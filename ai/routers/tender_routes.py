"""
PRAMAN AI Microservice — Phase 2: Tender Rule Extraction Router

Endpoint: POST /api/v1/tender/parse-rules
Accepts a tender NIT/RFP PDF, extracts eligibility rules using LLM + regex,
returns structured JSON matching the backend Tender.js rules schema.
"""

import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.tender import TenderParseResponse
from services.rule_extractor import parse_tender_rules
from utils.pdf_utils import save_upload_to_temp

router = APIRouter()


@router.post(
    "/parse-rules",
    response_model=TenderParseResponse,
    summary="Extract eligibility rules from a tender NIT/RFP PDF",
    description=(
        "Accepts a tender document (PDF). Extracts text using PyMuPDF, then uses "
        "Groq LLM (Llama-3.3-70B) with regex fallback to identify statutory eligibility "
        "rules: turnover, experience, MSME exemptions, EMD, MII %, and required certificates. "
        "Returns JSON matching backend Tender.js → rules sub-document."
    ),
)
async def parse_tender_rules_endpoint(
    file: UploadFile = File(..., description="Tender NIT/RFP PDF document"),
):
    """Parse a tender PDF and extract eligibility rules."""
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted. Please upload a .pdf document.",
        )

    # Save to temp and process
    temp_path = None
    try:
        temp_path = await save_upload_to_temp(file)
        result = await parse_tender_rules(temp_path)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse tender document: {str(e)}",
        )
    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
