# 🌐 PRAMAN — Unified API Routes & System Architecture Directory

> **PRAMAN (प्रमाण)** — Autonomous AI-Powered Public Procurement Bid Verification, Forensics & Cartel Detection Engine for GeM (Government e-Marketplace).

---

## 🏗️ System Topology & Service Ports

| Service | Technology | Port | Base URL | Role |
| :--- | :--- | :---: | :--- | :--- |
| **Frontend UI** | React 19 + Vite + Tailwind | **`5173`** | `http://localhost:5173` | Procurement Officer Dashboard & Bidder Portal |
| **Backend Engine** | Node.js (v24) + Express 5 + MongoDB | **`5000`** | `http://localhost:5000` | Statutory Verification Engine, Cryptographic Ledger & API Gateway |
| **AI Microservice** | Python 3.12 + FastAPI + PyMuPDF + Groq | **`8000`** | `http://localhost:8000` | OCR, Forensics, QR Verifier, Cartel Graph, RAG Assistant & Signatures |
| **Vector DB** | ChromaDB (Local air-gapped) | *In-proc* | `./ai/chroma_db` | Document and Signature Embeddings Store |
| **Database** | MongoDB | **`27017`** | `mongodb://localhost:27017/praman` | Tenders, Bidders, Submissions, Evidence & Audit Logs |
| **Cache (Optional)** | Redis | **`6379`** | `redis://localhost:6379` | API Idempotency & Rate Limiting |

---

## 🤖 1. AI Microservice Endpoints (`http://localhost:8000`)

### 📜 Tender Rule Extraction
| Method | Endpoint | Description | Payload / Params |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/tender/parse-rules` | Extracts statutory eligibility criteria from tender NIT/RFP PDF | `multipart/form-data`: `file` (PDF) |

### 🔍 Document Intelligence & Spatial OCR
| Method | Endpoint | Description | Payload / Params |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/document/classify` | Auto-detects statutory document type from 10 categories | `multipart/form-data`: `file` (PDF) |
| `POST` | `/api/v1/document/extract` | Extracts structured key-value claims + bounding boxes | `multipart/form-data`: `file`, `docType` |

### 🕵️ Forensic Tampering & QR Engine
| Method | Endpoint | Description | Payload / Params |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/forensics/analyze-metadata` | Detects Photoshop, Canva, GIMP traces & date mismatches | `multipart/form-data`: `file` (PDF) |
| `POST` | `/api/v1/forensics/verify-qr` | Decodes QR code and cross-checks against claimed statutory ID | `multipart/form-data`: `file`, `claimedIdentifier` |
| `POST` | `/api/v1/forensics/full-scan` | Combined metadata + QR check in one call | `multipart/form-data`: `file`, `claimedIdentifier` |

### 🕸️ Cartel & Syndicate Graph Detection
| Method | Endpoint | Description | Payload / Params |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/cartel/detect` | NetworkX connected components graph, outputs Cytoscape.js JSON | `application/json`: `{ bidders: [...], tenderId }` |

### ✍️ Signature Intelligence & Verification
| Method | Endpoint | Description | Payload / Params |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/signature/extract-and-embed` | Detects signature regions, crops, and computes 128-d HOG vector | `multipart/form-data`: `file` (PDF), `maxPages` |
| `POST` | `/api/v1/signature/index` | Indexes signature embeddings into ChromaDB vector registry | `application/json`: `{ tenderId, bidderId, signatures: [...] }` |
| `POST` | `/api/v1/signature/verify-cross-bid` | Flags cross-bidder signature collisions (same signer for competing bids) | `application/json`: `{ tenderId, similarityThreshold: 0.82 }` |
| `POST` | `/api/v1/signature/verify-against-anchor` | Validates submitted signature against master registered anchor | `application/json`: `{ anchorEmbedding, targetSignature }` |

### 🤖 Grounded RAG Officer Assistant
| Method | Endpoint | Description | Payload / Params |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/assistant/index-bid` | Ingests and chunks bid documents into ChromaDB | `application/json`: `{ tenderId, bidderId, documents: [...] }` |
| `POST` | `/api/v1/assistant/query` | Grounded procurement Q&A with exact source page citations | `application/json`: `{ question, tenderId, conversationHistory }` |

### ⚡ Unified Verification Pipeline
| Method | Endpoint | Description | Payload / Params |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/pipeline/verify-document` | Master single-call verification (Forensics + QR + OCR + Signatures) | `multipart/form-data`: `file`, `claimedType`, `claimedId` |

---

## ⚙️ 2. Backend Engine Endpoints (`http://localhost:5000`)

### 🛡️ Authentication & Authorization (`/api/auth`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user (OFFICER, CAG_AUDITOR, BIDDER) | Public |
| `POST` | `/api/auth/login` | Login with email/password, returns JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |

