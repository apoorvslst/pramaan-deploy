"""
PRAMAN AI Microservice — PaddleOCR Engine (via RapidOCR ONNX Runtime)

Uses PaddleOCR's PP-OCRv4 detection + recognition models through the
RapidOCR ONNX Runtime wrapper. This works on Python 3.14+ and provides
real OCR for scanned / image-based PDFs and images.

Capabilities:
  - Full OCR text extraction from scanned PDFs and images
  - Per-word bounding box coordinates (for 3-Pane Viewer highlighting)
  - Confidence scores per text region
  - Falls back to PyMuPDF text extraction for text-native PDFs
"""

import os
import logging
from typing import Dict, List, Optional, Tuple

import fitz  # PyMuPDF — for PDF-to-image conversion
from PIL import Image
import numpy as np

logger = logging.getLogger("praman.paddle_ocr")

# ──────────────────────────────────────────────
#  Lazy singleton RapidOCR engine
# ──────────────────────────────────────────────
_ocr_engine = None


def _get_ocr_engine():
    """Lazy-load the RapidOCR engine (downloads models on first use)."""
    global _ocr_engine
    if _ocr_engine is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _ocr_engine = RapidOCR()
            logger.info("[PaddleOCR] RapidOCR (PaddleOCR PP-OCRv4 ONNX) engine initialized.")
        except ImportError:
            logger.error("[PaddleOCR] rapidocr-onnxruntime not installed. Run: pip install rapidocr-onnxruntime")
            raise
    return _ocr_engine


# ──────────────────────────────────────────────
#  PDF → Image rendering (via PyMuPDF)
# ──────────────────────────────────────────────

def _pdf_page_to_image(file_path: str, page_num: int = 0, dpi: int = 300) -> np.ndarray:
    """Render a single PDF page to a numpy image array at the given DPI."""
    doc = fitz.open(file_path)
    if page_num >= len(doc):
        doc.close()
        raise ValueError(f"Page {page_num} does not exist in PDF (total pages: {len(doc)})")

    page = doc[page_num]
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)

    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, 3)
    doc.close()
    return img


def _image_file_to_array(file_path: str) -> np.ndarray:
    """Load an image file (PNG, JPG, etc.) to a numpy array."""
    img = Image.open(file_path).convert("RGB")
    return np.array(img)


# ──────────────────────────────────────────────
#  Core PaddleOCR extraction
# ──────────────────────────────────────────────

def run_paddle_ocr_on_image(img_array: np.ndarray) -> List[Dict]:
    """
    Run PaddleOCR on a numpy image array.

    Returns a list of OCR results:
    [
        {
            "text": "GSTIN: 07AABCN1234F1Z5",
            "confidence": 0.96,
            "bbox": [x1, y1, x2, y2, x3, y3, x4, y4],  # 4-point polygon
            "bbox_rect": [x_min, y_min, x_max, y_max],    # axis-aligned rect
        },
        ...
    ]
    """
    engine = _get_ocr_engine()
    result, elapse = engine(img_array)

    ocr_results = []
    if result is None:
        return ocr_results

    for item in result:
        # RapidOCR returns: [[x1,y1],[x2,y2],[x3,y3],[x4,y4]], text, confidence
        bbox_points, text, confidence = item

        # Flatten 4-point polygon
        flat_bbox = []
        for pt in bbox_points:
            flat_bbox.extend([float(pt[0]), float(pt[1])])

        # Compute axis-aligned bounding rect
        xs = [pt[0] for pt in bbox_points]
        ys = [pt[1] for pt in bbox_points]
        bbox_rect = [min(xs), min(ys), max(xs), max(ys)]

        ocr_results.append({
            "text": text.strip(),
            "confidence": round(float(confidence), 4),
            "bbox": flat_bbox,
            "bbox_rect": [round(v, 2) for v in bbox_rect],
        })

    return ocr_results


def run_paddle_ocr_on_pdf(
    file_path: str,
    page_num: int = 0,
    dpi: int = 300,
) -> Tuple[List[Dict], int, int]:
    """
    Run PaddleOCR on a specific page of a PDF file.

    Returns:
        (ocr_results, page_width_px, page_height_px)
    """
    img = _pdf_page_to_image(file_path, page_num=page_num, dpi=dpi)
    h, w = img.shape[:2]
    results = run_paddle_ocr_on_image(img)
    return results, w, h


# ──────────────────────────────────────────────
#  Full text extraction (PaddleOCR + PyMuPDF)
# ──────────────────────────────────────────────

def extract_full_text_paddle(file_path: str) -> str:
    """
    Extract full text from a PDF using PaddleOCR.
    First tries PyMuPDF native text extraction; if the PDF appears to be
    scanned (very little native text), falls back to PaddleOCR on rendered pages.
    """
    # Try native text first
    doc = fitz.open(file_path)
    page_count = len(doc)
    native_text = ""
    for page in doc:
        native_text += page.get_text("text") + "\n"
    doc.close()

    native_text = native_text.strip()

    # If native text extraction produced substantial text, use it
    if len(native_text) > 100:
        return native_text

    # Scanned/image PDF — use PaddleOCR
    logger.info(f"[PaddleOCR] Native text too short ({len(native_text)} chars). Running PaddleOCR on {page_count} pages...")
    all_text_parts = []
    for page_idx in range(min(page_count, 10)):  # Cap at 10 pages for perf
        try:
            results, _, _ = run_paddle_ocr_on_pdf(file_path, page_num=page_idx)
            page_text = " ".join([r["text"] for r in results])
            all_text_parts.append(page_text)
        except Exception as e:
            logger.warning(f"[PaddleOCR] Page {page_idx} OCR failed: {e}")

    ocr_text = "\n".join(all_text_parts).strip()
    return ocr_text if ocr_text else native_text


def extract_text_with_paddle_positions(
    file_path: str,
    page_num: int = 0,
) -> List[Dict]:
    """
    Extract text with bounding box positions using PaddleOCR.
    Falls back to PyMuPDF if the PDF has native text.

    Returns list of:
    {
        "text": "...",
        "confidence": 0.96,
        "x0": float, "y0": float, "x1": float, "y1": float,
        "pageWidth": float, "pageHeight": float,
    }
    """
    # Check if native text extraction is sufficient
    doc = fitz.open(file_path)
    if page_num >= len(doc):
        doc.close()
        return []

    page = doc[page_num]
    native_text = page.get_text("text").strip()
    page_rect = page.rect
    doc.close()

    if len(native_text) > 100:
        # Use PyMuPDF's native positioned text (more accurate for text PDFs)
        from utils.pdf_utils import extract_text_with_positions
        return extract_text_with_positions(file_path, page_num)

    # Scanned PDF — use PaddleOCR
    ocr_results, img_w, img_h = run_paddle_ocr_on_pdf(file_path, page_num=page_num)

    positioned = []
    for r in ocr_results:
        x_min, y_min, x_max, y_max = r["bbox_rect"]
        positioned.append({
            "text": r["text"],
            "confidence": r["confidence"],
            "x0": x_min,
            "y0": y_min,
            "x1": x_max,
            "y1": y_max,
            "pageWidth": float(img_w),
            "pageHeight": float(img_h),
        })

    return positioned
