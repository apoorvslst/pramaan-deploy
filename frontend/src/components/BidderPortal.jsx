import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  CreditCard, 
  User, 
  Building, 
  Lock, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Search, 
  Hash, 
  LogOut, 
  MapPin, 
  Download, 
  Database,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Layers
} from './Icons';

// ==========================================
// 1. BIDDER MOCK DATA & CONSTANTS
// ==========================================

const defaultBidderProfile = {
  name: "Rajendra Mehta",
  email: "rajendra.mehta@solarixgreen.com",
  phone: "+91-98110-44281",
  companyName: "Solarix Green Energy Solutions Pvt Ltd",
  designation: "Procurement Manager",
  registeredSince: "2024-03-15",
  gemSellerId: "GEM-VEND-2024-8841",
  panNumber: "AAACS9981F",
  gstinNumber: "07AAACS9981F1Z2",
  udyamNumber: "UDYAM-DL-03-0049281",
  entityType: "Micro Enterprise (MSME) + Class-I Local Supplier (68% MII)",
};

const defaultAvailableTenders = [
  {
    id: "GEM/2026/B/849201",
    title: "Supply, Installation & Commissioning of 500kW Solar Grid Inverters & Transformers",
    organisation: "NTPC Limited - Renewable Energy Division",
    publishedDate: "2026-09-15",
    closingDate: "2026-09-28",
    estimatedValue: "₹4,20,00,000",
    category: "Solar & Renewable Power Equipment",
    emdAmount: "₹8,40,000",
    emdExemption: "MSME/Startup Exempt",
    location: "Bhadla Solar Park, Rajasthan",
    mandatoryDocs: [
      "CA Certified Turnover Certificate (3-Year Average >= ₹1.25 Cr)",
      "OEM Authorization Letter for Grid Inverters",
      "Previous Work Experience Certificate",
      "EMD / Bid Security Declaration (Form-II)",
    ],
    eligibilityMatch: {
      isEligible: true,
      msmeWaiver: "Applicable (EMD Waived to ₹0, Turnover Waived)",
      miiMatch: "68% Content (Meets Min 50% Threshold)",
      debarmentStatus: "CLEAN (No Blacklisting)",
    },
    status: "OPEN",
    totalBidders: 12,
    daysLeft: 2,
  },
  {
    id: "GEM/2026/B/851044",
    title: "Procurement of 10,000 LED Street Light Luminaires with Smart Controls",
    organisation: "Chandigarh Smart City Ltd",
    publishedDate: "2026-09-18",
    closingDate: "2026-10-05",
    estimatedValue: "₹2,85,00,000",
    category: "Smart City Infrastructure",
    emdAmount: "₹5,70,000",
    emdExemption: "MSME/Startup Exempt",
    location: "Chandigarh, Punjab",
    mandatoryDocs: [
      "BIS Certification for LED Luminaires",
      "CA Certified Turnover Certificate",
      "Installation Completion Certificates (Min 3 Projects)",
      "EMD / Bid Security Declaration",
    ],
    eligibilityMatch: {
      isEligible: true,
      msmeWaiver: "Applicable (MSE Order 2012)",
      miiMatch: "55% Content (Compliant)",
      debarmentStatus: "CLEAN",
    },
    status: "OPEN",
    totalBidders: 8,
    daysLeft: 9,
  },
  {
    id: "GEM/2026/B/847990",
    title: "Annual Maintenance Contract for 250kW Rooftop Solar Plant",
    organisation: "Indian Oil Corporation Ltd (IOCL)",
    publishedDate: "2026-09-10",
    closingDate: "2026-09-25",
    estimatedValue: "₹48,00,000",
    category: "Solar Maintenance Services",
    emdAmount: "₹96,000",
    emdExemption: "None",
    location: "Mathura Refinery, UP",
    mandatoryDocs: [
      "Technical Manpower Certificate",
      "CA Certified Turnover Certificate",
      "Previous AMC Completion Certificates",
    ],
    eligibilityMatch: {
      isEligible: false,
      msmeWaiver: "Tender Specific Waiver Restricted",
      miiMatch: "N/A",
      debarmentStatus: "CLEAN",
    },
    status: "CLOSED",
    totalBidders: 6,
    daysLeft: 0,
  },
];

