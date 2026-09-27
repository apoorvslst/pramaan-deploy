"""
PRAMAN AI Microservice — Phase 9: Unified Verification Pipeline

Single entrypoint endpoint that orchestrates the entire AI verification stack:
  1. PDF Metadata Forensics (XMP inspection, tool traces, date mismatch)
  2. Embedded QR Code Decoding & Cryptographic Cross-Check
  3. Document Classification & OCR Key-Value Extraction with Bounding Boxes
  4. Assembles structured 3-Pane Evidence output for the backend

Endpoint:
  POST /api/v1/pipeline/verify-document
"""

import os
import shutil
import tempfile
from typing import Dict, List, Optional
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from pydantic import BaseModel, Field

from schemas.document import DocType, FieldWithBox, DocumentExtractionResponse
from schemas.forensics import ForensicCheckResult
from schemas.signature import DetectedSignature
from services.doc_classifier import classify_document
from services.ocr_engine import extract_document_fields
from services.forensic_scanner import analyze_metadata
from services.qr_verifier import verify_qr_codes
from services.signature_engine import detect_signatures_in_pdf

router = APIRouter()


class UnifiedVerificationResponse(BaseModel):
    """Consolidated 3-Pane Evidence verification package."""
    docType: DocType
    classificationConfidence: float = Field(default=0.0, ge=0, le=1)
    extractedFields: Dict[str, str] = Field(default_factory=dict)
    fieldsWithBoxes: Dict[str, FieldWithBox] = Field(default_factory=dict)
    visualMarkers: Dict[str, List[float]] = Field(default_factory=dict)
    detectedSignatures: List[DetectedSignature] = Field(default_factory=list)
    forensicCheck: ForensicCheckResult
    overallStatus: str = Field(
        description="Overall verdict: 'VERIFIED', 'FLAGGED_TAMPERED', 'FLAGGED_FORGERY', 'EXTRACTED'"
    )
    confidence: float = Field(default=0.0, ge=0, le=1)
    pageCount: int = Field(default=1, ge=1)
    warnings: List[str] = Field(default_factory=list)


@router.post(
    "/verify-document",
    response_model=UnifiedVerificationResponse,
    summary="Run full verification pipeline on a single document",
)
async def verify_document(
    file: UploadFile = File(..., description="PDF document to verify"),
    claimedType: Optional[DocType] = Form(None, description="Claimed document type"),
    claimedId: Optional[str] = Form("", description="Claimed identifier (e.g. GSTIN, Udyam No, PAN)"),
):
    """
    Unified endpoint for comprehensive document verification.
    Executes forensics, QR cross-checking, document classification,
    and OCR key-value extraction in one coordinated workflow.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF documents are supported for full verification pipeline",
        )

    # Save uploaded file to temp directory for processing
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file.filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ── Step 1: Run PDF Forensics (Metadata & Font Inspection) ──
        metadata_result = analyze_metadata(temp_path)

        # ── Step 2: Extract & Verify Embedded QR Code ──
        qr_result = verify_qr_codes(
            temp_path,
            claimed_identifier=claimedId or "",
        )

        # Build human-readable forensic flags from metadata result
        metadata_flags = []
        if metadata_result.flaggedTools:
            metadata_flags.append(f"Editing software detected: {', '.join(metadata_result.flaggedTools)}")
        if metadata_result.dateMismatch:
            metadata_flags.append("PDF creation and modification dates do not match")
        if metadata_result.fontAnomalies:
            metadata_flags.extend(metadata_result.fontAnomalies)

        # Build consolidated ForensicCheckResult matching backend schema
        forensic_check = ForensicCheckResult(
            hasMetadataTampering=metadata_result.isTampered,
            softwareDetected=metadata_result.flaggedTools,
            creationDate=metadata_result.creationDate,
            modificationDate=metadata_result.modificationDate,
            producer=metadata_result.producer,
            creator=metadata_result.creator,
            qrDecodedPayload=qr_result.qrPayloads[0].payload if qr_result.qrPayloads else None,
            qrMatchesClaim=qr_result.matchesClaim,
            isTampered=metadata_result.isTampered or qr_result.isForgeryDetected,
            tamperConfidence=max(
                metadata_result.tamperConfidenceScore,
                0.99 if qr_result.isForgeryDetected else 0.0,
            ),
            flags=metadata_flags + (
                ["CRITICAL: QR code payload contradicts claimed document identifier!"]
                if qr_result.isForgeryDetected
                else []
            ),
        )

        # ── Step 3: Classify Document if not provided ──
        if claimedType and claimedType != DocType.UNKNOWN:
            target_type = claimedType
            class_conf = 1.0
        else:
            classification = classify_document(temp_path)
            target_type = classification.docType
            class_conf = classification.confidence

        # ── Step 4: Extract Key-Value Claims & Bounding Boxes ──
        ocr_result = await extract_document_fields(temp_path, doc_type=target_type)

        # ── Step 5: Detect and Crop Signatures + Compute Embeddings ──
        sig_result = detect_signatures_in_pdf(temp_path, max_pages=3)
        for i, sig in enumerate(sig_result.signatures):
            ocr_result.visualMarkers[f"signatureBox_{i+1}"] = [
                sig.boundingBox.x,
                sig.boundingBox.y,
                sig.boundingBox.x + sig.boundingBox.width,
                sig.boundingBox.y + sig.boundingBox.height,
            ]

        # ── Step 6: Determine Overall Status ──
        warnings = list(ocr_result.warnings) + metadata_flags + sig_result.warnings

        if qr_result.isForgeryDetected:
            overall_status = "FLAGGED_FORGERY"
            warnings.append("Document flagged for cryptographic QR code forgery.")
        elif metadata_result.isTampered:
            overall_status = "FLAGGED_TAMPERED"
            warnings.append(f"Document edited using forbidden software: {', '.join(metadata_result.flaggedTools)}")
        elif ocr_result.confidence > 0.8:
            overall_status = "VERIFIED"
        else:
            overall_status = "EXTRACTED"

        return UnifiedVerificationResponse(
            docType=target_type,
            classificationConfidence=class_conf,
            extractedFields=ocr_result.extractedFields,
            fieldsWithBoxes=ocr_result.fieldsWithBoxes,
            visualMarkers=ocr_result.visualMarkers,
            detectedSignatures=sig_result.signatures,
            forensicCheck=forensic_check,
            overallStatus=overall_status,
            confidence=ocr_result.confidence,
            pageCount=ocr_result.pageCount,
            warnings=warnings,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification pipeline failed: {str(e)}",
        )
    finally:
        # Clean up temp files
        shutil.rmtree(temp_dir, ignore_errors=True)
