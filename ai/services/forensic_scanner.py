"""
PRAMAN AI Microservice — Phase 4: Forensic Metadata & Tampering Scanner

Multi-layer PDF forensic analysis engine:
  1. XMP Metadata & Tool Trace Analysis (Photoshop, Canva, GIMP, Sejda, etc.)
  2. Timestamp Inconsistency Detection (creation vs modification date)
  3. Font & Spatial Anomaly Detection (mismatched fonts indicating text insertion)

Based on Section 7.4 & 9.3 of the PRAMAN blueprint.
Uses: PyMuPDF (fitz) for low-level PDF inspection.
"""

import fitz  # PyMuPDF
from typing import List, Dict, Optional

from config import FORBIDDEN_SOFTWARE_SIGNATURES
from schemas.forensics import MetadataForensicResult
from utils.pdf_utils import get_pdf_metadata, get_font_info


def analyze_metadata(file_path: str) -> MetadataForensicResult:
    """
    Inspect PDF Producer, Creator, and Modification history for signs of tampering.
    
    Checks:
      1. Producer/Creator fields against forbidden editing software signatures
      2. Creation date vs Modification date mismatch
      3. Font anomalies (excessive font diversity indicating text insertion)
    
    Returns MetadataForensicResult matching VerificationEvidence.forensicCheck schema.
    """
    # --- Step 1: Extract metadata ---
    metadata = get_pdf_metadata(file_path)
    producer = (metadata.get("producer") or "").lower()
    creator = (metadata.get("creator") or "").lower()
    creation_date = metadata.get("creationDate") or ""
    mod_date = metadata.get("modDate") or ""

    # --- Step 2: Check for forbidden editing software ---
    flagged_tools = []
    for signature in FORBIDDEN_SOFTWARE_SIGNATURES:
        if signature in producer or signature in creator:
            # Store the original (non-lowered) name for display
            if signature in producer:
                flagged_tools.append(metadata.get("producer", signature))
            elif signature in creator:
                flagged_tools.append(metadata.get("creator", signature))

    # Deduplicate
    flagged_tools = list(set(flagged_tools))
    is_tool_tampered = len(flagged_tools) > 0

    # --- Step 3: Check timestamp mismatch ---
    date_mismatch = False
    if creation_date and mod_date:
        # PyMuPDF dates look like: "D:20240110090000+05'30'"
        # Simple check: if they differ significantly, flag it
        clean_creation = creation_date.replace("D:", "").strip()[:14]
        clean_mod = mod_date.replace("D:", "").strip()[:14]
        date_mismatch = clean_creation != clean_mod

    # --- Step 4: Font anomaly detection ---
    font_anomalies = []
    try:
        fonts = get_font_info(file_path)
        font_families = set()
        for f in fonts:
            # Normalize font family (strip Bold/Italic/Regular suffixes)
            family = f["font"].split("-")[0].split(",")[0].strip()
            if family:
                font_families.add(family)

        # Government certificates typically use 1-3 font families.
        # More than 5 distinct families is suspicious.
        if len(font_families) > 5:
            font_anomalies.append(
                f"Unusual font diversity: {len(font_families)} distinct font families detected "
                f"({', '.join(list(font_families)[:5])}...)"
            )

        # Check for known editing fonts
        editing_fonts = {"Helvetica-Bold", "ArialMT", "Calibri"}
        govt_unusual = font_families - editing_fonts
        if len(font_families) > 3 and len(font_families - govt_unusual) > 0:
            # Has both standard and unusual fonts — potential insertion
            pass

    except Exception:
        pass

    # --- Step 5: Compute tamper confidence score ---
    tamper_score = 0.0
    if is_tool_tampered:
        tamper_score += 0.60  # Strong signal
    if date_mismatch:
        tamper_score += 0.20
    if font_anomalies:
        tamper_score += 0.15
    tamper_score = min(tamper_score, 1.0)

    return MetadataForensicResult(
        isTampered=is_tool_tampered or tamper_score >= 0.70,
        flaggedTools=flagged_tools,
        producer=metadata.get("producer"),
        creator=metadata.get("creator"),
        creationDate=creation_date if creation_date else None,
        modificationDate=mod_date if mod_date else None,
        dateMismatch=date_mismatch,
        fontAnomalies=font_anomalies,
        tamperConfidenceScore=round(tamper_score, 3),
    )
