"""
PRAMAN AI Microservice — Phase 8: Assistant Router

Endpoints:
  POST /api/v1/assistant/query      — Query the grounded RAG officer assistant
  POST /api/v1/assistant/index-bid  — Index a bidder's documents into ChromaDB
"""

from fastapi import APIRouter, HTTPException

from schemas.assistant import (
    AssistantQueryRequest,
    AssistantQueryResponse,
    IndexBidRequest,
    IndexBidResponse,
)
from services.rag_assistant import query_assistant, index_bid_documents

router = APIRouter()


@router.post(
    "/query",
    response_model=AssistantQueryResponse,
    summary="Query the Procurement Officer AI Assistant with document grounding",
)
async def handle_assistant_query(request: AssistantQueryRequest):
    """
    RAG-powered conversational assistant for Procurement Officers.
    Retrieves relevant snippets from indexed tender and bid documents,
    and generates grounded answers with exact source citations.
    """
    try:
        response = await query_assistant(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Assistant query processing failed: {str(e)}",
        )


@router.post(
    "/index-bid",
    response_model=IndexBidResponse,
    summary="Index bidder documents into ChromaDB vector store",
)
async def handle_index_bid(request: IndexBidRequest):
    """
    Ingests and vectorizes extracted text chunks from a bidder's documents
    into ChromaDB to make them searchable for the assistant.
    """
    try:
        response = await index_bid_documents(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Bid indexing failed: {str(e)}",
        )
