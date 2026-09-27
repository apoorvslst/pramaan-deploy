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

  // If not logged in, render the Clean Auth Page
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Strict Role Isolation:
  // - If role === 'OFFICER' or 'CAG_AUDITOR', render Officer Dashboard
  // - If role === 'BIDDER', render Bidder Portal
  const isOfficer = currentUser.role === 'OFFICER' || currentUser.role === 'CAG_AUDITOR';

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#111827] flex flex-col font-sans selection:bg-[#0062FF] selection:text-white">
      
      {/* Ahrefs-Inspired Clean Header Bar */}
      <Header
        currentRole={currentUser.role}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace: Strictly Officer or Bidder */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5">
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

      {/* Lightweight Ahrefs-Inspired Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 px-4 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">PRAMAN Compliance Platform</span>
            <span className="text-slate-300">•</span>
            <span>SIH PS 26100 GeM Public Procurement Architecture</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded bg-[#0062FF]"></span>PyMuPDF Forensics</span>
            <span className="text-slate-300">•</span>
            <span>NetworkX Cartel Graph</span>
            <span className="text-slate-300">•</span>
            <span>ChromaDB RAG & Signatures</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
