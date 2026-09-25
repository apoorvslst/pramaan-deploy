# 🚀 PRAMAN AI Microservice — 3-Hour Implementation Plan (10 Phases)

> **Time: 3 hours (180 min) | Stack: Python 3.11 + FastAPI + PyMuPDF + PyZBar + NetworkX + Groq/Gemini LLM + ChromaDB**  
> **Goal: Production-grade, forensics-backed AI verification engine with OCR, QR verification, metadata forensics, cartel graph analysis, and tender RAG assistant**

---

## ⏱️ Timeline Overview

```
┌──────────┬────────────────────────────────────────────────┬──────────┐
│  Phase   │ What You'll Build                              │   Time   │
├──────────┼────────────────────────────────────────────────┼──────────┤
│ Phase 1  │ FastAPI Scaffold, VirtualEnv & Pydantic Schemas│  15 min  │
│ Phase 2  │ Tender RFP/NIT Rule Extraction Parser          │  20 min  │
│ Phase 3  │ Document Type Classifier & OCR Key-Value Engine│  20 min  │
│ Phase 4  │ Forensic Metadata & Software Tampering Scanner │  15 min  │
│ Phase 5  │ Embedded QR Code Decoder & Cross-Check Engine  │  15 min  │
│ Phase 6  │ Cartel & Syndicate Graph Detection (NetworkX)  │  20 min  │
│ Phase 7  │ 3-Pane Evidence Formatter & Bounding Box Align │  15 min  │
│ Phase 8  │ Local RAG Officer Assistant (ChromaDB + LLM)   │  20 min  │
│ Phase 9  │ Unified Verification Pipeline Endpoint         │  20 min  │
│ Phase 10 │ Integration Testing, Fixtures & Backend Wiring │  20 min  │
├──────────┼────────────────────────────────────────────────┼──────────┤
│  TOTAL   │ Complete AI Microservice                       │ 180 min  │
└──────────┴────────────────────────────────────────────────┴──────────┘
```

---

## 📁 Final Directory Structure

```
PRAMAAN/
├── frontend/                  ← Existing React UI (Vite)
├── backend/                   ← Express + MongoDB Backend
└── ai/                        ← AI Microservice
    ├── requirements.txt       # Python dependencies
    ├── main.py                # FastAPI bootstrap + CORS + Router mounts
    ├── .env                   # Environment variables (Groq, Gemini, Ports)
    ├── .env.example           # Template for environment variables
    ├── config.py              # App settings & constants
    ├── schemas/               # Pydantic request/response schemas
    │   ├── tender.py          # Tender rule extraction schemas
    │   ├── document.py        # OCR & classification schemas
    │   ├── forensics.py       # Tampering & QR verification schemas
    │   ├── cartel.py          # Network graph & collusion schemas
    │   └── assistant.py       # RAG Chatbot schemas
    ├── services/
    │   ├── rule_extractor.py  # NIT/Tender PDF parser (Turnover, MSME, MII %)
    │   ├── doc_classifier.py  # Identifies GST, Udyam, PAN, ITR, CA certs
    │   ├── ocr_engine.py      # Structured key-value & spatial extractor
    │   ├── forensic_scanner.py# XMP metadata & tampering tool trace detector
    │   ├── qr_verifier.py     # PyZBar QR decoder & claim cross-matcher
    │   ├── collusion_detector.py # NetworkX graph analyzer for syndicates
    │   └── rag_assistant.py   # ChromaDB + Groq/Gemini tender Q&A
    ├── routers/
    │   ├── tender_routes.py   # /api/v1/tender/*
    │   ├── document_routes.py # /api/v1/document/*
    │   ├── forensics_routes.py# /api/v1/forensics/*
    │   ├── cartel_routes.py   # /api/v1/cartel/*
    │   ├── assistant_routes.py# /api/v1/assistant/*
    │   └── pipeline_routes.py # /api/v1/pipeline/* (Unified orchestrator)
    ├── utils/
    │   ├── pdf_utils.py       # PyMuPDF rendering & coordinate scalers
    │   └── image_utils.py     # ELA and image conversion helpers
    └── test_fixtures/         # Sample test PDFs (Clean, Tampered, Cartel data)
```

---

## Phase 1 — FastAPI Scaffold, VirtualEnv & Pydantic Schemas ⏱️ 15 min

### 🎯 Goal
Set up the `ai/` microservice, install Python dependencies, configure FastAPI with CORS, and define strict Pydantic schemas.

### 📦 What to install
```bash
cd ai
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install fastapi uvicorn pydantic pydantic-settings python-multipart python-dotenv
pip install pymupdf pillow pyzbar networkx
pip install groq google-generativeai chromadb sentence-transformers
```

