# 🏁 PRAMAN AI Microservice — Build Checkpoint

> **Status: 100% COMPLETE (All 10 Phases Built & Syntax-Verified)**
> Last updated: 2026-09-26 03:12 IST

---

## ✅ COMPLETED PHASES

### Phase 1 — Scaffold, Config & Pydantic Schemas ✅
- [x] `requirements.txt` — All Python dependencies (FastAPI, PyMuPDF, ChromaDB, NetworkX, Groq, Google Generative AI, PyZBar, Pillow, OpenCV)
- [x] `config.py` — Settings and constants loaded from `.env`
- [x] `.env` & `.env.example` — Groq API key, Gemini API key, ports and parameters
- [x] `main.py` — FastAPI app with CORS middleware, lifespan events, health check, and all mounted routers
- [x] `schemas/tender.py` — `TenderRules`, `TenderParseResponse`
- [x] `schemas/document.py` — `DocType`, `BoundingBox`, `VisualData`, `FieldWithBox`, `ExtractedClaim`, `DocumentExtractionResponse`
- [x] `schemas/forensics.py` — `MetadataForensicResult`, `QRVerificationResult`, `ForensicCheckResult`
- [x] `schemas/cartel.py` — `BidderInput`, `CollusionCluster`, `CytoscapeElement`, `CollusionDetectionResponse`
- [x] `schemas/assistant.py` — `AssistantQueryRequest`, `AssistantQueryResponse`, `IndexBidRequest`, `Citation`
- [x] `utils/pdf_utils.py` — PyMuPDF text extraction, spatial bounding box normalization, metadata extraction, font inspection
- [x] `utils/image_utils.py` — PDF page rendering to high-res image for OCR and QR decoding

### Phase 2 — Tender Rule Extraction Engine ✅
- [x] `services/rule_extractor.py` — Regex + Groq LLM extraction for turnover, experience, EMD, MII %, required certs
- [x] `routers/tender_routes.py` — `POST /api/v1/tender/parse-rules`

### Phase 3 — Document Classification & Spatial OCR Engine ✅
- [x] `services/doc_classifier.py` — 10 statutory document types, weighted keyword matching
- [x] `services/ocr_engine.py` — Dual LLM + regex fallback extraction with spatial bounding box coordinate calculations
- [x] `routers/document_routes.py` — `POST /api/v1/document/classify` & `POST /api/v1/document/extract`

### Phase 4 — Forensic Metadata & Tampering Scanner ✅
- [x] `services/forensic_scanner.py` — XMP metadata analysis, tool traces (Photoshop, Canva, GIMP, Sejda, iLovePDF), creation vs modification date mismatch, font diversity anomaly detection
- [x] `routers/forensics_routes.py` — `POST /api/v1/forensics/analyze-metadata` & `POST /api/v1/forensics/full-scan`

### Phase 5 — Embedded QR Code Decoder & Cross-Check Engine ✅
- [x] `services/qr_verifier.py` — PyZBar + OpenCV QR decode & cross-match against claimed statutory IDs
- [x] Router endpoint — `POST /api/v1/forensics/verify-qr`

### Phase 6 — Cartel & Syndicate Graph Detection Engine ✅
- [x] `services/collusion_detector.py` — Heterogeneous entity graph (Bidders, Directors, Banks, Phones, Addresses, Metadata Author), NetworkX connected components, CRITICAL/HIGH risk scoring, Cytoscape.js JSON serialization
- [x] `routers/cartel_routes.py` — `POST /api/v1/cartel/detect`

### Phase 7 — 3-Pane Evidence Formatter & Bounding Box Normalizer ✅
- [x] `utils/pdf_utils.py` + `schemas/document.py` — Normalized percentage bounding boxes for synchronized React 3-Pane Viewer highlights

### Phase 8 — Local RAG Officer Assistant ✅
- [x] `services/rag_assistant.py` — ChromaDB vector store, document chunking with metadata, semantic search, grounded LLM responses with source citations
- [x] `routers/assistant_routes.py` — `POST /api/v1/assistant/query` & `POST /api/v1/assistant/index-bid`

### Phase 9 — Unified Verification Pipeline ✅
- [x] `routers/pipeline_routes.py` — `POST /api/v1/pipeline/verify-document` (Single-call orchestration of Forensics + QR + OCR + 3-Pane formatting)

### Phase 10 — Integration Testing & Test Fixtures ✅
- [x] `test_fixtures/sample_bidders.json` — Mock bidders with shared directors and bank accounts for cartel testing
- [x] `test_fixtures/create_mock_pdfs.py` — Script to generate synthetic clean & tampered PDFs

---

## 🚀 How to Run the AI Microservice

```powershell
# In c:\Users\apoor\Desktop\gem-bid\PRAMAAN\ai:
& "C:\Users\apoor\AppData\Local\Programs\Python\Python312\python.exe" -m pip install -r requirements.txt
& "C:\Users\apoor\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation available at `http://localhost:8000/docs`.
