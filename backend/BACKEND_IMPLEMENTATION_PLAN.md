# 🚀 PRAMAN Backend — 3-Hour Implementation Plan (10 Phases)

> **Time: 3 hours (180 min) | Stack: Node.js + Express + MongoDB + Redis**  
> **Goal: Fully functional backend with all core APIs, mock adapters, audit ledger, and scoring engine**

---

## ⏱️ Timeline Overview

```
┌──────────┬────────────────────────────────────────────────┬──────────┐
│  Phase   │ What You'll Build                              │   Time   │
├──────────┼────────────────────────────────────────────────┼──────────┤
│ Phase 1  │ Project Scaffold & npm Setup                   │  15 min  │
│ Phase 2  │ MongoDB Connection & All 5 Mongoose Schemas    │  20 min  │
│ Phase 3  │ User Model + JWT Auth Middleware               │  15 min  │
│ Phase 4  │ Tender CRUD Routes & Controller                │  20 min  │
│ Phase 5  │ Bid Submission + Multer Upload + SHA-256       │  20 min  │
│ Phase 6  │ Mock Government Portal Adapters (4 adapters)   │  15 min  │
│ Phase 7  │ SHA-256 Hash-Chained Audit Ledger Service      │  20 min  │
│ Phase 8  │ Deterministic Compliance Scoring Engine         │  15 min  │
│ Phase 9  │ Verification Pipeline (connects everything)    │  20 min  │
│ Phase 10 │ Socket.io Real-time + Final API Wiring         │  20 min  │
├──────────┼────────────────────────────────────────────────┼──────────┤
│  TOTAL   │ Complete Backend                               │ 180 min  │
└──────────┴────────────────────────────────────────────────┴──────────┘
```

---

## 📁 Final Directory Structure

```
gem-bid/
├── frontend/               ← Existing React frontend (Vite)
├── backend/                ← Backend
│   ├── package.json
│   ├── server.js                    # Express app + Socket.io bootstrap
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── redis.js                 # Redis client config
│   ├── models/
│   │   ├── User.js                  # Auth user (Officer/Bidder)
│   │   ├── Tender.js                # Tender rules & eligibility
│   │   ├── Bidder.js                # Bidder entity profile
│   │   ├── BidSubmission.js         # Submitted docs & evaluation
│   │   ├── VerificationEvidence.js  # 3-Pane viewer evidence
│   │   └── AuditLedger.js           # Crypto hash-chain blocks
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tenderRoutes.js
│   │   ├── bidRoutes.js
│   │   ├── verificationRoutes.js
│   │   └── auditRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tenderController.js
│   │   ├── bidController.js
│   │   ├── verificationController.js
│   │   └── auditController.js
│   ├── services/
│   │   ├── auditLedger.js           # SHA-256 hash chain logic
│   │   ├── complianceEngine.js      # Scoring engine
│   │   ├── verificationPipeline.js  # Orchestrates full verification
│   │   └── adapters/
│   │       ├── GSTNAdapter.js       # Mock GSTN portal
│   │       ├── UdyamAdapter.js      # Mock Udyam portal
│   │       ├── MCAAdapter.js        # Mock MCA21 portal
│   │       └── DebarmentAdapter.js  # Mock CPPP debarment
│   ├── middlewares/
│   │   ├── auth.js                  # JWT verification + RBAC
│   │   └── upload.js                # Multer + SHA-256 check
│   └── .env
```

---

## Phase 1 — Project Scaffold & npm Setup ⏱️ 15 min

### 🎯 Goal
Set up the `backend/` directory, install all dependencies, create the Express entry point.

### 📦 What to install
```bash
# Inside PRAMAAN/backend
npm init -y

# Core
npm install express mongoose dotenv cors helmet morgan

# Auth
npm install jsonwebtoken bcryptjs

# File upload
npm install multer uuid

# Real-time
npm install socket.io

# Queue & Cache (optional)
npm install bullmq ioredis
```

### 📝 Files to create
- `backend/server.js` — Express app bootstrap with Socket.io
- `backend/.env` — Environment variables
- `backend/config/db.js` — MongoDB connection

### 🧠 Key Concepts to Understand
- **Express app** = HTTP server that handles REST API requests
- **Mongoose** = ODM (Object Data Modeling) library that maps MongoDB documents to JavaScript objects
- **dotenv** = Loads `.env` file variables into `process.env`
- **cors** = Cross-Origin Resource Sharing (allows frontend on port 5173 to call backend on port 5000)
- **helmet** = Sets security-related HTTP headers

### ✅ Deliverable
Server starts on port 5000, connects to MongoDB, logs "PRAMAN Backend Ready".

---

## Phase 2 — MongoDB Connection & All 5 Mongoose Schemas ⏱️ 20 min

### 🎯 Goal
Create all 5 core data models exactly as specified in the blueprint.

### 📝 Files to create
1. `backend/models/Tender.js`
2. `backend/models/Bidder.js`
3. `backend/models/BidSubmission.js`
4. `backend/models/VerificationEvidence.js`
5. `backend/models/AuditLedger.js`

