"""
PRAMAN AI Microservice — Phase 3: Document Type Classifier

Automatically identifies statutory document types from uploaded PDFs:
  - GST Certificate (Form GST REG-06)
  - Udyam Registration Certificate
  - PAN Card
  - ITR-V / Acknowledgement
  - CA Turnover Certificate
  - EPFO / ESIC Registration
  - OEM Authorization Letter
  - Debarment Affidavit
  - MII Local Content Declaration

Uses fast keyword & structural matching first, with LLM fallback for ambiguous docs.
"""

import re
from typing import List
from schemas.document import ClassificationResult, DocType


# ──────────────────────────────────────────────
#  Keyword classification rules
#  Each doc type has primary keywords (strong signals)
#  and secondary keywords (supporting evidence)
# ──────────────────────────────────────────────

CLASSIFICATION_RULES = {
    DocType.GST_CERTIFICATE: {
        "primary": [
            r"certificate\s+of\s+registration",
            r"form\s+gst\s+reg[\s\-]*06",
            r"goods\s+and\s+services?\s+tax",
            r"gstin\s*[:\-]?\s*[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}",
        ],
        "secondary": [
            r"central\s+goods",
            r"state\s+goods",
            r"jurisdiction",
            r"constitution\s+of\s+business",
            r"trade\s+name",
            r"legal\s+name",
            r"date\s+of\s+(?:liability|registration)",
        ],
        "min_primary": 1,
        "min_total": 2,
    },
    DocType.UDYAM_CERTIFICATE: {
        "primary": [
            r"udyam\s+registration",
            r"udyam\s*[\-]?\s*[A-Z]{2}\s*[\-]?\s*\d{2}",
            r"ministry\s+of\s+micro[\s,]+small\s+(?:and|&)\s+medium",
            r"msme\s+(?:registration|certificate)",
        ],
        "secondary": [
            r"enterprise\s+type",
            r"micro|small|medium",
            r"major\s+activity",
            r"nic\s+code",
            r"investment\s+in\s+plant",
            r"date\s+of\s+(?:incorporation|commencement)",
        ],
        "min_primary": 1,
        "min_total": 2,
    },
    DocType.PAN_CARD: {
        "primary": [
            r"permanent\s+account\s+number",
            r"income\s+tax\s+department",
            r"[A-Z]{5}\d{4}[A-Z]",  # PAN format
        ],
        "secondary": [
            r"govt\.?\s+of\s+india",
            r"father.?s?\s+name",
            r"date\s+of\s+birth",
            r"date\s+of\s+incorporation",
            r"signature",
        ],
        "min_primary": 1,
        "min_total": 2,
    },
    DocType.ITR_V: {
        "primary": [
            r"itr[\s\-]*v",
            r"income\s+tax\s+return\s+verification",
            r"acknowledgement\s+(?:number|no)",
            r"e[\s\-]*filing\s+acknowledgement",
            r"assessment\s+year",
        ],
        "secondary": [
            r"gross\s+total\s+income",
            r"total\s+income",
            r"tax\s+payable",
            r"centralized\s+processing\s+centre",
            r"filed\s+(?:on|date)",
            r"verification\s+form",
        ],
        "min_primary": 1,
        "min_total": 2,
    },
    DocType.CA_TURNOVER: {
        "primary": [
            r"chartered\s+accountant",
            r"turnover\s+certificate",
            r"udin\s*[:\-]?\s*\d+",
            r"annual\s+(?:financial\s+)?turnover",
            r"certificate\s+of\s+turnover",
        ],
        "secondary": [
            r"membership\s+(?:no|number)",
            r"firm\s+registration\s+(?:no|number)",
            r"financial\s+year",
            r"gross\s+(?:revenue|turnover|receipt)",
            r"balance\s+sheet",
            r"ca\s+(?:seal|stamp|signature)",
        ],
        "min_primary": 1,
        "min_total": 2,
    },
    DocType.EPFO_CHALLAN: {
        "primary": [
            r"employees?\s+provident\s+fund",
            r"epf(?:o)?\s+(?:registration|establishment\s+code)",
            r"trrn\s*(?:no|number)?",
            r"ecr\s+(?:challan|receipt)",
        ],
        "secondary": [
            r"contribution",
            r"employer\s+share",
            r"employee\s+share",
            r"establishment\s+id",
            r"total\s+(?:members?|employees?)",
        ],
        "min_primary": 1,
        "min_total": 2,
    },
    DocType.ESIC_CHALLAN: {
        "primary": [
            r"employees?\s+state\s+insurance",
            r"esic?\s+(?:registration|code)",
            r"esic?\s+contribution",
        ],
        "secondary": [
            r"ip\s+(?:contribution|number)",
            r"employer\s+(?:code|contribution)",
            r"insured\s+person",
        ],
        "min_primary": 1,
        "min_total": 2,
    },
    DocType.OEM_AUTH: {
        "primary": [
            r"oem\s+(?:authorization|authorisation)",
            r"original\s+equipment\s+manufacturer",
            r"authorization\s+letter",
            r"authorized\s+(?:dealer|distributor|reseller|partner)",
        ],
        "secondary": [
            r"tender\s+(?:ref|reference|no|number)",
            r"validity\s+(?:period|date)",
            r"authorized\s+to\s+(?:quote|bid|supply)",
            r"manufacturer.?s?\s+(?:seal|stamp|signature)",
        ],
        "min_primary": 1,
        "min_total": 2,
    },
    DocType.DEBARMENT_AFFIDAVIT: {
        "primary": [
            r"debarment\s+(?:affidavit|declaration)",
            r"not\s+(?:been\s+)?(?:debarred|blacklisted|banned)",
            r"self[\s\-]?declaration",
        ],
        "secondary": [
            r"notary",
            r"sworn\s+(?:before|statement)",
            r"affidavit",
            r"court\s+(?:stamp|fee)",
            r"penalty\s+of\s+perjury",
        ],
        "min_primary": 1,
        "min_total": 1,
    },
    DocType.MII_DECLARATION: {
        "primary": [
            r"make\s+in\s+india",
            r"local\s+content\s+(?:declaration|certificate)",
            r"mii\s+(?:declaration|compliance)",
            r"domestic\s+(?:value\s+addition|content)",
        ],
        "secondary": [
            r"class[\s\-]?(?:i|ii|1|2)\s+(?:local\s+)?supplier",
            r"percentage\s+of\s+local\s+content",
            r"preference\s+under\s+ppo",
            r"public\s+procurement\s+(?:order|policy)",
        ],
        "min_primary": 1,
        "min_total": 1,
    },
}