const defaultMyBids = [
  {
    id: "BID-8901",
    tenderId: "GEM/2026/B/849201",
    tenderTitle: "Supply, Installation & Commissioning of 500kW Solar Grid Inverters & Transformers",
    organisation: "NTPC Limited - Renewable Energy Division",
    submittedAt: "2026-09-22 14:30 IST",
    status: "VERIFIED",
    complianceScore: 94,
    aiRecommendation: "QUALIFIED",
    rectificationRequired: false,
    uploadedDocuments: [
      { name: "CA Turnover Certificate FY2024-25.pdf", status: "VERIFIED", type: "CA Turnover Cert", sha256: "0x89ab...c12d", confidence: "98.8%" },
      { name: "OEM Authorization - Sungrow Power.pdf", status: "VERIFIED", type: "OEM Auth", sha256: "0x12ef...45aa", confidence: "99.2%" },
      { name: "Work Order - Tata Power Solar 150kW.pdf", status: "VERIFIED", type: "Experience Cert", sha256: "0x98bc...77ff", confidence: "97.5%" },
      { name: "Bid Security Declaration (MSME Form).pdf", status: "VERIFIED", type: "EMD Exemption", sha256: "0x44dd...11ee", confidence: "100%" },
    ],
    activityLog: [
      { timestamp: "2026-09-22 14:30", event: "Bid package submitted with client-side SHA-256 fingerprint", type: "SUBMIT" },
      { timestamp: "2026-09-22 14:31", event: "Smart Pre-Flight checks passed: 0 encryption locks, DPI > 300 verified", type: "PREFLIGHT" },
      { timestamp: "2026-09-22 14:32", event: "PaddleOCR spatial parsing completed with 98.4% average accuracy", type: "OCR" },
      { timestamp: "2026-09-22 14:33", event: "GSTN Portal Live Adapter: ACTIVE_VERIFIED (07AAACS9981F1Z2)", type: "PORTAL" },
      { timestamp: "2026-09-22 14:34", event: "Udyam Registry: MSME Micro enterprise verified, EMD exemption granted", type: "PORTAL" },
      { timestamp: "2026-09-22 14:35", event: "PyMuPDF Forensics: CLEAN_PASS — No software tampering or font anomaly", type: "FORENSIC" },
      { timestamp: "2026-09-22 14:35", event: "Compliance Score Evaluated: 94/100 (QUALIFIED FOR L1 REVERSE AUCTION)", type: "SCORE" },
      { timestamp: "2026-09-22 14:35", event: "Immutable block #102 appended to GeM Audit Ledger (SHA-256 Sealed)", type: "LEDGER" },
    ],
  },
  {
    id: "BID-9102",
    tenderId: "GEM/2026/B/851044",
    tenderTitle: "Procurement of 10,000 LED Street Light Luminaires with Smart Controls",
    organisation: "Chandigarh Smart City Ltd",
    submittedAt: "2026-09-25 09:15 IST",
    status: "NEEDS_REVIEW",
    complianceScore: 78,
    aiRecommendation: "NEEDS_REVIEW",
    rectificationRequired: true,
    rectificationNotice: "BIS Certificate is valid but UDIN number on CA Certificate has a slight digit scan blur. Please re-upload high-DPI CA Certificate before 2026-10-05.",
    uploadedDocuments: [
      { name: "BIS Certificate - Model SLX-200W.pdf", status: "VERIFIED", type: "BIS Certificate", sha256: "0xaa44...88ff", confidence: "99.1%" },
      { name: "CA Turnover Certificate Scan.pdf", status: "NEEDS_REVIEW", type: "CA Turnover Cert", sha256: "0xbb55...99ee", confidence: "82.4%" },
    ],
    activityLog: [
      { timestamp: "2026-09-25 09:15", event: "Bid package submitted, 2 of 4 documents uploaded", type: "SUBMIT" },
      { timestamp: "2026-09-25 09:16", event: "PaddleOCR flagged UDIN stamp digit variance (82% confidence)", type: "OCR" },
      { timestamp: "2026-09-25 09:17", event: "Status set to NEEDS_REVIEW: Rectification request dispatched to bidder", type: "REVIEW" },
    ],
  },
];

// ==========================================
// 2. SUB-COMPONENT: BIDDER LOGIN
// ==========================================

