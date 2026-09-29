import React, { useState } from 'react';
import {
  ScrollText, CheckCircle, ShieldCheck, ShieldAlert, FileText,
  Scan, Network, BarChart3, UserCheck, Link2, Lock, Hash,
  ChevronDown, ChevronRight, Copy
} from 'lucide-react';
import { MOCK_AUDIT_TRAIL } from '../data/mockData';

const ACTION_CONFIG = {
  TENDER_CREATED: { icon: ShieldCheck, label: 'Tender Created' },
  BID_SUBMITTED: { icon: FileText, label: 'Bid Submitted' },
  OCR_EXTRACTION_COMPLETED: { icon: Scan, label: 'OCR Complete' },
  FORENSIC_FLAG_RAISED: { icon: ShieldAlert, label: 'Forensic Alert', isCritical: true },
  PORTAL_VERIFIED: { icon: CheckCircle, label: 'Portal Verified' },
  COLLUSION_DETECTED: { icon: Network, label: 'Collusion Detected', isCritical: true },
  SCORE_CALCULATED: { icon: BarChart3, label: 'Score Calculated' },
  OFFICER_OVERRIDE: { icon: UserCheck, label: 'Officer Override' },
};

export default function AuditTrail({ currentUser }) {
  const isBidder = (currentUser?.role || '').toUpperCase() === 'BIDDER';
  const [expanded, setExpanded] = useState(new Set([3]));

  const toggle = (idx) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{isBidder ? 'Public CAG Audit Ledger' : 'Hash-Chained Audit Ledger'}</h1>
          <p className="page-subtitle">
            {isBidder 
              ? 'Public Cryptographic Record | 8 Blocks | SHA-256 Chain Verified Transparency'
              : 'Immutable cryptographic record | 8 blocks | SHA-256 chain verified'
            }
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="badge badge-pass" style={{ padding: '5px 10px', fontSize: '0.68rem' }}>
            <CheckCircle style={{ width: 13, height: 13 }} />
            <span>CHAIN INTEGRITY: VERIFIED</span>
          </div>
          <button className="btn btn-primary btn-sm">
            <ScrollText style={{ width: 14, height: 14 }} /> Export CAG Report
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Top 3 Stat Cards (Matching Image 4) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 22 }}>
          {/* Card 1: Total Blocks */}
          <div className="stat-card-accent" style={{ '--card-accent': '#10b981' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">TOTAL BLOCKS</span>
              <div className="stat-card-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Lock style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value">8</div>
            <div className="stat-card-change" style={{ color: 'var(--text-muted)' }}>
              All blocks valid
            </div>
          </div>

          {/* Card 2: Chain Status */}
          <div className="stat-card-accent" style={{ '--card-accent': '#3b82f6' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">CHAIN STATUS</span>
              <div className="stat-card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Link2 style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>INTACT</div>
            <div className="stat-card-change" style={{ color: 'var(--text-muted)' }}>
              No broken links
            </div>
          </div>

          {/* Card 3: Officer Actions */}
          <div className="stat-card-accent" style={{ '--card-accent': '#8b5cf6' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">OFFICER ACTIONS</span>
              <div className="stat-card-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <UserCheck style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value">2</div>
            <div className="stat-card-change" style={{ color: 'var(--text-muted)' }}>
              All justified & sealed
            </div>
          </div>
        </div>

        {/* Immutable Event Timeline Card (Matching Image 4) */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-title">
              <ScrollText style={{ width: 16, height: 16, color: '#475569' }} /> Immutable Event Timeline — TND-2026-GEM-48291
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Genesis → Block #7
            </span>
          </div>
          <div className="card-body">
            <div className="timeline-list">
              {[
                {
                  idx: 0,
                  type: 'TENDER_CREATED',
                  time: '15 Aug 2026, 3:35 pm',
                  actorRole: 'OFFICER',
                  actorName: 'Sh. Rajesh Kumar Verma',
                  desc: 'Tender TND-2026-GEM-48291 created and published with 9 mandatory statutory rules.',
                  hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
                },
                {
                  idx: 1,
                  type: 'BID_SUBMITTED',
                  time: '28 Aug 2026, 2:44 pm',
                  actorRole: 'BIDDER',
                  actorName: 'Bharat NetSolutions Pvt. Ltd.',
                  desc: '7 statutory documents uploaded. Client SHA-256 fingerprints verified against server recalculation.',
                  hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'
                },
                {
                  idx: 2,
                  type: 'OCR_EXTRACTION_COMPLETED',
                  time: '28 Aug 2026, 2:45 pm',
                  actorRole: 'SYSTEM_AI',
                  actorName: 'PaddleOCR-v4 Engine',
                  desc: 'GST Certificate OCR extraction completed. 7 key fields extracted at 96% mean confidence.',
                  hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4'
                },
                {
                  idx: 3,
                  type: 'FORENSIC_FLAG_RAISED',
                  time: '1 Sept 2026, 4:52 pm',
                  actorRole: 'SYSTEM_AI',
                  actorName: 'Forensic Scanner v2.1',
                  desc: 'CRITICAL: Adobe Photoshop detected in PDF metadata for Apex Infotech (BID-004) GST certificate. Font baseline anomaly near turnover field.',
                  hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5'
                },
              ].map(b => {
                const config = ACTION_CONFIG[b.type] || ACTION_CONFIG.TENDER_CREATED;
                const Icon = config.icon;
                const isOpen = expanded.has(b.idx);

                return (
                  <div key={b.idx} className="timeline-item">
                    <div className="timeline-bullet" />
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => toggle(b.idx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon style={{ width: 15, height: 15, color: '#374151' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#111827' }}>
                          {config.label}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>
                          Block #{b.idx}
                        </span>
                        {config.isCritical && (
                          <span className="badge badge-warn" style={{ fontSize: '0.62rem' }}>
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{b.time}</span>
                        {isOpen ? (
                          <ChevronDown style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                        ) : (
                          <ChevronRight style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', marginTop: 6, color: 'var(--text-secondary)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', marginRight: 6 }}>
                        {b.actorRole}: {b.actorName}
                      </span>
                      {b.desc}
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: 10, padding: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Lock style={{ width: 10, height: 10 }} /> CRYPTOGRAPHIC HASH (SHA-256)
                          </span>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 6px', fontSize: '0.55rem' }}
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(b.hash); }}
                          >
                            <Copy style={{ width: 10, height: 10 }} /> Copy
                          </button>
                        </div>
                        <div className="mono" style={{ fontSize: '0.65rem', wordBreak: 'break-all' }}>
                          {b.hash}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: '0.6rem', color: '#15803d' }}>
                          <Link2 style={{ width: 12, height: 12 }} /> Cryptographically linked to Block #{b.idx > 0 ? b.idx - 1 : 'GENESIS'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