def classify_document(text: str) -> ClassificationResult:
    """
    Classify a document's type based on keyword matching against its extracted text.

    Returns the best-matching DocType with confidence score and matched keywords.
    If no match found, returns DocType.UNKNOWN.
    """
    text_lower = text.lower()
    best_match = None
    best_score = 0.0
    best_keywords = []

    for doc_type, rules in CLASSIFICATION_RULES.items():
        primary_hits = []
        secondary_hits = []

        for pattern in rules["primary"]:
            if re.search(pattern, text_lower):
                primary_hits.append(pattern)

        for pattern in rules["secondary"]:
            if re.search(pattern, text_lower):
                secondary_hits.append(pattern)

        # Check minimum thresholds
        total_hits = len(primary_hits) + len(secondary_hits)
        if len(primary_hits) >= rules["min_primary"] and total_hits >= rules["min_total"]:
            # Score: primary hits are worth 2x, secondary hits are worth 1x
            max_possible = len(rules["primary"]) * 2 + len(rules["secondary"])
            score = (len(primary_hits) * 2 + len(secondary_hits)) / max_possible
            score = min(score, 1.0)

            if score > best_score:
                best_score = score
                best_match = doc_type
                best_keywords = primary_hits + secondary_hits

    if best_match:
        return ClassificationResult(
            docType=best_match,
            confidence=round(best_score, 3),
            matchedKeywords=best_keywords[:5],  # Limit to 5 for readability
        )

    return ClassificationResult(
        docType=DocType.UNKNOWN,
        confidence=0.0,
        matchedKeywords=[],
    )
