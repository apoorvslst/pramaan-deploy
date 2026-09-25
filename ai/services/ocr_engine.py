"""
PRAMAN AI Microservice — Phase 3: OCR Key-Value Extraction Engine

Extracts structured key-value pairs from statutory documents with spatial bounding boxes.
Uses PyMuPDF for text + position extraction, then Groq LLM for structured field parsing.

Supports extraction for:
  - GST Certificate: GSTIN, Legal Name, Trade Name, Registration Date, Status
  - Udyam Certificate: Udyam Number, Enterprise Type, Major Activity, NIC Code
  - PAN Card: PAN, Entity Name, Date of Birth/Incorporation
  - ITR-V: PAN, Assessment Year, Gross Total Income, Acknowledgement Number
  - CA Turnover Certificate: UDIN, Turnover figures, CA Membership Number
  - EPFO: Establishment Code, TRRN, Employee Count
  - OEM Auth: Tender Ref, Dealer Name, Validity Period
"""

import json
import re
from typing import Dict, List, Optional
from groq import Groq

from config import settings
from schemas.document import (
    DocType,
    DocumentExtractionResponse,
    FieldWithBox,
    BoundingBox,
)
from utils.pdf_utils import (
    extract_full_text,
    extract_text_with_positions,
    find_text_bbox,
    normalize_bbox_to_percent,
)


# ──────────────────────────────────────────────
#  Regex-based extraction patterns per document type
# ──────────────────────────────────────────────

REGEX_EXTRACTORS = {
    DocType.GST_CERTIFICATE: {
        "gstin": r"(?:GSTIN|GST\s*(?:IN|No|Number|Identification))[:\s\-]*(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d][A-Z]\d)",
        "legalName": r"(?:Legal\s+Name|Name\s+of\s+(?:the\s+)?(?:Registered\s+)?Person)[:\s\-]*([A-Z][A-Z\s&.,()]+)",
        "tradeName": r"(?:Trade\s+Name|Business\s+Name)[:\s\-]*([A-Z][A-Z\s&.,()]+)",
        "registrationDate": r"(?:Date\s+of\s+Registration|Effective\s+Date\s+of\s+Registration)[:\s\-]*([\d]{2}[/\-][\d]{2}[/\-][\d]{4})",
        "constitutionOfBusiness": r"(?:Constitution\s+of\s+Business)[:\s\-]*([A-Za-z\s]+?)(?:\n|$)",
    },
    DocType.UDYAM_CERTIFICATE: {
        "udyamNumber": r"(?:Udyam\s+Registration\s+(?:No|Number)|UDYAM)[:\s\-]*([A-Z]{2}[\-\s]?\d{2}[\-\s]?\d{7})",
        "enterpriseType": r"(?:Type\s+of\s+Enterprise|Enterprise\s+Type|Category)[:\s\-]*(Micro|Small|Medium)",
        "majorActivity": r"(?:Major\s+Activity)[:\s\-]*(Manufacturing|Services?|Trading)",
        "nicCode": r"(?:NIC\s+(?:Code|2\s+Digit))[:\s\-]*(\d{2,5})",
        "organizationType": r"(?:Organization\s+Type|Type\s+of\s+Organisation)[:\s\-]*([A-Za-z\s]+?)(?:\n|$)",
    },
    DocType.PAN_CARD: {
        "pan": r"(?:Permanent\s+Account\s+Number|PAN)[:\s\-]*([A-Z]{5}\d{4}[A-Z])",
        "entityName": r"(?:Name|नाम)[:\s\-]*([A-Z][A-Z\s]+)",
        "dateOfIncorporationOrBirth": r"(?:Date\s+of\s+(?:Birth|Incorporation)|DOB|जन्म\s+तिथि)[:\s\-]*([\d]{2}[/\-][\d]{2}[/\-][\d]{4})",
    },
    DocType.ITR_V: {
        "pan": r"(?:PAN)[:\s\-]*([A-Z]{5}\d{4}[A-Z])",
        "assessmentYear": r"(?:Assessment\s+Year|A\.?Y\.?)[:\s\-]*(20\d{2}[\s\-]*20\d{2})",
        "grossTotalIncome": r"(?:Gross\s+Total\s+Income|Total\s+Income)[:\s\-]*(?:Rs\.?\s*)?([\d,]+(?:\.\d{2})?)",
        "acknowledgementNumber": r"(?:Acknowledgement\s+(?:No|Number)|e[\-\s]?Filing\s+Ack)[:\s\-]*(\d{10,20})",
    },
    DocType.CA_TURNOVER: {
        "udin": r"(?:UDIN)[:\s\-]*(\d{14,20}[A-Z]*)",
        "caMembershipNumber": r"(?:Membership\s+(?:No|Number)|M\.?\s*No)[:\s\-]*(\d{5,7})",
        "turnoverYear1": r"(?:20\d{2}[\s\-]+20\d{2})[:\s]*(?:Rs\.?\s*)?([\d,]+(?:\.\d{2})?)",
    },
    DocType.EPFO_CHALLAN: {
        "establishmentCode": r"(?:Establishment\s+(?:Code|Id|ID))[:\s\-]*([A-Z]{2}[/\-]?\w+[/\-]?\w+)",
        "trrnNumber": r"(?:TRRN)[:\s\-]*(\d{10,20})",
        "employeeCount": r"(?:Total\s+(?:Members?|Employees?))[:\s\-]*(\d+)",
    },
    DocType.OEM_AUTH: {
        "tenderRefNo": r"(?:Tender\s+(?:Ref|Reference|No|Number))[:\s\-]*([A-Za-z0-9/\-]+)",
        "authorizedDealerName": r"(?:Authorized\s+(?:Dealer|Distributor|Partner))[:\s\-]*([A-Z][A-Za-z\s&.,()]+)",
        "validityPeriod": r"(?:Valid(?:ity)?\s+(?:up\s+to|till|period|from))[:\s\-]*([\d]{2}[/\-][\d]{2}[/\-][\d]{4})",
    },
}


