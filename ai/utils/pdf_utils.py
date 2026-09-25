"""
PRAMAN AI Microservice — PDF Utility Functions
Handles PyMuPDF document loading, text extraction, coordinate normalization,
and page rendering for the 3-Pane Viewer.
"""

import fitz  # PyMuPDF
import hashlib
import os
import tempfile
from typing import List, Dict, Tuple, Optional
from fastapi import UploadFile


async def save_upload_to_temp(file: UploadFile) -> str:
    """
    Save an uploaded file to a temporary path and return the path.
    Caller is responsible for cleanup.
    """
    suffix = os.path.splitext(file.filename or "document.pdf")[1]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    content = await file.read()
    tmp.write(content)
    tmp.flush()
    tmp.close()
    # Reset file position for potential re-reads
    await file.seek(0)
    return tmp.name


def compute_sha256(file_path: str) -> str:
    """Compute SHA-256 hash of a file on disk."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def extract_full_text(file_path: str) -> str:
    """Extract all text from every page of a PDF using PyMuPDF."""
    doc = fitz.open(file_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + "\n"
    doc.close()
    return full_text.strip()


def extract_text_by_page(file_path: str) -> List[Dict]:
    """
    Extract text page-by-page with metadata.
    Returns list of {pageNumber, text, width, height}.
    """
    doc = fitz.open(file_path)
    pages = []
    for i, page in enumerate(doc):
        rect = page.rect
        pages.append({
            "pageNumber": i + 1,
            "text": page.get_text("text").strip(),
            "width": rect.width,
            "height": rect.height,
        })
    doc.close()
    return pages


def extract_text_with_positions(file_path: str, page_num: int = 0) -> List[Dict]:
    """
    Extract text blocks with their bounding box positions from a specific page.
    Returns list of {text, x0, y0, x1, y1, pageWidth, pageHeight}.
    Used for generating 3-Pane Viewer bounding box highlights.
    """
    doc = fitz.open(file_path)
    if page_num >= len(doc):
        doc.close()
        return []

    page = doc[page_num]
    rect = page.rect
    blocks = page.get_text("dict", flags=fitz.TEXTFLAGS_TEXT)["blocks"]

    positioned_text = []
    for block in blocks:
        if block.get("type") != 0:  # Only text blocks
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                bbox = span["bbox"]  # (x0, y0, x1, y1) in PDF points
                positioned_text.append({
                    "text": span["text"].strip(),
                    "x0": bbox[0],
                    "y0": bbox[1],
                    "x1": bbox[2],
                    "y1": bbox[3],
                    "font": span.get("font", ""),
                    "size": span.get("size", 0),
                    "pageWidth": rect.width,
                    "pageHeight": rect.height,
                })

    doc.close()
    return positioned_text


def normalize_bbox_to_percent(
    x0: float, y0: float, x1: float, y1: float,
    page_width: float, page_height: float
) -> Dict[str, float]:
    """
    Convert absolute PDF point coordinates to percentage-based coordinates.
    This ensures bounding boxes stay aligned at any browser zoom level
    in the React 3-Pane Viewer.
    """
    return {
        "x": round((x0 / page_width) * 100, 2),
        "y": round((y0 / page_height) * 100, 2),
        "width": round(((x1 - x0) / page_width) * 100, 2),
        "height": round(((y1 - y0) / page_height) * 100, 2),
    }


def find_text_bbox(
    positioned_text: List[Dict], search_text: str
) -> Optional[Dict]:
    """
    Find the bounding box of a specific text string within positioned text blocks.
    Returns normalized percentage bbox or None if not found.
    Case-insensitive partial matching.
    """
    search_lower = search_text.lower().strip()
    if not search_lower:
        return None

    for item in positioned_text:
        if search_lower in item["text"].lower():
            return normalize_bbox_to_percent(
                item["x0"], item["y0"], item["x1"], item["y1"],
                item["pageWidth"], item["pageHeight"],
            )
    return None


def get_pdf_metadata(file_path: str) -> Dict:
    """Extract PDF metadata (producer, creator, dates) for forensic analysis."""
    doc = fitz.open(file_path)
    metadata = doc.metadata or {}
    page_count = len(doc)
    doc.close()
    return {
        "producer": metadata.get("producer"),
        "creator": metadata.get("creator"),
        "creationDate": metadata.get("creationDate"),
        "modDate": metadata.get("modDate"),
        "title": metadata.get("title"),
        "author": metadata.get("author"),
        "subject": metadata.get("subject"),
        "pageCount": page_count,
    }


def get_font_info(file_path: str) -> List[Dict]:
    """
    Extract all fonts used in the PDF.
    Font inconsistencies can indicate text tampering/insertion.
    """
    doc = fitz.open(file_path)
    fonts = set()
    font_details = []
    for page in doc:
        blocks = page.get_text("dict", flags=fitz.TEXTFLAGS_TEXT)["blocks"]
        for block in blocks:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    font_key = (span.get("font", ""), span.get("size", 0))
                    if font_key not in fonts:
                        fonts.add(font_key)
                        font_details.append({
                            "font": span.get("font", ""),
                            "size": span.get("size", 0),
                        })
    doc.close()
    return font_details
