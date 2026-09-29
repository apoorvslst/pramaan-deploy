import React from 'react';
import BidderPortal from '../components/BidderPortal';

export default function BidderPortalPage({ user, defaultTab = 'kyc', onLogout }) {
  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bidder Statutory & Procurement Portal</h1>
          <p className="page-subtitle">
            GeM Autonomous Verification • Pre-Flight AI Diagnostics • Real-Time Submission Tracking
          </p>
        </div>
      </div>
      <div className="page-body">
        <BidderPortal user={user} defaultTab={defaultTab} onLogout={onLogout} />
      </div>
    </div>
  );
}