### 📝 Files to create
- `ai/requirements.txt` — Dependencies list
- `ai/config.py` — Settings (port, upload paths, confidence thresholds)
- `ai/schemas/tender.py` — Pydantic models for tender rule extraction
- `ai/schemas/document.py` — Pydantic models for OCR & evidence payloads
- `ai/schemas/forensics.py` — Pydantic models for tampering & QR checks
- `ai/schemas/cartel.py` — Pydantic models for collusion graph
- `ai/schemas/assistant.py` — Pydantic models for RAG Q&A
- `ai/main.py` — FastAPI application entry point with CORS

### 🧠 Key Concepts to Understand
- **FastAPI**: High-performance asynchronous Python web framework with auto-generated Swagger UI (`/docs`).
- **Pydantic**: Data validation and type enforcement using standard Python type annotations.
- **Microservice Role**: Stateless HTTP worker processing compute-heavy PDF/Vision tasks dispatched by Node.js.

### ✅ Deliverable
FastAPI starts on port `8000`, exposes `/health`, and Swagger UI is visible at `http://localhost:8000/docs`.

---

## Phase 2 — Tender RFP/NIT Rule Extraction Parser ⏱️ 20 min

### 🎯 Goal
Build the NLP and layout extraction service that parses tender PDFs (NIT/RFP) to extract statutory rules and eligibility criteria.

### 📝 Files to create
1. `ai/services/rule_extractor.py`
2. `ai/routers/tender_routes.py`

### 🧠 Key Concepts to Understand
- **PyMuPDF (`fitz`)**: Fast PDF text, table, and metadata extractor.
- **LLM Clause Extraction (Groq Llama-3.3-70B)**: Uses structured JSON prompting to reliably extract complex clauses with zero hallucination.
- **Extracted Clauses**:
  - Minimum Average Annual Turnover (e.g., "30% of estimated tender value")
  - Prior Experience criteria (e.g., "3 similar completed works of 40% value")
  - MSME / Startup exemptions (PPO 2012 clauses)
  - Make in India (MII) local content minimum percentage (e.g., 20% or 50%)
  - EMD Amount & exemption conditions

### 📌 API Contract
```http
POST /api/v1/tender/parse-rules
Content-Type: multipart/form-data
Body: file (PDF)

Response:
{
  "estimatedValueINR": 5000000,
  "rules": {
    "minimumTurnoverINR": 1500000,
    "turnoverYearsRequired": 3,
    "minimumExperienceYears": 3,
    "makeInIndiaPercentage": 20,
    "allowStartupExemption": true,
    "allowMSMEExemption": true,
    "emdRequired": true,
    "emdAmountINR": 100000,
    "requiredCertificates": ["GST_CERTIFICATE", "UDYAM_CERTIFICATE", "PAN_CARD", "ITR_ACKNOWLEDGEMENT"]
  },
  "confidence": 0.95
}
```

### ✅ Deliverable
Endpoint accepts tender PDF and returns structured JSON eligibility checklist for the Procurement Officer.

---

## Phase 3 — Document Type Classifier & OCR Key-Value Engine ⏱️ 20 min

### 🎯 Goal
Automatically identify statutory document types (GST, Udyam, PAN, ITR, CA Turnover) and extract critical key-value pairs with spatial bounding boxes.

### 📝 Files to create
1. `ai/services/doc_classifier.py`
2. `ai/services/ocr_engine.py`
3. `ai/routers/document_routes.py`

### 🧠 Key Concepts to Understand
- **Document Classification**: Fast keyword & structural matching to tag documents (`GST_CERTIFICATE`, `UDYAM_CERTIFICATE`, `PAN_CARD`, `ITR_ACKNOWLEDGEMENT`, `CA_TURNOVER_CERTIFICATE`).
- **Spatial Key-Value Extraction**: Finding labels (e.g., `GSTIN`, `Udyam Registration Number`, `Permanent Account Number`) and fetching adjacent text tokens.
- **Bounding Box Normalization**: Extracting coordinates $(x, y, w, h)$ for the 3-Pane Viewer highlights.

### 📌 Extraction Matrix
| Document Type | Key Extracted Fields |
| :--- | :--- |
| `GST_CERTIFICATE` | `gstin`, `legalName`, `tradeName`, `constitutionOfBusiness`, `registrationDate` |
| `UDYAM_CERTIFICATE`| `udyamNumber`, `enterpriseType`, `majorActivity`, `nicCode`, `organizationType` |
| `PAN_CARD` | `pan`, `entityName`, `dateOfIncorporationOrBirth` |
| `ITR_ACKNOWLEDGEMENT`| `pan`, `assessmentYear`, `grossTotalIncome`, `acknowledgementNumber` |

### ✅ Deliverable
Endpoint `POST /api/v1/document/extract` returns structured claims and field bounding box coordinates.

---

## Phase 4 — Forensic Metadata & Software Tampering Scanner ⏱️ 15 min

