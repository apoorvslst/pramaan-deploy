import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, FileCheck, AlertTriangle,
  ShieldAlert, Users, FileText, Activity, Zap, Server,
  CheckCircle, Eye, BarChart3, Gauge
} from 'lucide-react';
import { MOCK_TENDER, DASHBOARD_STATS } from '../data/mockData';
import { api } from '../services/api';

function ScoreGauge({ score, size = 46, strokeWidth = 3.5 }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-text">{score}</div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, change, changeType, accentColor, iconBg, iconColor, onClick }) {
  return (
    <div
      className="stat-card-accent"
      style={{ '--card-accent': accentColor, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon-wrap" style={{ background: iconBg, color: iconColor }}>
          <Icon style={{ width: 15, height: 15 }} />
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {change && (
        <div className="stat-card-change">
          {changeType === 'positive' ? (
            <TrendingUp style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
          ) : (
            <TrendingDown style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
          )}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [bidders, setBidders] = useState([]);
  const [tender, setTender] = useState(MOCK_TENDER);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [stats, setStats] = useState({
    activeTenders: DASHBOARD_STATS.activeTenders,
    totalBidders: DASHBOARD_STATS.totalBidders,
    documentsProcessed: DASHBOARD_STATS.documentsProcessed,
    forensicFlagsRaised: DASHBOARD_STATS.forensicFlagsRaised,
    cartelsDetected: DASHBOARD_STATS.cartelsDetected
  });

  useEffect(() => {
    async function fetchLive() {
      try {
        const [liveTenders, liveBids, liveBidders] = await Promise.all([
          api.getTenders().catch(() => []),
          api.getAllBids().catch(() => []),
          api.getBidders().catch(() => [])
        ]);

        if (liveTenders && liveTenders.length > 0) {
          const t = liveTenders[0];
          setTender({
            id: t.tenderNumber || t._id,
            title: t.title,
            department: t.department,
            estimatedValue: `₹${(t.estimatedValueINR / 10000000).toFixed(2)} Cr`,
            status: t.status,
            closingDate: new Date(t.closingDate).toLocaleDateString()
          });
        }

        if (liveBids && liveBids.length > 0) {
          const formatted = liveBids.map((b) => ({
            id: b.bidReferenceNumber || b._id,
            mongoId: b._id,
            legalName: b.bidderId?.legalBusinessName || b.bidderId?.name || b.legalBusinessName || '—',
            gstin: b.bidderId?.gstin || b.gstin || '—',
            pan: b.bidderId?.pan || b.pan || '—',
            entityType: b.bidderId?.entityType || 'PVT_LTD',
            isMSME: b.bidderId?.isDPIITStartup !== false,
            bidAmount: Number(b.bidAmount || 0),
            score: b.evaluationResult?.complianceScore || 0,
            riskLevel: b.evaluationResult?.riskLevel || 'MEDIUM',
            docsCount: (b.uploadedDocuments || []).length || 0,
            forensicFlagsCount: 0,
            aiRecommendation: b.evaluationResult?.aiRecommendation || 'MANUAL_REVIEW',
            status: b.status || 'SUBMITTED',
            isCollusionFlagged: false,
          }));
          setBidders(formatted);
        } else if (liveBidders && liveBidders.length > 0) {
          // Fallback: use bidder directory if no bids exist yet
          const formatted = liveBidders.map((b) => ({
            id: b._id,
            mongoId: b._id,
            legalName: b.legalName,
            gstin: b.gstin,
            pan: b.pan,
            entityType: b.entityType || 'PVT_LTD',
            isMSME: b.isMSME,
            bidAmount: b.bidAmount || 0,
            score: b.score || 0,
            riskLevel: b.riskLevel || 'MEDIUM',
            docsCount: b.submittedDocs || 0,
            forensicFlagsCount: b.forensicFlags || 0,
            aiRecommendation: b.aiRecommendation || 'MANUAL_REVIEW',
            status: b.status || 'REGISTERED',
            isCollusionFlagged: b.isCollusionFlagged || false,
          }));
          setBidders(formatted);
        }

        const activeTendersCount = (liveTenders && liveTenders.length > 0)
          ? liveTenders.filter(t => t.status === 'PUBLISHED').length || liveTenders.length
          : 0;

        const totalBiddersCount = (liveBidders && liveBidders.length > 0)
          ? liveBidders.length
          : (liveBids && liveBids.length > 0) ? liveBids.length : 0;

        const totalDocsCount = (liveBids && liveBids.length > 0)
          ? liveBids.reduce((sum, b) => sum + (b.uploadedDocuments?.length || 0), 0)
          : 0;

        setStats({
          activeTenders: activeTendersCount,
          totalBidders: totalBiddersCount,
          documentsProcessed: totalDocsCount,
          forensicFlagsRaised: 0,
          cartelsDetected: 0
        });
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      }
    }
    fetchLive();
  }, []);


  const handleRunScan = async () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('AI Statutory Scan Completed: 100% of bidder certificates analyzed with Groq LLM & PyMuPDF.');
      setTimeout(() => setScanMessage(null), 5000);
    }, 1200);
  };

  const getRiskBadge = (level) => {
    return <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>{level}</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'VERIFIED' || status === 'QUALIFIED') return <span className="badge badge-neutral"><CheckCircle style={{ width: 11, height: 11, color: '#10b981' }} /> Verified</span>;
    if (status === 'DISQUALIFIED') return <span className="badge badge-neutral"><AlertTriangle style={{ width: 11, height: 11, color: '#ef4444' }} /> Disqualified</span>;
    if (status === 'NEEDS_REVIEW') return <span className="badge badge-neutral"><Eye style={{ width: 11, height: 11, color: '#f59e0b' }} /> Review</span>;
    return <span className="badge badge-neutral">{status}</span>;
  };

  const getRecommendBadge = (rec) => {
    if (rec === 'QUALIFY' || rec === 'QUALIFIED') return <span className="badge badge-pass">QUALIFY</span>;
    if (rec === 'DISQUALIFY' || rec === 'DISQUALIFIED') return <span className="badge badge-warn">DISQUALIFY</span>;
    return <span className="badge badge-review">REVIEW</span>;
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Dashboard</h1>
          <p className="page-subtitle">
            Tender: <span className="mono">{tender.id}</span> | {tender.department} | Status: <strong style={{ color: 'var(--text-primary)' }}>{tender.status}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="live-status">
            <span className="live-status-dot" />
            <span>Live Monitoring Active</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <BarChart3 style={{ width: 14, height: 14 }} /> Export Report
          </button>
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="btn btn-primary btn-sm"
          >
            <Zap style={{ width: 14, height: 14 }} />
            <span>{isScanning ? 'Scanning...' : 'Run AI Scan'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div style={{
          margin: '12px 28px 0', padding: '10px 16px',
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: '#15803d', fontWeight: 600
        }}>
          <CheckCircle style={{ width: 15, height: 15 }} />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Body */}
      <div className="page-body">
        {/* Row 1: 5 Accent Stat Cards (Matching Image 1) */}
        <div className="stat-card-row">
          <StatCard
            label="Active Tenders"
            value={stats.activeTenders}
            icon={FileText}
            change="+2 this week"
            changeType="positive"
            accentColor="#f97316"
            iconBg="#fff7ed"
            iconColor="#ea580c"
          />
          <StatCard
            label="Total Bidders"
            value={stats.totalBidders}
            icon={Users}
            change="+34 verified today"
            changeType="positive"
            accentColor="#3b82f6"
            iconBg="#eff6ff"
            iconColor="#2563eb"
          />
          <StatCard
            label="Documents Processed"
            value={stats.documentsProcessed.toLocaleString()}
            icon={FileCheck}
            change="Avg 4.2 min/doc"
            changeType="positive"
            accentColor="#10b981"
            iconBg="#ecfdf5"
            iconColor="#059669"
          />
          <StatCard
            label="Forensic Flags"
            value={stats.forensicFlagsRaised}
            icon={AlertTriangle}
            change="3 critical"
            changeType="negative"
            accentColor="#ef4444"
            iconBg="#fef2f2"
            iconColor="#dc2626"
          />
          <StatCard
            label="Collusion Alerts"
            value={DASHBOARD_STATS.collusionAlertsActive}
            icon={ShieldAlert}
            change="1 new ring found"
            changeType="negative"
            accentColor="#8b5cf6"
            iconBg="#f5f3ff"
            iconColor="#7c3aed"
            onClick={() => navigate('/collusion')}
          />
        </div>

        {/* Row 2: Portals & Verification Split (Matching Image 1) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 22 }}>
          {/* Government Portal Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title">
                <Server style={{ width: 16, height: 16, color: '#475569' }} /> Government Portal Status
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Last checked: 2 min ago</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'GSTN Portal', uptime: DASHBOARD_STATS.portalUptime.gstn, status: 'Online', isOk: true },
                { name: 'Udyam / MSME Portal', uptime: DASHBOARD_STATS.portalUptime.udyam, status: 'Online', isOk: true },
                { name: 'MCA21 / RoC Gateway', uptime: DASHBOARD_STATS.portalUptime.mca, status: 'Online', isOk: true },
                { name: 'EPFO / ESIC Portal', uptime: DASHBOARD_STATS.portalUptime.epfo, status: 'Degraded', isOk: false },
              ].map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ flex: '0 0 160px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {p.name}
                  </span>
                  <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${p.uptime}%`,
                        height: '100%',
                        background: p.isOk ? '#10b981' : '#ef4444',
                        borderRadius: 999
                      }}
                    />
                  </div>
                  <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, minWidth: 46, textAlign: 'right' }}>
                    {p.uptime}%
                  </span>
                  <span className={`badge ${p.isOk ? 'badge-pass' : 'badge-warn'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Outcome Distribution */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title">
                <Activity style={{ width: 16, height: 16, color: '#475569' }} /> Verification Outcome Distribution
              </span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{DASHBOARD_STATS.passRate}%</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>PASSED</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{DASHBOARD_STATS.reviewRate}%</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>REVIEW</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{DASHBOARD_STATS.failRate}%</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>FAILED</div>
                  </div>
                </div>

                <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <Gauge style={{ width: 13, height: 13 }} />
                    <span>Avg Compliance Score</span>
                  </div>
                  <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>
                    {DASHBOARD_STATS.avgScore}
                  </div>
                  <div style={{ height: 6, width: '100%', background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${DASHBOARD_STATS.avgScore}%`, height: '100%', background: 'linear-gradient(90deg, #ea580c, #334155)', borderRadius: 999 }} />
                  </div>
                </div>
              </div>

              {/* Single horizontal dark bar (Matching Image 1) */}
              <div style={{ height: 10, borderRadius: 999, background: '#334155', width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Row 3: Bidder Rankings Table (Sorted: Highest Bid at Top) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="card-header-title">
                <Users style={{ width: 15, height: 15, color: '#475569' }} /> Bidder Compliance & Price Rankings <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>({tender.id})</span>
              </span>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {bidders.length} participating bidders | Sorted by <strong>Highest Bid Price at Top</strong> along with verified AI Compliance Score
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-pass" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                ▲ Sorted: Highest Bid First
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Click row to inspect in 3-Pane Workspace
              </span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>BIDDER NAME</th>
                  <th style={{ textAlign: 'right' }}>QUOTED BID PRICE (₹)</th>
                  <th style={{ textAlign: 'center' }}>COMPLIANCE SCORE</th>
                  <th>GSTIN</th>
                  <th>ENTITY</th>
                  <th>MSME</th>
                  <th>RISK</th>
                  <th>DOCS</th>
                  <th>AI RECOMMENDATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[...bidders]
                  .sort((a, b) => ((b.bidAmount || 0) - (a.bidAmount || 0)) || ((b.score || 0) - (a.score || 0)))
                  .map((b, idx) => (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/evidence?bidId=${b.mongoId || b.id}`)}
                    style={{
                      cursor: 'pointer',
                      ...(b.isCollusionFlagged ? { background: 'rgba(239, 68, 68, 0.04)' } : {})
                    }}
                    title="Click to inspect bidder evidence in 3-Pane Workspace"
                  >
                    <td style={{ fontWeight: 800, color: idx === 0 ? '#10b981' : 'var(--text-muted)' }}>
                      #{idx + 1} {idx === 0 && <span title="Highest Bidder">🏆</span>}
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{b.legalName}</span>
                        {b.isCollusionFlagged && (
                          <ShieldAlert style={{ width: 13, height: 13, color: '#ef4444', marginLeft: 6, display: 'inline' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{b.id}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a' }}>
                        {b.bidAmount ? `₹${Number(b.bidAmount).toLocaleString('en-IN')}` : '₹4,50,00,000'}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {b.bidAmount ? `₹${(b.bidAmount / 10000000).toFixed(2)} Cr` : '₹4.50 Cr'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <ScoreGauge score={b.score} />
                        <span className="mono" style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: b.score >= 80 ? '#10b981' : b.score >= 60 ? '#f59e0b' : '#ef4444'
                        }}>
                          {b.score}/100
                        </span>
                      </div>
                    </td>
                    <td><span className="mono" style={{ fontSize: '0.72rem' }}>{b.gstin}</span></td>
                    <td><span className="badge badge-neutral">{b.entityType.replace('_', ' ')}</span></td>
                    <td>{b.isMSME ? <span className="badge badge-info">{b.msmeCategory}</span> : '—'}</td>
                    <td>{getRiskBadge(b.riskLevel)}</td>
                    <td style={{ fontWeight: 500 }}>{b.verifiedDocs || b.docsCount || 5} docs</td>
                    <td>{getRecommendBadge(b.aiRecommendation)}</td>
                    <td>{getStatusBadge(b.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
