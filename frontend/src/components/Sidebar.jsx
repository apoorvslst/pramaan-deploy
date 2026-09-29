import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, Network, ShieldCheck, ScrollText,
  Upload, Users
} from 'lucide-react';

const NAV_ITEMS = [
  { section: 'COMMAND CENTER' },
  { path: '/', label: 'Compliance Dashboard', icon: LayoutDashboard },
  { path: '/evidence', label: '3-Pane Evidence Viewer', icon: FileSearch, badge: '2' },
  { path: '/collusion', label: 'Cartel & Collusion Graph', icon: Network, badge: '1' },
  { path: '/audit', label: 'Audit Trail & Ledger', icon: ScrollText },
  { section: 'ADMINISTRATION' },
  { path: '/tenders', label: 'Tender Management', icon: ShieldCheck, badge: '6' },
  { path: '/bidders', label: 'Bidder Registry', icon: Users },
  { path: '/upload', label: 'Document Upload', icon: Upload },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="emblem">प्र</div>
          <div className="sidebar-brand-text">
            <span className="brand-name">PRAMAN</span>
            <span className="brand-sub">AI VERIFICATION PLATFORM</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} className="sidebar-section-label">
                {item.section}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="nav-badge">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="sidebar-footer">
        <div className="avatar">RV</div>
        <div className="user-info">
          <span className="name">Sh. Rajesh K. Verma</span>
          <span className="role">Procurement Officer | MeitY</span>
        </div>
      </div>
    </aside>
  );
}
