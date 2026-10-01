"""
PRAMAN AI Microservice — Pydantic Schemas for Signature Intelligence Engine

Covers:
  - Signature detection & bounding box localization
  - Feature embedding representation
  - Vector DB indexing in ChromaDB
  - Cross-bidder signature collusion detection (same signer across competing bids)
  - Reference anchor verification (cut-and-paste forgery & mismatch)
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
from schemas.document import BoundingBox


class SignatureVerdict(str, Enum):
    """Authenticity and collusion verdict for signature comparisons."""
    GENUINE_MATCH = "GENUINE_MATCH"
    IDENTICAL_DIGITAL_CLONE = "IDENTICAL_DIGITAL_CLONE"  # Exact copy-pasted bitmap
    SHARED_SIGNER_COLLUSION = "SHARED_SIGNER_COLLUSION"    # Same person signing for competing bidders
    SIGNATURE_MISMATCH = "SIGNATURE_MISMATCH"
    UNVERIFIED = "UNVERIFIED"


class DetectedSignature(BaseModel):
    """A detected and cropped signature region from a document page."""
    signatureId: str = Field(description="Unique ID for this signature occurrence")
    pageNumber: int = Field(default=1, ge=1)
    boundingBox: BoundingBox
    associatedLabel: Optional[str] = Field(
        default="Authorized Signatory",
        description="Associated text label near signature (e.g., Director, CA, Partner)",
    )
    confidence: float = Field(default=0.0, ge=0, le=1)
    cropBase64: Optional[str] = Field(
        default=None,
        description="Base64 encoded PNG thumbnail of the cropped signature for UI rendering",
    )
    embedding: Optional[List[float]] = Field(
        default=None,
        description="Normalized 128-dimensional visual feature embedding vector",
    )


class SignatureExtractionResponse(BaseModel):
    """Response returned when extracting signatures from a document."""
    totalSignaturesDetected: int = Field(ge=0)
    signatures: List[DetectedSignature] = Field(default_factory=list)
    docType: Optional[str] = None
    pageCount: int = Field(default=1, ge=1)
    warnings: List[str] = Field(default_factory=list)


class SignatureIndexRequest(BaseModel):
    """Request to ingest detected signatures into ChromaDB vector store."""
    tenderId: str
    bidderId: str
    bidderName: str
    docType: str
    signatures: List[DetectedSignature]


class SignatureIndexResponse(BaseModel):
    """Response after indexing signatures into vector DB."""
    indexedCount: int = Field(ge=0)
    tenderId: str
    bidderId: str
    status: str = Field(default="indexed")


class SignatureMatchResult(BaseModel):
    """Comparison result between two signatures."""
    targetBidderId: str
    targetBidderName: str
    targetDocType: str
    targetSignatureId: str
    similarityScore: float = Field(ge=0, le=1, description="Cosine similarity score (0.0 to 1.0)")
    verdict: SignatureVerdict
    isCollusionRisk: bool = Field(default=False)
    explanation: str


class CrossBidSignatureCheckRequest(BaseModel):
    """Request to analyze signatures across all competing bidders in a tender."""
    tenderId: str
    similarityThreshold: float = Field(
        default=0.82,
        ge=0.5,
        le=1.0,
        description="Minimum cosine similarity to flag shared signers",
    )


class CrossBidSignatureCheckResponse(BaseModel):
    """Response showing detected signature collisions across competing bidders."""
    tenderId: str
    totalSignaturesAnalyzed: int = Field(ge=0)
    collusionAlertsCount: int = Field(ge=0)
    flaggedMatches: List[SignatureMatchResult] = Field(default_factory=list)
    riskLevel: str = Field(default="LOW", description="Risk level: 'CRITICAL', 'HIGH', or 'CLEAR'")
    summary: str


class AnchorSignatureVerifyRequest(BaseModel):
    """Verify a submitted signature against a master/anchor reference signature."""
    claimedSignatoryName: Optional[str] = None
    anchorEmbedding: Optional[List[float]] = None
    targetSignature: DetectedSignature


class AnchorSignatureVerifyResponse(BaseModel):
    """Verification outcome against an anchor signature."""
    similarityScore: float = Field(ge=0, le=1)
    verdict: SignatureVerdict
    isAuthentic: bool
    confidence: float = Field(ge=0, le=1)
    notes: str