function BidderLogin({ onLogin }) {
  const [gemId, setGemId] = useState('GEM-VEND-2024-8841');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        id: gemId,
        name: defaultBidderProfile.name,
        email: defaultBidderProfile.email,
        company: defaultBidderProfile.companyName,
        designation: defaultBidderProfile.designation,
        role: 'Authorized Bidder',
      });
    }, 400);
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        id: 'GEM-VEND-2024-8841',
        name: defaultBidderProfile.name,
        email: defaultBidderProfile.email,
        company: defaultBidderProfile.companyName,
        designation: defaultBidderProfile.designation,
        role: 'Authorized Bidder',
      });
    }, 200);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0062FF] to-[#00D4B2] flex items-center justify-center text-white shadow-sm mb-3">
            <Building className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-semibold border border-blue-100 mb-2">
            GeM Seller & Bidder Portal
          </span>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">Bidder Authentication</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Sign in with your GeM Seller credentials to complete one-time identity verification and submit bids.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              GeM Seller ID / Registration No.
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={gemId}
                onChange={(e) => setGemId(e.target.value)}
                placeholder="e.g. GEM-VEND-2024-8841"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0062FF] font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password / DSC PIN
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0062FF] font-mono"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#0062FF] focus:ring-0" />
              <span>Remember DSC token</span>
            </label>
            <span className="text-[#0062FF] font-semibold hover:underline cursor-pointer">
              Forgot DSC PIN?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-sm shadow-sm hover:shadow active:scale-98 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating with GeM...
              </span>
            ) : (
              <>
                Sign In to Bidder Workspace
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center relative z-10">
          <p className="text-xs text-slate-500 mb-3">Quick Demo Authentication:</p>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0062FF] text-xs font-semibold border border-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            1-Click Demo Login as Solarix Green Pvt Ltd
          </button>
        </div>

        <div className="mt-5 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by GeM 256-bit DSC Token & NIC Gateway</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. SUB-COMPONENT: BIDDER ONE-TIME KYC
// ==========================================

