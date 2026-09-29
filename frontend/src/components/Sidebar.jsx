import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, Network, ShieldCheck, ScrollText,
  Upload, Users, LogOut, ArrowLeftRight, UserCheck
} from 'lucide-react';

export default function Sidebar({ currentUser, onSwitchRole, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isOfficer = !currentUser || (currentUser.role || '').toUpperCase() === 'OFFICER' || (currentUser.role || '').toUpperCase() === 'ADMIN';

  // Strict Role-Based Navigation Items (Zero Cross-Role Leaks)
  const NAV_ITEMS = isOfficer ? [
    { section: 'COMMAND CENTER' },
    { path: '/dashboard', label: 'Compliance Dashboard', icon: LayoutDashboard },
    { path: '/evidence', label: '3-Pane Evidence Viewer', icon: FileSearch, badge: 'ACTIVE' },
    { path: '/collusion', label: 'Cartel & Collusion Graph', icon: Network, badge: 'AI' },
    { path: '/audit', label: 'Audit Trail & Ledger', icon: ScrollText },
    { section: 'ADMINISTRATION' },
    { path: '/tenders', label: 'Tender Management', icon: ShieldCheck },
    { path: '/bidders', label: 'Bidder Registry', icon: Users },
    { path: '/upload', label: 'Document Forensics Scan', icon: Upload },
  ] : [
    { section: 'BIDDER WORKSPACE' },
    { path: '/bidder', label: 'Bidder Workspace & KYC', icon: UserCheck },
    { path: '/tenders', label: 'Browse Published Tenders', icon: ShieldCheck },
    { path: '/upload', label: 'Smart Pre-Flight AI', icon: Upload, badge: 'AI' },
    { section: 'PUBLIC RECORDS' },
    { path: '/audit', label: 'Public CAG Audit Ledger', icon: ScrollText },
  ];


  const getInitials = (name) => {
    if (!name) return 'PR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = currentUser?.name || (isOfficer ? 'Dr. Rajesh Verma' : 'Vikram Solar Enterprises');
  const displayRole = isOfficer 
    ? (currentUser?.designation || 'Chief Procurement Officer') + ' • ' + (currentUser?.department || 'Ministry of Heavy Industries')
    : 'Bidder / Vendor • ' + (currentUser?.organization || 'Vikram Solar Green Energy');

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
              type="button"
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

      {/* Role Switcher Action */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          onClick={onSwitchRole}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.68rem', gap: 6 }}
          title="Toggle view between Procurement Officer and Bidder"
        >
          <ArrowLeftRight style={{ width: 12, height: 12 }} />
          <span>Switch to {isOfficer ? 'Bidder Portal' : 'Officer Command'}</span>
        </button>
      </div>

      {/* Footer Profile */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <div className="avatar" style={{ background: isOfficer ? '#1e293b' : '#047857' }}>
            {getInitials(displayName)}
          </div>
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <span className="name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {displayName}
            </span>
            <span className="role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {displayRole}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Log Out of PRAMAN"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4
            }}
          >
            <LogOut style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
