import React, { useState } from 'react';
import { Header } from './components/Header';
import { OfficerDashboard } from './components/OfficerDashboard';
import { BidderPortal } from './components/BidderPortal';
import { AuthPage } from './components/AuthPage';
import { activeTender as initialTender, biddersData as initialBidders, auditLedger as initialLedger } from './data/mockData';

export function App() {
  // Check if a user session is stored in localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('praman_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [tender, setTender] = useState(initialTender);
  const [bidders, setBidders] = useState(initialBidders);
  const [ledger, setLedger] = useState(initialLedger);

  // Handle successful login or registration
  const handleLoginSuccess = (user, role) => {
    const verifiedUser = {
      ...user,
      role: role || user.role || 'OFFICER'
    };
    setCurrentUser(verifiedUser);
    localStorage.setItem('praman_user', JSON.stringify(verifiedUser));
  };

  // Handle sign out
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('praman_auth_token');
    localStorage.removeItem('praman_user');
  };

  const handleOfficerDecision = (bidderId, newDecision, justification) => {
    setBidders(prev => prev.map(b => {
      if (b.id === bidderId) {
        return {
          ...b,
          aiRecommendation: newDecision,
          officerDecision: newDecision,
          officerJustification: justification
        };
      }
      return b;
    }));
  };

  const handleCreateTender = (newTender) => {
    setTender(newTender);
    const newBlock = {
      blockIndex: ledger.length + 1,
      previousHash: ledger[ledger.length - 1]?.currentHash || '0x0000',
      timestamp: new Date().toISOString(),
      actionType: 'TENDER_PUBLISHED',
      actor: `${currentUser?.name || 'Dr. Vikramaditya Malhotra'} (OFFICER)`,
      payloadHash: '0x' + Math.random().toString(16).substring(2, 10),
      currentHash: '0x' + Math.random().toString(16).substring(2, 14) + '...f9e2'
    };
    setLedger(prev => [...prev, newBlock]);
  };

  // If not logged in, render the Stripe-styled Auth Page
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Strict Role Isolation:
  // - If role === 'OFFICER', render ONLY Officer Dashboard
  // - If role === 'BIDDER', render ONLY Bidder Portal
  const isOfficer = currentUser.role === 'OFFICER';

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#0A2540] flex flex-col font-sans selection:bg-[#635BFF] selection:text-white">
      
      {/* Header Bar with strict authenticated identity and logout */}
      <Header
        currentRole={currentUser.role}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace: Strictly Officer or Bidder */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {isOfficer ? (
          <OfficerDashboard
            activeTender={tender}
            bidders={bidders}
            auditLedger={ledger}
            onOfficerDecision={handleOfficerDecision}
            onCreateTender={handleCreateTender}
          />
        ) : (
          <BidderPortal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0A2540]">PRAMAN Architecture Prototype</span>
            <span>•</span>
            <span>SIH PS 26100 GeM Procurement Compliance</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span>PaddleOCR Spatial Vision</span>
            <span>PyMuPDF Forensics</span>
            <span>NetworkX Graph Engine</span>
            <span>SHA-256 Hash Chain</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
