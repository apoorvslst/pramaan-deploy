"""
PRAMAN AI Microservice — Phase 6: Cartel Detection Router

Endpoint:
  POST /api/v1/cartel/detect — Analyze bidders for collusion rings
"""

from fastapi import APIRouter, HTTPException

from schemas.cartel import (
    CollusionDetectionRequest,
    CollusionDetectionResponse,
)
from services.collusion_detector import detect_collusion

router = APIRouter()


@router.post(
    "/detect",
    response_model=CollusionDetectionResponse,
    summary="Detect cartel & collusion rings among competing bidders",
    description=(
        "Accepts a list of bidders with their directors, bank accounts, addresses, "
        "phone numbers, and PDF metadata. Constructs a heterogeneous entity graph "
        "using NetworkX and identifies connected components where >= 2 competing "
        "bidders share common identifiers. Returns detected clusters with risk "
        "severity (CRITICAL/HIGH) and Cytoscape.js graph elements for frontend rendering."
    ),
)
async def detect_collusion_endpoint(
    request: CollusionDetectionRequest,
):
    """Detect cartel/collusion rings among bidders for a tender."""
    if len(request.bidders) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 bidders are required for collusion analysis.",
        )

    try:
        result = detect_collusion(request.bidders)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Collusion detection failed: {str(e)}",
        )