### 📋 Tender Management (`/api/tenders`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/tenders` | List all tenders with filtering | Public / Officer |
| `POST` | `/api/tenders` | Create a new tender with statutory eligibility rules | Private (OFFICER) |
| `GET` | `/api/tenders/:id` | Get tender details and required compliance checklist | Public / Officer |
| `PATCH` | `/api/tenders/:id` | Update tender details | Private (OFFICER) |
| `GET` | `/api/tenders/:id/submissions` | List all bidder submissions on a tender | Private (OFFICER) |

### 📤 Bidder Portal & Submissions (`/api/bids`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/bids/submit` | Submit bid with statutory documents | Private (BIDDER) |
| `GET` | `/api/bids/my-submissions` | Get current bidder's submissions | Private (BIDDER) |
| `GET` | `/api/bids/:id` | Get detailed submission with evaluation result | Private |
| `POST` | `/api/bids/:id/documents` | Upload additional document to submission | Private (BIDDER) |

### 🔬 Verification & 3-Pane Evidence (`/api/verify`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/verify/:submissionId/run` | Triggers the 5-stage verification pipeline (calls AI microservice) | Private (OFFICER) |
| `GET` | `/api/verify/:submissionId/evidence` | Retrieves 3-Pane evidence records (Pane 1, Pane 2, Pane 3) | Private |
| `GET` | `/api/verify/:submissionId/score` | Retrieves compliance score breakdown and gating status | Private |
| `POST` | `/api/verify/:submissionId/decision` | Officer overrides / approves / rejects bid with audit note | Private (OFFICER) |

### 🕵️ Forensic & Collusion Analytics (`/api/forensics`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/forensics/:tenderId/collusion` | Multi-bidder cartel graph analysis + Cytoscape JSON | Private (OFFICER) |
| `POST` | `/api/forensics/:bidId/anomalies` | Single-bid anomaly & risk multiplier scan | Private (OFFICER) |
| `GET` | `/api/forensics/:tenderId/dashboard` | Consolidated forensic dashboard for all bidders | Private (OFFICER) |

### 🔗 AI Microservice Bridge (`/api/ai`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/ai/health` | Checks status of Python AI microservice & LLM models | Public |
| `POST` | `/api/ai/assistant/query` | Officer chat with Grounded RAG Assistant (documents citations) | Private (OFFICER) |
| `POST` | `/api/ai/assistant/index-bid` | Ingests bid documents into vector DB | Private (OFFICER) |
| `POST` | `/api/ai/signatures/detect` | Extracts signatures & visual crops from uploaded PDF | Private (OFFICER) |
| `POST` | `/api/ai/signatures/verify-cross-bid` | Detects cartel proxy signers across competing bids | Private (OFFICER) |
| `POST` | `/api/ai/tender/parse-nit` | Extracts eligibility rules from uploaded tender notice | Private (OFFICER) |

### 🔐 Cryptographic Audit Ledger (`/api/audit`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/audit/chain` | Retrieves complete SHA-256 cryptographic audit hash chain | Private |
| `GET` | `/api/audit/verify` | Verifies integrity of the entire tamper-evident block chain | Private |
| `GET` | `/api/audit/stats` | Audit ledger statistics & summary | Private |

### 🐒 System & Chaos Engineering (`/api/system`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/system/health` | Deep system health (DB, Redis, Memory, Uptime) | Public |
| `GET` | `/api/system/liveness` | Kubernetes liveness probe | Public |
| `GET` | `/api/system/readiness` | Kubernetes readiness probe | Public |
| `POST` | `/api/system/chaos/toggle` | Arm or disarm Chaos Monkey middleware | Private (ADMIN) |
| `GET` | `/api/system/chaos/stats` | Chaos engineering metrics & fault-injection logs | Private (ADMIN) |

---

## 🚀 How to Run the Complete Stack Locally

### 1. Start AI Microservice (Port 8000)
```powershell
cd c:\Users\apoor\Desktop\gem-bid\PRAMAAN\ai
& "C:\Users\apoor\AppData\Local\Programs\Python\Python312\python.exe" -m pip install -r requirements.txt
& "C:\Users\apoor\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Backend Engine (Port 5000)
```powershell
cd c:\Users\apoor\Desktop\gem-bid\PRAMAAN\backend
npm install
npm run seed     # (Optional) Seed realistic GeM procurement data
npm run dev      # Starts on http://localhost:5000
```

### 3. Start Frontend Dashboard (Port 5173)
```powershell
cd c:\Users\apoor\Desktop\gem-bid\PRAMAAN\frontend
npm install
npm run dev      # Starts on http://localhost:5173
```
