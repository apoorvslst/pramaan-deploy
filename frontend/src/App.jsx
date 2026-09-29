import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EvidenceViewer from './pages/EvidenceViewer';
import CollusionGraph from './pages/CollusionGraph';
import AuditTrail from './pages/AuditTrail';

import TenderManagement from './pages/TenderManagement';
import BidderRegistry from './pages/BidderRegistry';
import DocumentUpload from './pages/DocumentUpload';

function App() {
  return (
    <BrowserRouter>
      {/* Clean Full-Height Layout (Matches Screenshot 1-4) */}
      <div className="app-layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/evidence" element={<EvidenceViewer />} />
          <Route path="/collusion" element={<CollusionGraph />} />
          <Route path="/audit" element={<AuditTrail />} />
          {/* Administration Routes */}
          <Route path="/tenders" element={<TenderManagement />} />
          <Route path="/bidders" element={<BidderRegistry />} />
          <Route path="/upload" element={<DocumentUpload />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
