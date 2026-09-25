"""
PRAMAN AI Microservice — Pydantic Schemas for Document OCR & Classification
Matches the backend VerificationEvidence.js schema (Pane 1 & Pane 2 data).
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum


class DocType(str, Enum):
    """Document types matching backend BidSubmission.uploadedDocuments.docType enum."""
    GST_CERTIFICATE = "GST_CERTIFICATE"
    UDYAM_CERTIFICATE = "UDYAM_CERTIFICATE"
    PAN_CARD = "PAN_CARD"
    ITR_V = "ITR_V"
    CA_TURNOVER = "CA_TURNOVER"
    EPFO_CHALLAN = "EPFO_CHALLAN"
    ESIC_CHALLAN = "ESIC_CHALLAN"
    OEM_AUTH = "OEM_AUTH"
    DEBARMENT_AFFIDAVIT = "DEBARMENT_AFFIDAVIT"
    MII_DECLARATION = "MII_DECLARATION"
    UNKNOWN = "UNKNOWN"


# ──────────────────────────────────────────────
#  Bounding Box & Visual Markers (Pane 1)
# ──────────────────────────────────────────────

class BoundingBox(BaseModel):
    """Normalized bounding box coordinates for a single field highlight."""
    x: float = Field(ge=0, description="Left edge (pixels or normalized)")
    y: float = Field(ge=0, description="Top edge")
    width: float = Field(ge=0, description="Box width")
    height: float = Field(ge=0, description="Box height")


class VisualData(BaseModel):
    """Pane 1 data: Document visual markers for the 3-Pane Viewer."""
    pageNumber: int = Field(default=1, ge=1)
    boundingBox: Optional[BoundingBox] = None
    imageSnippetUrl: Optional[str] = None


class FieldWithBox(BaseModel):
    """An extracted field value paired with its spatial bounding box."""
    value: str
    confidence: float = Field(default=0.0, ge=0, le=1)
    boundingBox: Optional[BoundingBox] = None


# ──────────────────────────────────────────────
#  Extracted Claims (Pane 2)
# ──────────────────────────────────────────────

class ExtractedClaim(BaseModel):
    """Pane 2 data: AI-extracted key-value pairs from the document."""
    extractedFields: Dict[str, str] = Field(
        default_factory=dict,
        description="Key-value pairs, e.g. {gstin: '07AAAAA0000A1Z5', legalName: 'ABC Corp'}"
    )
    ocrEngineConfidence: float = Field(default=0.0, ge=0, le=1)
    extractionModel: str = Field(default="PyMuPDF + Groq LLM")


# ──────────────────────────────────────────────
#  Classification Response
# ──────────────────────────────────────────────

class ClassificationResult(BaseModel):
    """Result of document type classification."""
    docType: DocType
    confidence: float = Field(ge=0, le=1)
    matchedKeywords: List[str] = Field(default_factory=list)


# ──────────────────────────────────────────────
#  Full OCR Extraction Response
# ──────────────────────────────────────────────

class DocumentExtractionResponse(BaseModel):
    """
    Complete OCR extraction result for a single document.
    Combines classification + extraction + visual markers.
    Maps to VerificationEvidence schema fields.
    """
    docType: DocType
    extractedFields: Dict[str, str] = Field(default_factory=dict)
    fieldsWithBoxes: Dict[str, FieldWithBox] = Field(
        default_factory=dict,
        description="Fields with spatial bounding boxes for 3-Pane highlighting"
    )
    confidence: float = Field(default=0.0, ge=0, le=1)
    extractionModel: str = Field(default="PyMuPDF + Groq LLM")
    visualMarkers: Dict[str, List[float]] = Field(
        default_factory=dict,
        description="Named bounding boxes as [x1, y1, x2, y2], e.g. {'gstinBox': [140, 220, 310, 245]}"
    )
    pageCount: int = Field(default=1, ge=1)
    warnings: List[str] = Field(default_factory=list)


class DocumentExtractionError(BaseModel):
    """Error response for document extraction failures."""
    error: str
    detail: Optional[str] = None
    docType: Optional[DocType] = None
