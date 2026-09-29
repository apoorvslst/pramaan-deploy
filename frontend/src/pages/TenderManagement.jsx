import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, FileText, Plus, Search, Filter, Calendar,
  ArrowUpRight, CheckCircle, Clock, AlertCircle, Building, DollarSign
} from 'lucide-react';
import { MOCK_TENDERS_LIST } from '../data/mockData';

export default function TenderManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTender, setSelectedTender] = useState(MOCK_TENDERS_LIST[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = MOCK_TENDERS_LIST.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'EVALUATION') return <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>EVALUATION</span>;
    if (status === 'ACTIVE') return <span className="badge badge-pass">ACTIVE</span>;
    if (status === 'PUBLISHED') return <span className="badge badge-info">PUBLISHED</span>;
    return <span className="badge badge-neutral">DRAFT</span>;
  };

  const formatINR = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tender Management</h1>
          <p className="page-subtitle">
            GeM & CPPP Procurement Rule Ingestion | 6 Active Tenders Under Scrutiny
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus style={{ width: 14, height: 14 }} /> Create New Tender
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Top KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
          <div className="stat-card-accent" style={{ '--card-accent': '#3b82f6' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">ACTIVE TENDERS</span>
              <div className="stat-card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <ShieldCheck style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value">6</div>
            <div className="stat-card-change">Across 5 Ministries</div>
          </div>

          <div className="stat-card-accent" style={{ '--card-accent': '#10b981' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">TOTAL PROCUREMENT VALUE</span>
              <div className="stat-card-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                <DollarSign style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>₹74.05 Cr</div>
            <div className="stat-card-change">Fiscal Year 2026-27</div>
          </div>

          <div className="stat-card-accent" style={{ '--card-accent': '#f97316' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">IN EVALUATION</span>
              <div className="stat-card-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Clock style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value">1</div>
            <div className="stat-card-change">8 Competing Bidders</div>
          </div>

          <div className="stat-card-accent" style={{ '--card-accent': '#8b5cf6' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">STATUTORY RULES ENFORCED</span>
              <div className="stat-card-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <CheckCircle style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value">100%</div>
            <div className="stat-card-change">CAG Compliant Checks</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ width: 15, height: 15, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Tender ID, title, or ministry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                background: '#ffffff',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Tenders Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-title">
              <FileText style={{ width: 16, height: 16, color: '#475569' }} /> Registered Procurement Tenders
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {filtered.length} of {MOCK_TENDERS_LIST.length} tenders listed
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>TENDER ID</th>
                  <th>TITLE & DEPARTMENT</th>
                  <th>CATEGORY</th>
                  <th>ESTIMATED VALUE</th>
                  <th>CLOSING DATE</th>
                  <th>BIDDERS</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {t.department}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{t.category}</span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: '#0f172a' }}>
                        {formatINR(t.estimatedValueINR)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {t.closingDate}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{t.biddersCount}</span>
                    </td>
                    <td>
                      {getStatusBadge(t.status)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/')}
                        title="View Compliance Dashboard for this tender"
                      >
                        Inspect <ArrowUpRight style={{ width: 12, height: 12 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 8, padding: 24, width: '100%', maxWidth: 520,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>Create New Procurement Tender</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Define tender parameters and configure AI statutory compliance checklist rules.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.75rem' }}>
              <div>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Tender Title</label>
                <input type="text" placeholder="e.g. Supply & Commissioning of Server Blades" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Department</label>
                  <input type="text" placeholder="Ministry / PSU" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Estimated Value (₹)</label>
                  <input type="number" placeholder="50000000" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Min Turnover Required (₹)</label>
                  <input type="number" defaultValue="15000000" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Make In India (%)</label>
                  <input type="number" defaultValue="50" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(false)}>Publish Tender</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
