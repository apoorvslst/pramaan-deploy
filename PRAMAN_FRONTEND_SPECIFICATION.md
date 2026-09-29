# PRAMAN (प्रमाण) — Complete Frontend Specification & Antigravity Master Blueprint

> **Super-Detailed Specification & Implementation Guide for Antigravity / AI Coding Assistants**  
> *Target Project:* **PRAMAN (प्रमाण)** — AI-Powered Statutory Verification, Document Forensics & Cartel Detection Platform for GeM & Public Procurement.  
> *Target Stack:* React 19 + Vite + Vanilla CSS (Government Institutional Design System) + Lucide Icons + React Router v7.

---

## 📑 Table of Contents
1. [Master Prompt for Antigravity (Copy-Paste Ready)](#1-master-prompt-for-antigravity-copy-paste-ready)
2. [Visual Design Analysis from Reference Screenshots](#2-visual-design-analysis-from-reference-screenshots)
3. [Project Architecture & Directory Layout](#3-project-architecture--directory-layout)
4. [Centralized CSS Design System & Theme (`index.css`)](#4-centralized-css-design-system--theme-indexcss)
5. [Complete Source Code of All Components & Pages](#5-complete-source-code-of-all-components--pages)
   - 5.1 [Sidebar Navigation (`src/components/Sidebar.jsx`)](#51-sidebar-navigation-srccomponentssidebarjsx)
   - 5.2 [Application Router & Layout (`src/App.jsx`)](#52-application-router--layout-srcappjsx)
   - 5.3 [Compliance Dashboard (`src/pages/Dashboard.jsx`)](#53-compliance-dashboard-srcpagesdashboardjsx)
   - 5.4 [3-Pane Evidence Verification Workspace (`src/pages/EvidenceViewer.jsx`)](#54-3-pane-evidence-verification-workspace-srcpagesevidenceviewerjsx)
   - 5.5 [Cartel & Collusion Graph Detection (`src/pages/CollusionGraph.jsx`)](#55-cartel--collusion-graph-detection-srcpagescollusiongraphjsx)
   - 5.6 [Hash-Chained Cryptographic Audit Ledger (`src/pages/AuditTrail.jsx`)](#56-hash-chained-cryptographic-audit-ledger-srcpagesaudittrailjsx)
6. [Mock Dataset (`src/data/mockData.js`)](#6-mock-dataset-srcdatamockdatajs)
7. [Backend API Integration Layer (`src/services/api.js`)](#7-backend-api-integration-layer-srcservicesapijs)
8. [Backend API Contracts (REST & WebSockets)](#8-backend-api-contracts-rest--websockets)
9. [Step-by-Step Setup & Verification Guide](#9-step-by-step-setup--verification-guide)

---

## 1. Master Prompt for Antigravity (Copy-Paste Ready)

> **Instructions:** Copy the prompt block below and paste it directly into Antigravity or any agentic coding assistant to construct or rebuild the exact frontend matching the 4 reference screenshots.

```text
Build the complete, production-grade frontend for PRAMAN (प्रमाण) — an AI-powered statutory verification, document forensics, and cartel detection platform designed for Government e-Marketplace (GeM) and public procurement tenders.

The application must be built using Vite + React 19 + pure Vanilla CSS (institutional Government of India slate/navy corporate design system) + Lucide React icons + React Router v7.

Visual & Architectural Specifications (Must Match Provided Interface Screenshots Exactly):

1. Layout & Theme:
   - Full-height flex application layout with fixed 250px Sidebar on the left and scrollable Main Content area on the right.
   - Clean slate background (#f4f6f9), white card surfaces (#ffffff), crisp borders (#e2e8f0), and subtle card shadows.
   - Sidebar has a warm brown emblem (#935a24) with white Hindi letter 'प्र', title 'PRAMAN', subtitle 'AI VERIFICATION PLATFORM', section labels ('COMMAND CENTER', 'ADMINISTRATION'), and muted oval badge bubbles.
   - Active navigation item has a warm cream/beige background (#f5efe6) with dark bold text (#111827).
   - Sidebar footer features a blue circular avatar 'RV', officer name 'Sh. Rajesh K. Verma', and role 'Procurement Officer • MeitY'.

2. Page 1: Compliance Dashboard (/):
   - Header: 'Compliance Dashboard', tender metadata ('Tender: TND-2026-GEM-48291 • Ministry of Electronics and Information Technology (MeitY) • Status: EVALUATION'), live monitoring indicator, secondary 'Export Report' button, and dark charcoal primary button 'Run AI Scan' (#374151).
   - Top Row (5 Colored Accent Stat Cards):
     * Active Tenders: 3px orange top line (#f97316), peach icon box, value '6', change '+2 this week'.
     * Total Bidders: 3px blue top line (#3b82f6), light blue icon box, value '187', change '+34 verified today'.
     * Documents Processed: 3px emerald green top line (#10b981), light green icon box, value '1,428', change 'Avg 4.2 min/doc'.
     * Forensic Flags: 3px red top line (#ef4444), light red icon box, value '17', change '3 critical'.
     * Collusion Alerts: 3px purple top line (#8b5cf6), light purple icon box, value '3', change '1 new ring found'.
   - Middle Row:
     * Government Portal Status Card: Horizontal progress bars for GSTN Portal (99.2%, green), Udyam / MSME Portal (97.8%, green), MCA21 / RoC Gateway (95.1%, green), EPFO / ESIC Portal (88.5%, red), with Online/Degraded pill badges.
     * Verification Outcome Distribution Card: Big stats for 72% PASSED, 16% REVIEW, 12% FAILED, Avg Compliance Score 76.4 with gradient bar, and a single solid dark progress bar below.
   - Bottom Row:
     * Bidder Compliance Rankings Table: Columns for RANK, BIDDER NAME, GSTIN, ENTITY, MSME, SCORE, RISK, DOCS, FORENSICS, AI RECOMMENDATION, STATUS. Score rendered as SVG circular ring with stroke #1e293b.

3. Page 2: 3-Pane Evidence Verification Workspace (/evidence):
   - Header with bidder name, document type, and two top-right pill badges: '🛡 FORENSIC TAMPERING FLAGGED' and '⨂ TAMPERED'.
   - Pane 1: Original Document preview of Form GST REG-06 Certificate with red outlined bounding box around the turnover/liability region and a black tooltip directly above: '▲ Font Inconsistency Detected'.
   - Pane 2: AI Extracted Claims with OCR confidence bar (94%), structured key-value list with uppercase gray labels and bold black values.
   - Pane 3: Portal — GSTN with live timestamp (12/9/2026, 8:02:18 pm) and registry records showing green checkmark icons for matches and a warning triangle icon for legal name discrepancy.
   - Bottom Action Bar: 'Override AI Recommendation' button with expandable justification input, and two action buttons: 'Disqualify Bidder' (#7f1d1d) and 'Accept & Qualify' (#065f46).

4. Page 3: Cartel & Collusion Detection (/collusion):
   - Syndicate Bidding Detected banner detailing shared director, overlapping address, sequential phone numbers, and identical PDF Author metadata DESKTOP-APEX01.
   - Left Card (Bidder Relationship Graph): High-DPI HTML5 Canvas showing relationship nodes with dark outlines and center dots. An inner dashed ellipse encircling the collusion cluster with label '⚠ COLLUSION CLUSTER — CRITICAL RISK' and labeled connector lines ('Director', 'PDF Author', 'Address', 'Phone Range').
   - Right Card (Implicated Entities): Detailed cards for Apex Infotech (BID-004) and NewEdge IT (BID-006) with CRITICAL badges and shared attributes breakdown.

5. Page 4: Hash-Chained Audit Ledger (/audit):
   - Header with '✓ CHAIN INTEGRITY: VERIFIED ✓' badge and 'Export CAG Report' button.
   - 3 Top Accent Cards: Total Blocks (8, green accent), Chain Status (INTACT, blue accent), Officer Actions (2, purple accent).
   - Immutable Event Timeline with vertical timeline line and dots. Expandable block cards showing event type, role, actor name, timestamp, description, and expandable SHA-256 cryptographic hash with copy button and chain verification link.

6. Backend Integration:
   - Provide src/services/api.js that connects to VITE_API_BASE_URL (http://localhost:5000/api) with transparent fallback to src/data/mockData.js when the backend is offline.
```

---

## 2. Visual Design Analysis from Reference Screenshots

| Component | Visual Specification (From Screenshots) |
| :--- | :--- |
| **Sidebar Brand** | Warm brown square emblem (`#935a24`) with white Hindi letter `प्र`. Text `PRAMAN` with subtitle `AI VERIFICATION PLATFORM`. |
| **Sidebar Active State** | Warm cream/beige background (`#f5efe6`) with dark slate text (`#111827`) and rounded corners (`border-radius: 6px`). |
| **Sidebar Badges** | Neutral light gray oval bubbles (`#e2e8f0` background, `#64748b` text). |
| **Stat Cards** | Top 3px accent line (Orange, Blue, Green, Red, Purple) + soft rounded icon container in top right. |
| **Score Ring** | High-contrast dark stroke (`#1e293b`) circular SVG ring with score text centered. |
| **Portal Status Bars** | Bright emerald green (`#10b981`) for online portals; Coral red (`#ef4444`) for degraded portals. |
| **3-Pane Evidence** | Form GST REG-06 simulation sheet with red highlight box and black tooltip `▲ Font Inconsistency Detected`. |
| **Evidence Diff Icons** | Checkmark circle (`✓`) for registry matches; Warning triangle (`⚠`) for discrepancies. |
| **Collusion Graph** | Canvas graph with dashed ellipse cluster, dark stroke nodes with center dots, and labeled edges. |
| **Audit Ledger Timeline** | Vertical line with circular anchor bullets at each block; expandable SHA-256 hash box. |

---

## 3. Project Architecture & Directory Layout

```
praman-ui/ (or frontend/)
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   └── Sidebar.jsx
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── EvidenceViewer.jsx
    │   ├── CollusionGraph.jsx
    │   └── AuditTrail.jsx
    ├── services/
    │   └── api.js
    └── data/
        └── mockData.js
```

---

## 4. Centralized CSS Design System & Theme (`index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

:root {
  --bg-app: #f4f6f9;
  --bg-sidebar: #f8fafc;
  --bg-card: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-surface: #ffffff;
  --bg-active-nav: #f5efe6;

  --text-primary: #111827;
  --text-secondary: #374151;
  --text-muted: #64748b;

  --border-default: #e2e8f0;
  --border-subtle: #f1f5f9;

  --emblem-brown: #935a24;
  --btn-dark-charcoal: #374151;
  --btn-disqualify: #7f1d1d;
  --btn-qualify: #065f46;

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-full: 9999px;

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  background: var(--bg-app);
  color: var(--text-primary);
  line-height: 1.5;
  min-height: 100vh;
}

.mono {
  font-family: var(--font-mono);
}

.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar-header {
  padding: 18px 18px 16px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-brand .emblem {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--emblem-brown);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
}

.sidebar-brand-text .brand-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 1px;
  line-height: 1.1;
}

.sidebar-brand-text .brand-sub {
  font-size: 0.6rem;
  color: var(--text-muted);
  letter-spacing: 0.6px;
  font-weight: 700;
  margin-top: 2px;
}

.sidebar-nav {
  flex: 1;
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
}

.sidebar-section-label {
  font-size: 0.62rem;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 14px 10px 6px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  width: 100%;
  text-align: left;
  border: none;
  cursor: pointer;
}

.nav-link.active {
  background: var(--bg-active-nav);
  color: var(--text-primary);
  font-weight: 600;
}

.nav-link .nav-badge {
  margin-left: auto;
  font-size: 0.62rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: #e2e8f0;
  color: var(--text-muted);
}

.sidebar-footer {
  padding: 14px 18px;
  border-top: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-footer .avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.72rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-app);
  overflow-y: auto;
}

.page-header {
  padding: 18px 28px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.page-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 3px;
}

.page-body {
  padding: 22px 28px;
  flex: 1;
}

/* Stat Cards with Top Accent */
.stat-card-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}

.stat-card-accent {
  background: #ffffff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.stat-card-accent::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-accent, #3b82f6);
}

.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-card-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-card-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
}

.stat-card-change {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 8px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.card {
  background: #ffffff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-body {
  padding: 18px;
}

/* 3-Pane Grid */
.three-pane-container {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1fr;
  gap: 16px;
  height: calc(100vh - 180px);
}

.pane {
  background: #ffffff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pane-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-default);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pane-header-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.pane-body {
  padding: 18px;
  overflow-y: auto;
  flex: 1;
}

/* Document simulation sheet */
.doc-page-container {
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  min-height: 100%;
}

.doc-sheet {
  background: #ffffff;
  width: 100%;
  max-width: 440px;
  padding: 24px 22px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #cbd5e1;
  position: relative;
  font-size: 0.68rem;
  color: #1e293b;
}

.doc-sheet-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #f1f5f9;
}

.doc-sheet-label { font-weight: 600; color: #475569; }
.doc-sheet-value { font-weight: 700; color: #0f172a; }

.doc-highlight-box {
  position: absolute;
  border: 2px solid #ef4444;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 2px;
}

.doc-highlight-tooltip {
  position: absolute;
  top: -20px;
  left: 0;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.55rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
}

.bottom-action-bar {
  margin-top: 14px;
  padding: 12px 18px;
  background: #ffffff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

## 5. Verification & Running Guide

1. Make sure dependencies are installed:
   ```bash
   npm install lucide-react react-router-dom
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5174/` (or `http://localhost:5173/`).
4. All four tabs (**Compliance Dashboard**, **3-Pane Evidence Viewer**, **Cartel & Collusion Graph**, and **Audit Trail & Ledger**) will render with exact alignment to the 4 reference screenshots.
