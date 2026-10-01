"""
PRAMAN AI Microservice — Pydantic Schemas for Tender Rule Extraction
Matches the backend Tender.js schema rules object.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class CertificateType(str, Enum):
    """Certificate types matching backend Tender.rules.requiredCertificates enum."""
    GST_CERTIFICATE = "GST_CERTIFICATE"
    UDYAM_CERTIFICATE = "UDYAM_CERTIFICATE"
    PAN_CARD = "PAN_CARD"
    ITR_ACKNOWLEDGEMENT = "ITR_ACKNOWLEDGEMENT"
    CA_TURNOVER_CERTIFICATE = "CA_TURNOVER_CERTIFICATE"
    EPFO_REGISTRATION = "EPFO_REGISTRATION"
    ESIC_REGISTRATION = "ESIC_REGISTRATION"
    DEBARMENT_AFFIDAVIT = "DEBARMENT_AFFIDAVIT"
    OEM_AUTHORIZATION = "OEM_AUTHORIZATION"
    LOCAL_CONTENT_DECLARATION = "LOCAL_CONTENT_DECLARATION"


class RequiredCertificate(BaseModel):
    """Single certificate requirement as extracted from the tender NIT/RFP."""
    type: CertificateType
    isMandatory: bool = True
    weightage: float = Field(default=10.0, ge=0, le=100, description="Scoring weight for this certificate")


class TenderRules(BaseModel):
    """
    Extracted eligibility rules from a tender document.
    Maps 1:1 with backend Tender.js → rules sub-document.
    """
    minimumTurnoverINR: float = Field(default=0, ge=0, description="Minimum avg annual turnover in INR")
    turnoverYearsRequired: int = Field(default=3, ge=1, le=10, description="Number of years for turnover calculation")
    minimumExperienceYears: int = Field(default=0, ge=0, description="Minimum years of prior experience")
    makeInIndiaPercentage: float = Field(default=20.0, ge=0, le=100, description="MII local content minimum %")
    allowStartupExemption: bool = Field(default=True, description="DPIIT Startup exemption on turnover/experience")
    allowMSMEExemption: bool = Field(default=True, description="MSME (Micro/Small) exemption per PPO 2012")
    emdRequired: bool = Field(default=True, description="Whether EMD is required")
    emdAmountINR: float = Field(default=0, ge=0, description="EMD amount in INR")
    requiredCertificates: List[RequiredCertificate] = Field(
        default_factory=list,
        description="List of statutory certificates required for this tender"
    )


class TenderParseResponse(BaseModel):
    """Response from /api/v1/tender/parse-rules endpoint."""
    tenderTitle: Optional[str] = Field(None, description="Extracted tender title")
    department: Optional[str] = Field(None, description="Issuing department name")
    estimatedValueINR: Optional[float] = Field(None, ge=0, description="Estimated contract value")
    rules: TenderRules = Field(description="Extracted eligibility rules")
    confidence: float = Field(ge=0, le=1, description="Overall extraction confidence score")
    rawExtractedText: Optional[str] = Field(
        None,
        description="First N chars of extracted text for debugging (not sent to frontend)"
    )


class TenderParseError(BaseModel):
    """Error response for rule parsing failures."""
    error: str
    detail: Optional[str] = None
