"""
PRAMAN AI Microservice — Phase 5: QR Code Decoder & Cross-Check Engine

Extracts embedded QR codes from government certificates (GST, Udyam, EPFO),
decodes the payload, and cross-references against the document's visible text.

If QR code payload contains GSTIN '07ABCDE1234F1Z5' but document body text
has '07AAAAA9999A1Z1' → CRITICAL FORGERY flag.

Uses: PyZBar for QR decoding, Pillow for image handling, PyMuPDF for PDF→Image.
Based on Section 7.4.3 of the PRAMAN blueprint.
"""

import re
import io
from typing import List, Optional

from PIL import Image

from schemas.forensics import QRVerificationResult, QRPayload
from utils.image_utils import pdf_page_to_image


def _try_decode_qr(image: Image.Image) -> List[dict]:
    """
    Attempt to decode QR codes from a PIL Image.
    Uses pyzbar if available, falls back to OpenCV.
    Returns list of {data: str, rect: tuple}.
    """
    decoded = []

    # Try pyzbar first
    try:
        from pyzbar.pyzbar import decode as pyzbar_decode
        results = pyzbar_decode(image)
        for obj in results:
            decoded.append({
                "data": obj.data.decode("utf-8", errors="ignore"),
                "type": obj.type,
            })
        if decoded:
            return decoded
    except ImportError:
        pass
    except Exception:
        pass

    # Fallback: OpenCV QR detector
    try:
        import cv2
        import numpy as np
        img_array = np.array(image)
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array
        detector = cv2.QRCodeDetector()
        data, points, _ = detector.detectAndDecode(gray)
        if data:
            decoded.append({"data": data, "type": "QRCODE"})
    except ImportError:
        pass
    except Exception:
        pass

    return decoded


def verify_qr_codes(
    file_path: str,
    claimed_identifier: str,
    max_pages: int = 5,
) -> QRVerificationResult:
    """
    Extract QR codes from all pages of a PDF and cross-check against a claimed identifier.

    Args:
        file_path: Path to the PDF document
        claimed_identifier: The identifier to match against (e.g., GSTIN, Udyam number, PAN)
        max_pages: Maximum number of pages to scan (default 5)

    Returns:
        QRVerificationResult with match status and forgery flag
    """
    qr_payloads: List[QRPayload] = []
    qr_matched = False
    is_forgery = False

    # Render each page as an image and scan for QR codes
    import fitz
    doc = fitz.open(file_path)
    page_count = min(len(doc), max_pages)
    doc.close()

    for page_num in range(page_count):
        page_image = pdf_page_to_image(file_path, page_num=page_num, dpi=300)
        if page_image is None:
            continue

        decoded_items = _try_decode_qr(page_image)

        for item in decoded_items:
            qr_data = item["data"]
            qr_payloads.append(QRPayload(
                page=page_num + 1,
                payload=qr_data,
            ))

            # Normalize both strings for comparison
            clean_claim = re.sub(r"[^A-Z0-9]", "", claimed_identifier.upper())
            clean_payload = re.sub(r"[^A-Z0-9]", "", qr_data.upper())

            if clean_claim and clean_claim in clean_payload:
                qr_matched = True

    # Determine forgery status
    if qr_payloads and not qr_matched and claimed_identifier.strip():
        # QR codes exist but NONE match the claimed identifier → forgery
        is_forgery = True

    # matches_claim is None if no QR codes were found at all
    matches_claim = None
    if qr_payloads:
        matches_claim = qr_matched

    return QRVerificationResult(
        qrCodesFound=len(qr_payloads),
        qrPayloads=qr_payloads,
        matchesClaim=matches_claim,
        claimedIdentifier=claimed_identifier,
        isForgeryDetected=is_forgery,
    )
