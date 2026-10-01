"""
PRAMAN AI Microservice — Phase 2: Tender Rule Extraction Service

Parses tender NIT/RFP PDF documents to extract statutory eligibility rules.
Uses PyMuPDF for text extraction + Groq LLM for structured clause identification.

Extracted Rules (maps to backend Tender.js → rules):
  - Minimum annual turnover (INR)
  - Turnover years required
  - Minimum experience years
  - Make in India percentage
  - MSME/Startup exemptions
  - EMD amount & requirements
  - Required statutory certificates
"""

import json
import re
import os
from typing import Optional
from groq import Groq

from config import settings
from utils.pdf_utils import extract_full_text
from schemas.tender import TenderRules, RequiredCertificate, TenderParseResponse


# ──────────────────────────────────────────────
#  LLM Client Initialization
# ──────────────────────────────────────────────

def _get_groq_client() -> Optional[Groq]:
    """Initialize Groq client if API key is available."""
    if settings.GROQ_API_KEY:
        return Groq(api_key=settings.GROQ_API_KEY)
    return None


# ──────────────────────────────────────────────
#  Regex-Based Fallback Extraction
# ──────────────────────────────────────────────

def _extract_rules_with_regex(text: str) -> dict:
    """
    Fallback rule extraction using regex patterns.
    Catches common tender clause patterns even without LLM.
    """
    rules = {
        "minimumTurnoverINR": 0,
        "turnoverYearsRequired": 3,
        "minimumExperienceYears": 0,
        "makeInIndiaPercentage": 20,
        "allowStartupExemption": True,
        "allowMSMEExemption": True,
        "emdRequired": True,
        "emdAmountINR": 0,
        "requiredCertificates": [],
    }
    estimated_value = 0

    text_lower = text.lower()

    # --- Extract estimated value ---
    value_patterns = [
        r'estimated\s*(?:cost|value|amount)[:\s]*(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)',
        r'estimated\s*(?:cost|value|amount)[:\s]*(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|lac)',
        r'estimated\s*(?:cost|value|amount)[:\s]*(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)',
    ]
    for i, pattern in enumerate(value_patterns):
        match = re.search(pattern, text_lower)
        if match:
            raw_val = float(match.group(1).replace(",", ""))
            if i == 0:  # crore
                estimated_value = raw_val * 10_000_000
            elif i == 1:  # lakh
                estimated_value = raw_val * 100_000
            else:
                estimated_value = raw_val
            break

    # --- Extract turnover ---
    turnover_patterns = [
        r'(?:annual|average)\s*(?:financial\s*)?turnover[^.]*?(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)',
        r'(?:annual|average)\s*(?:financial\s*)?turnover[^.]*?(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|lac)',
        r'(?:annual|average)\s*(?:financial\s*)?turnover[^.]*?(\d+)\s*%\s*(?:of\s*)?(?:estimated|tender)',
        r'turnover[^.]*?(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)',
    ]
    for i, pattern in enumerate(turnover_patterns):
        match = re.search(pattern, text_lower)
        if match:
            raw_val = float(match.group(1).replace(",", ""))
            if i == 0:
                rules["minimumTurnoverINR"] = raw_val * 10_000_000
            elif i == 1:
                rules["minimumTurnoverINR"] = raw_val * 100_000
            elif i == 2:
                rules["minimumTurnoverINR"] = (raw_val / 100) * estimated_value if estimated_value else 0
            else:
                rules["minimumTurnoverINR"] = raw_val
            break

    # --- Turnover years ---
    years_match = re.search(r'(?:last|preceding|past)\s*(\d+)\s*(?:financial\s*)?years?.*?turnover', text_lower)
    if years_match:
        rules["turnoverYearsRequired"] = int(years_match.group(1))

    # --- Experience years ---
    exp_match = re.search(r'(?:minimum|at\s*least)\s*(\d+)\s*years?\s*(?:of\s*)?(?:experience|similar\s*work)', text_lower)
    if exp_match:
        rules["minimumExperienceYears"] = int(exp_match.group(1))

    # --- Make in India ---
    mii_match = re.search(r'(?:local\s*content|make\s*in\s*india|mii)[^.]*?(\d+)\s*%', text_lower)
    if mii_match:
        rules["makeInIndiaPercentage"] = float(mii_match.group(1))

    # --- EMD ---
    emd_patterns = [
        r'emd[^.]*?(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)',
        r'emd[^.]*?(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|lac)',
        r'emd[^.]*?(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)',
        r'earnest\s*money[^.]*?(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)',
    ]
    for i, pattern in enumerate(emd_patterns):
        match = re.search(pattern, text_lower)
        if match:
            raw_val = float(match.group(1).replace(",", ""))
            if "crore" in pattern or "cr" in pattern:
                rules["emdAmountINR"] = raw_val * 10_000_000
            elif "lakh" in pattern or "lac" in pattern:
                rules["emdAmountINR"] = raw_val * 100_000
            else:
                rules["emdAmountINR"] = raw_val
            break

    if "emd exempted" in text_lower or "emd waived" in text_lower or "no emd" in text_lower:
        rules["emdRequired"] = False
        rules["emdAmountINR"] = 0

    # --- MSME / Startup exemptions ---
    if "msme" in text_lower or "micro" in text_lower or "small enterprise" in text_lower:
        rules["allowMSMEExemption"] = True
    if "startup" in text_lower or "dpiit" in text_lower:
        rules["allowStartupExemption"] = True

    # --- Detect required certificates ---
    cert_keywords = {
        "GST_CERTIFICATE": ["gst", "gstin", "gst registration", "gst certificate", "gst reg-06"],
        "UDYAM_CERTIFICATE": ["udyam", "msme registration", "msme certificate", "udyam registration"],
        "PAN_CARD": ["pan card", "pan number", "permanent account number"],
        "ITR_ACKNOWLEDGEMENT": ["itr", "income tax return", "itr-v", "itr acknowledgement"],
        "CA_TURNOVER_CERTIFICATE": ["ca certificate", "chartered accountant", "turnover certificate", "udin"],
        "EPFO_REGISTRATION": ["epfo", "pf registration", "provident fund", "epf"],
        "ESIC_REGISTRATION": ["esic", "esi registration", "employee state insurance"],
        "DEBARMENT_AFFIDAVIT": ["debarment", "blacklist", "not debarred", "affidavit"],
        "OEM_AUTHORIZATION": ["oem", "original equipment manufacturer", "authorization letter"],
        "LOCAL_CONTENT_DECLARATION": ["local content", "make in india", "mii declaration"],
    }
    detected_certs = []
    for cert_type, keywords in cert_keywords.items():
        for kw in keywords:
            if kw in text_lower:
                detected_certs.append(cert_type)
                break

    rules["requiredCertificates"] = [
        {"type": ct, "isMandatory": True, "weightage": round(100 / max(len(detected_certs), 1), 1)}
        for ct in detected_certs
    ]

    return rules, estimated_value


