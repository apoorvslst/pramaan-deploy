import React from 'react';
import {
  TrendingUp, TrendingDown, FileCheck, AlertTriangle,
  ShieldAlert, Users, FileText, Activity, Zap, Server,
  CheckCircle, Eye, BarChart3, Gauge
} from 'lucide-react';
import { MOCK_BIDDERS, MOCK_TENDER, DASHBOARD_STATS } from '../data/mockData';

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

function StatCard({ label, value, icon: Icon, change, changeType, accentColor, iconBg, iconColor }) {
  return (
    <div
      className="stat-card-accent"
      style={{ '--card-accent': accentColor }}
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
  const getRiskBadge = (level) => {
    return <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>{level}</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'VERIFIED') return <span className="badge badge-neutral"><CheckCircle style={{ width: 11, height: 11, color: '#10b981' }} /> Verified</span>;
    if (status === 'NEEDS_REVIEW') return <span className="badge badge-neutral"><Eye style={{ width: 11, height: 11, color: '#f59e0b' }} /> Review</span>;
    return <span className="badge badge-neutral">{status}</span>;
  };

  const getRecommendBadge = (rec) => {
    if (rec === 'QUALIFY') return <span className="badge badge-pass">QUALIFY</span>;
    if (rec === 'DISQUALIFY') return <span className="badge badge-warn">DISQUALIFY</span>;
    return <span className="badge badge-review">REVIEW</span>;
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Dashboard</h1>
          <p className="page-subtitle">
            Tender: <span className="mono">{MOCK_TENDER.id}</span> | {MOCK_TENDER.department} | Status: <strong style={{ color: 'var(--text-primary)' }}>{MOCK_TENDER.status}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="live-status">
            <span className="live-status-dot" />
            <span>Live Monitoring Active</span>
          </div>
          <button className="btn btn-secondary btn-sm">
            <BarChart3 style={{ width: 14, height: 14 }} /> Export Report
          </button>
          <button className="btn btn-primary btn-sm">
            <Zap style={{ width: 14, height: 14 }} /> Run AI Scan
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="page-body">
        {/* Row 1: 5 Accent Stat Cards (Matching Image 1) */}
        <div className="stat-card-row">
          <StatCard
            label="Active Tenders"
            value={DASHBOARD_STATS.activeTenders}
            icon={FileText}
            change="+2 this week"
            changeType="positive"
            accentColor="#f97316"
            iconBg="#fff7ed"
            iconColor="#ea580c"
          />
          <StatCard
            label="Total Bidders"
            value={DASHBOARD_STATS.totalBidders}
            icon={Users}
            change="+34 verified today"
            changeType="positive"
            accentColor="#3b82f6"
            iconBg="#eff6ff"
            iconColor="#2563eb"
          />
          <StatCard
            label="Documents Processed"
            value={DASHBOARD_STATS.documentsProcessed.toLocaleString()}
            icon={FileCheck}
            change="Avg 4.2 min/doc"
            changeType="positive"
            accentColor="#10b981"
            iconBg="#ecfdf5"
            iconColor="#059669"
          />
          <StatCard
            label="Forensic Flags"
            value={DASHBOARD_STATS.forensicFlagsRaised}
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

        {/* Row 3: Bidder Rankings Table (Matching Image 1) */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-title">
              <Users style={{ width: 15, height: 15, color: '#475569' }} /> Bidder Compliance Rankings <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>({MOCK_TENDER.id})</span>
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {MOCK_BIDDERS.length} bidders | Sorted by compliance score
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>BIDDER NAME</th>
                  <th>GSTIN</th>
                  <th>ENTITY</th>
                  <th>MSME</th>
                  <th style={{ textAlign: 'center' }}>SCORE</th>
                  <th>RISK</th>
                  <th>DOCS</th>
                  <th>FORENSICS</th>
                  <th>AI RECOMMENDATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[...MOCK_BIDDERS].sort((a, b) => b.score - a.score).map((b, idx) => (
                  <tr key={b.id} style={b.isCollusionFlagged ? { background: 'rgba(239, 68, 68, 0.04)' } : {}}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{b.legalName}</span>
                        {b.isCollusionFlagged && (
                          <ShieldAlert style={{ width: 13, height: 13, color: '#ef4444', marginLeft: 6, display: 'inline' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{b.id}</div>
                    </td>
                    <td><span className="mono" style={{ fontSize: '0.72rem' }}>{b.gstin}</span></td>
                    <td><span className="badge badge-neutral">{b.entityType.replace('_', ' ')}</span></td>
                    <td>{b.isMSME ? <span className="badge badge-info">{b.msmeCategory}</span> : '—'}</td>
                    <td style={{ textAlign: 'center' }}><ScoreGauge score={b.score} /></td>
                    <td>{getRiskBadge(b.riskLevel)}</td>
                    <td style={{ fontWeight: 500 }}>{b.verifiedDocs}/{b.submittedDocs}</td>
                    <td>
                      {b.forensicFlags > 0 ? (
                        <span className="badge badge-warn"><AlertTriangle style={{ width: 10, height: 10 }} /> {b.forensicFlags} flags</span>
                      ) : (
                        <span className="badge badge-neutral"><CheckCircle style={{ width: 10, height: 10, color: '#10b981' }} /> Clean</span>
                      )}
                    </td>
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