# ──────────────────────────────────────────────
#  LLM-Powered Extraction
# ──────────────────────────────────────────────

LLM_EXTRACTION_PROMPTS = {
    DocType.GST_CERTIFICATE: """Extract EXACTLY these fields from this GST Certificate text. Return JSON only:
{
  "gstin": "15-char GSTIN string",
  "legalName": "Registered legal name",
  "tradeName": "Trade name (null if same as legal name)",
  "registrationDate": "DD/MM/YYYY",
  "constitutionOfBusiness": "e.g. Private Limited Company",
  "status": "Active/Cancelled/Suspended"
}""",
    DocType.UDYAM_CERTIFICATE: """Extract EXACTLY these fields from this Udyam/MSME Certificate. Return JSON only:
{
  "udyamNumber": "e.g. UDYAM-XX-00-0000000",
  "enterpriseType": "Micro/Small/Medium",
  "majorActivity": "Manufacturing/Services",
  "nicCode": "NIC code digits",
  "organizationType": "e.g. Proprietorship, Partnership, Pvt Ltd"
}""",
    DocType.PAN_CARD: """Extract EXACTLY these fields from this PAN Card. Return JSON only:
{
  "pan": "10-char PAN e.g. ABCDE1234F",
  "entityName": "Name on the PAN card",
  "dateOfIncorporationOrBirth": "DD/MM/YYYY"
}""",
    DocType.ITR_V: """Extract EXACTLY these fields from this ITR-V / IT Return. Return JSON only:
{
  "pan": "PAN number",
  "assessmentYear": "e.g. 2024-2025",
  "grossTotalIncome": "numeric amount in INR",
  "acknowledgementNumber": "e-filing acknowledgement number"
}""",
    DocType.CA_TURNOVER: """Extract EXACTLY these fields from this CA Turnover Certificate. Return JSON only:
{
  "udin": "UDIN number",
  "caMembershipNumber": "CA membership number",
  "annualTurnover": {"FY 2022-23": "amount", "FY 2023-24": "amount", "FY 2024-25": "amount"}
}""",
}


def _get_groq_client() -> Optional[Groq]:
    if settings.GROQ_API_KEY:
        return Groq(api_key=settings.GROQ_API_KEY)
    return None


