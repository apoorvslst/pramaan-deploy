import React, { useRef, useEffect } from 'react';
import {
  Network, ShieldAlert, AlertTriangle, Building2, Phone, FileWarning
} from 'lucide-react';
import { MOCK_BIDDERS } from '../data/mockData';

const GRAPH_NODES = [
  { id: 'BID-004', label: 'Apex Infotech', type: 'bidder', x: 280, y: 220, r: 24 },
  { id: 'BID-006', label: 'NewEdge IT Infra', type: 'bidder', x: 550, y: 220, r: 24 },
  { id: 'DIR-098', label: 'Vikram S. Mehta\nDIN: 09876543', type: 'director', x: 415, y: 110, r: 18 },
  { id: 'META-APEX01', label: 'DESKTOP-APEX01\n(PDF Author)', type: 'meta', x: 415, y: 220, r: 18 },
  { id: 'ADDR-110019', label: 'Nehru Place\n- PIN 110019', type: 'address', x: 415, y: 310, r: 18 },
  { id: 'PHONE-9876500', label: '+91-98765-00XXX\n(Similar Range)', type: 'phone', x: 275, y: 340, r: 18 },
  { id: 'BID-002', label: 'TechVista LLP', type: 'bidder', x: 220, y: 110, r: 20 },
  { id: 'BID-001', label: 'Bharat NetSolutions', type: 'bidder', x: 650, y: 340, r: 20 },
];

const GRAPH_EDGES = [
  { from: 'BID-004', to: 'DIR-098', label: 'Director' },
  { from: 'BID-006', to: 'DIR-098', label: 'Director' },
  { from: 'BID-004', to: 'META-APEX01', label: 'PDF Author' },
  { from: 'BID-006', to: 'META-APEX01', label: 'PDF Author' },
  { from: 'BID-004', to: 'ADDR-110019', label: 'Address' },
  { from: 'BID-006', to: 'ADDR-110019', label: 'Address' },
  { from: 'BID-004', to: 'PHONE-9876500', label: 'Phone Range' },
  { from: 'BID-006', to: 'PHONE-9876500', label: 'Phone Range' },
];

function GraphCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    ctx.clearRect(0, 0, W, H);

    // 1. Draw Collusion Cluster Dashed Ellipse (Matching Image 3)
    ctx.beginPath();
    ctx.ellipse(415, 220, 185, 125, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Danger Cluster Label
    ctx.font = '700 10px Inter';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('COLLUSION CLUSTER: HIGH RISK', 415, 360);

    // 2. Draw Edges
    GRAPH_EDGES.forEach(e => {
      const from = GRAPH_NODES.find(n => n.id === e.from);
      const to = GRAPH_NODES.find(n => n.id === e.to);
      if (!from || !to) return;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Edge Label
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      ctx.font = '800 10px Inter';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(e.label, mx, my - 4);
    });

    // 3. Draw Nodes (Matching Image 3 style: dark stroke with center dot)
    GRAPH_NODES.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Center dark dot (Matching Image 3)
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Node Label Text
      const lines = n.label.split('\n');
      ctx.font = '700 10px Inter';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      lines.forEach((line, i) => {
        ctx.fillText(line, n.x, n.y + n.r + 14 + (i * 12));
      });
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#ffffff',
      }}
    />
  );
}

export default function CollusionGraph() {
  const flaggedBidders = MOCK_BIDDERS.filter(b => b.isCollusionFlagged);

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cartel & Collusion Detection</h1>
          <p className="page-subtitle">
            Network analysis across 8 bidders | <strong style={{ color: 'var(--text-primary)' }}>1 collusion ring detected</strong>
          </p>
        </div>
        <div className="badge-pill-header">
          <ShieldAlert style={{ width: 14, height: 14, color: '#475569' }} />
          <span>CRITICAL: CARTEL ALERT ACTIVE</span>
        </div>
      </div>

      <div className="page-body">
        {/* Syndicate Bidding Detected Banner */}
        <div className="alert-banner-box">
          <AlertTriangle style={{ width: 18, height: 18, color: '#1e293b', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Syndicate Bidding Detected — Immediate Officer Review Required
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Apex Infotech Solutions (BID-004)</strong> and <strong>NewEdge IT Infra (BID-006)</strong> share a common Director (DIN: 09876543 — Vikram S. Mehta), nearly identical registered addresses at Nehru Place, New Delhi (PIN 110019), similar phone number ranges (+91-98765-00XXX), and identical PDF Author metadata <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3, fontSize: '0.68rem' }}>DESKTOP-APEX01</code>. This constitutes a <strong style={{ color: 'var(--text-primary)' }}>CRITICAL</strong> collusion risk per CVC Guidelines.
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Bidder Relationship Graph */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title">
                <Network style={{ width: 16, height: 16, color: '#475569' }} /> Bidder Relationship Graph
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#1e293b', borderRadius: 1 }} /> Bidder
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#2563eb', borderRadius: 1 }} /> Director
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#16a34a', borderRadius: 1 }} /> Address
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#ea580c', borderRadius: 1 }} /> Phone
                </span>
              </div>
            </div>
            <div style={{ height: 440, padding: 8 }}>
              <GraphCanvas />
            </div>
          </div>

          {/* Implicated Entities (Matching Image 3) */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title">
                <FileWarning style={{ width: 16, height: 16, color: '#475569' }} /> Implicated Entities
              </span>
              <span className="badge badge-neutral">2 Flagged</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {flaggedBidders.map(b => (
                <div
                  key={b.id}
                  style={{
                    padding: 14,
                    background: '#f8fafc',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {b.legalName}
                    </span>
                    <span className="badge badge-neutral" style={{ fontWeight: 800 }}>CRITICAL</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div><strong>ID:</strong> {b.id}</div>
                    <div><strong>GSTIN:</strong> <span className="mono">{b.gstin}</span></div>
                    <div><strong>Address:</strong> {b.address}</div>
                    <div><strong>Score:</strong> <span className="mono" style={{ fontWeight: 800 }}>{b.score}/100</span></div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 8, lineHeight: 1.4 }}>
                    {b.collusionNote}
                  </div>
                </div>
              ))}

              {/* Shared Attributes Detected */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  SHARED ATTRIBUTES DETECTED
                </div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 style={{ width: 14, height: 14, color: '#475569' }} />
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>Common Director</div>
                      <div className="mono" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        DIN: 09876543 — Vikram S. Mehta
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
