"""
PRAMAN AI Microservice — Pydantic Schemas for Forensics & QR Verification
Matches the backend VerificationEvidence.js → forensicCheck sub-document.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ──────────────────────────────────────────────
#  PDF Metadata Forensics
# ──────────────────────────────────────────────

class MetadataForensicResult(BaseModel):
    """Result of PDF metadata and tool-trace analysis."""
    isTampered: bool = Field(default=False, description="True if forbidden editing software detected")
    flaggedTools: List[str] = Field(
        default_factory=list,
        description="List of detected editing software (e.g. ['Adobe Photoshop CC 2023'])"
    )
    producer: Optional[str] = Field(None, description="PDF Producer metadata field")
    creator: Optional[str] = Field(None, description="PDF Creator metadata field")
    creationDate: Optional[str] = None
    modificationDate: Optional[str] = None
    dateMismatch: bool = Field(
        default=False,
        description="True if creation date != modification date without justification"
    )
    fontAnomalies: List[str] = Field(
        default_factory=list,
        description="Detected font inconsistencies indicating text insertion"
    )
    tamperConfidenceScore: float = Field(
        default=0.0, ge=0, le=1,
        description="Overall tampering confidence (0 = clean, 1 = definitely tampered)"
    )


# ──────────────────────────────────────────────
#  QR Code Verification
# ──────────────────────────────────────────────

class QRPayload(BaseModel):
    """A single decoded QR code from a document page."""
    page: int = Field(ge=1)
    payload: str


class QRVerificationResult(BaseModel):
    """Result of embedded QR code decoding and cross-matching against document claims."""
    qrCodesFound: int = Field(default=0, ge=0)
    qrPayloads: List[QRPayload] = Field(default_factory=list)
    matchesClaim: Optional[bool] = Field(
        None,
        description="True if QR payload matches doc text. None if no QR codes found."
    )
    claimedIdentifier: Optional[str] = Field(None, description="The identifier we tried to match against")
    isForgeryDetected: bool = Field(
        default=False,
        description="True if QR decoded content contradicts visible document text"
    )


# ──────────────────────────────────────────────
#  Combined Forensic Check (maps to VerificationEvidence.forensicCheck)
# ──────────────────────────────────────────────

class ForensicCheckResult(BaseModel):
    """
    Combined forensic analysis result.
    Maps directly to backend VerificationEvidence.js → forensicCheck sub-document.
    """
    hasMetadataTampering: bool = Field(default=False)
    softwareDetected: Optional[str] = Field(None, description="Comma-separated flagged tool names")
    qrDecodedPayload: Optional[str] = Field(None, description="Raw decoded QR string")
    qrMatchesClaim: bool = Field(default=True)
    fontInconsistenciesDetected: bool = Field(default=False)
    tamperConfidenceScore: float = Field(default=0.0, ge=0, le=1)


class ForensicAnalysisError(BaseModel):
    """Error response for forensic analysis failures."""
    error: str
    detail: Optional[str] = None
