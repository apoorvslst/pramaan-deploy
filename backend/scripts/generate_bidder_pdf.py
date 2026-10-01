"""
PRAMAN Statutory Certificate Generator
Generates pristine, authentic PDF certificates tailored to a specific bidder
(Udyam, GST REG-06, PAN Card, CA Turnover, Debarment Affidavit).
Used for live OCR verification and 3-Pane Evidence Viewing.
"""

import sys
import os
import json
import io
import pymupdf as fitz
import qrcode
from PIL import Image

UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))

def generate_qr_image(data: str) -> Image.Image:
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white")


def generate_udyam_pdf(bidder, output_path):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4

    udyam_no = bidder.get("udyam") or bidder.get("udyamRegistrationNumber") or "UDYAM-RJ-24-0106524"
    legal_name = bidder.get("legalName") or bidder.get("legalBusinessName") or "FITFORM AI"
    entity_type = bidder.get("entityType") or "LLP"
    pan_no = bidder.get("pan") or "AAAAI9231N"
    address = bidder.get("address") or "Plot 42, HSIIDC Industrial Area, Phase-I, Jaipur, Rajasthan - 302001"
    msme_type = bidder.get("msmeCategory") or "Small"

    # Header
    page.insert_text((50, 50), "GOVERNMENT OF INDIA", fontsize=11, fontname="helv", color=(0.4, 0.4, 0.4))
    page.insert_text((50, 70), "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES", fontsize=13, fontname="helv", color=(0.1, 0.1, 0.1))
    page.insert_text((50, 92), "UDYAM REGISTRATION CERTIFICATE", fontsize=15, fontname="helv", color=(0.08, 0.5, 0.2))

    page.draw_line((50, 105), (545, 105), color=(0.8, 0.8, 0.8), width=1.5)

    fields = [
        ("UDYAM REGISTRATION NUMBER:", udyam_no, 135),
        ("NAME OF ENTERPRISE:", legal_name, 165),
        ("ORGANISATION TYPE:", entity_type, 195),
        ("TYPE OF ENTERPRISE:", f"{msme_type} Enterprise", 225),
        ("MAJOR ACTIVITY:", "Services / AI & Software Solutions", 255),
        ("PAN NUMBER:", pan_no, 285),
        ("DATE OF INCORPORATION:", "12/04/2019", 315),
        ("DATE OF UDYAM REGISTRATION:", "14/06/2020", 345),
        ("OFFICIAL ADDRESS:", address, 375),
    ]

    for label, val, y in fields:
        page.insert_text((50, y), label, fontsize=9.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((240, y), str(val), fontsize=10, fontname="helv", color=(0.05, 0.05, 0.05))

    # Embed QR Code
    qr_payload = f"UDYAM:{udyam_no};NAME:{legal_name};PAN:{pan_no};TYPE:{msme_type}"
    qr_img = generate_qr_image(qr_payload)
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr, format='PNG')
    page.insert_image(fitz.Rect(410, 45, 530, 165), stream=img_byte_arr.getvalue())

    # Footer Seal
    page.draw_line((50, 750), (545, 750), color=(0.8, 0.8, 0.8), width=1)
    page.insert_text((50, 770), "This is an electronically generated statutory certificate, authenticated via MSME National Database.", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))

    doc.set_metadata({
        "producer": "Ministry of MSME Central Udyam Database System v4.1",
        "creator": "Udyam PDF Engine",
        "creationDate": "D:20200614110000+05'30'",
        "modDate": "D:20200614110000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    return output_path


def generate_gst_pdf(bidder, output_path):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    gstin = bidder.get("gstin") or "08AAAAI9231N1ZC"
    legal_name = bidder.get("legalName") or bidder.get("legalBusinessName") or "FITFORM AI"
    entity_type = bidder.get("entityType") or "LLP"
    address = bidder.get("address") or "Plot 42, HSIIDC Industrial Area, Phase-I, Jaipur, Rajasthan - 302001"

    page.insert_text((50, 50), "GOVERNMENT OF INDIA", fontsize=11, fontname="helv", color=(0.4, 0.4, 0.4))
    page.insert_text((50, 70), "GOODS AND SERVICES TAX", fontsize=14, fontname="helv", color=(0.1, 0.1, 0.1))
    page.insert_text((50, 90), "FORM GST REG-06 - CERTIFICATE OF REGISTRATION", fontsize=13, fontname="helv", color=(0.1, 0.3, 0.7))

    page.draw_line((50, 105), (545, 105), color=(0.8, 0.8, 0.8), width=1.5)

    fields = [
        ("Registration Number (GSTIN):", gstin, 135),
        ("Legal Name:", legal_name, 165),
        ("Trade Name:", legal_name, 195),
        ("Constitution of Business:", entity_type, 225),
        ("Address of Principal Place:", address, 255),
        ("Date of Liability:", "01/07/2017", 285),
        ("Date of Registration:", "12/04/2019", 315),
        ("Type of Registration:", "Regular Taxpayer", 345),
    ]

    for label, val, y in fields:
        page.insert_text((50, y), label, fontsize=9.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((240, y), str(val), fontsize=10, fontname="helv", color=(0.05, 0.05, 0.05))

    qr_payload = f"GSTIN:{gstin};LEGAL:{legal_name};DATE:12/04/2019"
    qr_img = generate_qr_image(qr_payload)
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr, format='PNG')
    page.insert_image(fitz.Rect(410, 45, 530, 165), stream=img_byte_arr.getvalue())

    doc.set_metadata({
        "producer": "Government of India GST Portal PDF Generator v3.1",
        "creator": "GSTN System",
        "creationDate": "D:20190412100000+05'30'",
        "modDate": "D:20190412100000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    return output_path


def generate_pan_pdf(bidder, output_path):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    pan_no = bidder.get("pan") or "AAAAI9231N"
    legal_name = bidder.get("legalName") or bidder.get("legalBusinessName") or "FITFORM AI"
    director = "Apoorva Mishra"
    if bidder.get("directors") and len(bidder["directors"]) > 0:
        director = bidder["directors"][0].get("name", director)

    page.insert_text((50, 50), "INCOME TAX DEPARTMENT", fontsize=14, fontname="helv", color=(0.1, 0.1, 0.1))
    page.insert_text((50, 72), "GOVT. OF INDIA", fontsize=11, fontname="helv", color=(0.4, 0.4, 0.4))
    page.insert_text((50, 94), "Permanent Account Number Card Verification", fontsize=13, fontname="helv", color=(0.2, 0.2, 0.8))

    page.draw_line((50, 105), (545, 105), color=(0.8, 0.8, 0.8), width=1.5)

    fields = [
        ("Permanent Account Number (PAN):", pan_no, 135),
        ("Name of Taxpayer:", legal_name, 165),
        ("Authorized Representative / Director:", director, 195),
        ("Date of Incorporation / Birth:", "12/04/2019", 225),
        ("Taxpayer Status:", "OPERATIVE & ACTIVE", 255),
    ]

    for label, val, y in fields:
        page.insert_text((50, y), label, fontsize=9.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((240, y), str(val), fontsize=10, fontname="helv", color=(0.05, 0.05, 0.05))

    qr_payload = f"PAN:{pan_no};NAME:{legal_name};STATUS:ACTIVE"
    qr_img = generate_qr_image(qr_payload)
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr, format='PNG')
    page.insert_image(fitz.Rect(410, 45, 530, 165), stream=img_byte_arr.getvalue())

    doc.set_metadata({
        "producer": "NSDL e-Governance Infrastructure Limited",
        "creator": "Income Tax Department",
        "creationDate": "D:20190412100000+05'30'",
        "modDate": "D:20190412100000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    return output_path


def generate_ca_turnover_pdf(bidder, output_path):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    legal_name = bidder.get("legalName") or bidder.get("legalBusinessName") or "FITFORM AI"
    pan_no = bidder.get("pan") or "AAAAI9231N"

    page.insert_text((50, 50), "CHARTERED ACCOUNTANTS' STATUTORY CERTIFICATE", fontsize=13, fontname="helv", color=(0.1, 0.1, 0.1))
    page.insert_text((50, 72), "Annual Financial Turnover Certification", fontsize=11, fontname="helv", color=(0.3, 0.3, 0.3))

    page.draw_line((50, 90), (545, 90), color=(0.8, 0.8, 0.8), width=1.5)

    fields = [
        ("Enterprise Name:", legal_name, 120),
        ("Permanent Account Number (PAN):", pan_no, 150),
        ("UDIN (Unique Doc Identification No):", f"260849201{pan_no}984", 180),
        ("Financial Year 2024-25 Turnover:", "INR 19,80,00,000", 210),
        ("Financial Year 2023-24 Turnover:", "INR 18,20,00,000", 240),
        ("Financial Year 2022-23 Turnover:", "INR 17,20,00,000", 270),
        ("3-Year Average Annual Turnover:", "INR 18,40,00,000", 300),
        ("Solvency & Compliance Verdict:", "CERTIFIED SOLVENT & QUALIFIED", 330),
    ]

    for label, val, y in fields:
        page.insert_text((50, y), label, fontsize=9.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((240, y), str(val), fontsize=10, fontname="helv", color=(0.05, 0.05, 0.05))

    doc.set_metadata({
        "producer": "ICAI UDIN Portal Generator",
        "creator": "M/s S.K. Agrawal & Co. Chartered Accountants",
        "creationDate": "D:20260215100000+05'30'",
        "modDate": "D:20260215100000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    return output_path


def generate_debarment_pdf(bidder, output_path):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    legal_name = bidder.get("legalName") or bidder.get("legalBusinessName") or "FITFORM AI"
    director = "Apoorva Mishra"
    if bidder.get("directors") and len(bidder["directors"]) > 0:
        director = bidder["directors"][0].get("name", director)

    page.insert_text((50, 50), "BEFORE THE COMPETENT PROCUREMENT AUTHORITY", fontsize=12, fontname="helv", color=(0.1, 0.1, 0.1))
    page.insert_text((50, 70), "NON-DEBARMENT / ANTI-BLACKLISTING AFFIDAVIT", fontsize=13, fontname="helv", color=(0.1, 0.1, 0.1))

    page.draw_line((50, 85), (545, 85), color=(0.8, 0.8, 0.8), width=1.5)

    text_body = f"""I, {director}, Authorized Signatory / Designated Partner of M/s {legal_name}, having registered office at {bidder.get('address', 'Jaipur, Rajasthan')}, do hereby solemnly affirm and state on oath:

1. That M/s {legal_name} has never been blacklisted, debarred, or banned by the Government of India, GeM Portal, any State Government, or CPSE from participating in any public procurement tender.

2. That no criminal proceedings or CBI/ED investigation for corrupt, fraudulent, or collusive practices are pending against the firm or its directors.

3. That all statutory declarations, certificates, and financial figures submitted in this bid proposal are true, authentic, and accurate.

DEPONENT: {director}
For and on behalf of {legal_name}
ATTESTED BY: Notary Public (Govt. of India)"""

    page.insert_textbox(fitz.Rect(50, 110, 545, 500), text_body, fontsize=10, fontname="helv")

    doc.set_metadata({
        "producer": "Court & Notary Certified Document Repository",
        "creator": "e-Notary Portal",
        "creationDate": "D:20260215100000+05'30'",
        "modDate": "D:20260215100000+05'30'",
    })

    doc.save(output_path)
    doc.close()
    return output_path


def generate_all_for_bidder(bidder, target_dir=UPLOADS_DIR):
    os.makedirs(target_dir, exist_ok=True)
    bidder_id = str(bidder.get("_id") or bidder.get("id") or "default")
    
    paths = {
        "UDYAM_CERTIFICATE": os.path.join(target_dir, f"bidder_{bidder_id}_udyam.pdf"),
        "GST_CERTIFICATE": os.path.join(target_dir, f"bidder_{bidder_id}_gst.pdf"),
        "PAN_CARD": os.path.join(target_dir, f"bidder_{bidder_id}_pan.pdf"),
        "CA_TURNOVER_CERTIFICATE": os.path.join(target_dir, f"bidder_{bidder_id}_ca_turnover.pdf"),
        "DEBARMENT_AFFIDAVIT": os.path.join(target_dir, f"bidder_{bidder_id}_debarment.pdf"),
    }

    generate_udyam_pdf(bidder, paths["UDYAM_CERTIFICATE"])
    generate_gst_pdf(bidder, paths["GST_CERTIFICATE"])
    generate_pan_pdf(bidder, paths["PAN_CARD"])
    generate_ca_turnover_pdf(bidder, paths["CA_TURNOVER_CERTIFICATE"])
    generate_debarment_pdf(bidder, paths["DEBARMENT_AFFIDAVIT"])

    print(json.dumps({
        "success": True,
        "bidderId": bidder_id,
        "legalName": bidder.get("legalName") or bidder.get("legalBusinessName"),
        "files": paths
    }))
    return paths


if __name__ == "__main__":
    raw_input = ""
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
    else:
        raw_input = sys.stdin.read().strip()

    if raw_input:
        bidder_data = json.loads(raw_input)
        generate_all_for_bidder(bidder_data)
    else:
        print("Usage: python generate_bidder_pdf.py '<json_bidder_data>' or pipe JSON to stdin")
