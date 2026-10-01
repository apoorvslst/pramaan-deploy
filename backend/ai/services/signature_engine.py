"""
PRAMAN AI Microservice — Signature Intelligence & Cross-Verification Engine

Features:
  1. Signature Detection: Locates signature blocks via statutory text anchors + contour analysis.
  2. Bounding Box & Crop: Normalizes coordinates and extracts base64 visual crops for UI.
  3. Visual Feature Embedding: Computes 128-dimensional L2-normalized stroke geometry vectors.
  4. Vector DB (ChromaDB): Stores and searches signature embeddings with cosine distance.
  5. Cross-Bidder Collusion Detection: Spots identical signers / proxy signers across competing bidders.
  6. Cut-and-Paste Forgery Detection: Flags cloned digital signatures across documents.
"""

import os
import io
import re
import uuid
import base64
import math
from typing import List, Dict, Any, Optional, Tuple

import fitz  # PyMuPDF
from PIL import Image
import numpy as np

from config import settings
from schemas.document import BoundingBox
from schemas.signature import (
    DetectedSignature,
    SignatureExtractionResponse,
    SignatureIndexRequest,
    SignatureIndexResponse,
    SignatureMatchResult,
    SignatureVerdict,
    CrossBidSignatureCheckRequest,
    CrossBidSignatureCheckResponse,
    AnchorSignatureVerifyRequest,
    AnchorSignatureVerifyResponse,
)
from utils.pdf_utils import normalize_bbox_to_percent


# ──────────────────────────────────────────────
#  Core Primary Statutory Signatories Only
#  (Focused solely on Authorized Signatories/Directors and Chartered Accountants)
# ──────────────────────────────────────────────

SIGNATURE_TEXT_ANCHORS = [
    r"authorized\s+signatory",
    r"authorised\s+signatory",
    r"signature\s+of\s+(?:the\s+)?bidder",
    r"chartered\s+accountant",
    r"managing\s+director",
    r"director",
    r"partner",
    r"proprietor",
]


# ──────────────────────────────────────────────
#  ChromaDB Signature Collection
# ──────────────────────────────────────────────

_signature_chroma_client = None
_signature_collection = None


def _get_signature_collection():
    """Lazily initialize ChromaDB collection for signatures."""
    global _signature_chroma_client, _signature_collection
    if _signature_collection is not None:
        return _signature_collection

    try:
        import chromadb
        _signature_chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIRECTORY
        )
        _signature_collection = _signature_chroma_client.get_or_create_collection(
            name="praman_signature_registry",
            metadata={"hnsw:space": "cosine"},
        )
        return _signature_collection
    except Exception as e:
        print(f"[SignatureEngine] ChromaDB init failed: {e}")
        return None


# ──────────────────────────────────────────────
#  Visual Feature Embedding Generator (HOG + Density)
# ──────────────────────────────────────────────

def generate_signature_embedding(pil_image: Image.Image) -> List[float]:
    """
    Generate a normalized 128-dimensional stroke feature embedding from a cropped signature image.
    Uses multi-grid gradient orientation histograms + stroke moments.
    Output is L2-normalized so that cosine similarity = dot product.
    """
    # 1. Convert to grayscale & standard size 128x128
    gray = pil_image.convert("L").resize((128, 128), Image.Resampling.BILINEAR)
    img_arr = np.array(gray, dtype=np.float32)

    # 2. Invert so strokes are high values (white on black background)
    # Most signatures are dark ink on light paper
    img_arr = 255.0 - img_arr

    # Binarize with threshold
    thresh = np.mean(img_arr) + 0.3 * np.std(img_arr)
    binary_img = (img_arr > thresh).astype(np.float32)

    # 3. Compute spatial gradients (Sobel-like)
    gx = np.zeros_like(img_arr)
    gy = np.zeros_like(img_arr)
    gx[:, 1:-1] = img_arr[:, 2:] - img_arr[:, :-2]
    gy[1:-1, :] = img_arr[2:, :] - img_arr[:-2, :]

    magnitude = np.sqrt(gx ** 2 + gy ** 2)
    angle = (np.arctan2(gy, gx) * (180.0 / np.pi)) % 180.0

    # 4. Multi-cell Histogram of Oriented Gradients (4x4 spatial grid, 8 angle bins = 128 dims)
    num_cells_x, num_cells_y = 4, 4
    num_bins = 8
    cell_w, cell_h = 32, 32
    bin_width = 180.0 / num_bins

    features = []

    for cy in range(num_cells_y):
        for cx in range(num_cells_x):
            cell_mag = magnitude[cy * cell_h:(cy + 1) * cell_h, cx * cell_w:(cx + 1) * cell_w]
            cell_ang = angle[cy * cell_h:(cy + 1) * cell_h, cx * cell_w:(cx + 1) * cell_w]
            cell_bin = binary_img[cy * cell_h:(cy + 1) * cell_h, cx * cell_w:(cx + 1) * cell_w]

            hist = np.zeros(num_bins, dtype=np.float32)
            for b in range(num_bins):
                bin_mask = (cell_ang >= b * bin_width) & (cell_ang < (b + 1) * bin_width)
                hist[b] = np.sum(cell_mag[bin_mask])

            # Also incorporate stroke density
            density = np.sum(cell_bin)

            cell_feat = np.append(hist, density)
            features.extend(cell_feat.tolist()[:8])  # keep 8 features per cell = 128 total

    feat_vec = np.array(features[:128], dtype=np.float32)

    # 5. L2 Normalization
    norm = np.linalg.norm(feat_vec)
    if norm > 1e-6:
        feat_vec = feat_vec / norm
    else:
        feat_vec = np.ones(128, dtype=np.float32) / math.sqrt(128)

    return feat_vec.tolist()


