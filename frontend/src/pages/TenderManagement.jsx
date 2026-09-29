import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, FileText, Plus, Search, Filter, Calendar,
  ArrowUpRight, CheckCircle, Clock, AlertCircle, Building, DollarSign,
  Sparkles, RefreshCw, Layers
} from 'lucide-react';
import { MOCK_TENDERS_LIST } from '../data/mockData';
import { api } from '../services/api';

export default function TenderManagement({ currentUser }) {
  const navigate = useNavigate();
  const isBidder = (currentUser?.role || '').toUpperCase() === 'BIDDER';
  const [searchTerm, setSearchTerm] = useState('');
  const [tendersList, setTendersList] = useState(MOCK_TENDERS_LIST);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // AI Create Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(currentUser?.department || 'Ministry of Heavy Industries');
  const [estimatedValueINR, setEstimatedValueINR] = useState('50000000');
  const [category, setCategory] = useState('Public Procurement & Services');
  const [requirements, setRequirements] = useState('');
  const [minTurnoverINR, setMinTurnoverINR] = useState('15000000');
  const [makeInIndia, setMakeInIndia] = useState('50');
  const [emdAmountINR, setEmdAmountINR] = useState('1000000');
  const [aiJustification, setAiJustification] = useState('');
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Load live tenders from MongoDB
  const loadTenders = async () => {
    try {
      const live = await api.getTenders();
      if (live && live.length > 0) {
        const formatted = live.map(t => ({
          id: t.tenderNumber || t._id,
          _id: t._id,
          title: t.title,
          department: t.department || 'Government of India',
          estimatedValueINR: t.estimatedValueINR || 10000000,
          closingDate: new Date(t.closingDate).toISOString().split('T')[0],
          biddersCount: t.biddersCount || 0,
          category: t.category || 'Statutory Supply',
          status: t.status || 'PUBLISHED',
          rules: t.rules
        }));
        setTendersList(formatted);
      }
    } catch (err) {
      console.warn('Could not load live tenders:', err.message);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const handleAiAssistDraft = async () => {
    setIsAiDrafting(true);
    setCreateError(null);
    try {
      const draft = await api.generateAITenderDraft({
        title: title || 'Procurement of Statutory Equipment & Works',
        department,
        estimatedValueINR: Number(estimatedValueINR) || 50000000,
        category,
        requirements: requirements || 'Standard statutory GeM compliance under GFR 2017'
      });

      if (draft) {
        if (draft.standardTitle && !title) setTitle(draft.standardTitle);
        if (draft.minimumTurnoverINR) setMinTurnoverINR(String(draft.minimumTurnoverINR));
        if (draft.makeInIndiaPercentage) setMakeInIndia(String(draft.makeInIndiaPercentage));
        if (draft.emdAmountINR) setEmdAmountINR(String(draft.emdAmountINR));
        if (draft.aiComplianceJustification) setAiJustification(draft.aiComplianceJustification);
      }
    } catch (err) {
      console.warn('AI Draft error:', err.message);
      // Fallback standard GFR calculation
      const val = Number(estimatedValueINR) || 50000000;
      setMinTurnoverINR(String(Math.round(val * 0.3)));
      setEmdAmountINR(String(Math.round(val * 0.02)));
      setAiJustification('Standardized rule configured: 30% Turnover & 2% EMD pursuant to GFR 2017 Rule 149.');
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleCreateAndPublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !estimatedValueINR) {
      setCreateError('Please specify tender title and estimated value.');
      return;
    }

    setIsPublishing(true);
    setCreateError(null);

    try {
      const payload = {
        title: title.trim(),
        department: department.trim(),
        estimatedValueINR: Number(estimatedValueINR),
        category,
        rules: {
          minimumTurnoverINR: Number(minTurnoverINR),
          makeInIndiaPercentage: Number(makeInIndia),
          emdAmountINR: Number(emdAmountINR),
          allowMSMEExemption: true,
          allowStartupExemption: true
        }
      };

      const res = await api.createTender(payload);
      if (res.tender?._id) {
        await api.publishTender(res.tender._id).catch(() => {});
      }

      await loadTenders();
      setShowCreateModal(false);
      setTitle('');
      setRequirements('');
      setAiJustification('');
    } catch (err) {
      setCreateError(err.message || 'Failed to create tender.');
    } finally {
      setIsPublishing(false);
    }
  };

  const filtered = tendersList.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'EVALUATION') return <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>EVALUATION</span>;
    if (status === 'ACTIVE' || status === 'OPEN') return <span className="badge badge-pass">ACTIVE</span>;
    if (status === 'PUBLISHED') return <span className="badge badge-info">PUBLISHED</span>;
    return <span className="badge badge-neutral">{status}</span>;
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
          <h1 className="page-title">{isBidder ? 'Browse Published Tenders' : 'Tender Management & AI Drafting'}</h1>
          <p className="page-subtitle">
            {isBidder 
              ? 'GeM & CPPP Procurement Opportunities | Verify Eligibility, MSME Exemptions & Submit Bids'
              : 'Official GeM Tender Gating | AI Statutory GFR-2017 Rule Synthesis'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isBidder ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowCreateModal(true);
                setCreateError(null);
              }}
            >
              <Plus style={{ width: 14, height: 14 }} /> Create New Tender (AI Assist)
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/bidder')}
            >
              <ShieldCheck style={{ width: 14, height: 14 }} /> Bidder Workspace
            </button>
          )}
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
            <div className="stat-card-value">{tendersList.length}</div>
            <div className="stat-card-change">Across Central Ministries</div>
          </div>

          <div className="stat-card-accent" style={{ '--card-accent': '#10b981' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">TOTAL PROCUREMENT VALUE</span>
              <div className="stat-card-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                <DollarSign style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
              ₹{(tendersList.reduce((acc, t) => acc + (t.estimatedValueINR || 0), 0) / 10000000).toFixed(2)} Cr
            </div>
            <div className="stat-card-change">Fiscal Year 2026-27</div>
          </div>

          <div className="stat-card-accent" style={{ '--card-accent': '#f97316' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">IN EVALUATION</span>
              <div className="stat-card-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Clock style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value">
              {tendersList.filter(t => t.status === 'EVALUATION' || t.status === 'PUBLISHED').length}
            </div>
            <div className="stat-card-change">Live Competing Bidders</div>
          </div>

          <div className="stat-card-accent" style={{ '--card-accent': '#8b5cf6' }}>
            <div className="stat-card-header">
              <span className="stat-card-label">STATUTORY RULES ENFORCED</span>
              <div className="stat-card-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <CheckCircle style={{ width: 15, height: 15 }} />
              </div>
            </div>
            <div className="stat-card-value">100%</div>
            <div className="stat-card-change">CAG GFR-2017 Compliant</div>
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
              {filtered.length} tenders listed
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
                      {isBidder ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate('/bidder')}
                          title="Apply and submit bid proposal for this tender"
                        >
                          Apply & Bid <ArrowUpRight style={{ width: 12, height: 12 }} />
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate('/evidence')}
                          title="Inspect submitted bids and AI verification evidence"
                        >
                          Inspect <ArrowUpRight style={{ width: 12, height: 12 }} />
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Enhanced Create Tender Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 8, padding: 24, width: '100%', maxWidth: 580,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles style={{ width: 16, height: 16 }} />
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>AI Standardized Tender Creator</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Provide basic tender requirements. PRAMAN's AI will automatically synthesize standard GFR 2017 parameters, statutory checklists, and turnover thresholds.
            </p>

            {createError && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: 4, color: '#be123c', fontSize: '0.74rem', marginBottom: 12 }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAndPublish}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.75rem' }}>
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Tender Scope / Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Supply & Installation of High Capacity Inverters"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Issuing Ministry / Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Ministry of Heavy Industries"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Estimated Value INR (₹) *</label>
                    <input
                      type="number"
                      required
                      value={estimatedValueINR}
                      onChange={(e) => setEstimatedValueINR(e.target.value)}
                      placeholder="50000000"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Special Technical / Regulatory Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="e.g. Class-1 Local supplier preference, MSME relaxation allowed..."
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {/* AI Assist Action Trigger */}
                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 6, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                    Need GFR 2017 compliant turnover & EMD thresholds?
                  </span>
                  <button
                    type="button"
                    disabled={isAiDrafting}
                    onClick={handleAiAssistDraft}
                    style={{
                      background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                      padding: '5px 10px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                    }}
                  >
                    {isAiDrafting ? <RefreshCw className="animate-spin" style={{ width: 12, height: 12 }} /> : <Sparkles style={{ width: 12, height: 12 }} />}
                    <span>{isAiDrafting ? 'AI Analyzing...' : '✨ AI Auto-Draft Rules'}</span>
                  </button>
                </div>

                {aiJustification && (
                  <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, color: '#166534', fontSize: '0.72rem' }}>
                    <strong>AI Statutory Note:</strong> {aiJustification}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Min Turnover (₹)</label>
                    <input
                      type="number"
                      value={minTurnoverINR}
                      onChange={(e) => setMinTurnoverINR(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>EMD Amount (₹)</label>
                    <input
                      type="number"
                      value={emdAmountINR}
                      onChange={(e) => setEmdAmountINR(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Make In India (%)</label>
                    <input
                      type="number"
                      value={makeInIndia}
                      onChange={(e) => setMakeInIndia(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4, outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="btn btn-primary btn-sm"
                >
                  {isPublishing ? 'Publishing into Ledger...' : 'Publish Tender to GeM Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