### 📌 Schema Relationships
```
Tender  ←──┐
            ├── BidSubmission ──→ VerificationEvidence
Bidder  ←──┘                            │
                                        ↓
                                  AuditLedger (records every action)
```

### ✅ Deliverable
All 5 models exported and importable. Schemas match the specification exactly.

---

## Phase 3 — User Model + JWT Auth Middleware ⏱️ 15 min

### 🎯 Goal
Create authentication system with JWT tokens and role-based access control (RBAC).

### 📝 Files to create
1. `backend/models/User.js` — User schema with roles
2. `backend/middlewares/auth.js` — JWT verification middleware
3. `backend/routes/authRoutes.js` — Login/Register endpoints
4. `backend/controllers/authController.js` — Auth logic

### 📌 API Endpoints
- `POST /api/auth/register` — Creates user with role
- `POST /api/auth/login` — Returns JWT token
- `GET /api/auth/me` — Returns current user (protected route)

---

## Phase 4 — Tender CRUD Routes & Controller ⏱️ 20 min

### 🎯 Goal
Build the Procurement Officer's tender management APIs.

### 📝 Files to create
1. `backend/routes/tenderRoutes.js`
2. `backend/controllers/tenderController.js`

### 📌 API Endpoints
```
POST   /api/tenders          → Create new tender with rules
GET    /api/tenders          → List all tenders (filter by status)
GET    /api/tenders/:id      → Get single tender with full rules
PUT    /api/tenders/:id      → Update tender rules/config
PATCH  /api/tenders/:id/publish → Publish tender (change status)
```

---

## Phase 5 — Bid Submission + Multer Upload + SHA-256 ⏱️ 20 min

### 🎯 Goal
Build the bidder document upload pipeline with file integrity verification.

### 📝 Files to create
1. `backend/middlewares/upload.js` — Multer config + SHA-256 computation
2. `backend/routes/bidRoutes.js`
3. `backend/controllers/bidController.js`

### 📌 Upload Flow
```
Bidder uploads PDF
    → Multer saves to disk
    → Server computes SHA-256 hash of saved file
    → Compares with client-submitted hash
    → If match → Save metadata to BidSubmission
    → Create AuditLedger block (BID_SUBMITTED)
    → Return tracking reference number
```

---

## Phase 6 — Mock Government Portal Adapters ⏱️ 15 min

### 🎯 Goal
Build 4 mock adapters that simulate government portal API responses.

### 📝 Files to create
1. `backend/services/adapters/GSTNAdapter.js`
2. `backend/services/adapters/UdyamAdapter.js`
3. `backend/services/adapters/MCAAdapter.js`
4. `backend/services/adapters/DebarmentAdapter.js`

| Adapter | Input | Key Response Fields |
| :--- | :--- | :--- |
| GSTN | GSTIN string | status, legalName, registrationDate, lastFiled |
| Udyam | Udyam number | enterpriseType (Micro/Small/Medium), activity, NIC code |
| MCA | CIN/DIN | directors[], paidUpCapital, companyStatus |
| Debarment | PAN | isDebarred (boolean), debarmentReason, orderDate |

---

## Phase 7 — SHA-256 Hash-Chained Audit Ledger ⏱️ 20 min

### 🎯 Goal
Build the cryptographic append-only audit ledger — the backbone of PRAMAN's legal compliance.

### 📝 Files to create
1. `backend/services/auditLedger.js` — Core hash chain logic
2. `backend/routes/auditRoutes.js`
3. `backend/controllers/auditController.js`

### 📌 Chain Verification Algorithm
```
For each block i from 0 to N:
  1. Recompute hash from block's own data
  2. Check: recomputed hash === stored currentHash?
  3. Check: block.previousHash === blocks[i-1].currentHash?
  4. If any check fails → CHAIN BROKEN → tampering detected
```

---

## Phase 8 — Deterministic Compliance Scoring Engine ⏱️ 15 min

### 🎯 Goal
Build the rules engine that calculates the explainable 0–100 compliance score.

### 📝 Files to create
1. `backend/services/complianceEngine.js`

### 📌 Scoring Formula
$$\text{Score} = \text{GatingIndicator} \times \sum (\text{weight}_i \times \text{compliance}_i)$$

---

## Phase 9 — Verification Pipeline (Connects Everything) ⏱️ 20 min

### 🎯 Goal
Build the orchestrator that ties together: OCR / AI Microservice → Portal Adapters → Scoring Engine → Audit Ledger.

### 📝 Files to create
1. `backend/services/verificationPipeline.js`
2. `backend/routes/verificationRoutes.js`
3. `backend/controllers/verificationController.js`

---

## Phase 10 — Socket.io Real-time + Final API Wiring ⏱️ 20 min

### 🎯 Goal
Add real-time WebSocket events and wire everything together for a working demo.

### 📝 Files to update/create
1. Update `backend/server.js` — Mount all routes, initialize Socket.io
2. Add Socket.io event emissions in verification pipeline