function BidderKYC({ kycState, onVerifyKyc, onContinueToBids }) {
  const [docs, setDocs] = useState(kycState?.documents || [
    {
      id: 'aadhaar',
      name: 'Aadhaar Card',
      desc: 'Government 12-digit Unique Identification Authority of India (UIDAI) ID',
      file: null,
      status: 'PENDING',
      number: '•••• •••• 9812',
    },
    {
      id: 'pan',
      name: 'PAN Card',
      desc: 'Income Tax Department Permanent Account Number for corporate / proprietor tax entity',
      file: null,
      status: 'PENDING',
      number: 'AAECS8912P',
    },
    {
      id: 'gstin',
      name: 'GSTIN Registration',
      desc: 'Goods & Services Tax Identification Number (Live GST Portal sync)',
      file: null,
      status: 'PENDING',
      number: '08AAECS8912P1ZR',
    },
    {
      id: 'udyam',
      name: 'Udyam / MSME Certificate',
      desc: 'Ministry of MSME Enterprise Registration Certificate (EMD Exemption eligibility)',
      file: null,
      status: 'PENDING',
      number: 'UDYAM-RJ-14-0029144',
    }
  ]);

  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [isVerified, setIsVerified] = useState(kycState?.isVerified || false);

  const steps = [
    'Computing SHA-256 cryptographic hashes for document authenticity...',
    'Running PaddleOCR spatial extraction on Aadhaar & PAN text fields...',
    'Performing biometric & anti-tamper forensics check (PyMuPDF / Exif)...',
    'Cross-referencing UIDAI, NSDL Income Tax & GSTN live portal registries...',
    'One-Time KYC verified! Appending identity verification block to ledger.'
  ];

  const handleSimulateUpload = (docId) => {
    setDocs(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          file: `${d.name}_Scanned_Document.pdf`,
          status: 'UPLOADED'
        };
      }
      return d;
    }));
  };

  const handleAutoFillAll = () => {
    setDocs(prev => prev.map(d => ({
      ...d,
      file: `${d.name}_Verified_Copy.pdf`,
      status: 'UPLOADED'
    })));
  };

  const handleStartVerification = () => {
    setVerifying(true);
    setVerificationStep(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < steps.length) {
        setVerificationStep(current);
      } else {
        clearInterval(interval);
        setVerifying(false);
        setIsVerified(true);
        setDocs(prev => prev.map(d => ({ ...d, status: 'VERIFIED' })));
        if (onVerifyKyc) {
          onVerifyKyc({
            isVerified: true,
            verifiedAt: new Date().toLocaleTimeString(),
            documents: docs.map(d => ({ ...d, status: 'VERIFIED' }))
          });
        }
      }
    }, 600);
  };

  const allUploaded = docs.filter(d => d.id === 'aadhaar' || d.id === 'pan').every(d => d.file !== null);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-50/60 to-cyan-50/40 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                STAGE 1 / 4
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isVerified 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {isVerified ? '✓ ONE-TIME KYC VERIFIED' : 'ONE-TIME KYC VERIFICATION REQUIRED'}
              </span>
            </div>
            
            <h2 className="text-xl lg:text-2xl font-black text-[#111827] tracking-tight">
              Bidder Identity & Master Statutory KYC Gate
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              In accordance with GeM Procurement Norms & Section 7.2 of PRAMAN specification, every vendor must complete a one-time automated identity verification by uploading mandatory documents (<strong className="text-[#0062FF]">Aadhaar Card</strong> & <strong className="text-[#0062FF]">PAN Card</strong>). Once verified by AI, all live tenders and pre-flight submissions will be unlocked.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {!isVerified && (
              <button
                type="button"
                onClick={handleAutoFillAll}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0062FF] text-xs font-semibold border border-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#0062FF]" />
                Auto-attach Sample Docs
              </button>
            )}

            {isVerified && (
              <button
                type="button"
                onClick={onContinueToBids}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                Browse & Apply for Tenders
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification In Progress Card */}
      {verifying && (
        <div className="bg-white border-2 border-indigo-400 rounded-2xl p-6 shadow-md relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062FF] flex items-center justify-center animate-spin">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">AI Engine Processing Documents</h4>
              <p className="text-xs text-[#0062FF] font-mono">Stage {verificationStep + 1} of {steps.length}</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-4 border border-slate-200">
            <div 
              className="bg-[#0062FF] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${((verificationStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <p className="text-xs text-slate-700 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0062FF] animate-ping" />
            {steps[verificationStep]}
          </p>
        </div>
      )}

      {/* Document Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {docs.map((doc) => {
          const isMandatory = doc.id === 'aadhaar' || doc.id === 'pan';
          const isDocVerified = doc.status === 'VERIFIED';
          const isDocUploaded = doc.status === 'UPLOADED' || doc.file !== null;

          return (
            <div
              key={doc.id}
              className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${
                isDocVerified 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : isDocUploaded 
                    ? 'border-indigo-300' 
                    : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDocVerified 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-blue-50 text-[#0062FF] border border-blue-100'
                  }`}>
                    {doc.id === 'aadhaar' && <User className="w-5 h-5" />}
                    {doc.id === 'pan' && <CreditCard className="w-5 h-5" />}
                    {doc.id === 'gstin' && <Building className="w-5 h-5" />}
                    {doc.id === 'udyam' && <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827]">{doc.name}</h3>
                      {isMandatory && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">ID: {doc.number}</span>
                  </div>
                </div>

                <div>
                  {isDocVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : isDocUploaded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#0062FF] font-semibold text-xs border border-blue-200">
                      Ready for Check
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                      Not Uploaded
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4">{doc.desc}</p>

              {doc.file ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-5 h-5 text-[#0062FF] flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-mono font-medium text-slate-800 truncate">{doc.file}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {isDocVerified ? 'Hash: 0x93e4b...verified' : 'Ready for AI parsing'}
                      </p>
                    </div>
                  </div>
                  {!isVerified && (
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload(doc.id)}
                      className="text-xs text-[#0062FF] font-semibold hover:underline ml-2"
                    >
                      Replace
                    </button>
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => handleSimulateUpload(doc.id)}
                  className="border-2 border-dashed border-slate-200 hover:border-[#0062FF] rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Click to upload or drag & drop</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG (Max 10MB)</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action footer */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062FF] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#111827]">Automated Cross-Verification Engine</h4>
            <p className="text-xs text-slate-500">
              {allUploaded 
                ? 'Mandatory Aadhaar & PAN attached. Ready to run AI compliance check.' 
                : 'Please attach both Aadhaar and PAN documents to activate verification.'}
            </p>
          </div>
        </div>

        {!isVerified ? (
          <button
            type="button"
            disabled={!allUploaded || verifying}
            onClick={handleStartVerification}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {verifying ? 'AI Verification in Progress...' : 'Verify Aadhaar & PAN via AI'}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              KYC Status: Verified (ID #KYC-GEM-9941)
            </span>
            <button
              type="button"
              onClick={onContinueToBids}
              className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              Continue to Available Bids
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

// ==========================================
// 4. SUB-COMPONENT: SMART PRE-FLIGHT VALIDATOR (SEC 7.2)
// ==========================================

function BidderSmartPreFlight() {
  const [testFile, setTestFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleSimulatePreFlight = (fileName = 'CA_Turnover_Certificate_FY24.pdf') => {
    setTestFile(fileName);
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        fileName: fileName,
        fileSizeBytes: '2.4 MB (Under 15MB limit)',
        mimeType: 'application/pdf (Valid PDF/A standard)',
        sha256Hash: '0x8f3c7e1b9a22d41088bc012e55aa91bc44f0e21a8899cc334411eedd8822ff99',
        encryptionStatus: 'UNENCRYPTED (No password protection lock)',
        dpiClarity: '340 DPI (High readability - exceeds 200 DPI minimum)',
        pageCount: 3,
        readabilityScore: '99.2%',
        checks: [
          { name: 'Client-side Web Crypto SHA-256 Fingerprint', passed: true, note: 'Non-repudiation hash generated' },
          { name: 'Password / DRM Protection Detection', passed: true, note: 'No decryption password required' },
          { name: 'Blank / Corrupt PDF Page Check', passed: true, note: 'All 3 pages render valid text & vector tables' },
          { name: 'Resolution & Spatial DPI Check', passed: true, note: '340 DPI clear scan, optimal for PaddleOCR' },
          { name: 'ExifTool & Metadata Tamper Pre-Check', passed: true, note: 'No Adobe Photoshop or Canva traces' },
        ]
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                SECTION 7.2 MODULE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                CLIENT-SIDE SANITY ENGINE
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-[#111827] tracking-tight">
              Smart Upload Pre-Flight Document Validator
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Before submitting bids to government servers, run this client-side pre-flight test. It computes a client SHA-256 fingerprint, verifies zero password-locks, and ensures your certificate will not be rejected due to corruption or DPI blur.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleSimulatePreFlight('CA_Turnover_Certificate_FY24.pdf')}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0062FF] text-xs font-semibold border border-slate-200 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-[#0062FF]" />
            Test Sample Certificate
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div 
        onClick={() => handleSimulatePreFlight('OEM_Authorization_Sungrow.pdf')}
        className="bg-white border-2 border-dashed border-blue-200 hover:border-[#0062FF] rounded-2xl p-8 text-center cursor-pointer shadow-sm hover:shadow transition-all"
      >
        <UploadCloud className="w-10 h-10 text-[#0062FF] mx-auto mb-2" />
        <h4 className="text-sm font-bold text-[#111827]">Drop any PDF certificate to run instant Pre-Flight diagnostics</h4>
        <p className="text-xs text-slate-500 mt-1">
          Validates SHA-256, DPI clarity, PDF encryption lock, and format compliance in browser memory.
        </p>
        <div className="mt-4">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0062FF] text-xs font-bold border border-blue-200">
            ⚡ Click to Test OEM Authorization Letter (2.1 MB)
          </span>
        </div>
      </div>

      {/* Scanning status */}
      {isScanning && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0062FF] border-t-transparent animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-[#111827]">Running Client-Side Web Crypto & PDF Sanitization...</h4>
          <p className="text-xs text-slate-500 font-mono">Hashing bytes: window.crypto.subtle.digest('SHA-256')</p>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                ✓ ALL PRE-FLIGHT CHECKS PASSED
              </span>
              <h3 className="text-base font-bold text-[#111827] mt-1">{scanResult.fileName}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">SHA-256: {scanResult.sha256Hash}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Clarity Score</span>
                <span className="text-base font-black text-emerald-700 font-mono">{scanResult.readabilityScore}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Checks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scanResult.checks.map((check, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">{check.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{check.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-indigo-950 font-medium">
            <span>Certificate is 100% compliant and ready for GeM tender submission without rejection risk.</span>
            <span className="text-[#0062FF] font-bold font-mono">Pre-Flight Pass ID #PF-9912</span>
          </div>

        </div>
      )}

    </div>
  );
}

// ==========================================
// 5. SUB-COMPONENT: BIDDER TENDER BROWSER & UPLOAD
// ==========================================

function BidderTenderBrowser({ onBidSubmitted }) {
  const [tenders] = useState(defaultAvailableTenders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTenderModal, setActiveTenderModal] = useState(null);

  const [tenderDocs, setTenderDocs] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);

  const categories = ['ALL', 'Solar & Renewable Power Equipment', 'Smart City Infrastructure', 'Solar Maintenance Services'];

  const filteredTenders = tenders.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.organisation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenBidModal = (tender) => {
    setActiveTenderModal(tender);
    const initialDocs = {};
    tender.mandatoryDocs.forEach((docName, index) => {
      initialDocs[index] = {
        name: docName,
        fileName: null,
        status: 'EMPTY',
      };
    });
    setTenderDocs(initialDocs);
  };

  const handleAttachSampleDoc = (index) => {
    setTenderDocs(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        fileName: `${prev[index].name.replace(/[^a-zA-Z0-9]/g, '_')}_Signed.pdf`,
        status: 'READY',
      }
    }));
  };

  const handleAutoFillAllBidDocs = () => {
    if (!activeTenderModal) return;
    const filledDocs = {};
    activeTenderModal.mandatoryDocs.forEach((docName, index) => {
      filledDocs[index] = {
        name: docName,
        fileName: `${docName.replace(/[^a-zA-Z0-9]/g, '_')}_Verified.pdf`,
        status: 'READY',
      };
    });
    setTenderDocs(filledDocs);
  };

  const handleSubmitBid = () => {
    setIsSubmitting(true);
    setSubmissionProgress(25);

    setTimeout(() => setSubmissionProgress(60), 350);
    setTimeout(() => setSubmissionProgress(90), 700);

    setTimeout(() => {
      setIsSubmitting(false);
      const newBid = {
        id: `BID-${Math.floor(1000 + Math.random() * 9000)}`,
        tenderId: activeTenderModal.id,
        tenderTitle: activeTenderModal.title,
        organisation: activeTenderModal.organisation,
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: 'VERIFIED',
        complianceScore: 94,
        aiRecommendation: 'QUALIFIED',
        rectificationRequired: false,
        uploadedDocuments: Object.values(tenderDocs).map(d => ({
          name: d.fileName || d.name,
          status: 'VERIFIED',
          type: d.name,
          sha256: '0x' + Math.random().toString(16).substring(2, 10) + '...verified',
          confidence: '98.5%'
        })),
        activityLog: [
          { timestamp: 'Just now', event: 'Bid package submitted with client-side SHA-256 fingerprint', type: 'SUBMIT' },
          { timestamp: 'Just now', event: 'Pre-flight checks passed: Valid PDF/A, 0 password locks', type: 'PREFLIGHT' },
          { timestamp: 'Just now', event: 'PaddleOCR spatial parsing completed with 98.4% confidence', type: 'OCR' },
          { timestamp: 'Just now', event: 'PyMuPDF tamper forensic analysis: PASS (0 font or metadata anomalies)', type: 'FORENSIC' },
          { timestamp: 'Just now', event: 'Compliance Score Evaluated: 94/100 (QUALIFIED)', type: 'SCORE' },
          { timestamp: 'Just now', event: 'Block appended to GeM Audit Ledger (SHA-256 Anchored)', type: 'LEDGER' }
        ]
      };

      setActiveTenderModal(null);
      if (onBidSubmitted) {
        onBidSubmitted(newBid);
      }
    }, 1100);
  };

  const isAllUploaded = activeTenderModal && 
    activeTenderModal.mandatoryDocs.every((_, idx) => tenderDocs[idx]?.fileName);

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenders by ID, title, or authority..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0062FF]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0062FF] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Tenders' : cat.split(' ')[0]}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Tender Cards */}
      <div className="grid grid-cols-1 gap-5">
        {filteredTenders.map((tender) => {
          const isOpen = tender.status === 'OPEN';

          return (
            <div
              key={tender.id}
              className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                      {tender.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                      isOpen 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {isOpen ? 'ACTIVE BIDDING' : 'BID CLOSED'}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {isOpen ? `${tender.daysLeft} days remaining` : 'Closed'}
                    </span>
                  </div>

                  <h3 className="text-base lg:text-lg font-bold text-[#111827] tracking-tight">
                    {tender.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {tender.organisation}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {tender.location}
                    </span>
                    <span className="font-semibold text-[#0062FF]">
                      Est. Value: {tender.estimatedValue}
                    </span>
                    <span className="font-semibold text-amber-700">
                      EMD: {tender.emdAmount} ({tender.emdExemption})
                    </span>
                  </div>

                  {/* Real-time statutory eligibility calculator banner */}
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111827] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#0062FF]" />
                        Statutory Eligibility Assessment for Your Firm:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ELIGIBLE TO BID
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                      <div>• EMD Waiver: <strong className="text-emerald-700">₹0 (MSME Micro Exempt)</strong></div>
                      <div>• MII Local Content: <strong className="text-slate-800">68% &gt; 50% Req</strong></div>
                      <div>• Debarment Check: <strong className="text-emerald-700">Clean Pass</strong></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Mandatory Documents Checklist:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tender.mandatoryDocs.map((doc, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[11px] border border-slate-200 font-mono">
                          📄 {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  <span className="text-xs text-slate-500 font-mono">
                    Total Bidders: <strong className="text-slate-800 font-bold">{tender.totalBidders}</strong>
                  </span>
                  
                  {isOpen ? (
                    <button
                      type="button"
                      onClick={() => handleOpenBidModal(tender)}
                      className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Upload Documents & Apply
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                    >
                      Bidding Window Expired
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Bid Documents Modal */}
      {activeTenderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                  {activeTenderModal.id}
                </span>
                <h3 className="text-lg font-bold text-[#111827] mt-1">
                  Upload Tender Documents for Pre-Flight & Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTenderModal.title} • {activeTenderModal.organisation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTenderModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-800 font-medium">
                    One-Time Identity KYC (Aadhaar & PAN) verified
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillAllBidDocs}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white text-[#0062FF] border border-blue-200 hover:bg-blue-50 font-semibold"
                >
                  ⚡ Auto-Attach Demo Docs
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Remaining Bid Specific Documents:
                </p>

                {activeTenderModal.mandatoryDocs.map((docName, idx) => {
                  const currentDoc = tenderDocs[idx];
                  const hasFile = currentDoc?.fileName;

                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl p-3.5 transition-all ${
                        hasFile 
                          ? 'border-indigo-300 bg-blue-50/20' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className={`w-5 h-5 flex-shrink-0 ${hasFile ? 'text-[#0062FF]' : 'text-slate-400'}`} />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">{docName}</p>
                            {hasFile ? (
                              <p className="text-[11px] font-mono text-[#0062FF] truncate">{currentDoc.fileName}</p>
                            ) : (
                              <p className="text-[11px] text-slate-400">Required format: PDF (Max 15MB)</p>
                            )}
                          </div>
                        </div>

                        <div>
                          {hasFile ? (
                            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                              Attached
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAttachSampleDoc(idx)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200"
                            >
                              Upload File
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isSubmitting && (
                <div className="bg-slate-50 border border-blue-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#0062FF] font-mono font-semibold flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Computing Hashes & Running PaddleOCR + Forensics Check...
                    </span>
                    <span className="text-slate-500 font-mono font-bold">{submissionProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#0062FF] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${submissionProgress}%` }}
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveTenderModal(null)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!isAllUploaded || isSubmitting}
                onClick={handleSubmitBid}
                className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Verifying Bid Documents...' : 'Submit Bid & Run AI Verification'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 6. SUB-COMPONENT: BIDDER ACTIVITY & RECTIFICATION CENTRE
// ==========================================

function BidderActivityCentre({ bids = [], onReuploadDocument }) {
  const [selectedBidId, setSelectedBidId] = useState(bids[0]?.id || null);
  const [isReuploading, setIsReuploading] = useState(false);

  const selectedBid = bids.find(b => b.id === selectedBidId) || bids[0];

  const handleSimulateRectification = () => {
    setIsReuploading(true);
    setTimeout(() => {
      setIsReuploading(false);
      alert('Rectified high-DPI document uploaded. PaddleOCR re-scanned and status updated to VERIFIED (Compliance score increased to 92/100)!');
      if (selectedBid) {
        selectedBid.status = 'VERIFIED';
        selectedBid.rectificationRequired = false;
        selectedBid.complianceScore = 92;
        selectedBid.aiRecommendation = 'QUALIFIED';
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-50/60 to-cyan-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
                ACTIVITY & COMPLIANCE CENTRE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] text-xs font-semibold border border-blue-100">
                LIVE AUDIT TRAIL
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-[#111827] tracking-tight">
              Bid Verification & Evaluation Status
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Track real-time AI compliance verification, document tamper forensic results, and SHA-256 ledger proofs for all your submitted GeM bids.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Downloading official GeM AI Compliance Certificate (PDF) stamped with SHA-256 proof...')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#0062FF]" />
              Download Verification Slip
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Bids List (Left) + Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Bids selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Submitted Tender Applications ({bids.length})
          </h3>

          {bids.map((bid) => {
            const isSelected = bid.id === selectedBid?.id;
            const isQualified = bid.aiRecommendation === 'QUALIFIED' || bid.status === 'VERIFIED';

            return (
              <div
                key={bid.id}
                onClick={() => setSelectedBidId(bid.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-2xs ${
                  isSelected 
                    ? 'bg-blue-50/40 border-[#0062FF] shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#0062FF]">
                    {bid.id}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    isQualified 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {bid.aiRecommendation || bid.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-2">
                  {bid.tenderTitle}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="truncate">{bid.organisation}</span>
                  {bid.complianceScore && (
                    <span className="font-mono font-bold text-emerald-700 ml-2 flex-shrink-0">
                      Score: {bid.complianceScore}/100
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Detailed Bid Verification View */}
        {selectedBid ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Rectification Alert Box if Needs Review */}
            {selectedBid.rectificationRequired && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Action Required: Compliance Rectification Window Open
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 font-bold">Closing: 2026-10-05</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {selectedBid.rectificationNotice || 'One or more certificates require high-DPI re-upload to confirm UDIN/dates.'}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSimulateRectification}
                    disabled={isReuploading}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {isReuploading ? 'Scanning Rectified File...' : 'Upload Rectified CA Certificate'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#0062FF] px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {selectedBid.tenderId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Submitted: {selectedBid.submittedAt || 'Draft State'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#111827]">
                    {selectedBid.tenderTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedBid.organisation}</p>
                </div>

                {selectedBid.complianceScore && (
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-lg">
                      {selectedBid.complianceScore}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Compliance</div>
                      <div className="text-xs font-bold text-emerald-700">
                        {selectedBid.aiRecommendation || 'QUALIFIED'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Documents Breakdown */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0062FF]" />
                  Verified Document Manifest & AI Forensic Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedBid.uploadedDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{doc.type || doc.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                            OCR {doc.confidence || '98%+'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#0062FF] border border-blue-100 font-mono">
                            Clean Pass
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Aadhaar & PAN Master KYC</p>
                      <p className="text-[10px] text-slate-500 font-mono">Linked to Vendor Profile</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#0062FF] border border-blue-100 font-mono">
                          UIDAI & NSDL Synced
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forensic & Compliance Guarantees */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0062FF]" />
                  <span className="text-slate-700 font-medium">PyMuPDF Metadata Forensics:</span>
                  <span className="text-emerald-700 font-mono font-semibold">0 Font Anomalies / No Splice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0062FF]" />
                  <span className="text-slate-700 font-medium">Audit Proof Hash:</span>
                  <span className="font-mono text-slate-500">0x81b4...e39a</span>
                </div>
              </div>

            </div>

            {/* Live Activity Log */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0062FF]" />
                Live Verification Timeline & Activity Centre
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedBid.activityLog.map((log, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#0062FF] border-2 border-white group-hover:scale-125 transition-transform" />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800">{log.event}</p>
                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{log.timestamp}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 mt-1 inline-block">
                      Tag: {log.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            No bids submitted yet. Please browse available tenders and submit your documents.
          </div>
        )}

      </div>

    </div>
  );
}

// ==========================================
// 7. MAIN EXPORT: COMPLETE BIDDER PORTAL
// ==========================================

export function BidderPortal() {
  const [currentUser, setCurrentUser] = useState({
    id: 'GEM-VEND-2024-8841',
    name: defaultBidderProfile.name,
    email: defaultBidderProfile.email,
    company: defaultBidderProfile.companyName,
    designation: defaultBidderProfile.designation,
    entityType: defaultBidderProfile.entityType,
  });

  const [kycState, setKycState] = useState({
    isVerified: false,
    verifiedAt: null,
    documents: null,
  });

  // Active sub-navigation tab: 'kyc' | 'tenders' | 'preflight' | 'activity'
  const [activeTab, setActiveTab] = useState('kyc');
  const [bids, setBids] = useState(defaultMyBids);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleVerifyKyc = (result) => {
    setKycState(result);
  };

  const handleBidSubmitted = (newBid) => {
    setBids(prev => [newBid, ...prev]);
    setActiveTab('activity');
  };

  if (!currentUser) {
    return <BidderLogin onLogin={handleLogin} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Bidder Profile Top Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0062FF] to-[#00D4B2] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#111827]">{currentUser.company}</h3>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-[#0062FF] border border-blue-100 font-bold">
                {currentUser.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.name} • {currentUser.designation} • <span className="text-emerald-700 font-medium">{currentUser.entityType || defaultBidderProfile.entityType}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">KYC Gate:</span>
            {kycState.isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Pending Verification
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out of Bidder Portal"
            className="p-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* AHREFS-STYLE SUB-NAVIGATION NAVBAR */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        
        {/* Tab 1: Master KYC */}
        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'kyc'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'kyc' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            1
          </span>
          One-Time Master KYC (Aadhaar & PAN)
          {kycState.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-300 ml-1" />}
        </button>

        {/* Tab 2: Available Tenders */}
        <button
          onClick={() => {
            if (!kycState.isVerified) {
              alert('Please complete one-time identity verification (Aadhaar & PAN) first to unlock live tenders.');
              return;
            }
            setActiveTab('tenders');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'tenders'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : kycState.isVerified
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                : 'text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'tenders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            2
          </span>
          Browse Tenders & Eligibility Calculator
          {!kycState.isVerified && <Lock className="w-3.5 h-3.5 text-amber-500 ml-1" />}
        </button>

        {/* Tab 3: Smart Pre-Flight Validator (Section 7.2) */}
        <button
          onClick={() => setActiveTab('preflight')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'preflight'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'preflight' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            3
          </span>
          Smart Upload Pre-Flight Validator
          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[#0062FF] text-[9px] font-mono border border-blue-100 ml-1">
            SEC 7.2
          </span>
        </button>

        {/* Tab 4: Activity & Rectification Centre */}
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'activity' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            4
          </span>
          My Submissions & Activity Centre
          <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-[#0062FF] text-[10px] font-mono ml-1 font-bold">
            {bids.length}
          </span>
        </button>

      </div>

      {/* View Panels */}
      {activeTab === 'kyc' && (
        <BidderKYC 
          kycState={kycState} 
          onVerifyKyc={handleVerifyKyc}
          onContinueToBids={() => setActiveTab('tenders')}
        />
      )}

      {activeTab === 'tenders' && (
        <BidderTenderBrowser 
          onBidSubmitted={handleBidSubmitted}
        />
      )}

      {activeTab === 'preflight' && (
        <BidderSmartPreFlight />
      )}

      {activeTab === 'activity' && (
        <BidderActivityCentre 
          bids={bids}
        />
      )}

    </div>
  );
}

export default BidderPortal;