# ──────────────────────────────────────────────
#  LLM-Powered Rule Extraction
# ──────────────────────────────────────────────

EXTRACTION_PROMPT = """You are a government procurement rules extraction engine for Indian public tenders (GeM/CPPP).

Given the following tender document text, extract ALL eligibility rules and requirements into a strict JSON object.

IMPORTANT: Only extract information that is EXPLICITLY stated in the text. Do NOT hallucinate or assume.

Return this EXACT JSON structure (no additional text, no markdown, just raw JSON):
{
  "tenderTitle": "string or null",
  "department": "string or null",
  "estimatedValueINR": number or null,
  "minimumTurnoverINR": number (0 if not mentioned),
  "turnoverYearsRequired": number (default 3),
  "minimumExperienceYears": number (0 if not mentioned),
  "makeInIndiaPercentage": number (default 20),
  "allowStartupExemption": boolean,
  "allowMSMEExemption": boolean,
  "emdRequired": boolean,
  "emdAmountINR": number (0 if not mentioned or exempted),
  "requiredCertificates": ["GST_CERTIFICATE", "UDYAM_CERTIFICATE", "PAN_CARD", ...]
}

Valid certificate types: GST_CERTIFICATE, UDYAM_CERTIFICATE, PAN_CARD, ITR_ACKNOWLEDGEMENT, CA_TURNOVER_CERTIFICATE, EPFO_REGISTRATION, ESIC_REGISTRATION, DEBARMENT_AFFIDAVIT, OEM_AUTHORIZATION, LOCAL_CONTENT_DECLARATION

TENDER DOCUMENT TEXT:
---
{text}
---

JSON OUTPUT:"""


