"""
PRAMAN AI Microservice — Image Utility Functions
Handles Error Level Analysis (ELA), image conversion, and forensic heatmaps.
"""

import io
import numpy as np
from PIL import Image
from typing import Optional


def error_level_analysis(image_path: str, quality: int = 90) -> np.ndarray:
    """
    Perform Error Level Analysis (ELA) to detect image tampering.
    
    How it works:
    1. Re-save the image at a lower JPEG quality
    2. Compute the pixel-level difference between original and re-saved
    3. Tampered regions show HIGHER error levels (brighter in the diff)
    
    Returns a numpy array of the amplified difference image.
    """
    original = Image.open(image_path).convert("RGB")

    # Re-save at lower quality
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    resaved = Image.open(buffer).convert("RGB")

    # Compute absolute difference and amplify
    orig_array = np.array(original, dtype=np.float32)
    resaved_array = np.array(resaved, dtype=np.float32)
    diff = np.abs(orig_array - resaved_array)

    # Amplify differences (scale × 10) for visibility
    ela_image = (diff * 10).clip(0, 255).astype(np.uint8)
    return ela_image


def pdf_page_to_image(file_path: str, page_num: int = 0, dpi: int = 200) -> Optional[Image.Image]:
    """
    Render a PDF page as a PIL Image at the specified DPI.
    Used for QR code extraction and visual analysis.
    """
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        if page_num >= len(doc):
            doc.close()
            return None
        page = doc[page_num]
        # Render at specified DPI
        zoom = dpi / 72.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        doc.close()
        return img
    except Exception:
        return None


def image_to_bytes(image: Image.Image, fmt: str = "PNG") -> bytes:
    """Convert a PIL Image to bytes."""
    buffer = io.BytesIO()
    image.save(buffer, format=fmt)
    return buffer.getvalue()
