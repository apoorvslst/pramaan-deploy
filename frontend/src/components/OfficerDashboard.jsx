import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Database, 
  Sparkles, 
  FileText, 
  Lock, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  ArrowRight, 
  Download, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Bot, 
  Send, 
  Check, 
  Building, 
  Clock, 
  MapPin, 
  UploadCloud,
  Network,
  ExternalLink,
  Cpu,
  Scale
} from './Icons';

export function OfficerDashboard({ 
  activeTender, 
  bidders, 
  auditLedger, 
  onOfficerDecision, 
  onCreateTender 
}) {
  // Navigation & Sub-views in Officer Dashboard
  // 1. evaluation | 2. evidence | 3. comparison | 4. collusion | 5. ingestion | 6. adapters | 7. ledger
  const [subTab, setSubTab] = useState('evaluation');

  // Inspected bidder for modals or dedicated views
  const [inspectedBidder, setInspectedBidder] = useState(null);
  const [collusionBidder, setCollusionBidder] = useState(null);
  
  // Mathematical Score Breakdown Modal State (Section 7.6)
  const [scoreBreakdownBidder, setScoreBreakdownBidder] = useState(null);

  // Shortfall / Rectification Clarification Notice Modal State (GeM 48h Clarification Workflow)
  const [shortfallBidder, setShortfallBidder] = useState(null);
  const [shortfallNoticeText, setShortfallNoticeText] = useState('Please submit CA certified annual turnover certificate with valid UDIN and QR code verification within 48 hours.');
  const [shortfallDeadlineHours, setShortfallDeadlineHours] = useState(48);
  const [shortfallSuccessMessage, setShortfallSuccessMessage] = useState(null);

  // Table Filter & Search State
  const [tableFilter, setTableFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 3-Pane Evidence Verification Workspace State (Section 7.8 & Section 9.4)
  const [selectedBidderForDoc, setSelectedBidderForDoc] = useState(bidders[0] || null);
  const [selectedDocType, setSelectedDocType] = useState('CA Turnover Certificate');
  const [isScanningForensics, setIsScanningForensics] = useState(false);
  const [forensicHeatmapMode, setForensicHeatmapMode] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [docZoomLevel, setDocZoomLevel] = useState(100);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Side-by-Side Comparison State (select up to 4 bidders)
  const [comparedBidderIds, setComparedBidderIds] = useState(['BID-8901', 'BID-8902', 'BID-8903']);

  // Cartel Network Graph Interactive State (Section 7.7)
  const [selectedGraphNode, setSelectedGraphNode] = useState(null);
  const [cartelFilter, setCartelFilter] = useState('ALL');

  // Tender Ingestion Studio State (Section 7.1)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [newTenderData, setNewTenderData] = useState({
    title: 'High-Efficiency Monocrystalline Bifacial Solar Modules (100MW)',
    organisation: 'NTPC Vidyut Vyapar Nigam Ltd (NVVN)',
    estimatedValue: '₹98,50,00,000',
    closingDate: '2026-10-15',
    category: 'Solar & Renewable Power Equipment',
    emdAmount: '₹1,97,00,000',
    minTurnover: '₹29.5 Cr (30% of contract value)',
    minExperience: '3 completed solar projects >= 40MW',
    makeInIndiaMin: 50,
    allowMsmeExemption: true,
    allowStartupExemption: true,
    turnoverWeightage: 30,
    experienceWeightage: 30,
    miiWeightage: 20,
    certWeightage: 20,
    mandatoryDocs: [
      'CA Certified Turnover Certificate (FY22, FY23, FY24 with UDIN)',
      'ALMM Listed OEM Authorization Certificate',
      'Tier-1 Module Reliability & Flash Test Reports',
      'Class-I Local Supplier (Make in India >= 50%) Declaration',
      'Non-Debarment Affidavit on ₹100 Stamp Paper'
    ]
  });

  // Ledger Mathematical Verification State (Section 7.9 & 9.1)
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [chainVerifiedStatus, setChainVerifiedStatus] = useState(null);

  // Government Adapters Status State (Section 7.5)
  const [adapterHealth, setAdapterHealth] = useState([
    { name: 'GSTN Portal Adapter API', status: 'OPERATIONAL', latency: '142ms', cacheHitRate: '88.4%', lastSync: '2 min ago', endpoint: 'https://api.gst.gov.in/v1.2/taxpayer' },
    { name: 'Udyam / MSME Registry Adapter', status: 'OPERATIONAL', latency: '98ms', cacheHitRate: '94.1%', lastSync: 'Just now', endpoint: 'https://udyamregistration.gov.in/api/v2/verify' },
    { name: 'NSDL Income Tax / PAN Gateway', status: 'OPERATIONAL', latency: '180ms', cacheHitRate: '82.0%', lastSync: '5 min ago', endpoint: 'https://incometaxindiaefiling.gov.in/api/pan-status' },
    { name: 'MCA21 RoC Company Master Adapter', status: 'OPERATIONAL', latency: '210ms', cacheHitRate: '79.5%', lastSync: '8 min ago', endpoint: 'https://mca.gov.in/api/company/directors' },
    { name: 'GeM & CPPP Central Debarment DB', status: 'OPERATIONAL', latency: '45ms', cacheHitRate: '99.2%', lastSync: 'Real-time', endpoint: 'https://gem.gov.in/api/debarment-registry' },
  ]);

  // Air-Gapped AI Assistant Co-Pilot State (Section 7.10)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste Officer. I am your PRAMAN Air-Gapped Verification Co-Pilot (Llama-3 Sovereign). Ask me anything about NIT eligibility clauses, statutory exemptions, turnover claims, or document forensics across all submitted bids.'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Handle Tender Creation Submission
  const handleSimulateParsing = () => {
    setCreateStep(2);
    setParsingProgress(15);
    setTimeout(() => setParsingProgress(50), 350);
    setTimeout(() => setParsingProgress(85), 700);
    setTimeout(() => {
      setParsingProgress(100);
      setCreateStep(3);
    }, 1000);
  };

  const handlePublishNewTender = () => {
    if (onCreateTender) {
      onCreateTender({
        id: `GEM/2026/B/${Math.floor(800000 + Math.random() * 99999)}`,
        ...newTenderData,
        publishedDate: new Date().toISOString().split('T')[0],
        mandatoryRequirements: newTenderData.mandatoryDocs
      });
    }
    setShowCreateModal(false);
    setCreateStep(1);
    alert('Tender successfully published! Stamped with Officer Digital Signature (DSC) and Merkle Root anchored into the SHA-256 Cryptographic Audit Ledger.');
  };

  // Toggle comparison selection
  const toggleBidderComparison = (id) => {
    setComparedBidderIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter(bId => bId !== id);
      } else {
        if (prev.length >= 4) return prev;
        return [...prev, id];
      }
    });
  };

  // Handle on-the-fly Ledger Verification
  const handleVerifyLedgerChain = () => {
    setIsVerifyingChain(true);
    setChainVerifiedStatus(null);
    setTimeout(() => {
      setIsVerifyingChain(false);
      setChainVerifiedStatus({
        verifiedBlocks: auditLedger.length,
        merkleRoot: '0x8f2a11b9c8821d4099ee71ab553311ff9988eedd2211bb443300998877665544',
        status: 'VALID',
        tamperDetected: false,
        verifiedAt: new Date().toLocaleTimeString()
      });
    }, 900);
  };

  // Issue Shortfall Notice
  const handleIssueShortfall = () => {
    if (!shortfallBidder) return;
    setShortfallSuccessMessage(`Notice #${Math.floor(100000 + Math.random() * 899999)} successfully dispatched to ${shortfallBidder.companyName}. Bidder granted ${shortfallDeadlineHours} hours for rectification.`);
    setTimeout(() => {
      setShortfallBidder(null);
      setShortfallSuccessMessage(null);
    }, 2000);
  };

  // Chat queries handler
  const handleSendChat = (prefilledQuery) => {
    const q = prefilledQuery || inputQuery;
    if (!q.trim()) return;

    const newMsgs = [...chatMessages, { sender: 'user', text: q }];
    setChatMessages(newMsgs);
    if (!prefilledQuery) setInputQuery('');

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();
      if (lower.includes('msme') || lower.includes('solarix') || lower.includes('waiver')) {
        reply = 'Solarix Green Energy (BID-8901) is registered as Micro Enterprise (Udyam: UDYAM-DL-03-0049281) with 68% Make-in-India content. Under Section 7.6 Statutory Exemptions (Public Procurement Policy for MSEs Order 2012), turnover threshold and ₹8.4L EMD are automatically waived with valid status.';
      } else if (lower.includes('collusion') || lower.includes('apex') || lower.includes('ring')) {
        reply = 'Apex InfraTech (BID-8903) and GreenVolt Power (BID-8904) share common Director DIN: 08912441 (cross-verified against MCA21 registry). Both submissions originated from identical IP subnet 103.24.112.44 within 4 minutes. NetworkX generated High Collusion Alert #C-104.';
      } else if (lower.includes('tamper') || lower.includes('photoshop') || lower.includes('greenvolt')) {
        reply = 'GreenVolt Power Systems (BID-8904) submitted an OEM Authorization with XMP metadata tag "Adobe Photoshop CC 2024 (Windows)". Error Level Analysis (ELA) detected 99.8% compression noise inconsistency on the signature block. Flagged as CRITICAL_FORGERY.';
      } else {
        reply = `Analysis based on Tender ${activeTender.id}: All ${bidders.length} bids have been processed by PaddleOCR-v4 and checked against GSTN/MCA21. Gating rules: 2 Bidders Qualified, 1 Minor Review, 1 Disqualified (Forged OEM), 1 Syndicate Flag.`;
      }
      setChatMessages([...newMsgs, { sender: 'ai', text: reply }]);
    }, 600);
  };

  // Filtered bidders
  const filteredBidders = bidders.filter(bidder => {
    const matchesSearch = 
      bidder.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bidder.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bidder.gstin.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (tableFilter === 'QUALIFIED') return matchesSearch && bidder.aiRecommendation === 'QUALIFIED';
    if (tableFilter === 'NEEDS_REVIEW') return matchesSearch && bidder.aiRecommendation === 'NEEDS_REVIEW';
    if (tableFilter === 'DISQUALIFIED') return matchesSearch && bidder.aiRecommendation === 'DISQUALIFIED';
    if (tableFilter === 'COLLUSION') return matchesSearch && bidder.collusionAlert;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* AHREFS-INSPIRED LIGHT OFFICER HERO BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-50/50 to-blue-50/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0062FF]" />
                GeM Procurement Officer Console
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                DSC Token Valid (e-Sign 256-bit)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Officer ID: <strong className="text-slate-700 font-bold">PO-GOV-DEL-7712</strong>
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-[#111827] tracking-tight">
              Procurement & Statutory Compliance Workspace
            </h1>

            <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">Dr. Vikramaditya Malhotra (Chief Procurement Officer, NTPC)</span>
              <span>•</span>
              <span className="text-[#0062FF] font-semibold">{activeTender.title}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSubTab('ingestion');
                setShowCreateModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm hover:shadow active:scale-98 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Tender (Ingest NIT)
            </button>

            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                isChatOpen 
                  ? 'bg-blue-50 text-[#0062FF] border-blue-200 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <Bot className="w-4 h-4 text-[#0062FF]" />
              AI Officer Co-Pilot
            </button>
          </div>

        </div>

        {/* Live Tender Metadata Summary & Rule Gates */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <span>Tender: <strong className="text-[#111827] font-mono">{activeTender.id}</strong></span>
            <span>Est. Value: <strong className="text-[#0062FF] font-semibold">{activeTender.estimatedValue}</strong></span>
            <span>EMD: <strong className="text-amber-700 font-semibold">{activeTender.emdAmount}</strong></span>
            <span>Closing: <strong className="text-slate-700 font-mono">{activeTender.closingDate}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">Active Rule Gates:</span>
            {activeTender.mandatoryRequirements.slice(0, 3).map((req, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200">
                ✓ {req.split(' ')[0]} {req.split(' ')[1]}...
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* STRIPE-LIKE 7-TAB SUB-NAVIGATION NAVBAR */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        
        <button
          onClick={() => setSubTab('evaluation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            subTab === 'evaluation'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>1. Evaluation Console</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            subTab === 'evaluation' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {bidders.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('evidence')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            subTab === 'evidence'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. 3-Pane Evidence Workspace</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            subTab === 'evidence' ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0062FF]'
          }`}>
            Interactive OCR
          </span>
        </button>

        <button
          onClick={() => setSubTab('comparison')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            subTab === 'comparison'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Comparison Matrix</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            subTab === 'comparison' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {comparedBidderIds.length} Selected
          </span>
        </button>

        <button
          onClick={() => setSubTab('collusion')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            subTab === 'collusion'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>4. Cartel Graph (NetworkX)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-50 text-rose-700 font-bold border border-rose-200">
            2 Flagged
          </span>
        </button>

        <button
          onClick={() => setSubTab('ingestion')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            subTab === 'ingestion'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>5. Tender Rules & Ingestion</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            subTab === 'ingestion' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            Sec 7.1
          </span>
        </button>

        <button
          onClick={() => setSubTab('adapters')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            subTab === 'adapters'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>6. Portal Adapter Fabric</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            5/5 Online
          </span>
        </button>

        <button
          onClick={() => setSubTab('ledger')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            subTab === 'ledger'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>7. Audit Ledger (SHA-256)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            subTab === 'ledger' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            Immutable
          </span>
        </button>

      </div>

      {/* STRIPE-STYLE STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bidders</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-[#111827]">{bidders.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Submitted bid packages for active tender</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Qualified</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {bidders.filter(b => b.aiRecommendation === 'QUALIFIED').length}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Meets 100% statutory & NIT rule gates</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Under Officer Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {bidders.filter(b => b.aiRecommendation === 'NEEDS_REVIEW').length}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Minor OCR/format discrepancy</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Disqualified / Collusion</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {bidders.filter(b => b.aiRecommendation === 'DISQUALIFIED' || b.collusionAlert).length}
          </div>
          <p className="text-[11px] text-rose-700 mt-1">Tampered certificate or cartel link</p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* TAB 1: BID COMPLIANCE EVALUATION CONSOLE (SEC 7.6)       */}
      {/* ======================================================== */}
      {subTab === 'evaluation' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm space-y-0">
          
          {/* Table Search & Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company, GSTIN, or Bid ID..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
              {['ALL', 'QUALIFIED', 'NEEDS_REVIEW', 'DISQUALIFIED', 'COLLUSION'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTableFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    tableFilter === f
                      ? 'bg-[#0062FF] text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {f === 'ALL' ? 'All Bidders' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="p-4 w-12">Rank</th>
                  <th className="p-4">Bidder Details</th>
                  <th className="p-4">Statutory & MSME Status</th>
                  <th className="p-4">Explainable Score</th>
                  <th className="p-4">Forensics Check</th>
                  <th className="p-4">Government Registry</th>
                  <th className="p-4">AI Recommendation</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBidders.map((bidder) => {
                  const isQualified = bidder.aiRecommendation === 'QUALIFIED';
                  const isReview = bidder.aiRecommendation === 'NEEDS_REVIEW';

                  return (
                    <tr key={bidder.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-500">
                        #{bidder.rank}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-[#111827] text-sm">{bidder.companyName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span className="text-[#0062FF] font-semibold">{bidder.id}</span>
                          <span>•</span>
                          <span>GSTIN: {bidder.gstin}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-slate-700">{bidder.type}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{bidder.exemptionStatus}</div>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => setScoreBreakdownBidder(bidder)}
                          className="flex items-center gap-2 group text-left cursor-pointer"
                          title="Click to view mathematical scoring formula breakdown"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs group-hover:ring-2 ring-[#0062FF]/30 transition-all ${
                            bidder.complianceScore >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            bidder.complianceScore >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {bidder.complianceScore}
                          </div>
                          <div>
                            <span className="text-[11px] text-[#0062FF] font-mono group-hover:underline block font-semibold">
                              View Formula
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {bidder.ocrConfidence}% OCR
                            </span>
                          </div>
                        </button>
                      </td>

                      <td className="p-4">
                        {bidder.forensicScan === 'CLEAN_PASS' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Clean Pass
                          </span>
                        )}
                        {bidder.forensicScan === 'MINOR_ANOMALY' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Font Anomaly
                          </span>
                        )}
                        {bidder.forensicScan === 'CRITICAL_FORGERY' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Photoshop Edit
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-[11px]">
                        <div className="text-emerald-700 font-semibold">GSTN: {bidder.portalMatch.gstn}</div>
                        <div className="text-slate-500">Debarment: {bidder.portalMatch.debarment}</div>
                      </td>

                      <td className="p-4">
                        {isQualified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> QUALIFIED
                          </span>
                        )}
                        {isReview && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> NEEDS REVIEW
                          </span>
                        )}
                        {!isQualified && !isReview && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> DISQUALIFIED
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBidderForDoc(bidder);
                              setSubTab('evidence');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062FF] text-xs font-semibold border border-blue-100 transition-colors inline-flex items-center gap-1"
                            title="Open 3-Pane Evidence Verification"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            3-Pane View
                          </button>

                          {isReview && (
                            <button
                              type="button"
                              onClick={() => setShortfallBidder(bidder)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors inline-flex items-center gap-1"
                              title="Issue GeM 48h Shortfall Clarification Notice"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              Shortfall Notice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 3-PANE EVIDENCE VERIFICATION WORKSPACE (SEC 7.8)  */}
      {/* ======================================================== */}
      {subTab === 'evidence' && (
        <div className="space-y-6">
          
          {/* Top Control Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                  SECTION 7.8 SPECIFICATION
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200">
                  HUMAN-IN-THE-LOOP COGNITIVE AUDIT
                </span>
              </div>
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0062FF]" />
                3-Pane Evidence Verification Workspace
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side triad: Original PDF Canvas (with OCR Bounding Boxes) vs Normalized Extracted Claims vs Real-time Government Ground Truth.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Bidder Switcher */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-mono">Bidder:</span>
                <select
                  value={selectedBidderForDoc?.id}
                  onChange={(e) => {
                    const found = bidders.find(b => b.id === e.target.value);
                    if (found) setSelectedBidderForDoc(found);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0062FF] font-mono shadow-2xs font-bold"
                >
                  {bidders.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.id} - {b.companyName.substring(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Switcher */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-mono">Doc:</span>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0062FF] font-mono shadow-2xs"
                >
                  <option value="CA Turnover Certificate">CA Turnover Certificate (UDIN)</option>
                  <option value="GST Certificate">GST REG-06 Certificate</option>
                  <option value="Udyam Registration">Udyam / MSME Certificate</option>
                  <option value="OEM Authorization">OEM Authorization Letter</option>
                </select>
              </div>

              {/* ELA Heatmap Toggle */}
              <button
                type="button"
                onClick={() => setForensicHeatmapMode(!forensicHeatmapMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  forensicHeatmapMode
                    ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                {forensicHeatmapMode ? 'ELA Tamper Heatmap ON' : 'Toggle ELA Heatmap'}
              </button>

              {/* Bounding Box Toggle */}
              <button
                type="button"
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showBoundingBoxes
                    ? 'bg-blue-50 text-[#0062FF] border-blue-200 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {showBoundingBoxes ? 'Bounding Boxes Visible' : 'Hide Boxes'}
              </button>

              {/* Re-Scan Button */}
              <button
                type="button"
                onClick={() => {
                  setIsScanningForensics(true);
                  setTimeout(() => setIsScanningForensics(false), 600);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0062FF] text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanningForensics ? 'animate-spin' : ''}`} />
                Re-Scan
              </button>
            </div>
          </div>

          {/* 3 PANES GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PANE 1: DOCUMENT VISUAL CANVAS */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Pane 1: Original Document PDF
                    </span>
                    <span className="text-[10px] font-mono text-[#0062FF] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Page 1 of 2
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                    <button 
                      onClick={() => setDocZoomLevel(prev => Math.max(75, prev - 25))}
                      className="px-1.5 py-0.5 bg-slate-100 rounded hover:bg-slate-200"
                    >-</button>
                    <span>{docZoomLevel}%</span>
                    <button 
                      onClick={() => setDocZoomLevel(prev => Math.min(150, prev + 25))}
                      className="px-1.5 py-0.5 bg-slate-100 rounded hover:bg-slate-200"
                    >+</button>
                  </div>
                </div>

                {/* PDF Canvas Simulation */}
                <div className={`border rounded-xl p-4 font-mono text-[11px] relative overflow-hidden transition-all ${
                  forensicHeatmapMode 
                    ? 'bg-rose-950/5 border-rose-300 shadow-inner' 
                    : 'bg-slate-50/70 border-slate-200'
                }`} style={{ transform: `scale(${docZoomLevel / 100})`, transformOrigin: 'top left' }}>
                  
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <span className="text-[10px] text-slate-500">FORMAT: PDF 1.7 (ISO 32000)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      DPI: 300 (Optical Grade)
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-2 text-xs">
                      {selectedDocType.toUpperCase()}
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block text-[10px]">Legal Entity Name:</span>
                      <div className="text-[#111827] font-bold">{selectedBidderForDoc?.companyName}</div>
                    </div>

                    {/* Bounding box highlighted token */}
                    <div className={`p-2.5 rounded-lg border relative transition-all ${
                      showBoundingBoxes
                        ? forensicHeatmapMode
                          ? 'bg-rose-100/70 border-rose-500 shadow-sm animate-pulse'
                          : 'bg-blue-50/70 border-indigo-300 ring-2 ring-blue-200/50'
                        : 'bg-white border-slate-200'
                    }`}>
                      <span className="text-[#0062FF] font-bold text-[10px] block">Extracted Identifier (GSTIN):</span>
                      <div className="text-indigo-950 font-bold font-mono">{selectedBidderForDoc?.gstin}</div>
                      {showBoundingBoxes && (
                        <span className="absolute right-2 top-2 text-[9px] font-mono text-[#0062FF] bg-white px-1.5 py-0.5 rounded border border-blue-200">
                          bbox [120, 340, 480, 420]
                        </span>
                      )}
                      {forensicHeatmapMode && (
                        <span className="text-[9px] text-rose-700 font-bold block mt-1">
                          ⚡ ELA Compression Anomaly: 99.8% pixel noise variance detected
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block text-[10px]">3-Year Audited Average Turnover:</span>
                      <div className="text-emerald-700 font-bold">₹4,28,00,000 / annum (Meets NIT Gate)</div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block text-[10px]">Statutory ICAI UDIN:</span>
                      <div className="text-slate-700 font-mono">24089124AAAAAA9912 (Active)</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>SHA-256: 0x9f8c...3b1a</span>
                    <span className="text-emerald-700 font-semibold">✓ Non-Repudiation Verified</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Viewer Engine: <span className="text-slate-800 font-semibold font-mono">PDF.js Canvas + SVG Dynamic Overlay</span>
              </div>
            </div>

            {/* PANE 2: AI EXTRACTED CLAIMS JSON */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pane 2: AI Extracted Claims
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    Confidence: {selectedBidderForDoc?.ocrConfidence}%
                  </span>
                </div>

                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-2.5 text-slate-700">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-[11px]">
                    <span className="text-slate-500">Extraction Model:</span>
                    <span className="text-[#0062FF] font-semibold">PaddleOCR-v4 + LayoutLM-v3</span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">entity_type:</span>
                      <span className="text-slate-800 font-bold">"{selectedBidderForDoc?.type}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">gstin_string:</span>
                      <span className="text-[#0062FF] font-bold">"{selectedBidderForDoc?.gstin}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">pan_number:</span>
                      <span className="text-slate-800">"{selectedBidderForDoc?.pan}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">udyam_msme:</span>
                      <span className="text-slate-800">"{selectedBidderForDoc?.udyam}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">exemption_claimed:</span>
                      <span className="text-emerald-700 font-semibold">"{selectedBidderForDoc?.exemptionStatus}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">forensic_flag:</span>
                      <span className={selectedBidderForDoc?.forensicScan === 'CLEAN_PASS' ? 'text-emerald-700' : 'text-rose-700 font-bold'}>
                        "{selectedBidderForDoc?.forensicScan}"
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">calculated_score:</span>
                      <span className="font-bold text-[#111827]">{selectedBidderForDoc?.complianceScore} / 100</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 block mb-1">Forensic Analysis Detail:</span>
                    <p className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 leading-relaxed font-sans">
                      {selectedBidderForDoc?.forensicDetails}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Normalization: ISO-8601</span>
                <span className="text-emerald-700 font-semibold">✓ Schema Validated</span>
              </div>
            </div>

            {/* PANE 3: GOVERNMENT REGISTRY GROUND TRUTH */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pane 3: Government Ground Truth
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    LIVE REGISTRY SYNC
                  </span>
                </div>

                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-[11px]">
                    <span className="text-slate-500">Adapter Gateway:</span>
                    <span className="text-[#0062FF] font-semibold">NIC / GSTN Portal Fabric</span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">GSTN Status:</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedBidderForDoc?.portalMatch.gstn}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">MCA21 Registry:</span>
                      <span className="text-emerald-700 font-bold">
                        {selectedBidderForDoc?.portalMatch.mca}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Udyam Verification:</span>
                      <span className="text-blue-700 font-semibold">
                        {selectedBidderForDoc?.portalMatch.udyam}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">GeM Debarment:</span>
                      <span className={selectedBidderForDoc?.portalMatch.debarment === 'CLEAN' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {selectedBidderForDoc?.portalMatch.debarment}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                    <div>Query ID: <span className="text-slate-700">Q-GSTN-2026-8812</span></div>
                    <div>Cached TTL: <span className="text-slate-700">Redis 24h (Last Sync: 2m ago)</span></div>
                    <div>Digital Signature: <span className="text-emerald-700 font-bold">SHA-256 e-Signed</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Discrepancy Status:</span>
                <span className={`font-bold ${
                  selectedBidderForDoc?.complianceScore >= 85 ? 'text-emerald-700' :
                  selectedBidderForDoc?.complianceScore >= 50 ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {selectedBidderForDoc?.complianceScore >= 85 ? '100% MATCH' : selectedBidderForDoc?.complianceScore >= 50 ? 'MINOR VARIANCE' : 'CRITICAL MISMATCH'}
                </span>
              </div>
            </div>

          </div>

          {/* INTEGRATED OFFICER DECISION BAR (SECTION 5 STAGE 6) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Officer Justification:
              </span>
              <input
                type="text"
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Enter mandatory legal rationale or override reason to seal into SHA-256 ledger..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF]"
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShortfallBidder(selectedBidderForDoc)}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Issue 48h Shortfall Notice
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOfficerDecision) onOfficerDecision(selectedBidderForDoc.id, 'DISQUALIFIED', decisionNotes || 'Disqualified by procurement officer review');
                  alert(`Bidder ${selectedBidderForDoc.id} DISQUALIFIED. Action cryptographically sealed into Audit Ledger.`);
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
              >
                Disqualify Bidder
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOfficerDecision) onOfficerDecision(selectedBidderForDoc.id, 'QUALIFIED', decisionNotes || 'Qualified by procurement officer review');
                  alert(`Bidder ${selectedBidderForDoc.id} QUALIFIED. Action cryptographically sealed into Audit Ledger.`);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Accept & Qualify
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SIDE-BY-SIDE BIDDER COMPARISON MATRIX            */}
      {/* ======================================================== */}
      {subTab === 'comparison' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0062FF]" />
                Side-by-Side Head-to-Head Statutory Comparison Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare statutory compliance, financial criteria, Make-in-India content, and forensic checks side-by-side.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 mr-1 font-mono">Select to compare:</span>
              {bidders.map(b => (
                <button
                  key={b.id}
                  onClick={() => toggleBidderComparison(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                    comparedBidderIds.includes(b.id)
                      ? 'bg-[#0062FF] text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {b.id}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-slate-500 uppercase tracking-wider font-semibold w-56 bg-slate-50 sticky left-0 z-10">
                      Parameter / Criteria
                    </th>
                    {bidders
                      .filter(b => comparedBidderIds.includes(b.id))
                      .map(b => (
                        <th key={b.id} className="p-4 border-l border-slate-200 min-w-[260px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[#0062FF] font-bold text-sm">{b.id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              b.aiRecommendation === 'QUALIFIED' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : b.aiRecommendation === 'NEEDS_REVIEW'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {b.aiRecommendation}
                            </span>
                          </div>
                          <div className="font-bold text-[#111827] text-xs truncate">{b.companyName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{b.gstin}</div>
                        </th>
                      ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  
                  {/* Row: Score */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-[#111827] bg-slate-50/40 sticky left-0">
                      AI Compliance Score
                    </td>
                    {bidders.filter(b => comparedBidderIds.includes(b.id)).map(b => (
                      <td key={b.id} className="p-4 border-l border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                            b.complianceScore >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            b.complianceScore >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {b.complianceScore}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {b.complianceScore >= 85 ? 'High Compliance' : b.complianceScore >= 50 ? 'Partial Pass' : 'Non-Compliant'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">Confidence: {b.ocrConfidence}%</div>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Entity */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-700 bg-slate-50/40 sticky left-0">
                      Entity & Preferential Status
                    </td>
                    {bidders.filter(b => comparedBidderIds.includes(b.id)).map(b => (
                      <td key={b.id} className="p-4 border-l border-slate-100">
                        <div className="font-medium text-slate-800">{b.type}</div>
                        <div className="text-[11px] text-[#0062FF] font-mono mt-0.5">{b.udyam}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Exemptions */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-700 bg-slate-50/40 sticky left-0">
                      EMD & Turnover Exemption
                    </td>
                    {bidders.filter(b => comparedBidderIds.includes(b.id)).map(b => (
                      <td key={b.id} className="p-4 border-l border-slate-100">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs border border-slate-200 font-medium">
                          {b.exemptionStatus}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Forensics */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-700 bg-slate-50/40 sticky left-0">
                      Document Forensics (PyMuPDF)
                    </td>
                    {bidders.filter(b => comparedBidderIds.includes(b.id)).map(b => (
                      <td key={b.id} className="p-4 border-l border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1 font-bold text-xs">
                          {b.forensicScan === 'CLEAN_PASS' && <span className="text-emerald-700">✓ Clean Pass</span>}
                          {b.forensicScan === 'MINOR_ANOMALY' && <span className="text-amber-700">⚠ Font Anomaly</span>}
                          {b.forensicScan === 'CRITICAL_FORGERY' && <span className="text-rose-700">✕ Critical Forgery</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">{b.forensicDetails}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Ground Truth */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-700 bg-slate-50/40 sticky left-0">
                      Government Registry Ground-Truth
                    </td>
                    {bidders.filter(b => comparedBidderIds.includes(b.id)).map(b => (
                      <td key={b.id} className="p-4 border-l border-slate-100 font-mono text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">GSTN:</span>
                          <span className="text-emerald-700 font-semibold">{b.portalMatch.gstn}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Debarment:</span>
                          <span className={b.portalMatch.debarment === 'CLEAN' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                            {b.portalMatch.debarment}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr className="bg-slate-50/70">
                    <td className="p-4 font-bold text-slate-700 bg-slate-50 sticky left-0">
                      Actions
                    </td>
                    {bidders.filter(b => comparedBidderIds.includes(b.id)).map(b => (
                      <td key={b.id} className="p-4 border-l border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBidderForDoc(b);
                            setSubTab('evidence');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Launch 3-Pane Evidence
                        </button>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CARTEL GRAPH & COLLUSION (NETWORKX) (SEC 7.7)     */}
      {/* ======================================================== */}
      {subTab === 'collusion' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-xs font-bold border border-rose-200">
                  SECTION 7.7 SPECIFICATION
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-mono text-xs font-semibold border border-amber-200">
                  BIPARTITE GRAPH PROJECTION
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <Network className="w-5 h-5 text-amber-500" />
                Cartel, Syndicate & Collusive Bidding Detection Network (NetworkX)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-3xl">
                Multi-factor graph algorithm links competing bidders via shared Director DINs, physical address tokens, bank IFSC accounts, and PDF author metadata.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Filter Ring:</span>
              <select
                value={cartelFilter}
                onChange={(e) => setCartelFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono shadow-2xs"
              >
                <option value="ALL">All Collusion Clusters</option>
                <option value="DIRECTOR">Shared Director DIN Rings</option>
                <option value="IP">Shared IP Subnets</option>
                <option value="METADATA">PDF Author Fingerprints</option>
              </select>
            </div>
          </div>

          {/* Interactive Visual Network Canvas */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 text-xs">
              <span className="font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0062FF]" />
                Interactive Entity Relationship Canvas
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#0062FF]"></span> Bidder Node</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Shared DIN Token</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span> Collusion Cluster</span>
              </div>
            </div>

            {/* SVG Visual Graph */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-8 min-h-[380px] flex flex-col items-center justify-center relative overflow-hidden select-none">
              <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400">
                NetworkX Layout: Spring Force-Directed • Centrality Threshold &gt; 0.70
              </div>

              {/* Network Graph Nodes Simulation */}
              <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-between gap-8 py-6">
                
                {/* Node 1: Solarix (Clean) */}
                <div 
                  onClick={() => setSelectedGraphNode({ name: 'Solarix Green Energy', type: 'Bidder', status: 'ISOLATED_CLEAN', risk: 'Low (0.04)' })}
                  className="p-4 bg-white border-2 border-emerald-400 rounded-2xl text-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-[10px] font-mono text-emerald-700 font-bold block">BID-8901</span>
                  <span className="text-xs font-bold text-slate-800">Solarix Green Energy</span>
                  <span className="text-[10px] text-emerald-600 block mt-1">✓ No Shared Linkages</span>
                </div>

                {/* Collusion Ring Area */}
                <div className="border-2 border-dashed border-rose-300 bg-rose-50/50 p-6 rounded-3xl flex flex-col items-center gap-4 relative">
                  <span className="absolute -top-3 px-3 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold shadow-xs">
                    ⚡ CARTEL RING #C-104 (Jaccard: 0.89)
                  </span>

                  <div className="flex items-center gap-6">
                    {/* Node 2: Apex */}
                    <div 
                      onClick={() => setSelectedGraphNode({ name: 'Apex InfraTech Solutions', type: 'Bidder', status: 'FLAGGED_COLLUSION', risk: 'High (0.89)', linkedTo: 'GreenVolt Power' })}
                      className="p-4 bg-white border-2 border-rose-500 rounded-2xl text-center shadow-xs cursor-pointer hover:scale-105 transition-transform ring-2 ring-rose-200"
                    >
                      <span className="text-[10px] font-mono text-rose-600 font-bold block">BID-8903</span>
                      <span className="text-xs font-bold text-slate-800">Apex InfraTech</span>
                      <span className="text-[10px] text-rose-700 font-mono block mt-0.5">IP: 103.24.112.44</span>
                    </div>

                    {/* Shared Director Node */}
                    <div className="p-3 bg-amber-100 text-amber-900 rounded-xl font-mono text-xs font-bold border border-amber-300 text-center shadow-xs">
                      <div>Director DIN:</div>
                      <div className="text-amber-950 font-black">08912441</div>
                      <div className="text-[9px] text-amber-700 font-normal mt-0.5">S. K. Aggarwal</div>
                    </div>

                    {/* Node 3: GreenVolt */}
                    <div 
                      onClick={() => setSelectedGraphNode({ name: 'GreenVolt Power Systems', type: 'Bidder', status: 'FLAGGED_COLLUSION', risk: 'Critical (0.94)', linkedTo: 'Apex InfraTech' })}
                      className="p-4 bg-white border-2 border-rose-500 rounded-2xl text-center shadow-xs cursor-pointer hover:scale-105 transition-transform ring-2 ring-rose-200"
                    >
                      <span className="text-[10px] font-mono text-rose-600 font-bold block">BID-8904</span>
                      <span className="text-xs font-bold text-slate-800">GreenVolt Power</span>
                      <span className="text-[10px] text-rose-700 font-mono block mt-0.5">IP: 103.24.112.44</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-rose-800 text-center max-w-md bg-white p-2.5 rounded-xl border border-rose-200">
                    <strong>Evidence Proof:</strong> Shared director DIN registered under MCA21 records + submissions received within 4 minutes from identical IP subnet.
                  </div>
                </div>

                {/* Node 4: Vayu Dynamics */}
                <div 
                  onClick={() => setSelectedGraphNode({ name: 'Vayu Dynamics Ltd', type: 'Bidder', status: 'ISOLATED_CLEAN', risk: 'Low (0.08)' })}
                  className="p-4 bg-white border-2 border-slate-300 rounded-2xl text-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-[10px] font-mono text-[#0062FF] font-bold block">BID-8902</span>
                  <span className="text-xs font-bold text-slate-800">Vayu Dynamics Ltd</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Independent Entity</span>
                </div>

              </div>

              {/* Node Inspector Drawer */}
              {selectedGraphNode && (
                <div className="w-full max-w-xl mt-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between text-xs animate-in fade-in duration-200">
                  <div>
                    <span className="font-bold text-[#111827]">{selectedGraphNode.name}</span>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                      Status: <strong className={selectedGraphNode.status.includes('FLAGGED') ? 'text-rose-700' : 'text-emerald-700'}>{selectedGraphNode.status}</strong> • Risk Score: {selectedGraphNode.risk}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGraphNode(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1"
                  >✕</button>
                </div>
              )}

            </div>
          </div>

          {/* Flagged Bidders Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-rose-50/40 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Bidders Flagged for High Risk Cartelization / Syndicate Clustering
              </span>
              <span className="text-xs font-mono text-rose-700">Algorithm: Connected Components & Jaccard &gt; 0.70</span>
            </div>

            <div className="divide-y divide-slate-100">
              {bidders.filter(b => b.collusionAlert).map(b => (
                <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-[#111827] text-sm">{b.companyName}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {b.id} • GSTIN: {b.gstin} • Director DIN shared with competing bidder (GreenVolt Power)
                    </div>
                  </div>
                  <button
                    onClick={() => setCollusionBidder(b)}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 transition-colors"
                  >
                    View Cluster Evidence
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: TENDER INGESTION & RULE CHECKLIST (SEC 7.1)       */}
      {/* ======================================================== */}
      {subTab === 'ingestion' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                    SECTION 7.1 SPECIFICATION
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200">
                    AUTONOMOUS NLP RULE PARSER
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#0062FF]" />
                  Tender Ingestion & Mandatory Rule Checklist Studio
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload Notice Inviting Tender (NIT/RFP) PDF. The NLP parser extracts eligibility thresholds, turnover gates, MII %, and maps them into verifiable checklists.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateStep(1);
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Launch NIT Ingestion Wizard
              </button>
            </div>

            {/* Current Tender Active Rules Overview */}
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Tender Value</span>
                  <span className="text-lg font-black text-[#111827]">{activeTender.estimatedValue}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">EMD: {activeTender.emdAmount}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Minimum Turnover Threshold</span>
                  <span className="text-lg font-black text-[#0062FF]">30% of contract (₹1.25 Cr)</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Last 3 Financial Years</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Make In India (MII) Preference</span>
                  <span className="text-lg font-black text-emerald-700">Class-I (Min. 50%)</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Public Procurement Order 2017</span>
                </div>
              </div>

              {/* Scoring Weights ($w_i$) Configuration Panel */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#0062FF]" />
                    Configured Technical Scoring Weightages ($\sum w_i = 100$):
                  </span>
                  <span className="font-mono text-[#0062FF] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                    Normalized: 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Turnover Weight ($w_1$)</span>
                      <span className="text-[#0062FF]">30%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#0062FF] h-1.5 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Experience Weight ($w_2$)</span>
                      <span className="text-[#0062FF]">30%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#0062FF] h-1.5 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Make in India ($w_3$)</span>
                      <span className="text-[#0062FF]">20%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#0062FF] h-1.5 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Certificates ($w_4$)</span>
                      <span className="text-[#0062FF]">20%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#0062FF] h-1.5 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Statutory Checklists */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Mandatory Gating Checklist Extracted from NIT:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeTender.mandatoryRequirements.map((req, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-slate-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: GOVERNMENT PORTAL ADAPTER FABRIC (SEC 7.5)       */}
      {/* ======================================================== */}
      {subTab === 'adapters' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                  SECTION 7.5 SPECIFICATION
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200">
                  5/5 ADAPTERS ONLINE
                </span>
              </div>
              <h3 className="text-base font-bold text-[#111827]">
                Government Portal Adapter Fabric & Real-time Resilience Gateway
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                Unified integration layer with external government registries: GSTN, Udyam MSME, NSDL Income Tax, MCA21 RoC, and GeM Central Debarment with Redis 24h caching and exponential backoff retry.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('Pinging all 5 statutory government portal adapters: All endpoints responding within 200ms threshold.');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-[#0062FF]" />
              Health Ping All Gateways
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adapterHealth.map((adapter, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111827] text-sm">{adapter.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {adapter.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-500 truncate">
                  Endpoint: <span className="text-slate-700">{adapter.endpoint}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Latency</span>
                    <span className="font-mono font-bold text-slate-700">{adapter.latency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cache Hit</span>
                    <span className="font-mono font-bold text-emerald-700">{adapter.cacheHitRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Last Sync</span>
                    <span className="font-mono text-slate-600">{adapter.lastSync}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fallback & Resilience Note */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0062FF]" />
              <strong>Circuit Breaker Status:</strong> Closed (Normal). If any portal has high latency, system gracefully serves verified 24h Redis snapshot without stalling evaluation.
            </span>
            <span className="font-mono font-bold text-slate-500">Zero Downtime Guarantee</span>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: AUDIT LEDGER (SHA-256 HASH CHAIN) (SEC 7.9)       */}
      {/* ======================================================== */}
      {subTab === 'ledger' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                  SECTION 7.9 SPECIFICATION
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200">
                  APPEND-ONLY IMMUTABLE LEDGER
                </span>
              </div>
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#0062FF]" />
                Cryptographic Append-Only Audit Ledger (SHA-256 Hash Chain)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every tender ingestion, OCR output, government adapter query, and officer override is cryptographically anchored.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleVerifyLedgerChain}
                disabled={isVerifyingChain}
                className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                {isVerifyingChain ? 'Computing Hashes...' : 'Verify Chain Mathematical Integrity'}
              </button>

              <button
                onClick={() => alert('Generating CAG-Compliant Audit Certificate PDF stamped with Merkle Root hash...')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-[#0062FF]" />
                Export CAG Certificate (PDF)
              </button>
            </div>
          </div>

          {/* Mathematical verification result banner */}
          {chainVerifiedStatus && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  MATHEMATICAL INTEGRITY 100% VERIFIED — 0 TAMPER INDICATORS DETECTED
                </span>
                <span className="font-mono text-emerald-700">Verified At: {chainVerifiedStatus.verifiedAt}</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-800">
                Merkle Root Hash: <span className="font-bold text-emerald-950">{chainVerifiedStatus.merkleRoot}</span>
              </div>
            </div>
          )}

          <div className="space-y-3 font-mono text-xs">
            {auditLedger.map((block, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0062FF] font-bold text-[11px] border border-blue-100">
                      Block #{block.blockIndex}
                    </span>
                    <span className="font-bold text-slate-800">{block.actionType}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{block.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400">Actor:</span> {block.actor}
                  </div>
                  <div>
                    <span className="text-slate-400">Current Block Hash:</span>{' '}
                    <span className="text-emerald-700 font-bold">{block.currentHash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400">Previous Hash:</span> {block.previousHash}
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400">Payload Hash:</span> {block.payloadHash}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EXPLAINABLE SCORING FORMULA BREAKDOWN MODAL (SEC 7.6)    */}
      {/* ======================================================== */}
      {scoreBreakdownBidder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] font-mono text-[10px] font-bold border border-blue-100">
                  SECTION 7.6 MATHEMATICAL FORMULATION
                </span>
                <h3 className="text-base font-black text-[#111827] mt-1">
                  Explainable Compliance Score Calculation: {scoreBreakdownBidder.companyName}
                </h3>
              </div>
              <button
                onClick={() => setScoreBreakdownBidder(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Formula Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Mathematical Engine Equation</span>
                <div className="text-base font-bold text-[#111827]">
                  Score_final = I_gating × ∑ (w_i · C_i)
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-sans">
                  If any mandatory gating criteria fails (e.g. Debarred, Forged document), I_gating = 0 and score instantly collapses to 0.
                </p>
              </div>

              {/* Gating Multiplier */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">Mandatory Statutory Gating (I_gating = 1)</span>
                  <span className="text-[11px] text-emerald-700">No debarment, active GSTIN, no critical forgery.</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold">PASS (1.0)</span>
              </div>

              {/* Itemized Weighted Parameters */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-white">
                <span className="font-bold text-slate-800 block text-xs mb-1">Itemized Factor Breakdown:</span>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-bold text-slate-700">1. Financial Turnover Compliance (w_1 = 30%)</span>
                    <span className="text-[10px] text-slate-500 block">Exemption applied: {scoreBreakdownBidder.exemptionStatus}</span>
                  </div>
                  <span className="font-mono font-bold text-[#0062FF]">28.2 / 30 pts</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-bold text-slate-700">2. Past Technical Experience (w_2 = 30%)</span>
                    <span className="text-[10px] text-slate-500 block">3 Completed projects verified</span>
                  </div>
                  <span className="font-mono font-bold text-[#0062FF]">27.8 / 30 pts</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-bold text-slate-700">3. Make in India Local Content (w_3 = 20%)</span>
                    <span className="text-[10px] text-slate-500 block">{scoreBreakdownBidder.type}</span>
                  </div>
                  <span className="font-mono font-bold text-[#0062FF]">19.5 / 20 pts</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-bold text-slate-700">4. Statutory Registry Verification (w_4 = 20%)</span>
                    <span className="text-[10px] text-slate-500 block">GSTN, MCA21, Udyam, Debarment</span>
                  </div>
                  <span className="font-mono font-bold text-[#0062FF]">18.5 / 20 pts</span>
                </div>
              </div>

              {/* Final Sum */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between font-bold">
                <span className="text-indigo-950">Aggregated Total Compliance Score:</span>
                <span className="text-lg font-mono text-[#0062FF]">{scoreBreakdownBidder.complianceScore} / 100</span>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setScoreBreakdownBidder(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Close Breakdown
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* GE-M 48-HOUR SHORTFALL CLARIFICATION NOTICE MODAL       */}
      {/* ======================================================== */}
      {shortfallBidder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold border border-amber-200">
                  GeM CLAUSE 4.2 SHORTFALL NOTICE
                </span>
                <h3 className="text-base font-black text-[#111827] mt-1">
                  Issue Shortfall Notice to {shortfallBidder.companyName}
                </h3>
              </div>
              <button
                onClick={() => setShortfallBidder(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {shortfallSuccessMessage ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-center font-bold space-y-1">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div>{shortfallSuccessMessage}</div>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    Under GeM and CPPP public procurement guidelines, bidders with minor document discrepancies are afforded a legal rectification window before final disqualification.
                  </p>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Reason for Shortfall / Clarification Required:
                    </label>
                    <textarea
                      rows={3}
                      value={shortfallNoticeText}
                      onChange={(e) => setShortfallNoticeText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0062FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Rectification Window (Hours):
                    </label>
                    <select
                      value={shortfallDeadlineHours}
                      onChange={(e) => setShortfallDeadlineHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                    >
                      <option value={24}>24 Hours (Fast-Track Tender)</option>
                      <option value={48}>48 Hours (GeM Standard Guideline)</option>
                      <option value={72}>72 Hours (Extended Clarification)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {!shortfallSuccessMessage && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShortfallBidder(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleIssueShortfall}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Clarification Notice
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE NEW BID (NIT INGESTION) MODAL (SEC 7.1)          */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-semibold border border-blue-100">
                  Tender Ingestion & Rule Checklist Studio (Sec 7.1)
                </span>
                <h3 className="text-lg font-black text-[#111827] mt-2">
                  Create New Bid / Ingest NIT Specification Document
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload Notice Inviting Tender (NIT/RFP) PDF. AI parser will automatically extract rules, thresholds, and mandatory checklists.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={createStep >= 1 ? 'text-[#0062FF]' : 'text-slate-400'}>1. Upload NIT PDF</span>
                <span className="text-slate-300">→</span>
                <span className={createStep >= 2 ? 'text-[#0062FF]' : 'text-slate-400'}>2. AI NLP Extraction</span>
                <span className="text-slate-300">→</span>
                <span className={createStep >= 3 ? 'text-[#0062FF]' : 'text-slate-400'}>3. Checklist & Gate Rules</span>
              </div>

              {createStep === 1 && (
                <div className="space-y-4">
                  <div 
                    onClick={handleSimulateParsing}
                    className="border-2 border-dashed border-blue-200 hover:border-[#0062FF] rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all"
                  >
                    <UploadCloud className="w-10 h-10 text-[#0062FF] mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-[#111827]">Click or drag NIT / RFP document here</h4>
                    <p className="text-xs text-slate-500 mt-1">Accepted: PDF up to 50MB (GeM Standard NIT / CPPP RFP)</p>
                    <div className="mt-4">
                      <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#0062FF] text-xs font-bold border border-blue-200">
                        ⚡ Click to Auto-Load Sample 100MW Solar NIT Document
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-700">Preset Detected NIT Parameters:</div>
                    <div className="text-slate-600">Title: <span className="text-slate-900 font-semibold">{newTenderData.title}</span></div>
                    <div className="text-slate-600">Authority: <span className="text-slate-900 font-semibold">{newTenderData.organisation}</span></div>
                    <div className="text-slate-600">Est. Value: <span className="text-[#0062FF] font-mono font-bold">{newTenderData.estimatedValue}</span></div>
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <div className="py-8 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0062FF] flex items-center justify-center mx-auto animate-spin">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111827]">PyMuPDF & AI Extraction In Progress...</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Scanning contract clauses, financial turnover equations, Make-in-India percentages, and statutory certificates manifest.
                  </p>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div 
                      className="bg-[#0062FF] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${parsingProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#0062FF] font-bold">{parsingProgress}% completed</span>
                </div>
              )}

              {createStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-800 font-medium">
                      AI successfully parsed 5 eligibility rules and 2 statutory exemptions from NIT text.
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                        Tender Title
                      </label>
                      <input
                        type="text"
                        value={newTenderData.title}
                        onChange={(e) => setNewTenderData({ ...newTenderData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0062FF]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                          Estimated Value (INR)
                        </label>
                        <input
                          type="text"
                          value={newTenderData.estimatedValue}
                          onChange={(e) => setNewTenderData({ ...newTenderData, estimatedValue: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                          EMD Amount (INR)
                        </label>
                        <input
                          type="text"
                          value={newTenderData.emdAmount}
                          onChange={(e) => setNewTenderData({ ...newTenderData, emdAmount: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Weightage Sliders */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Technical Scoring Weightages (Normalized $\sum w_i = 100$):</span>
                        <span className="font-mono text-[#0062FF]">100% Total</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>Turnover: {newTenderData.turnoverWeightage}%</div>
                        <div>Experience: {newTenderData.experienceWeightage}%</div>
                        <div>Make-in-India: {newTenderData.miiWeightage}%</div>
                        <div>Certificates: {newTenderData.certWeightage}%</div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <span className="text-xs font-bold text-slate-800 block">Statutory Preferential Exemptions:</span>
                      <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                        <span>Allow MSME Turnover & EMD Waiver (MSE Order 2012)</span>
                        <input 
                          type="checkbox" 
                          checked={newTenderData.allowMsmeExemption}
                          onChange={(e) => setNewTenderData({ ...newTenderData, allowMsmeExemption: e.target.checked })}
                          className="rounded text-[#0062FF] focus:ring-0" 
                        />
                      </label>
                      <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                        <span>Allow DPIIT Startup Exemption (Turnover & Prior Experience)</span>
                        <input 
                          type="checkbox" 
                          checked={newTenderData.allowStartupExemption}
                          onChange={(e) => setNewTenderData({ ...newTenderData, allowStartupExemption: e.target.checked })}
                          className="rounded text-[#0062FF] focus:ring-0" 
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-800 block mb-1.5">
                        Mandatory Document Checklist for Bidders:
                      </span>
                      <div className="space-y-1.5">
                        {newTenderData.mandatoryDocs.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#0062FF]" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>

              {createStep === 3 ? (
                <button
                  type="button"
                  onClick={handlePublishNewTender}
                  className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sign with DSC & Publish Tender
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulateParsing}
                  className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center gap-2"
                >
                  Parse NIT & Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COLLUSION NETWORK GRAPH MODAL (SEC 7.7)                  */}
      {/* ======================================================== */}
      {collusionBidder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[#111827]">
                  Cartel Ring Analysis: {collusionBidder.companyName}
                </h3>
              </div>
              <button
                onClick={() => setCollusionBidder(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  Cluster #C-104: Shared DIN & IP Submission Ring
                </div>
                <p className="leading-relaxed">
                  The NetworkX bipartite graph detected a direct shared director connection (DIN: 08912441) between <strong>{collusionBidder.companyName}</strong> and competing bidder <strong>GreenVolt Power Systems Pvt Ltd</strong>. Both submissions occurred within 4 minutes from identical IP subnet.
                </p>
              </div>

              {/* Visual Nodes Simulation */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center gap-8 flex-wrap justify-center">
                  <div className="p-4 bg-white border-2 border-[#0062FF] rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] font-mono text-[#0062FF] font-bold block">{collusionBidder.id}</span>
                    <span className="text-xs font-bold text-slate-800">{collusionBidder.companyName}</span>
                  </div>

                  <div className="p-3 bg-amber-100 text-amber-900 rounded-xl font-mono text-xs font-bold border border-amber-300">
                    🔗 Shared DIN: 08912441
                  </div>

                  <div className="p-4 bg-white border-2 border-rose-500 rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] font-mono text-rose-600 font-bold block">BID-8904</span>
                    <span className="text-xs font-bold text-slate-800">GreenVolt Power Systems Pvt Ltd</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-mono text-center">
                  Bipartite Centrality Score: 0.89 • High Syndicate Risk
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setCollusionBidder(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AIR-GAPPED OFFICER AI ASSISTANT (RAG CHATBOT DOCK)      */}
      {/* ======================================================== */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062FF] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">PRAMAN AI Officer Co-Pilot</h4>
                <p className="text-[10px] text-emerald-700 font-mono">Air-Gapped Sovereign RAG (Llama-3)</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="p-4 h-72 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#0062FF] text-white rounded-br-none shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-mono text-[11px] shadow-2xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => handleSendChat('Is Solarix eligible for MSME waiver?')}
              className="px-2 py-1 rounded bg-slate-100 text-[#0062FF] border border-slate-200 whitespace-nowrap hover:bg-slate-200 font-medium"
            >
              MSME Waiver Check?
            </button>
            <button
              onClick={() => handleSendChat('Why was Apex flagged for collusion?')}
              className="px-2 py-1 rounded bg-slate-100 text-[#0062FF] border border-slate-200 whitespace-nowrap hover:bg-slate-200 font-medium"
            >
              Apex Collusion Ring?
            </button>
            <button
              onClick={() => handleSendChat('Show Photoshop tampering on GreenVolt')}
              className="px-2 py-1 rounded bg-slate-100 text-[#0062FF] border border-slate-200 whitespace-nowrap hover:bg-slate-200 font-medium"
            >
              GreenVolt Forgery?
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask about NIT rules, documents, or bids..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0062FF]"
            />
            <button
              type="button"
              onClick={() => handleSendChat()}
              className="p-2 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default OfficerDashboard;
