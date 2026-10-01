"""
PRAMAN AI Microservice — Phase 3: Document Intelligence Router

Endpoints:
  POST /api/v1/document/classify  — Classify a document's type
  POST /api/v1/document/extract   — Classify + Extract key-value fields with bounding boxes
"""

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from schemas.document import (
    ClassificationResult,
    DocumentExtractionResponse,
    DocType,
)
from services.doc_classifier import classify_document
from services.ocr_engine import extract_document_fields
from utils.pdf_utils import save_upload_to_temp, extract_full_text

router = APIRouter()


@router.post(
    "/classify",
    response_model=ClassificationResult,
    summary="Classify a statutory document type",
    description=(
        "Accepts a PDF document and classifies it as one of the statutory types: "
        "GST Certificate, Udyam Certificate, PAN Card, ITR-V, CA Turnover Certificate, "
        "EPFO/ESIC Registration, OEM Authorization, Debarment Affidavit, or MII Declaration. "
        "Uses fast keyword matching — no LLM needed."
    ),
)
async def classify_document_endpoint(
    file: UploadFile = File(..., description="Statutory document PDF"),
):
    """Classify a statutory document's type."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    temp_path = None
    try:
        temp_path = await save_upload_to_temp(file)
        text = extract_full_text(temp_path)
        result = classify_document(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


@router.post(
    "/extract",
    response_model=DocumentExtractionResponse,
    summary="Extract key-value fields from a statutory document",
    description=(
        "Accepts a PDF document, classifies its type (or uses the provided type), "
        "then extracts structured key-value fields (e.g., GSTIN, Legal Name, Turnover) "
        "with bounding box coordinates for 3-Pane Viewer highlighting. "
        "Uses Groq LLM for structured extraction with regex fallback."
    ),
)
async def extract_document_endpoint(
    file: UploadFile = File(..., description="Statutory document PDF"),
    docType: Optional[str] = Form(
        None,
        description=(
            "Override document type classification. "
            "Valid values: GST_CERTIFICATE, UDYAM_CERTIFICATE, PAN_CARD, ITR_V, "
            "CA_TURNOVER, EPFO_CHALLAN, ESIC_CHALLAN, OEM_AUTH, DEBARMENT_AFFIDAVIT, MII_DECLARATION"
        ),
    ),
):
    """Extract key-value fields and bounding boxes from a statutory document."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    temp_path = None
    try:
        temp_path = await save_upload_to_temp(file)

        # Determine document type
        if docType:
            try:
                resolved_type = DocType(docType)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid docType: '{docType}'. Must be one of: {[e.value for e in DocType]}",
                )
        else:
            # Auto-classify
            text = extract_full_text(temp_path)
            classification = classify_document(text)
            resolved_type = classification.docType

        result = await extract_document_fields(temp_path, resolved_type)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
