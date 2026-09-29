import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, CheckCircle, AlertTriangle, ShieldCheck,
  Zap, ArrowRight, Lock, Scan, Server, RefreshCw
} from 'lucide-react';

const DOC_TYPES = [
  { id: 'GST_CERTIFICATE', label: 'GST Registration Certificate (Form GST REG-06)', required: true },
  { id: 'UDYAM_CERTIFICATE', label: 'Udyam MSME Registration Certificate', required: false },
  { id: 'PAN_CARD', label: 'Permanent Account Number (PAN Card)', required: true },
  { id: 'CA_TURNOVER_CERTIFICATE', label: 'Chartered Accountant Annual Turnover Certificate', required: true },
  { id: 'DEBARMENT_AFFIDAVIT', label: 'Non-Debarment / Anti-Blacklisting Affidavit', required: true },
  { id: 'OEM_AUTHORIZATION', label: 'Original Equipment Manufacturer (OEM) Authorization', required: false },
];

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [docType, setDocType] = useState('GST_CERTIFICATE');
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setScanResult(null);
    }
  };

  const runSimulatedScan = () => {
    setIsScanning(true);
    setScanStep(1);

    setTimeout(() => {
      setScanStep(2);
      setTimeout(() => {
        setScanStep(3);
        setTimeout(() => {
          setScanStep(4);
          setTimeout(() => {
            setIsScanning(false);
            setScanResult({
              sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              ocrConfidence: 96.4,
              forensicVerdict: 'CLEAN',
              registryStatus: 'VERIFIED_ACTIVE',
              fields: {
                'GSTIN': '07AABCN1234F1Z5',
                'Legal Name': 'Bharat NetSolutions Pvt. Ltd.',
                'Registration Date': '15/08/2018',
                'Entity Type': 'Private Limited Company'
              }
            });
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Forensics & AI Scrutiny</h1>
          <p className="page-subtitle">
            Officer Deep Document Inspection | PyMuPDF Font Forensics, Spatial OCR, Registry Ground-Truth Verification
          </p>
        </div>
      </div>


      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
          {/* Left Column: Upload Form */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title">
                <Upload style={{ width: 16, height: 16, color: '#475569' }} /> Document Intake Form
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SHA-256 Client Fingerprinted</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Select Document Type */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  Select Statutory Document Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                >
                  {DOC_TYPES.map(d => (
                    <option key={d.id} value={d.id}>{d.label} {d.required ? '(Mandatory)' : ''}</option>
                  ))}
                </select>
              </div>

              {/* File Dropzone */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  Upload Document (PDF / Scan)
                </label>
                <label
                  style={{
                    border: '2px dashed var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    padding: '30px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    background: file ? '#f0fdf4' : '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input type="file" accept=".pdf,image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  <Upload style={{ width: 32, height: 32, color: file ? '#10b981' : 'var(--text-muted)' }} />
                  {file ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#10b981' }}>{file.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {(file.size / 1024).toFixed(1)} KB • Ready for cryptographic scan
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Click or Drag PDF Document Here</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Supports digitally signed PDFs, Scanned Formats & High-Res Images up to 25MB
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Action Button */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 14px' }}
                disabled={isScanning}
                onClick={runSimulatedScan}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="animate-spin" style={{ width: 14, height: 14 }} /> Scanning in progress...
                  </>
                ) : (
                  <>
                    <Zap style={{ width: 14, height: 14 }} /> Run Instant AI Statutory & Forensic Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Real-time Scan Diagnostics */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title">
                <Scan style={{ width: 16, height: 16, color: '#475569' }} /> Automated Scrutiny Pipeline
              </span>
              <span className={`badge ${scanResult ? 'badge-pass' : 'badge-neutral'}`}>
                {scanResult ? 'Scan Complete' : isScanning ? 'Processing' : 'Idle'}
              </span>
            </div>
            <div className="card-body">
              {/* 4 Pipeline Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {[
                  { step: 1, title: 'Cryptographic Hashing', desc: 'SHA-256 fingerprint generated & checked against tamper repository' },
                  { step: 2, title: 'Spatial OCR & Field Extraction', desc: 'PaddleOCR-v4 + LayoutLM extraction of statutory identifier claims' },
                  { step: 3, title: 'Multi-Layer Forensic Scanner', desc: 'Font baseline anomaly check, PDF producer metadata & ELA analysis' },
                  { step: 4, title: 'Government Portal Cross-Verification', desc: 'Live query against official GSTN / Udyam / MCA21 registry' },
                ].map(s => {
                  const isDone = scanStep > s.step || scanResult;
                  const isCurrent = scanStep === s.step && isScanning;

                  return (
                    <div
                      key={s.step}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isCurrent ? '#eff6ff' : isDone ? '#f0fdf4' : '#f8fafc',
                        border: '1px solid',
                        borderColor: isCurrent ? '#bfdbfe' : isDone ? '#bbf7d0' : '#e2e8f0',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isDone ? (
                        <CheckCircle style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
                      ) : isCurrent ? (
                        <RefreshCw className="animate-spin" style={{ width: 16, height: 16, color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
                      ) : (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0, marginTop: 2 }} />
                      )}
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Step {s.step}: {s.title}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scan Results Card */}
              {scanResult && (
                <div style={{ padding: 14, background: '#f8fafc', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Pre-Flight Verdict</span>
                    <span className="badge badge-pass">VERIFIED</span>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><strong>SHA-256:</strong> <span className="mono" style={{ fontSize: '0.62rem' }}>{scanResult.sha256.substring(0, 32)}...</span></div>
                    <div><strong>Mean OCR Confidence:</strong> <span className="mono" style={{ fontWeight: 700, color: '#16a34a' }}>{scanResult.ocrConfidence}%</span></div>
                    <div><strong>Registry Status:</strong> <span className="badge badge-pass">GSTN LIVE ACTIVE</span></div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                    onClick={() => navigate('/evidence')}
                  >
                    Open in 3-Pane Evidence Workspace <ArrowRight style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
