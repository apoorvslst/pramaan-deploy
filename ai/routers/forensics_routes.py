"""
PRAMAN AI Microservice — Phase 4+5: Forensics Router

Endpoints:
  POST /api/v1/forensics/analyze-metadata  — PDF metadata & tool-trace analysis
  POST /api/v1/forensics/verify-qr         — QR code decode & cross-check
  POST /api/v1/forensics/full-scan         — Combined forensics (metadata + QR + fonts)
"""

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from schemas.forensics import (
    MetadataForensicResult,
    QRVerificationResult,
    ForensicCheckResult,
)
from services.forensic_scanner import analyze_metadata
from services.qr_verifier import verify_qr_codes
from utils.pdf_utils import save_upload_to_temp

router = APIRouter()


@router.post(
    "/analyze-metadata",
    response_model=MetadataForensicResult,
    summary="Analyze PDF metadata for tampering indicators",
    description=(
        "Inspects PDF Producer, Creator, XMP metadata for traces of forbidden "
        "editing software (Photoshop, Canva, GIMP, Sejda, PDFescape). Detects "
        "timestamp mismatches and font anomalies indicating text insertion."
    ),
)
async def analyze_metadata_endpoint(
    file: UploadFile = File(..., description="PDF document to scan"),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    temp_path = None
    try:
        temp_path = await save_upload_to_temp(file)
        result = analyze_metadata(temp_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensic analysis failed: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


@router.post(
    "/verify-qr",
    response_model=QRVerificationResult,
    summary="Decode embedded QR codes and verify against claimed identifier",
    description=(
        "Scans all pages of the PDF for embedded QR/barcodes, decodes their payload, "
        "and cross-references against the claimed identifier (e.g. GSTIN, Udyam number). "
        "If QR payload contradicts visible text → CRITICAL FORGERY flag."
    ),
)
async def verify_qr_endpoint(
    file: UploadFile = File(..., description="PDF document with QR codes"),
    claimedIdentifier: str = Form(
        ...,
        description="The identifier to verify against QR payload (e.g. GSTIN, Udyam number, PAN)",
    ),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    temp_path = None
    try:
        temp_path = await save_upload_to_temp(file)
        result = verify_qr_codes(temp_path, claimedIdentifier)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR verification failed: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


@router.post(
    "/full-scan",
    response_model=ForensicCheckResult,
    summary="Run complete forensic analysis (metadata + QR + fonts)",
    description=(
        "Combines metadata tampering analysis and QR verification into a single "
        "ForensicCheckResult matching the backend VerificationEvidence.forensicCheck schema."
    ),
)
async def full_forensic_scan_endpoint(
    file: UploadFile = File(..., description="PDF document to forensically analyze"),
    claimedIdentifier: str = Form(
        default="",
        description="Optional identifier to verify QR codes against",
    ),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    temp_path = None
    try:
        temp_path = await save_upload_to_temp(file)

        # Run metadata analysis
        meta_result = analyze_metadata(temp_path)

        # Run QR verification if identifier provided
        qr_result = None
        if claimedIdentifier.strip():
            qr_result = verify_qr_codes(temp_path, claimedIdentifier)

        # Combine into ForensicCheckResult (matches backend schema)
        return ForensicCheckResult(
            hasMetadataTampering=meta_result.isTampered,
            softwareDetected=meta_result.flaggedTools if meta_result.flaggedTools else None,
            creationDate=meta_result.creationDate,
            modificationDate=meta_result.modificationDate,
            producer=meta_result.producer,
            creator=meta_result.creator,
            qrDecodedPayload=(
                qr_result.qrPayloads[0].payload if qr_result and qr_result.qrPayloads else None
            ),
            qrMatchesClaim=(
                qr_result.matchesClaim if qr_result and qr_result.matchesClaim is not None else True
            ),
            isTampered=meta_result.isTampered or (qr_result.isForgeryDetected if qr_result else False),
            tamperConfidence=meta_result.tamperConfidenceScore,
            fontInconsistenciesDetected=len(meta_result.fontAnomalies) > 0,
            flags=meta_result.flags if hasattr(meta_result, 'flags') else [],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensic scan failed: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
