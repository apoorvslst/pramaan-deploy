"""
PRAMAN AI Microservice — Test PDF Generator

Generates synthetic PDF documents for testing:
  1. sample_gst_clean.pdf       — Clean GST certificate with valid metadata
  2. sample_gst_tampered.pdf    — Tampered GST certificate with Photoshop metadata
  3. sample_udyam_clean.pdf     — Clean Udyam registration certificate
  4. sample_tender_doc.pdf      — Standard GeM tender notice with eligibility rules
"""

import os
import fitz  # PyMuPDF
import qrcode
import io
from PIL import Image

FIXTURES_DIR = os.path.dirname(os.path.abspath(__file__))


def generate_qr_image(data: str) -> Image.Image:
    """Generate a QR code PIL image for embedding in PDF."""
    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white")


def create_clean_gst_pdf(output_path: str):
    """Create a pristine GST Certificate PDF."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4

    # Header
    page.insert_text((50, 60), "GOVERNMENT OF INDIA", fontsize=16, fontname="helv")
    page.insert_text((50, 80), "FORM GST REG-06", fontsize=14, fontname="helv")
    page.insert_text((50, 100), "Registration Certificate", fontsize=13, fontname="helv")

    # Fields
    fields = [
        ("Registration Number (GSTIN):", "07AAAAA1111A1Z1", 140),
        ("Legal Name:", "Apex Infra Solutions Private Limited", 170),
        ("Trade Name:", "Apex Infra Tech", 200),
        ("Constitution of Business:", "Private Limited Company", 230),
        ("Date of Registration:", "15/04/2018", 260),
        ("Address of Principal Place:", "Plot 42, Okhla Industrial Area Phase 3, New Delhi - 110020", 290),
    ]

    for label, val, y in fields:
        page.insert_text((50, y), label, fontsize=10, fontname="helv")
        page.insert_text((220, y), val, fontsize=10, fontname="helv")

    # Embed QR Code with matching GSTIN
    qr_img = generate_qr_image("GSTIN:07AAAAA1111A1Z1;LEGAL:Apex Infra Solutions;DATE:15/04/2018")
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr, format='PNG')
    page.insert_image(fitz.Rect(400, 50, 520, 170), stream=img_byte_arr.getvalue())

    # Metadata
    doc.set_metadata({
        "producer": "Government of India GST Portal PDF Generator v3.1",
        "creator": "GSTN System",
        "creationDate": "D:20180415100000+05'30'",
        "modDate": "D:20180415100000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    print(f"Created: {output_path}")


def create_tampered_gst_pdf(output_path: str):
    """Create a tampered GST Certificate PDF with Photoshop metadata and mismatched QR."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 60), "GOVERNMENT OF INDIA", fontsize=16, fontname="helv")
    page.insert_text((50, 80), "FORM GST REG-06", fontsize=14, fontname="helv")
    page.insert_text((50, 100), "Registration Certificate", fontsize=13, fontname="helv")

    # Text claims GSTIN '07FAKE0000A1Z5'
    fields = [
        ("Registration Number (GSTIN):", "07FAKE0000A1Z5", 140),
        ("Legal Name:", "Altered Entity Fraud Co", 170),
        ("Trade Name:", "Fraudulent Traders", 200),
        ("Constitution of Business:", "Private Limited Company", 230),
        ("Date of Registration:", "01/01/2024", 260),
    ]

    for label, val, y in fields:
        page.insert_text((50, y), label, fontsize=10, fontname="helv")
        page.insert_text((220, y), val, fontsize=10, fontname="helv")

    # Embed QR Code with DIFFERENT GSTIN (original stolen cert)
    qr_img = generate_qr_image("GSTIN:07ORIGINAL1234F1;LEGAL:Original Innocent Co;DATE:10/01/2019")
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr, format='PNG')
    page.insert_image(fitz.Rect(400, 50, 520, 170), stream=img_byte_arr.getvalue())

    # Tampered metadata (Adobe Photoshop CC)
    doc.set_metadata({
        "producer": "Adobe PDF Library 17.0",
        "creator": "Adobe Photoshop CC 2023 (Windows)",
        "creationDate": "D:20190110090000+05'30'",
        "modDate": "D:20260215143000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    print(f"Created (Tampered): {output_path}")


def create_udyam_pdf(output_path: str):
    """Create a clean Udyam Registration Certificate PDF."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 60), "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES", fontsize=14, fontname="helv")
    page.insert_text((50, 80), "UDYAM REGISTRATION CERTIFICATE", fontsize=13, fontname="helv")

    fields = [
        ("UDYAM REGISTRATION NUMBER:", "UDYAM-DL-01-0012345", 130),
        ("NAME OF ENTERPRISE:", "APEX INFRA SOLUTIONS PVT LTD", 160),
        ("TYPE OF ENTERPRISE:", "Small", 190),
        ("MAJOR ACTIVITY:", "Services", 220),
        ("ORGANIZATION TYPE:", "Private Limited Company", 250),
        ("NIC 2 Digit:", "62", 280),
    ]

    for label, val, y in fields:
        page.insert_text((50, y), label, fontsize=10, fontname="helv")
        page.insert_text((240, y), val, fontsize=10, fontname="helv")

    # QR Code
    qr_img = generate_qr_image("UDYAM:UDYAM-DL-01-0012345;NAME:APEX INFRA SOLUTIONS;TYPE:Small")
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr, format='PNG')
    page.insert_image(fitz.Rect(400, 50, 520, 170), stream=img_byte_arr.getvalue())

    doc.set_metadata({
        "producer": "MSME Udyam Portal System",
        "creator": "Udyam PDF Engine",
        "creationDate": "D:20200801120000+05'30'",
        "modDate": "D:20200801120000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    print(f"Created: {output_path}")


def create_tender_pdf(output_path: str):
    """Create a sample GeM Tender Document with rule clauses."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 50), "GOVERNMENT E-MARKETPLACE (GeM) - BID DOCUMENT", fontsize=14, fontname="helv")
    page.insert_text((50, 75), "Bid Number: GEM/2026/B/7890123", fontsize=11, fontname="helv")
    page.insert_text((50, 95), "Dated: 15-02-2026", fontsize=10, fontname="helv")

    clauses = [
        "1. ELIGIBILITY CRITERIA AND FINANCIAL TURNOVER:",
        "   The Minimum Average Annual Turnover of the bidder for the last 3 financial years",
        "   (2022-23, 2023-24, 2024-25) should not be less than Rs. 5.00 Crores (INR 50,000,000).",
        "   Audited Balance Sheets and CA Certified Turnover Certificate with valid UDIN is mandatory.",
        "",
        "2. EARNEST MONEY DEPOSIT (EMD):",
        "   EMD Amount: Rs. 2,50,000/- (Rupees Two Lakh Fifty Thousand only).",
        "   Micro and Small Enterprises (MSEs) registered with Udyam are EXEMPTED from EMD.",
        "",
        "3. PAST EXPERIENCE CRITERIA:",
        "   The Bidder must have successfully executed at least 3 similar contracts with a value",
        "   not less than Rs. 1.50 Crores each, or 2 contracts of Rs. 2.50 Crores, or 1 contract of Rs. 4.00 Crores.",
        "   Experience requirement: 3 years in the supply of enterprise IT hardware and services.",
        "",
        "4. STATUTORY MANDATORY COMPLIANCES:",
        "   - Valid GST Registration Certificate (Active Status).",
        "   - Permanent Account Number (PAN) Card.",
        "   - Non-Debarment / Non-Blacklisting Notarized Affidavit on Rs. 100 Stamp Paper.",
        "   - Class 3 Digital Signature Certificate (DSC) for authorized signatory.",
        "   - Make in India (MII) Class-I local supplier declaration (minimum 50% local content).",
    ]

    y = 130
    for line in clauses:
        page.insert_text((50, y), line, fontsize=9, fontname="helv")
        y += 18

    doc.set_metadata({
        "producer": "GeM Bid Creation Engine v4.2",
        "creator": "GeM Portal",
        "creationDate": "D:20260215090000+05'30'",
        "modDate": "D:20260215090000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    print(f"Created: {output_path}")


if __name__ == "__main__":
    os.makedirs(FIXTURES_DIR, exist_ok=True)
    create_clean_gst_pdf(os.path.join(FIXTURES_DIR, "sample_gst_clean.pdf"))
    create_tampered_gst_pdf(os.path.join(FIXTURES_DIR, "sample_gst_tampered.pdf"))
    create_udyam_pdf(os.path.join(FIXTURES_DIR, "sample_udyam_clean.pdf"))
    create_tender_pdf(os.path.join(FIXTURES_DIR, "sample_tender_doc.pdf"))
    print("\nAll mock PDFs successfully generated in test_fixtures/")
