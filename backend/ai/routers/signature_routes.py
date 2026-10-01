"""
PRAMAN AI Microservice — Signature Intelligence Router

Endpoints:
  POST /api/v1/signature/extract-and-embed   — Extract signatures, crops, and embeddings from PDF
  POST /api/v1/signature/index               — Index signature embeddings into ChromaDB
  POST /api/v1/signature/verify-cross-bid    — Check for shared signers / collusion across competing bidders
  POST /api/v1/signature/verify-against-anchor — Verify signature against a registered anchor
"""

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from schemas.signature import (
    SignatureExtractionResponse,
    SignatureIndexRequest,
    SignatureIndexResponse,
    CrossBidSignatureCheckRequest,
    CrossBidSignatureCheckResponse,
    AnchorSignatureVerifyRequest,
    AnchorSignatureVerifyResponse,
)
from services.signature_engine import (
    detect_signatures_in_pdf,
    index_signatures,
    check_cross_bid_signatures,
    verify_signature_against_anchor,
)
from utils.pdf_utils import save_upload_to_temp

router = APIRouter()


@router.post(
    "/extract-and-embed",
    response_model=SignatureExtractionResponse,
    summary="Extract signature regions, visual crops, and 128-d embeddings from PDF",
)
async def handle_extract_signatures(
    file: UploadFile = File(..., description="PDF document containing signatures"),
    maxPages: int = Form(5, description="Maximum pages to inspect"),
):
    """
    Scans statutory documents (CA certificates, affidavits, agreements) for signature blocks,
    extracts spatial bounding boxes, creates base64 thumbnails, and computes visual embeddings.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF documents are supported for signature extraction",
        )

    temp_path = None
    try:
        temp_path = await save_upload_to_temp(file)
        result = detect_signatures_in_pdf(temp_path, max_pages=maxPages)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Signature extraction failed: {str(e)}",
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


@router.post(
    "/index",
    response_model=SignatureIndexResponse,
    summary="Index signature embeddings into ChromaDB vector store",
)
async def handle_index_signatures(request: SignatureIndexRequest):
    """
    Ingests extracted signature embeddings into ChromaDB to enable cross-bidder
    collusion searches and anchor signature verification.
    """
    try:
        response = await index_signatures(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Signature indexing failed: {str(e)}",
        )


@router.post(
    "/verify-cross-bid",
    response_model=CrossBidSignatureCheckResponse,
    summary="Detect shared signers & proxy signatures across competing bidders in a tender",
)
async def handle_verify_cross_bid(request: CrossBidSignatureCheckRequest):
    """
    Compares all bidder signatures in a tender to detect:
      1. Identical digital cut-and-paste clones across documents
      2. Same physical human signing on behalf of two competing bidders (Cartel collusion)
    """
    try:
        response = await check_cross_bid_signatures(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Cross-bid signature check failed: {str(e)}",
        )


@router.post(
    "/verify-against-anchor",
    response_model=AnchorSignatureVerifyResponse,
    summary="Verify candidate signature against registered anchor signature",
)
async def handle_verify_anchor(request: AnchorSignatureVerifyRequest):
    """
    Verifies if a submitted signature matches a registered anchor reference on file.
    """
    try:
        response = verify_signature_against_anchor(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Anchor signature verification failed: {str(e)}",
        )
