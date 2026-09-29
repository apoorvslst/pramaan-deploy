import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import Dashboard from './pages/Dashboard';
import EvidenceViewer from './pages/EvidenceViewer';
import CollusionGraph from './pages/CollusionGraph';
import AuditTrail from './pages/AuditTrail';
import TenderManagement from './pages/TenderManagement';
import BidderRegistry from './pages/BidderRegistry';
import DocumentUpload from './pages/DocumentUpload';
import BidderPortalPage from './pages/BidderPortalPage';

// Strict Role Guard Components
function OfficerRoute({ currentUser, children }) {
  const isOfficer = (currentUser?.role || '').toUpperCase() === 'OFFICER' || (currentUser?.role || '').toUpperCase() === 'ADMIN';
  if (!isOfficer) {
    return <Navigate to="/bidder" replace />;
  }
  return children;
}

function BidderRoute({ currentUser, children }) {
  const isBidder = (currentUser?.role || '').toUpperCase() === 'BIDDER';
  if (!isBidder) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('praman_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user, role) => {
    const verifiedUser = {
      ...user,
      role: (role || user.role || 'OFFICER').toUpperCase()
    };
    setCurrentUser(verifiedUser);
    localStorage.setItem('praman_user', JSON.stringify(verifiedUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('praman_token');
    localStorage.removeItem('praman_auth_token');
    localStorage.removeItem('praman_user');
  };

  const handleSwitchRole = () => {
    if (!currentUser) return;
    const isCurrentlyOfficer = (currentUser.role || '').toUpperCase() === 'OFFICER';
    const newRole = isCurrentlyOfficer ? 'BIDDER' : 'OFFICER';
    const updated = {
      ...currentUser,
      role: newRole,
      name: newRole === 'BIDDER' ? 'Vikram Solar Enterprises' : 'Dr. Rajesh Verma',
      organization: newRole === 'BIDDER' ? 'Vikram Solar Green Energy Pvt Ltd' : 'Ministry of Heavy Industries'
    };
    setCurrentUser(updated);
    localStorage.setItem('praman_user', JSON.stringify(updated));
  };

  // If not logged in, render the clean Government of India Auth Page
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isOfficer = (currentUser.role || '').toUpperCase() === 'OFFICER' || (currentUser.role || '').toUpperCase() === 'ADMIN';
  const isBidder = (currentUser.role || '').toUpperCase() === 'BIDDER';

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
        />
        <Routes>
          {/* Default Dynamic Root */}
          <Route
            path="/"
            element={
              isBidder ? (
                <Navigate to="/bidder" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Officer Only Routes */}
          <Route
            path="/dashboard"
            element={
              <OfficerRoute currentUser={currentUser}>
                <Dashboard />
              </OfficerRoute>
            }
          />
          <Route
            path="/evidence"
            element={
              <OfficerRoute currentUser={currentUser}>
                <EvidenceViewer />
              </OfficerRoute>
            }
          />
          <Route
            path="/collusion"
            element={
              <OfficerRoute currentUser={currentUser}>
                <CollusionGraph />
              </OfficerRoute>
            }
          />
          <Route
            path="/bidders"
            element={
              <OfficerRoute currentUser={currentUser}>
                <BidderRegistry />
              </OfficerRoute>
            }
          />

          {/* Bidder Only Routes */}
          <Route
            path="/bidder"
            element={
              <BidderRoute currentUser={currentUser}>
                <BidderPortalPage user={currentUser} onLogout={handleLogout} />
              </BidderRoute>
            }
          />

          {/* Contextual / Role-Adapted Routes */}
          <Route
            path="/tenders"
            element={<TenderManagement currentUser={currentUser} />}
          />
          <Route
            path="/upload"
            element={
              isBidder ? (
                <BidderPortalPage user={currentUser} defaultTab="preflight" onLogout={handleLogout} />
              ) : (
                <OfficerRoute currentUser={currentUser}>
                  <DocumentUpload />
                </OfficerRoute>
              )
            }
          />
          <Route
            path="/audit"
            element={<AuditTrail currentUser={currentUser} />}
          />

          {/* Catch-all fallback */}
          <Route
            path="*"
            element={
              isBidder ? (
                <Navigate to="/bidder" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