### 🎯 Goal
Build a zero-trust forensic scanner that detects unauthorized PDF editing and graphic tool traces.

### 📝 Files to create
1. `ai/services/forensic_scanner.py`
2. `ai/routers/forensics_routes.py`

### 🧠 Key Concepts to Understand
- **XMP Metadata Inspection**: Scans document properties for forbidden editing tools:
  `["photoshop", "canva", "coreldraw", "illustrator", "gimp", "pdfescape", "sejda", "ilovepdf"]`
- **Timestamp Discrepancy**: Flags if `modificationDate != creationDate` without an official digital signature.
- **Font Stream Anomaly**: Detects newly embedded fonts or mismatched character baselines indicating text tampering.

### 📌 Forensic Detection Output
```json
{
  "isTampered": true,
  "flaggedTools": ["Adobe Photoshop CC 2023"],
  "producer": "Adobe PDF Library 17.0",
  "creator": "Adobe Photoshop 24.0",
  "creationDate": "2024-01-10T09:00:00Z",
  "modificationDate": "2025-08-14T14:30:00Z",
  "dateMismatch": true,
  "confidence": 0.98
}
```

### ✅ Deliverable
Endpoint `POST /api/v1/forensics/analyze-metadata` returns tampering flag, tool name, and confidence score.

---

## Phase 5 — Embedded QR Code Decoder & Cross-Check Engine ⏱️ 15 min

### 🎯 Goal
Extract embedded QR codes from government certificates (GST, Udyam, EPFO), decode payload, and cross-match with the document's visible text.

### 📝 Files to create
1. `ai/services/qr_verifier.py`

### 🧠 Key Concepts to Understand
- **PyZBar + Pillow**: Extracts raw images from PDF pages and decodes 2D barcode/QR data.
- **Cryptographic Mismatch Detection**: If the QR code payload contains GSTIN `07ABCDE1234F1Z5` but the document text has been visually altered to `07AAAAA9999A1Z1` $\rightarrow$ triggers **CRITICAL FORGERY** alert.

### 📌 QR Verification Flow
```
PDF Page Image ──> PyZBar Decode ──> QR String / JSON Payload
                                              │
                                              ▼
                    Compare (QR Payload vs Extracted OCR Claim)
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
                 MATCH [Pass]                                  MISMATCH [Forged Flag]
```

### ✅ Deliverable
`POST /api/v1/forensics/verify-qr` decodes QR and verifies whether certificate content matches cryptographic signature.

---

## Phase 6 — Cartel & Syndicate Graph Detection (NetworkX) ⏱️ 20 min

### 🎯 Goal
Construct multi-entity relationship graphs across competing bidders to detect bid-rigging rings and cartelization.

### 📝 Files to create
1. `ai/services/collusion_detector.py`
2. `ai/routers/cartel_routes.py`

### 🧠 Key Concepts to Understand
- **Heterogeneous Entity Graph**: Bidders, Directors (DIN/PAN), Bank Accounts, Phones, Addresses, and Document Author metadata.
- **Connected Components**: Computes subgraphs where $\ge 2$ competing bidders share common identifiers.
- **Cytoscape JSON Serialization**: Exports graph nodes and edges ready for frontend interactive D3/Cytoscape rendering.

### 📌 Cartel Entity Graph Model
```
[Bidder A] ──(HAS_DIRECTOR)──> [Director: John Doe] <──(HAS_DIRECTOR)── [Bidder B]
    │                                                                         │
(SHARES_BANK)                                                           (SHARES_BANK)
    │                                                                         │
    └──────────────────────> [A/C: XXXX-5432] <───────────────────────────────┘
```

### ✅ Deliverable
Endpoint `POST /api/v1/cartel/detect` returns detected cartel clusters, risk severity (`CRITICAL`/`HIGH`), and Cytoscape elements.

---

## Phase 7 — 3-Pane Evidence Formatter & Bounding Box Align ⏱️ 15 min

### 🎯 Goal
Format OCR and forensic output to perfectly align with the React 3-Pane Viewer (`visualData`, `extractedClaim`, `forensicCheck`).

### 📝 Files to create
1. `ai/utils/pdf_utils.py` — Normalizes coordinate scaling (0 to 100% or absolute canvas pixels)
2. `ai/schemas/document.py` — Formats evidence output

### 🧠 Key Concepts to Understand
- **Coordinate Normalization**: Translates PDF coordinate space to standard percentages `(x, y, w, h)` so highlights stay locked onto text at any browser zoom level.
- **3-Pane Contract Consistency**: Matches the exact structure expected by the backend `VerificationEvidence.js` model.

### ✅ Deliverable
Extracted claims include normalized visual marker boxes and high-res snippet coordinates.

---

## Phase 8 — Local RAG Officer Assistant (ChromaDB + LLM) ⏱️ 20 min

