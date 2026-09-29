import React, { useState } from 'react';
import {
  FileText, Server, Globe, ShieldAlert, CheckCircle, AlertTriangle,
  XCircle, Eye
} from 'lucide-react';
import { MOCK_EVIDENCE } from '../data/mockData';

function DummyGSTCertificate() {
  return (
    <div className="doc-page-container">
      <div className="doc-sheet">
        {/* Certificate Header */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: '0.58rem', color: '#64748b' }}>Government of India</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
            GOODS AND SERVICES TAX
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e293b' }}>
            CERTIFICATE OF REGISTRATION
          </div>
          <div style={{ fontSize: '0.55rem', color: '#64748b' }}>
            Form GST REG-06 [See Rule 10(1)]
          </div>
          <div style={{ width: '100%', height: 2, background: '#cbd5e1', marginTop: 6 }} />
        </div>

        {/* Certificate Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div className="doc-sheet-row">
            <span className="doc-sheet-label">1. GSTIN</span>
            <span className="doc-sheet-value mono">07AAFCA3456J1Z9</span>
          </div>
          <div className="doc-sheet-row">
            <span className="doc-sheet-label">2. Legal Name</span>
            <span className="doc-sheet-value">APEX INFOTECH SOLUTIONS PVT. LTD.</span>
          </div>
          <div className="doc-sheet-row">
            <span className="doc-sheet-label">3. Trade Name</span>
            <span className="doc-sheet-value">Apex Infotech</span>
          </div>
          <div className="doc-sheet-row">
            <span className="doc-sheet-label">4. Constitution</span>
            <span className="doc-sheet-value">Private Limited Company</span>
          </div>
          <div className="doc-sheet-row">
            <span className="doc-sheet-label">5. Address</span>
            <span className="doc-sheet-value" style={{ fontSize: '0.62rem' }}>42, Nehru Place, Block-B, New Delhi - 110019</span>
          </div>
          <div className="doc-sheet-row">
            <span className="doc-sheet-label">6. Date of Liability</span>
            <span className="doc-sheet-value">01/07/2017</span>
          </div>
          <div className="doc-sheet-row">
            <span className="doc-sheet-label">7. Date of Registration</span>
            <span className="doc-sheet-value">12/04/2019</span>
          </div>
          <div className="doc-sheet-row">
            <span className="doc-sheet-label">8. Jurisdiction</span>
            <span className="doc-sheet-value">Centre - Delhi | State - Delhi</span>
          </div>
          <div className="doc-sheet-row" style={{ borderBottom: 'none' }}>
            <span className="doc-sheet-label">9. Type of Registration</span>
            <span className="doc-sheet-value">Regular</span>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          width: 50, height: 50, border: '1px solid #cbd5e1',
          borderRadius: 3, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#fafafa'
        }}>
          <div style={{
            width: 38, height: 38, display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(6, 1fr)', gap: 1
          }}>
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} style={{ background: i % 2 === 0 || i % 5 === 0 ? '#0f172a' : '#ffffff' }} />
            ))}
          </div>
        </div>

        {/* Highlight Box — Suspicious Region */}
        <div className="doc-highlight-box" style={{ left: 145, top: 168, width: 175, height: 20 }}>
          <div className="doc-highlight-tooltip">
            Font Inconsistency Detected
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvidenceViewer() {
  const ev = MOCK_EVIDENCE;
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideText, setOverrideText] = useState('');

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">3-Pane Evidence Verification Workspace</h1>
          <p className="page-subtitle">
            Bidder: <strong>Apex Infotech Solutions Pvt. Ltd.</strong> (BID-004) | Document: GST Certificate
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="badge-pill-header">
            <ShieldAlert style={{ width: 14, height: 14, color: '#475569' }} />
            <span>FORENSIC TAMPERING FLAGGED</span>
          </div>
          <div className="badge-pill-header">
            <XCircle style={{ width: 14, height: 14, color: '#475569' }} />
            <span>{ev.verificationStatus}</span>
          </div>
        </div>
      </div>

      {/* 3 Panes (Matching Image 2) */}
      <div style={{ padding: '20px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="three-pane-container">
          {/* Pane 1: Original Document */}
          <div className="pane">
            <div className="pane-header">
              <span className="pane-header-title">
                <FileText style={{ width: 15, height: 15 }} /> PANE 1: ORIGINAL DOCUMENT
              </span>
              <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Page 1/1
              </span>
            </div>
            <div className="pane-body" style={{ padding: 0 }}>
              <DummyGSTCertificate />
            </div>
          </div>

          {/* Pane 2: AI Extracted Claims */}
          <div className="pane">
            <div className="pane-header">
              <span className="pane-header-title">
                <Server style={{ width: 15, height: 15 }} /> PANE 2: AI EXTRACTED
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {ev.extractedClaim.extractionModel}
              </span>
            </div>
            <div className="pane-body">
              {/* OCR Confidence */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    OCR ENGINE CONFIDENCE
                  </span>
                  <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                    {Math.round(ev.extractedClaim.ocrEngineConfidence * 100)}%
                  </span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${ev.extractedClaim.ocrEngineConfidence * 100}%`, height: '100%', background: '#334155', borderRadius: 999 }} />
                </div>
              </div>

              {/* Extracted Fields */}
              <div className="field-extract-list">
                {[
                  { label: 'GSTIN', value: '07AAFCA3456J1Z9' },
                  { label: 'LEGAL NAME', value: 'APEX INFOTECH SOLUTIONS PVT. LTD.' },
                  { label: 'TRADE NAME', value: 'Apex Infotech' },
                  { label: 'REGISTRATION DATE', value: '12/04/2019' },
                  { label: 'CONSTITUTION', value: 'Private Limited Company' },
                  { label: 'JURISDICTION', value: 'Centre - Delhi' },
                  { label: 'STATUS', value: 'Active' },
                ].map(item => (
                  <div key={item.label} className="field-extract-item">
                    <span className="field-extract-label">{item.label}</span>
                    <span className="field-extract-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pane 3: Portal — GSTN */}
          <div className="pane">
            <div className="pane-header">
              <span className="pane-header-title">
                <Globe style={{ width: 15, height: 15 }} /> PANE 3: PORTAL — GSTN
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="live-status-dot" style={{ background: '#10b981' }} />
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1e293b' }}>LIVE VERIFIED</span>
              </div>
            </div>
            <div className="pane-body">
              {/* Source Info */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  VERIFICATION SOURCE
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  GSTN Official Gateway
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Timestamp: 12/9/2026, 8:02:18 pm
                </div>
              </div>

              {/* Records Section */}
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                REGISTRY RECORDS
              </div>
              <div className="field-extract-list">
                {[
                  { label: 'GSTIN', value: '07AAFCA3456J1Z9', isMatch: true },
                  { label: 'LEGAL NAME', value: 'APEX INFOTECH SOLUTIONS PRIVATE LIMITED', isMatch: false },
                  { label: 'TRADE NAME', value: 'Apex Infotech', isMatch: true },
                  { label: 'REGISTRATION DATE', value: '12/04/2019', isMatch: true },
                  { label: 'STATUS', value: 'Active', isMatch: true },
                  { label: 'LAST RETURN FILED', value: 'GSTR-3B (July 2026)', isMatch: null },
                ].map(item => (
                  <div key={item.label} className="field-extract-item">
                    <span className="field-extract-label">{item.label}</span>
                    <div className="field-extract-value-row">
                      <span className="field-extract-value">{item.value}</span>
                      {item.isMatch === true && (
                        <CheckCircle style={{ width: 13, height: 13, color: '#475569' }} />
                      )}
                      {item.isMatch === false && (
                        <AlertTriangle style={{ width: 13, height: 13, color: '#475569' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar (Matching Image 2) */}
        <div className="bottom-action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setOverrideMode(!overrideMode)}
            >
              <Eye style={{ width: 14, height: 14 }} /> {overrideMode ? 'Cancel Override' : 'Override AI Recommendation'}
            </button>
            {overrideMode && (
              <input
                type="text"
                placeholder="Mandatory justification for override (sealed into audit chain)..."
                value={overrideText}
                onChange={e => setOverrideText(e.target.value)}
                style={{
                  padding: '6px 12px', fontSize: '0.72rem',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)',
                  width: 380, outline: 'none'
                }}
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-danger btn-sm">
              <XCircle style={{ width: 14, height: 14 }} /> Disqualify Bidder
            </button>
            <button className="btn btn-success btn-sm">
              <CheckCircle style={{ width: 14, height: 14 }} /> Accept & Qualify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
