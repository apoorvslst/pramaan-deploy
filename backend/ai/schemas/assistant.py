"""
PRAMAN AI Microservice — Pydantic Schemas for RAG Officer Assistant
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class Citation(BaseModel):
    """A single citation reference to a source document."""
    bidderId: Optional[str] = None
    bidderName: Optional[str] = None
    docType: Optional[str] = None
    pageNumber: Optional[int] = None
    snippet: Optional[str] = Field(None, description="Relevant text excerpt from the source")


class AssistantQueryRequest(BaseModel):
    """Request to the RAG officer assistant."""
    question: str = Field(description="Natural language question from the Procurement Officer")
    tenderId: Optional[str] = None
    conversationHistory: List[dict] = Field(
        default_factory=list,
        description="Previous Q&A pairs for multi-turn context"
    )


class AssistantQueryResponse(BaseModel):
    """Response from the RAG officer assistant."""
    answer: str = Field(description="Grounded answer with inline citations")
    citations: List[Citation] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0, le=1)
    modelUsed: str = Field(default="groq/llama-3.3-70b-versatile")


class IndexBidRequest(BaseModel):
    """Request to ingest a bid's documents into the vector store."""
    tenderId: str
    bidderId: str
    bidderName: str
    documents: List[dict] = Field(
        description="List of {docType, textContent, pageNumber} objects to index"
    )


class IndexBidResponse(BaseModel):
    """Response after indexing bid documents."""
    chunksIndexed: int = Field(ge=0)
    tenderId: str
    bidderId: str
    status: str = Field(default="indexed")