### 🎯 Goal
Build a conversational assistant that answers Procurement Officer questions about tender compliance with page citations.

### 📝 Files to create
1. `ai/services/rag_assistant.py`
2. `ai/routers/assistant_routes.py`

### 🧠 Key Concepts to Understand
- **ChromaDB**: Lightweight, local vector store.
- **Document Chunking**: Breaks submitted PDFs into searchable snippets tagged with `{bidderId, docType, pageNumber}`.
- **Grounded Answering**: System prompt forces strictly factual responses with clickable citations (e.g. `[Bidder 1 - GST Certificate, Page 1]`).

### 📌 API Endpoints
```http
POST /api/v1/assistant/index-bid    → Ingests bid text chunks into ChromaDB
POST /api/v1/assistant/query        → Officer asks question, returns answer + citations
```

### ✅ Deliverable
Procurement Officer can ask *"Which bidders requested MSME turnover exemption?"* and get precise citations.

---

## Phase 9 — Unified Verification Pipeline Endpoint ⏱️ 20 min

### 🎯 Goal
Expose a single unified endpoint that runs the entire AI pipeline (Forensics + QR + OCR + Formatter) in one call.

### 📝 Files to create
1. `ai/routers/pipeline_routes.py`

### 📌 Pipeline Orchestration Flow
```python
# POST /api/v1/pipeline/verify-document
async def verify_document(file: UploadFile, claimed_type: str, claimed_id: str):
    # Step 1: Run PDF Forensics
    forensics = forensic_scanner.analyze(file)
    
    # Step 2: Decode QR & Verify Signature
    qr_check = qr_verifier.verify(file, claimed_id)
    
    # Step 3: Classify & Extract OCR Claims + Bounding Boxes
    ocr_result = ocr_engine.extract(file, claimed_type)
    
    # Step 4: Assemble 3-Pane Evidence Payload
    return {
        "docType": ocr_result.doc_type,
        "visualData": ocr_result.visual_markers,
        "extractedClaim": ocr_result.extracted_fields,
        "forensicCheck": {
            "hasMetadataTampering": forensics.is_tampered,
            "softwareDetected": forensics.flagged_tools,
            "qrDecodedPayload": qr_check.payload,
            "qrMatchesClaim": qr_check.matches_claim
        },
        "overallStatus": "TAMPERED" if forensics.is_tampered or not qr_check.matches_claim else "EXTRACTED"
    }
```

### ✅ Deliverable
Node.js backend can call `POST /api/v1/pipeline/verify-document` with a single multipart request and receive the complete verification package.

---

## Phase 10 — Integration Testing, Fixtures & Backend Wiring ⏱️ 20 min

### 🎯 Goal
Create test fixtures (clean PDF, Photoshop-edited PDF, syndicate bidders JSON), verify all routes, and test end-to-end integration with the Node.js backend.

### 📝 Files to create
1. `ai/test_fixtures/sample_bidders.json` — Mock bidders sharing directors/bank details
2. `ai/test_fixtures/create_mock_pdfs.py` — Script to generate test PDFs with metadata
3. Run integration tests against Node.js `services/verificationPipeline.js`

### 📌 Verification Checklist
```
✅ GET  http://localhost:8000/health                      → Status OK
✅ POST http://localhost:8000/api/v1/tender/parse-rules    → Extracts checklist JSON
✅ POST http://localhost:8000/api/v1/document/extract      → Returns GSTIN/Udyam & boxes
✅ POST http://localhost:8000/api/v1/forensics/analyze     → Flags editing software
✅ POST http://localhost:8000/api/v1/forensics/verify-qr   → Validates QR code vs claim
✅ POST http://localhost:8000/api/v1/cartel/detect         → Generates Cytoscape graph
✅ POST http://localhost:8000/api/v1/pipeline/verify-doc   → Complete 3-Pane payload
```

### ✅ Deliverable
Fully tested, production-grade AI microservice running on port `8000`, ready to integrate seamlessly with the Node.js backend on port `5000` and React UI on port `5173`.

---

## 🧪 Quick Test Commands (After All Phases)

```bash
# 1. Check AI Microservice Health
curl http://localhost:8000/health

# 2. Test Cartel Detection
curl -X POST http://localhost:8000/api/v1/cartel/detect \
  -H "Content-Type: application/json" \
  -d @ai/test_fixtures/sample_bidders.json

# 3. Test Document Forensics + OCR
curl -X POST http://localhost:8000/api/v1/pipeline/verify-document \
  -F "file=@sample_gst_certificate.pdf" \
  -F "claimedType=GST_CERTIFICATE" \
  -F "claimedId=07AAAAA0000A1Z5"

# 4. Open Interactive Swagger Docs
# Open in browser: http://localhost:8000/docs
```
