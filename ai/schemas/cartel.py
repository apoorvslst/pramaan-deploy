"""
PRAMAN AI Microservice — Pydantic Schemas for Cartel & Collusion Graph Detection
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum


class CollusionRiskLevel(str, Enum):
    """Risk severity for detected collusion clusters."""
    CRITICAL = "CRITICAL"  # Shared directors or bank accounts
    HIGH = "HIGH"          # Shared address, phone, or metadata
    MEDIUM = "MEDIUM"      # Shared PIN code only
    LOW = "LOW"            # Weak signal


class BidderInput(BaseModel):
    """Input data for a single bidder in collusion analysis."""
    id: str
    legalBusinessName: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    primaryPhone: Optional[str] = None
    primaryEmail: Optional[str] = None
    registeredAddress: Optional[Dict[str, Any]] = None
    directors: List[Dict[str, str]] = Field(default_factory=list)
    bankAccountDetails: Optional[Dict[str, str]] = None
    fileMetadataAuthor: Optional[str] = None


class ImplicatedBidder(BaseModel):
    """A bidder implicated in a collusion cluster."""
    id: str
    name: str


class SharedEntity(BaseModel):
    """A shared attribute linking bidders in a cluster."""
    id: str
    type: str
    label: Optional[str] = None


class CollusionCluster(BaseModel):
    """A detected collusion ring containing >= 2 competing bidders."""
    clusterSize: int = Field(ge=2)
    implicatedBidders: List[ImplicatedBidder]
    sharedEntities: List[SharedEntity]
    riskLevel: CollusionRiskLevel


class CytoscapeElement(BaseModel):
    """A single node or edge in Cytoscape.js format for React graph rendering."""
    data: Dict[str, Any]


class CollusionDetectionResponse(BaseModel):
    """Full response from /api/v1/cartel/detect endpoint."""
    totalBidders: int = Field(ge=0)
    collusionRingsDetected: int = Field(ge=0)
    clusters: List[CollusionCluster] = Field(default_factory=list)
    cytoscapeGraph: List[CytoscapeElement] = Field(default_factory=list)


class CollusionDetectionRequest(BaseModel):
    """Request body for collusion detection."""
    bidders: List[BidderInput]
    tenderId: Optional[str] = None