async def extract_rules_with_llm(text: str) -> Optional[dict]:
    """
    Use Groq (Llama-3.3-70B) to extract structured rules from tender text.
    Falls back to Gemini if Groq fails.
    """
    # Truncate text to fit context window (keep first ~6000 chars)
    truncated_text = text[:6000]
    prompt = EXTRACTION_PROMPT.replace("{text}", truncated_text)

    # Try Groq first
    client = _get_groq_client()
    if client:
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a precise JSON extraction engine. Output ONLY valid JSON."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.0,
                max_tokens=1500,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content.strip()
            return json.loads(raw)
        except Exception as e:
            print(f"[RuleExtractor] Groq extraction failed: {e}")

    # Fallback to Gemini
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.0,
                    max_output_tokens=1500,
                    response_mime_type="application/json",
                ),
            )
            raw = response.text.strip()
            return json.loads(raw)
        except Exception as e:
            print(f"[RuleExtractor] Gemini extraction failed: {e}")

    return None


# ──────────────────────────────────────────────
#  Main Extraction Pipeline
# ──────────────────────────────────────────────

async def parse_tender_rules(file_path: str) -> TenderParseResponse:
    """
    Main entry point: Parse a tender PDF and extract eligibility rules.
    
    Strategy:
    1. Extract full text with PyMuPDF
    2. Try LLM-based extraction (Groq → Gemini fallback)
    3. If LLM fails, use regex fallback
    4. Return structured TenderParseResponse
    """
    # Step 1: Extract text
    full_text = extract_full_text(file_path)
    if not full_text or len(full_text.strip()) < 50:
        return TenderParseResponse(
            rules=TenderRules(),
            confidence=0.0,
            rawExtractedText=full_text[:500] if full_text else None,
        )

    # Step 2: Try LLM extraction
    llm_result = await extract_rules_with_llm(full_text)
    confidence = 0.95  # High confidence for LLM extraction

    if llm_result:
        # Build required certificates list from LLM output
        cert_types = llm_result.get("requiredCertificates", [])
        required_certs = []
        for ct in cert_types:
            if isinstance(ct, str):
                required_certs.append(RequiredCertificate(
                    type=ct,
                    isMandatory=True,
                    weightage=round(100 / max(len(cert_types), 1), 1),
                ))

        rules = TenderRules(
            minimumTurnoverINR=llm_result.get("minimumTurnoverINR", 0) or 0,
            turnoverYearsRequired=llm_result.get("turnoverYearsRequired", 3) or 3,
            minimumExperienceYears=llm_result.get("minimumExperienceYears", 0) or 0,
            makeInIndiaPercentage=llm_result.get("makeInIndiaPercentage", 20) or 20,
            allowStartupExemption=llm_result.get("allowStartupExemption", True),
            allowMSMEExemption=llm_result.get("allowMSMEExemption", True),
            emdRequired=llm_result.get("emdRequired", True),
            emdAmountINR=llm_result.get("emdAmountINR", 0) or 0,
            requiredCertificates=required_certs,
        )

        return TenderParseResponse(
            tenderTitle=llm_result.get("tenderTitle"),
            department=llm_result.get("department"),
            estimatedValueINR=llm_result.get("estimatedValueINR"),
            rules=rules,
            confidence=confidence,
            rawExtractedText=full_text[:500],
        )

    # Step 3: Regex fallback
    regex_rules, estimated_value = _extract_rules_with_regex(full_text)
    required_certs = [
        RequiredCertificate(**cert)
        for cert in regex_rules.pop("requiredCertificates", [])
    ]
    rules = TenderRules(**regex_rules, requiredCertificates=required_certs)

    return TenderParseResponse(
        estimatedValueINR=estimated_value if estimated_value > 0 else None,
        rules=rules,
        confidence=0.60,  # Lower confidence for regex-only
        rawExtractedText=full_text[:500],
    )
