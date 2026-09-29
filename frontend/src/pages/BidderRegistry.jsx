import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Filter, ShieldAlert, CheckCircle, Eye,
  Building, Phone, MapPin, FileCheck, ArrowUpRight
} from 'lucide-react';
import { MOCK_BIDDERS } from '../data/mockData';

export default function BidderRegistry() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const filtered = MOCK_BIDDERS.filter(b => {
    const matchesSearch = b.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || b.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bidder Registry</h1>
          <p className="page-subtitle">
            Centralized Statutory Directory | Verification Status, Udyam MSME, Debarment Records
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '5px 10px' }}>
            Total Bidders: <strong style={{ marginLeft: 4 }}>{MOCK_BIDDERS.length}</strong>
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* Search & Filter Row */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ width: 15, height: 15, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by legal entity name, GSTIN, PAN, or Bidder ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                background: '#ffffff',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'LOW', 'MEDIUM', 'CRITICAL'].map(risk => (
              <button
                key={risk}
                className={`btn btn-sm ${filterRisk === risk ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterRisk(risk)}
              >
                {risk === 'ALL' ? 'All Risks' : `${risk} Risk`}
              </button>
            ))}
          </div>
        </div>

        {/* Bidders Directory Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map(b => (
            <div
              key={b.id}
              className="card"
              style={b.isCollusionFlagged ? { borderColor: '#fca5a5' } : {}}
            >
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {b.legalName}
                    </span>
                    {b.isCollusionFlagged && (
                      <span className="badge badge-warn" style={{ fontSize: '0.6rem' }}>
                        <ShieldAlert style={{ width: 11, height: 11 }} /> COLLUSION FLAGGED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    ID: {b.id} | Entity: {b.entityType.replace('_', ' ')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`badge ${b.riskLevel === 'LOW' ? 'badge-pass' : b.riskLevel === 'MEDIUM' ? 'badge-neutral' : 'badge-warn'}`}>
                    {b.riskLevel} RISK
                  </span>
                </div>
              </div>

              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.74rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>GSTIN</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{b.gstin}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>PAN</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{b.pan}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>UDYAM / MSME STATUS</span>
                  <span style={{ fontWeight: 600 }}>
                    {b.udyam ? `${b.udyam} (${b.msmeCategory} Enterprise)` : 'Not MSME Registered'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                  <MapPin style={{ width: 13, height: 13, flexShrink: 0 }} />
                  <span>{b.address}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                  <Phone style={{ width: 13, height: 13, flexShrink: 0 }} />
                  <span>{b.phone}</span>
                </div>

                {b.collusionNote && (
                  <div style={{ padding: '6px 10px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 4, color: '#dc2626', fontSize: '0.68rem' }}>
                    <strong>Syndicate Alert:</strong> {b.collusionNote}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.7rem' }}>
                    Compliance Score: <strong className="mono" style={{ color: b.score >= 80 ? '#10b981' : b.score >= 60 ? '#f59e0b' : '#ef4444' }}>{b.score}/100</strong>
                    <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>({b.verifiedDocs}/{b.submittedDocs} docs verified)</span>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate('/evidence')}
                  >
                    Inspect Documents <ArrowUpRight style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
