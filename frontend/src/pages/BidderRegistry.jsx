import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Filter, ShieldAlert, CheckCircle, Eye,
  Building, Phone, MapPin, FileCheck, ArrowUpRight, BarChart2,
  FileText, Sparkles, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { MOCK_BIDDERS } from '../data/mockData';
import { api } from '../services/api';

export default function BidderRegistry() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'directory'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  
  const [liveBids, setLiveBids] = useState([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // Tender Comparison View Modal
  const [comparisonModal, setComparisonModal] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [rankedBidders, setRankedBidders] = useState([]);

  const fetchBids = async () => {
    setIsLoadingBids(true);
    try {
      const data = await api.getAllBids();
      if (data && data.length > 0) {
        setLiveBids(data);
      }
    } catch (err) {
      console.warn('Could not load live bids:', err.message);
    } finally {
      setIsLoadingBids(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const openComparison = async (tenderId, tenderTitle) => {
    setComparisonModal({ tenderId, tenderTitle });
    setComparisonLoading(true);
    try {
      const res = await api.getTenderEvaluations(tenderId);
      if (res && res.rankedBidders && res.rankedBidders.length > 0) {
        const sorted = [...res.rankedBidders]
          .map(r => ({
            ...r,
            bidId: r.submissionId || r.bidId,
            bidRef: r.bidReferenceNumber || r.bidRef,
            bidderName: r.bidder?.name || r.bidderName || 'Bidder Entity',
            bidAmount: Number(r.bidAmount || 0),
            score: r.score ?? (r.evaluationResult?.complianceScore || 88)
          }))
          .sort((a, b) => (b.bidAmount || 0) - (a.bidAmount || 0) || (b.score || 0) - (a.score || 0))
          .map((r, i) => ({ ...r, rank: i + 1 }));
        setRankedBidders(sorted);
      } else {
        // Build ranked list from loaded bids
        const tenderBids = liveBids.filter(b => (
          b.tenderId?._id === tenderId || 
          b.tenderId === tenderId || 
          b.tenderId?.tenderNumber === tenderId ||
          (tenderTitle && b.tenderId?.title === tenderTitle)
        ));
        const ranked = tenderBids
          .map((b, idx) => ({
            rank: idx + 1,
            bidId: b._id,
            bidRef: b.bidReferenceNumber,
            bidderName: b.bidderId?.legalBusinessName || b.legalBusinessName || 'Bidder Entity',
            bidAmount: Number(b.bidAmount || 0),
            score: b.evaluationResult?.complianceScore || 88,
            riskLevel: b.evaluationResult?.riskLevel || 'LOW',
            aiRecommendation: b.evaluationResult?.aiRecommendation || 'QUALIFIED',
            status: b.status || 'SUBMITTED'
          }))
          .sort((a, b) => (b.bidAmount || 0) - (a.bidAmount || 0) || (b.score || 0) - (a.score || 0))
          .map((r, i) => ({ ...r, rank: i + 1 }));
        setRankedBidders(ranked);
      }
    } catch (e) {
      // Fallback ranked list
      const tenderBids = liveBids.filter(b => (
        b.tenderId?._id === tenderId || 
        b.tenderId === tenderId || 
        b.tenderId?.tenderNumber === tenderId ||
        (tenderTitle && b.tenderId?.title === tenderTitle)
      ));
      const ranked = tenderBids.map((b, idx) => ({
        rank: idx + 1,
        bidId: b._id,
        bidRef: b.bidReferenceNumber,
        bidderName: b.bidderId?.legalBusinessName || b.legalBusinessName || 'Bidder Entity',
        bidAmount: Number(b.bidAmount || 0),
        score: b.evaluationResult?.complianceScore || 88,
        riskLevel: b.evaluationResult?.riskLevel || 'LOW',
        aiRecommendation: b.evaluationResult?.aiRecommendation || 'QUALIFIED',
        status: b.status || 'SUBMITTED'
      })).sort((a, b) => (b.bidAmount || 0) - (a.bidAmount || 0) || (b.score || 0) - (a.score || 0))
        .map((r, i) => ({ ...r, rank: i + 1 }));
      setRankedBidders(ranked);
    } finally {
      setComparisonLoading(false);
    }
  };

  const filteredBidders = MOCK_BIDDERS.filter(b => {
    const matchesSearch = b.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || b.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const filteredSubmissions = liveBids.filter(b => {
    const name = b.bidderId?.legalBusinessName || b.legalBusinessName || '';
    const ref = b.bidReferenceNumber || '';
    const tender = b.tenderId?.title || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bidder & Submission Review Center</h1>
          <p className="page-subtitle">
            Statutory Bids Intake • AI Verification Forensics • Cross-Bidder Tender Comparison
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={fetchBids}
            className="btn btn-secondary btn-sm"
            title="Refresh Live Bids"
          >
            <RefreshCw className={isLoadingBids ? 'animate-spin' : ''} style={{ width: 13, height: 13 }} /> Refresh Bids
          </button>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '5px 10px' }}>
            Live Bids Received: <strong style={{ marginLeft: 4 }}>{liveBids.length}</strong>
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, borderBottom: '1px solid var(--border-default)', paddingBottom: 12 }}>
          <button
            className={`btn btn-sm ${activeTab === 'submissions' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('submissions')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FileCheck style={{ width: 14, height: 14 }} /> Live Tender Submissions ({liveBids.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('directory')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Users style={{ width: 14, height: 14 }} /> Statutory Directory ({MOCK_BIDDERS.length})
          </button>
        </div>

        {/* Search & Filter Row */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ width: 15, height: 15, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={activeTab === 'submissions' ? "Search bids by reference, bidder name, or tender..." : "Search by legal entity name, GSTIN, PAN, or Bidder ID..."}
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

          {activeTab === 'directory' && (
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
          )}
        </div>

        {/* Tab 1: Live Tender Submissions */}
        {activeTab === 'submissions' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredSubmissions.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText style={{ width: 32, height: 32, margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>No live bid submissions received yet.</p>
                <p style={{ fontSize: '0.72rem', marginTop: 4 }}>Bids submitted by verified bidders will automatically appear here.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Bid Reference</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Bidder Legal Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Bid Price (₹)</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tender / Department</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Submitted Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>AI Score</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Officer Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredSubmissions]
                      .sort((a, b) => (Number(b.bidAmount || 0) - Number(a.bidAmount || 0)) || ((b.evaluationResult?.complianceScore || 0) - (a.evaluationResult?.complianceScore || 0)))
                      .map((b) => {
                      const score = b.evaluationResult?.complianceScore || 88;
                      const tenderId = b.tenderId?._id || b.tenderId;
                      const tenderTitle = b.tenderId?.title || 'Supply of Statutory Equipment';

                      return (
                        <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-color)' }}>
                            {b.bidReferenceNumber || b._id?.substring(0, 12)}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                            {b.bidderId?.legalBusinessName || b.legalBusinessName || 'Bidder Entity'}
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              GSTIN: {b.bidderId?.gstin || b.gstin || '07AAAAA0000A1Z5'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '0.8rem' }}>
                              {b.bidAmount ? `₹${Number(b.bidAmount).toLocaleString('en-IN')}` : '₹4,50,00,000'}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {b.bidAmount ? `₹${(b.bidAmount / 10000000).toFixed(2)} Cr` : '₹4.50 Cr'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {tenderTitle}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {b.tenderId?.department || 'Ministry of Heavy Industries'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            {new Date(b.submissionDate || b.createdAt || Date.now()).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
                            }}>
                              {score}/100
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`badge ${b.status === 'QUALIFIED' ? 'badge-pass' : b.status === 'DISQUALIFIED' ? 'badge-warn' : 'badge-neutral'}`}>
                              {b.status || 'SUBMITTED'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => openComparison(tenderId, tenderTitle)}
                                title="Compare all bids for this tender (Sorted by highest bid)"
                              >
                                <BarChart2 style={{ width: 12, height: 12 }} /> Compare Bids
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate(`/evidence/${b._id}`)}
                              >
                                Inspect Evidence <ArrowUpRight style={{ width: 12, height: 12 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Directory */}
        {activeTab === 'directory' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {filteredBidders.map(b => (
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
        )}

        {/* Comparison Modal */}
        {comparisonModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            padding: 20
          }}>
            <div style={{
              background: '#ffffff', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: 840,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Comparative Bid Evaluation & Ranking
                  </h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {comparisonModal.tenderTitle}
                  </p>
                </div>
                <button
                  onClick={() => setComparisonModal(null)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
                >
                  <X style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                </button>
              </div>

              <div style={{ padding: 20 }}>
                {comparisonLoading ? (
                  <div style={{ textAlign: 'center', padding: 30 }}>
                    <RefreshCw className="animate-spin" style={{ width: 24, height: 24, margin: '0 auto 10px', color: 'var(--primary-color)' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Computing composite rank and AI compliance matrix...</p>
                  </div>
                ) : rankedBidders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    <p style={{ fontWeight: 600 }}>No other bids submitted for this tender yet.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-default)' }}>
                        <th style={{ padding: '10px 12px' }}>Rank</th>
                        <th style={{ padding: '10px 12px' }}>Bidder Entity</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Quoted Bid Price (₹)</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>Compliance Score</th>
                        <th style={{ padding: '10px 12px' }}>Risk</th>
                        <th style={{ padding: '10px 12px' }}>AI Rec</th>
                        <th style={{ padding: '10px 12px' }}>Status</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedBidders.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: i === 0 ? '#10b981' : 'inherit' }}>
                            #{r.rank || i + 1} {i === 0 && <span title="Highest Bidder">🏆 HIGHEST</span>}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                            {r.bidderName}
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.bidRef}</div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <div className="mono" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.8rem' }}>
                              {r.bidAmount ? `₹${Number(r.bidAmount).toLocaleString('en-IN')}` : '₹4,50,00,000'}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                              {r.bidAmount ? `₹${(r.bidAmount / 10000000).toFixed(2)} Cr` : '₹4.50 Cr'}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', color: (r.score || 0) >= 80 ? '#10b981' : (r.score || 0) >= 60 ? '#f59e0b' : '#ef4444' }}>
                            {r.score}/100
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span className={`badge ${r.riskLevel === 'LOW' ? 'badge-pass' : 'badge-warn'}`}>
                              {r.riskLevel}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                            {r.aiRecommendation}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span className="badge badge-neutral">{r.status}</span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            {r.bidId && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setComparisonModal(null);
                                  navigate(`/evidence/${r.bidId}`);
                                }}
                              >
                                Inspect
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid var(--border-default)', textAlign: 'right' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setComparisonModal(null)}>
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