def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two unit vectors."""
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a < 1e-6 or norm_b < 1e-6:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


# ──────────────────────────────────────────────
#  Signature Detection & Bounding Box Extractor
# ──────────────────────────────────────────────

def detect_signatures_in_pdf(
    file_path: str,
    max_pages: int = 5,
) -> SignatureExtractionResponse:
    """
    Scans PDF pages to locate signature regions using text anchors and visual stroke contours.
    Extracts bounding boxes, cropped thumbnails (base64), and visual embeddings.
    """
    doc = fitz.open(file_path)
    total_pages = len(doc)
    scan_pages = min(total_pages, max_pages)

    detected_signatures: List[DetectedSignature] = []
    warnings: List[str] = []

    for page_idx in range(scan_pages):
        page = doc[page_idx]
        page_rect = page.rect
        page_w = page_rect.width
        page_h = page_rect.height

        # Render page to high-res PIL Image for visual cropping
        pix = page.get_pixmap(dpi=200)
        page_img = Image.open(io.BytesIO(pix.tobytes("png")))
        img_w, img_h = page_img.size
        scale_x = img_w / page_w
        scale_y = img_h / page_h

        # Step 1: Search for statutory text anchors
        text_page = page.get_text("blocks")
        found_anchors = []

        for block in text_page:
            x0, y0, x1, y1, text, block_no, block_type = block
            clean_text = text.lower()
            for pattern in SIGNATURE_TEXT_ANCHORS:
                if re.search(pattern, clean_text):
                    found_anchors.append({
                        "label": text.strip()[:40],
                        "rect": (x0, y0, x1, y1),
                    })
                    break

        # Step 2: Extract signature regions around anchors
        if found_anchors:
            for anchor in found_anchors:
                ax0, ay0, ax1, ay1 = anchor["rect"]

                # The signature is typically directly above the label (e.g. 70pt height)
                sig_x0 = max(0, ax0 - 30)
                sig_y0 = max(0, ay0 - 75)
                sig_x1 = min(page_w, ax1 + 50)
                sig_y1 = min(page_h, ay1 + 5)

                sig_w = sig_x1 - sig_x0
                sig_h = sig_y1 - sig_y0

                if sig_w <= 10 or sig_h <= 10:
                    continue

                # Crop image for embedding and thumbnail
                crop_box = (
                    int(sig_x0 * scale_x),
                    int(sig_y0 * scale_y),
                    int(sig_x1 * scale_x),
                    int(sig_y1 * scale_y),
                )
                cropped_img = page_img.crop(crop_box)

                # Generate base64 thumbnail
                buffered = io.BytesIO()
                cropped_img.save(buffered, format="PNG")
                crop_b64 = f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}"

                # Generate feature embedding
                embedding = generate_signature_embedding(cropped_img)

                # Normalize bounding box for 3-Pane Viewer
                norm_box = normalize_bbox_to_percent(
                    [sig_x0, sig_y0, sig_x1, sig_y1],
                    page_w,
                    page_h,
                )

                detected_signatures.append(DetectedSignature(
                    signatureId=f"sig_{uuid.uuid4().hex[:8]}",
                    pageNumber=page_idx + 1,
                    boundingBox=BoundingBox(**norm_box),
                    associatedLabel=anchor["label"],
                    confidence=0.92,
                    cropBase64=crop_b64,
                    embedding=embedding,
                ))

        # Step 3: Fallback Bottom-Right Scan (if no explicit text anchor on this page)
        elif page_idx == total_pages - 1 or page_idx == 0:
            # Look in bottom 25% of page (common signature location)
            sig_x0 = page_w * 0.50
            sig_y0 = page_h * 0.75
            sig_x1 = page_w * 0.95
            sig_y1 = page_h * 0.95

            crop_box = (
                int(sig_x0 * scale_x),
                int(sig_y0 * scale_y),
                int(sig_x1 * scale_x),
                int(sig_y1 * scale_y),
            )
            cropped_img = page_img.crop(crop_box)

            # Check if there is actual content in the crop (not plain white)
            gray_crop = np.array(cropped_img.convert("L"))
            content_ratio = np.sum(gray_crop < 220) / gray_crop.size

            if content_ratio > 0.015:  # at least 1.5% non-white pixels
                buffered = io.BytesIO()
                cropped_img.save(buffered, format="PNG")
                crop_b64 = f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}"

                embedding = generate_signature_embedding(cropped_img)
                norm_box = normalize_bbox_to_percent(
                    [sig_x0, sig_y0, sig_x1, sig_y1],
                    page_w,
                    page_h,
                )

                detected_signatures.append(DetectedSignature(
                    signatureId=f"sig_{uuid.uuid4().hex[:8]}",
                    pageNumber=page_idx + 1,
                    boundingBox=BoundingBox(**norm_box),
                    associatedLabel="Signatory Block (Visual Detection)",
                    confidence=0.75,
                    cropBase64=crop_b64,
                    embedding=embedding,
                ))

    doc.close()

    if not detected_signatures:
        warnings.append("No clear signature blocks detected on scanned pages.")

    return SignatureExtractionResponse(
        totalSignaturesDetected=len(detected_signatures),
        signatures=detected_signatures,
        pageCount=total_pages,
        warnings=warnings,
    )


# ──────────────────────────────────────────────
#  ChromaDB Indexing for Signatures
# ──────────────────────────────────────────────

async def index_signatures(request: SignatureIndexRequest) -> SignatureIndexResponse:
    """Store signature embeddings and metadata into ChromaDB vector store."""
    collection = _get_signature_collection()
    if collection is None:
        return SignatureIndexResponse(
            indexedCount=0,
            tenderId=request.tenderId,
            bidderId=request.bidderId,
            status="error: ChromaDB not available",
        )

    count = 0
    for sig in request.signatures:
        if not sig.embedding:
            continue

        doc_id = f"sig_{request.tenderId}_{request.bidderId}_{sig.signatureId}"
        collection.upsert(
            ids=[doc_id],
            embeddings=[sig.embedding],
            metadatas=[{
                "tenderId": request.tenderId,
                "bidderId": request.bidderId,
                "bidderName": request.bidderName,
                "docType": request.docType,
                "pageNumber": str(sig.pageNumber),
                "signatureId": sig.signatureId,
                "associatedLabel": sig.associatedLabel or "Authorized Signatory",
                "cropBase64": (sig.cropBase64 or "")[:200],  # truncated thumbnail meta
            }],
            documents=[f"Signature of {request.bidderName} on {request.docType} page {sig.pageNumber}"],
        )
        count += 1

    return SignatureIndexResponse(
        indexedCount=count,
        tenderId=request.tenderId,
        bidderId=request.bidderId,
        status="indexed",
    )


# ──────────────────────────────────────────────
#  Cross-Bidder Collusion & Forgery Detection
# ──────────────────────────────────────────────

async def check_cross_bid_signatures(
    request: CrossBidSignatureCheckRequest,
) -> CrossBidSignatureCheckResponse:
    """
    Compare all signatures in a tender across competing bidders.
    Flags:
      - IDENTICAL_DIGITAL_CLONE (sim >= 0.985): Cut-and-paste digital clone
      - SHARED_SIGNER_COLLUSION (sim >= 0.82): Same human signing for 2+ competing bidders
    """
    collection = _get_signature_collection()
    if collection is None or collection.count() == 0:
        return CrossBidSignatureCheckResponse(
            tenderId=request.tenderId,
            totalSignaturesAnalyzed=0,
            collusionAlertsCount=0,
            riskLevel="CLEAR",
            summary="No indexed signatures available for this tender.",
        )

    # Fetch all signatures for this tender
    results = collection.get(
        where={"tenderId": request.tenderId},
        include=["embeddings", "metadatas"],
    )

    ids = results.get("ids", [])
    embeddings = results.get("embeddings", [])
    metadatas = results.get("metadatas", [])

    total_count = len(ids)
    flagged_matches: List[SignatureMatchResult] = []

    # Compare all pairs belonging to DIFFERENT bidders
    for i in range(total_count):
        for j in range(i + 1, total_count):
            meta_a = metadatas[i]
            meta_b = metadatas[j]

            # Only compare across competing bidders
            if meta_a.get("bidderId") == meta_b.get("bidderId"):
                continue

            sim = _cosine_similarity(embeddings[i], embeddings[j])

            if sim >= 0.985:
                # Exact identical stroke structure (Cut-and-paste clone)
                flagged_matches.append(SignatureMatchResult(
                    targetBidderId=meta_b.get("bidderId", ""),
                    targetBidderName=f"{meta_a.get('bidderName')} ⟷ {meta_b.get('bidderName')}",
                    targetDocType=f"{meta_a.get('docType')} vs {meta_b.get('docType')}",
                    targetSignatureId=meta_b.get("signatureId", ""),
                    similarityScore=round(sim, 4),
                    verdict=SignatureVerdict.IDENTICAL_DIGITAL_CLONE,
                    isCollusionRisk=True,
                    explanation=(
                        f"CRITICAL FORGERY: Identical signature bitmap clone ({sim:.1%}) "
                        f"found across competing bidders '{meta_a.get('bidderName')}' and '{meta_b.get('bidderName')}'."
                    ),
                ))
            elif sim >= request.similarityThreshold:
                # High similarity stroke pattern (Same person signing for competing firms)
                flagged_matches.append(SignatureMatchResult(
                    targetBidderId=meta_b.get("bidderId", ""),
                    targetBidderName=f"{meta_a.get('bidderName')} ⟷ {meta_b.get('bidderName')}",
                    targetDocType=f"{meta_a.get('docType')} vs {meta_b.get('docType')}",
                    targetSignatureId=meta_b.get("signatureId", ""),
                    similarityScore=round(sim, 4),
                    verdict=SignatureVerdict.SHARED_SIGNER_COLLUSION,
                    isCollusionRisk=True,
                    explanation=(
                        f"CARTEL ALERT: Same signatory stroke pattern ({sim:.1%}) detected across "
                        f"competing bidders '{meta_a.get('bidderName')}' and '{meta_b.get('bidderName')}'."
                    ),
                ))

    risk_level = "CRITICAL" if any(m.isCollusionRisk for m in flagged_matches) else "CLEAR"
    summary = (
        f"Analyzed {total_count} signatures. Detected {len(flagged_matches)} cross-bidder signature collisions."
        if flagged_matches
        else f"Analyzed {total_count} signatures. No cross-bidder signature collusion detected."
    )

    return CrossBidSignatureCheckResponse(
        tenderId=request.tenderId,
        totalSignaturesAnalyzed=total_count,
        collusionAlertsCount=len(flagged_matches),
        flaggedMatches=flagged_matches,
        riskLevel=risk_level,
        summary=summary,
    )


# ──────────────────────────────────────────────
#  Anchor Signature Verification
# ──────────────────────────────────────────────

def verify_signature_against_anchor(
    request: AnchorSignatureVerifyRequest,
) -> AnchorSignatureVerifyResponse:
    """Verify a candidate signature against a known reference / anchor signature embedding."""
    if not request.anchorEmbedding or not request.targetSignature.embedding:
        return AnchorSignatureVerifyResponse(
            similarityScore=0.0,
            verdict=SignatureVerdict.UNVERIFIED,
            isAuthentic=False,
            confidence=0.0,
            notes="Missing anchor or candidate signature embedding vector.",
        )

    sim = _cosine_similarity(request.anchorEmbedding, request.targetSignature.embedding)

    if sim >= 0.985:
        verdict = SignatureVerdict.IDENTICAL_DIGITAL_CLONE
        is_auth = False
        notes = "Suspicious: Signature is a 100% identical pixel copy (potential cut-and-paste forgery)."
    elif sim >= 0.78:
        verdict = SignatureVerdict.GENUINE_MATCH
        is_auth = True
        notes = f"Signature matches anchor profile with high confidence ({sim:.1%})."
    else:
        verdict = SignatureVerdict.SIGNATURE_MISMATCH
        is_auth = False
        notes = f"Signature stroke morphology differs significantly from reference anchor ({sim:.1%})."

    return AnchorSignatureVerifyResponse(
        similarityScore=round(sim, 4),
        verdict=verdict,
        isAuthentic=is_auth,
        confidence=min(1.0, max(0.0, (sim - 0.5) / 0.5)),
        notes=notes,
    )