async def _extract_with_llm(text: str, doc_type: DocType) -> Optional[Dict[str, str]]:
    """Use Groq LLM to extract structured fields from document text."""
    prompt_template = LLM_EXTRACTION_PROMPTS.get(doc_type)
    if not prompt_template:
        return None

    truncated = text[:4000]
    prompt = f"{prompt_template}\n\nDOCUMENT TEXT:\n---\n{truncated}\n---\n\nJSON OUTPUT:"

    client = _get_groq_client()
    if client:
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Extract document fields into JSON. Output ONLY valid JSON. No markdown."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.0,
                max_tokens=800,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content.strip()
            parsed = json.loads(raw)
            # Flatten nested dicts to string values
            flat = {}
            for k, v in parsed.items():
                if v is None:
                    continue
                if isinstance(v, dict):
                    flat[k] = json.dumps(v)
                else:
                    flat[k] = str(v)
            return flat
        except Exception as e:
            print(f"[OCREngine] Groq LLM extraction failed: {e}")

    # Gemini fallback
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.0,
                    max_output_tokens=800,
                    response_mime_type="application/json",
                ),
            )
            parsed = json.loads(response.text.strip())
            flat = {}
            for k, v in parsed.items():
                if v is None:
                    continue
                flat[k] = str(v) if not isinstance(v, dict) else json.dumps(v)
            return flat
        except Exception as e:
            print(f"[OCREngine] Gemini extraction failed: {e}")

    return None


def _extract_with_regex(text: str, doc_type: DocType) -> Dict[str, str]:
    """Regex-based field extraction as fallback."""
    patterns = REGEX_EXTRACTORS.get(doc_type, {})
    extracted = {}
    for field_name, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted[field_name] = match.group(1).strip()
    return extracted


# ──────────────────────────────────────────────
#  Main OCR Extraction Pipeline
# ──────────────────────────────────────────────

async def extract_document_fields(
    file_path: str,
    doc_type: DocType,
) -> DocumentExtractionResponse:
    """
    Main entry point: Extract key-value fields from a classified document.

    Strategy:
    1. Extract text + positioned text blocks (for bounding boxes) via PyMuPDF
    2. Try LLM-based structured extraction (Groq → Gemini fallback)
    3. If LLM fails, fall back to regex patterns
    4. For each extracted field, find its bounding box in the positioned text
    5. Return DocumentExtractionResponse with fields + visual markers
    """
    import fitz
    doc = fitz.open(file_path)
    page_count = len(doc)
    doc.close()

    # Step 1: Extract text
    full_text = extract_full_text(file_path)
    positioned_text = extract_text_with_positions(file_path, page_num=0)

    if not full_text or len(full_text.strip()) < 20:
        return DocumentExtractionResponse(
            docType=doc_type,
            confidence=0.0,
            pageCount=page_count,
            warnings=["Document appears blank or unreadable"],
        )

    # Step 2: Try LLM extraction first
    extracted_fields = await _extract_with_llm(full_text, doc_type)
    confidence = 0.95

    # Step 3: Regex fallback
    if not extracted_fields:
        extracted_fields = _extract_with_regex(full_text, doc_type)
        confidence = 0.70

    if not extracted_fields:
        return DocumentExtractionResponse(
            docType=doc_type,
            confidence=0.0,
            pageCount=page_count,
            warnings=["Could not extract any fields from document"],
        )

    # Step 4: Find bounding boxes for each extracted value
    fields_with_boxes = {}
    visual_markers = {}

    for field_name, value in extracted_fields.items():
        bbox = find_text_bbox(positioned_text, value)
        field_box = FieldWithBox(
            value=value,
            confidence=confidence,
            boundingBox=BoundingBox(**bbox) if bbox else None,
        )
        fields_with_boxes[field_name] = field_box

        if bbox:
            # Convert to [x1, y1, x2, y2] for legacy visualMarkers format
            visual_markers[f"{field_name}Box"] = [
                bbox["x"], bbox["y"],
                bbox["x"] + bbox["width"],
                bbox["y"] + bbox["height"],
            ]

    # Step 5: Build warnings
    warnings = []
    if confidence < settings.CONFIDENCE_THRESHOLD:
        warnings.append(f"Low confidence ({confidence:.0%}). Manual review recommended.")
    if doc_type == DocType.UNKNOWN:
        warnings.append("Document type could not be determined.")

    return DocumentExtractionResponse(
        docType=doc_type,
        extractedFields=extracted_fields,
        fieldsWithBoxes=fields_with_boxes,
        confidence=confidence,
        extractionModel="PyMuPDF + Groq LLM" if confidence > 0.8 else "PyMuPDF + Regex",
        visualMarkers=visual_markers,
        pageCount=page_count,
        warnings=warnings,
    )
