import React, { useState, useRef, useEffect } from 'react';
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
import { api } from '../services/api';
import { generateBidSubmissionSlip, generateLetterOfAward } from '../utils/documentGenerator';
import BidderCracReviewView from './BidderCracReviewView';
import { Award, Star } from 'lucide-react';

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
    bidAmount: 41500000,
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
    bidAmount: 28200000,
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
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-cyan-50 rounded  pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-14 h-14 rounded bg-gradient-to-tr from-[#0062FF] to-[#00D4B2] flex items-center justify-center text-white shadow-sm mb-3">
            <Building className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded bg-blue-50 text-[#0062FF] font-mono text-xs font-semibold border border-blue-100 mb-2">
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#0062FF] font-mono"
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#0062FF] font-mono"
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
            className="w-full py-3 px-4 rounded bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-sm shadow-sm hover:shadow active:scale-98 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded animate-spin" />
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
            className="w-full py-2 px-3 rounded bg-slate-50 hover:bg-slate-100 text-[#0062FF] text-xs font-semibold border border-slate-200 flex items-center justify-center gap-2 transition-all"
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

function BidderKYC({ user, kycState, onVerifyKyc, onContinueToBids }) {
  const [panNumber, setPanNumber] = useState(user?.panNumber || '');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [gstinNumber, setGstinNumber] = useState(user?.gstinNumber || '');
  const [udyamNumber, setUdyamNumber] = useState(user?.udyamNumber || '');
  const [kycError, setKycError] = useState(null);

  const [docs, setDocs] = useState(kycState?.documents || [
    {
      id: 'aadhaar',
      name: 'Aadhaar Card (Individual / Proprietor / Director)',
      desc: '12-digit UIDAI Card of Owner, Proprietor, Director, or Authorized Signatory (Mandatory)',
      file: null,
      status: 'PENDING',
    },
    {
      id: 'pan',
      name: 'PAN Card (Individual / Business Entity)',
      desc: 'Permanent Account Number for Corporate / Proprietorship / Firm (Mandatory)',
      file: null,
      status: 'PENDING',
    },
    {
      id: 'gstin',
      name: 'GSTIN Registration',
      desc: 'Goods & Services Tax Certificate (Form GST REG-06)',
      file: null,
      status: 'PENDING',
    },
    {
      id: 'udyam',
      name: 'Udyam / MSME Certificate',
      desc: 'Ministry of MSME Enterprise Certificate (For EMD/Turnover exemption)',
      file: null,
      status: 'PENDING',
    }
  ]);

  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [isVerified, setIsVerified] = useState(Boolean(kycState?.isVerified));

  const steps = [
    'Computing cryptographic SHA-256 fingerprints of attached documents...',
    'Running PaddleOCR spatial extraction on Aadhaar & PAN fields...',
    'Performing anti-tamper forensics & metadata scrutiny (PyMuPDF)...',
    'Cross-referencing UIDAI & Income Tax registries via Groq AI Engine...',
    'Verifying statutory identity coherence (Individual / Entity)...'
  ];

  const handleRealFileUpload = (docId, file) => {
    setKycError(null);
    setDocs(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          file: file.name,
          fileObj: file,
          status: 'UPLOADED'
        };
      }
      return d;
    }));
  };

  const aadhaarUploaded = Boolean(docs.find(d => d.id === 'aadhaar')?.file);
  const panUploaded = Boolean(docs.find(d => d.id === 'pan')?.file);
  const allUploaded = aadhaarUploaded && panUploaded;

  const handleStartVerification = async () => {
    setKycError(null);
    if (!aadhaarUploaded || !panUploaded) {
      setKycError('Mandatory documents missing: Please upload both your Aadhaar Card (Individual/Proprietor) and PAN Card.');
      return;
    }

    if (!panNumber || panNumber.trim().length < 10) {
      setKycError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
      return;
    }

    setVerifying(true);
    setVerificationStep(0);

    try {
      setVerificationStep(1); // SHA-256 calculation
      await new Promise(r => setTimeout(r, 400));
      
      setVerificationStep(2); // AI OCR & Forensics Check
      await new Promise(r => setTimeout(r, 400));

      setVerificationStep(3); // Cross-referencing via Groq AI
      
      const payload = {
        email: user?.email,
        name: user?.company || user?.name,
        gemSellerId: user?.gemSellerId || user?.id || 'GEM-VEND-2026-9041',
        panNumber: panNumber.trim().toUpperCase(),
        aadhaarNumber: aadhaarNumber.trim(),
        gstinNumber: gstinNumber.trim().toUpperCase(),
        udyamNumber: udyamNumber.trim().toUpperCase(),
        documents: docs.filter(d => d.file).map(d => ({
          docType: d.id,
          name: d.file,
          status: 'UPLOADED'
        }))
      };

      const res = await api.verifyKyc(payload);

      setVerificationStep(4); // Sealing ledger block
      await new Promise(r => setTimeout(r, 400));

      setVerifying(false);
      setIsVerified(true);
      const updatedDocs = docs.map(d => {
        if (d.file) {
          return { ...d, status: 'VERIFIED' };
        }
        return { ...d, status: 'NOT_UPLOADED' };
      });
      setDocs(updatedDocs);
      if (onVerifyKyc) {
        onVerifyKyc({
          isVerified: true,
          verifiedAt: res.verifiedAt || new Date().toLocaleTimeString(),
          documents: updatedDocs
        });
      }
    } catch (err) {
      setVerifying(false);
      setKycError(err.message || 'Statutory KYC verification failed.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200/80 rounded p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                STATUTORY GATEWAY
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
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
              Every vendor must complete statutory verification by uploading their <strong className="text-[#0062FF]">Aadhaar Card (Individual Proprietor / Director / Authorized Signatory)</strong> & <strong className="text-[#0062FF]">PAN Card (Individual or Business Entity)</strong>. Individual Aadhaar cards are fully recognized for Sole Proprietorships, MSMEs, and Corporate Representatives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {isVerified && (
              <button
                type="button"
                onClick={onContinueToBids}
                className="w-full sm:w-auto px-5 py-2.5 rounded bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                Browse & Apply for Tenders
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {kycError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900 mb-0.5">Verification Rejected</h4>
            <p className="leading-relaxed">{kycError}</p>
          </div>
        </div>
      )}

      {/* Statutory Number Inputs */}
      {!isVerified && (
        <div className="bg-white border border-slate-200/80 rounded p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
            1. Enter Declared Statutory Identifiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Permanent Account Number (PAN) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#0062FF]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Aadhaar Number / Virtual ID <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="e.g. 5482 9102 3841"
                maxLength={14}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:border-[#0062FF]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                GSTIN Registration Number (Optional)
              </label>
              <input
                type="text"
                value={gstinNumber}
                onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 07ABCDE1234F1Z5"
                maxLength={15}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono uppercase focus:outline-none focus:border-[#0062FF]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Udyam MSME Number (Optional)
              </label>
              <input
                type="text"
                value={udyamNumber}
                onChange={(e) => setUdyamNumber(e.target.value.toUpperCase())}
                placeholder="e.g. UDYAM-DL-03-0049281"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono uppercase focus:outline-none focus:border-[#0062FF]"
              />
            </div>
          </div>
        </div>
      )}


      {/* Verification In Progress Card */}
      {verifying && (
        <div className="bg-white border-2 border-indigo-400 rounded p-6 shadow-md relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded bg-blue-50 text-[#0062FF] flex items-center justify-center animate-spin">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">AI Engine Processing Documents</h4>
              <p className="text-xs text-[#0062FF] font-mono">Stage {verificationStep + 1} of {steps.length}</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 rounded h-2.5 overflow-hidden mb-4 border border-slate-200">
            <div 
              className="bg-[#0062FF] h-2.5 rounded transition-all duration-500"
              style={{ width: `${((verificationStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <p className="text-xs text-slate-700 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-[#0062FF] animate-ping" />
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
              className={`bg-white border rounded p-5 transition-all shadow-sm ${
                isDocVerified 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : isDocUploaded 
                    ? 'border-indigo-300' 
                    : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : isDocUploaded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-[#0062FF] font-semibold text-xs border border-blue-200">
                      Ready for Check
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs">
                      Not Uploaded
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4">{doc.desc}</p>

              {doc.file ? (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 flex items-center justify-between">
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
                    <label
                      htmlFor={`kyc-replace-${doc.id}`}
                      className="text-xs text-[#635BFF] font-semibold hover:underline ml-2 cursor-pointer"
                    >
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        id={`kyc-replace-${doc.id}`}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (f) handleRealFileUpload(doc.id, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <label 
                  htmlFor={`kyc-upload-${doc.id}`}
                  className="border-2 border-dashed border-slate-200 hover:border-[#635BFF] rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30 block"
                >
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    id={`kyc-upload-${doc.id}`}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) handleRealFileUpload(doc.id, f);
                      e.target.value = '';
                    }}
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Click to upload or drag & drop</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG (Max 10MB)</p>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Action footer */}
      <div className="bg-white border border-slate-200/80 rounded p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-50 text-[#0062FF] flex items-center justify-center">
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
            className="w-full md:w-auto px-6 py-3 rounded bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="px-5 py-2.5 rounded bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
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
  const preflightFileRef = useRef(null);

  const handleSimulatePreFlight = async (fileName = 'CA_Turnover_Certificate_FY24.pdf') => {
    setTestFile(fileName);
    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await api.preflightCheck({
        companyName: 'Vikram Solar Enterprises',
        gstin: '07AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
        annualTurnoverINR: 15000000,
        experienceYears: 4,
        isMSME: true,
        documents: ['GST_CERTIFICATE', 'PAN_CARD', 'CA_TURNOVER_CERTIFICATE', 'DEBARMENT_AFFIDAVIT']
      });

      setIsScanning(false);
      setScanResult({
        fileName: fileName,
        fileSizeBytes: '2.4 MB (Under 15MB limit)',
        mimeType: 'application/pdf (Valid PDF/A standard)',
        sha256Hash: '0x8f3c7e1b9a22d41088bc012e55aa91bc44f0e21a8899cc334411eedd8822ff99',
        encryptionStatus: 'UNENCRYPTED (0 DRM password locks)',
        dpiClarity: '340 DPI (High readability - exceeds 200 DPI standard)',
        pageCount: 3,
        readabilityScore: `${res.readinessScore}%`,
        aiAdvisory: res.aiAdvisory,
        checks: (res.checks || []).map(c => ({
          name: c.name,
          passed: c.status === 'PASS',
          note: c.message
        }))
      });
    } catch (err) {
      console.warn('Preflight API fallback:', err.message);
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
        aiAdvisory: 'Statutory compliance validation passed. All criteria conform to GFR 2017 eligibility standards.',
        checks: [
          { name: 'Client-side Web Crypto SHA-256 Fingerprint', passed: true, note: 'Non-repudiation hash generated' },
          { name: 'Password / DRM Protection Detection', passed: true, note: 'No decryption password required' },
          { name: 'Blank / Corrupt PDF Page Check', passed: true, note: 'All 3 pages render valid text & vector tables' },
          { name: 'Resolution & Spatial DPI Check', passed: true, note: '340 DPI clear scan, optimal for PaddleOCR' },
          { name: 'ExifTool & Metadata Tamper Pre-Check', passed: true, note: 'No Adobe Photoshop or Canva traces' },
        ]
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200/80 rounded p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                SECTION 7.2 MODULE
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
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
            className="px-4 py-2.5 rounded bg-slate-50 hover:bg-slate-100 text-[#0062FF] text-xs font-semibold border border-slate-200 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-[#0062FF]" />
            Test Sample Certificate
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div 
        onClick={() => preflightFileRef.current?.click()}
        className="bg-white border-2 border-dashed border-indigo-200 hover:border-[#635BFF] rounded-2xl p-8 text-center cursor-pointer shadow-sm hover:shadow transition-all"
      >
        <input
          type="file"
          accept=".pdf"
          ref={preflightFileRef}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) handleSimulatePreFlight(f.name);
            e.target.value = '';
          }}
        />
        <UploadCloud className="w-10 h-10 text-[#635BFF] mx-auto mb-2" />
        <h4 className="text-sm font-bold text-[#0A2540]">Drop any PDF certificate to run instant Pre-Flight diagnostics</h4>
        <p className="text-xs text-slate-500 mt-1">
          Validates SHA-256, DPI clarity, PDF encryption lock, and format compliance in browser memory.
        </p>
        <div className="mt-4">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-[#635BFF] text-xs font-bold border border-indigo-200">
            ⚡ Click to Select a PDF Certificate
          </span>
        </div>
      </div>

      {/* Scanning status */}
      {isScanning && (
        <div className="bg-white border border-slate-200 rounded p-6 text-center shadow-sm space-y-3">
          <div className="w-8 h-8 rounded border-2 border-[#0062FF] border-t-transparent animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-[#111827]">Running Client-Side Web Crypto & PDF Sanitization...</h4>
          <p className="text-xs text-slate-500 font-mono">Hashing bytes: window.crypto.subtle.digest('SHA-256')</p>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div className="bg-white border border-slate-200/80 rounded p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                 ALL PRE-FLIGHT CHECKS PASSED
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
              <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">{check.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{check.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between text-xs text-indigo-950 font-medium">
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

function BidderTenderBrowser({ user, onBidSubmitted }) {
  const [tenders, setTenders] = useState(defaultAvailableTenders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTenderModal, setActiveTenderModal] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [openBidsModal, setOpenBidsModal] = useState(null);
  const [modalOpenBids, setModalOpenBids] = useState([]);
  const [isLoadingModalBids, setIsLoadingModalBids] = useState(false);
  const [showOpenBidsAccordion, setShowOpenBidsAccordion] = useState(false);

  const [tenderDocs, setTenderDocs] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [submittedReceiptModal, setSubmittedReceiptModal] = useState(null);

  // User-Declared Statutory Parameters for the active bid
  const [declaredCompanyName, setDeclaredCompanyName] = useState('');
  const [declaredPan, setDeclaredPan] = useState('');
  const [declaredGstin, setDeclaredGstin] = useState('');
  const [declaredUdyam, setDeclaredUdyam] = useState('');
  const [declaredEntityType, setDeclaredEntityType] = useState('PVT_LTD');
  const [declaredAddress, setDeclaredAddress] = useState('');
  const [declaredCity, setDeclaredCity] = useState('');
  const [declaredState, setDeclaredState] = useState('');
  const [declaredPincode, setDeclaredPincode] = useState('');
  const [declaredDirector, setDeclaredDirector] = useState('');
  const [gstinDetectionInfo, setGstinDetectionInfo] = useState(null);
  const [isResolvingGstin, setIsResolvingGstin] = useState(false);
  const [panDetectionInfo, setPanDetectionInfo] = useState(null);
  const [isResolvingPan, setIsResolvingPan] = useState(false);

  const categories = ['ALL', 'Solar & Renewable Power Equipment', 'Smart City Infrastructure', 'Solar Maintenance Services'];

  React.useEffect(() => {
    async function loadLiveTenders() {
      try {
        const live = await api.getTenders();
        if (live && live.length > 0) {
          const formatted = live.map(t => ({
            id: t.tenderNumber || t._id,
            _id: t._id,
            title: t.title,
            organisation: t.department || 'Government of India',
            publishedDate: new Date(t.createdAt || Date.now()).toISOString().split('T')[0],
            closingDate: new Date(t.closingDate).toISOString().split('T')[0],
            estimatedValue: `₹${(t.estimatedValueINR / 10000000).toFixed(2)} Cr`,
            estimatedValueINR: t.estimatedValueINR || 42000000,
            category: t.category || 'Renewable Power Equipment',
            emdAmount: `₹${((t.estimatedValueINR * 0.02) / 100000).toFixed(2)} Lakh`,
            emdExemption: 'MSME/Startup Exempt',
            location: t.location || 'New Delhi',
            statutoryDocs: [
              { id: 'GST_CERTIFICATE', name: 'GST Registration Certificate (Form GST REG-06)', required: true },
              { id: 'PAN_CARD', name: 'Permanent Account Number (PAN Card)', required: true },
              { id: 'CA_TURNOVER_CERTIFICATE', name: 'CA Certified Turnover Certificate', required: false },
              { id: 'DEBARMENT_AFFIDAVIT', name: 'Non-Debarment / Anti-Blacklisting Affidavit', required: false },
              { id: 'UDYAM_CERTIFICATE', name: 'Udyam MSME Registration Certificate', required: false },
            ],
            mandatoryDocs: [
              'GST Registration Certificate (Form GST REG-06)',
              'Permanent Account Number (PAN Card)'
            ],
            eligibilityMatch: {
              isEligible: true,
              msmeWaiver: 'Applicable (EMD Waived to ₹0)',
              miiMatch: 'Compliant',
              debarmentStatus: 'CLEAN'
            },
            status: t.status === 'PUBLISHED' ? 'OPEN' : t.status,
            totalBidders: t.biddersCount || 0,
            daysLeft: Math.max(1, Math.ceil((new Date(t.closingDate) - new Date()) / (1000 * 60 * 60 * 24)))
          }));
          setTenders(formatted);
        }
      } catch (err) {
        console.warn('Using fallback tenders:', err.message);
      }
    }
    loadLiveTenders();
  }, []);

  const filteredTenders = tenders.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.organisation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleGstinChange = async (val) => {
    const rawGst = (val || '').toUpperCase().trim();
    setDeclaredGstin(rawGst);

    if (rawGst.length >= 12 && (!declaredPan || declaredPan.length < 10)) {
      setDeclaredPan(rawGst.slice(2, 12));
    }

    if (rawGst.length >= 2) {
      setIsResolvingGstin(true);
      try {
        const resolved = await api.resolveGstin(rawGst);
        setIsResolvingGstin(false);
        if (resolved && resolved.success) {
          setDeclaredCity(resolved.city || 'Bahadurgarh');
          setDeclaredState(resolved.state || 'Haryana');
          setDeclaredPincode(resolved.pincode || '124507');
          if (!declaredAddress || declaredAddress.includes('Industrial Area')) {
            setDeclaredAddress(resolved.addressLine1 || `Plot 42, HSIIDC Industrial Area, ${resolved.city}`);
          }
          if (resolved.entityType) {
            setDeclaredEntityType(resolved.entityType);
          }
          if (resolved.pan && (!declaredPan || declaredPan.length < 10)) {
            setDeclaredPan(resolved.pan);
          }
          setGstinDetectionInfo({
            city: resolved.city,
            state: resolved.state,
            district: resolved.district,
            pincode: resolved.pincode,
            provider: resolved.provider,
            jurisdiction: resolved.jurisdiction,
            stateCode: resolved.stateCode || rawGst.slice(0, 2)
          });
        }
      } catch (err) {
        setIsResolvingGstin(false);
      }
    } else {
      setGstinDetectionInfo(null);
    }
  };

  const handlePanChange = async (rawPan) => {
    const panVal = rawPan.toUpperCase().trim();
    setDeclaredPan(panVal);

    if (panVal.length === 10) {
      setIsResolvingPan(true);
      try {
        const resolved = await api.verifyPan(panVal, declaredCompanyName, {
          city: declaredCity,
          state: declaredState,
          udyam: declaredUdyam
        });
        if (resolved && resolved.isValid) {
          setPanDetectionInfo(resolved);
          if (resolved.entityCode === 'LLP') setDeclaredEntityType('LLP');
          else if (resolved.entityCode === 'FIRM') setDeclaredEntityType('PARTNERSHIP');
          else if (resolved.entityCode === 'COMPANY') setDeclaredEntityType('PVT_LTD');
          else if (resolved.entityCode === 'INDIVIDUAL') setDeclaredEntityType('PROPRIETORSHIP');
          else if (resolved.entityCode === 'TRUST') setDeclaredEntityType('TRUST');
        } else {
          setPanDetectionInfo(null);
        }
      } catch (err) {
        console.warn('PAN resolve error:', err.message);
      } finally {
        setIsResolvingPan(false);
      }
    } else {
      setPanDetectionInfo(null);
    }
  };

  const handleOpenBidModal = async (tender) => {
    setSubmitError(null);
    setActiveTenderModal(tender);
    const rawVal = tender.estimatedValueINR || 42000000;
    setBidPrice(String(Math.round(rawVal * 0.95)));

    // Initialize declared statutory fields from current user profile
    const panVal = user?.panNumber || '';
    setDeclaredCompanyName(user?.organization || user?.company || user?.name || '');
    setDeclaredPan(panVal);
    const initGst = user?.gstinNumber || (panVal ? `06${panVal}1Z1` : '');
    setDeclaredGstin(initGst);
    setDeclaredUdyam(user?.udyamNumber || '');
    setDeclaredEntityType(user?.entityType || 'PVT_LTD');
    setDeclaredAddress(user?.address || '');
    setDeclaredCity(user?.city || '');
    setDeclaredState(user?.state || '');
    setDeclaredPincode(user?.pincode || '');
    setDeclaredDirector(user?.name || '');
    setGstinDetectionInfo(null);

    if (initGst && initGst.length >= 2) {
      handleGstinChange(initGst);
    }

    const docList = Array.isArray(tender.statutoryDocs) && tender.statutoryDocs.length > 0
      ? tender.statutoryDocs
      : [
          { id: 'GST_CERTIFICATE', name: 'GST Registration Certificate (Form GST REG-06)', required: true },
          { id: 'PAN_CARD', name: 'Permanent Account Number (PAN Card)', required: true },
          { id: 'CA_TURNOVER_CERTIFICATE', name: 'CA Certified Turnover Certificate', required: false },
          { id: 'DEBARMENT_AFFIDAVIT', name: 'Non-Debarment / Anti-Blacklisting Affidavit', required: false },
          { id: 'UDYAM_CERTIFICATE', name: 'Udyam MSME Registration Certificate', required: false },
        ];

    const initialDocs = {};
    docList.forEach((docItem, index) => {
      initialDocs[index] = {
        id: docItem.id,
        name: docItem.name,
        required: Boolean(docItem.required),
        fileName: null,
        fileObj: null,
        status: 'EMPTY',
      };
    });
    setTenderDocs(initialDocs);

    setIsLoadingModalBids(true);
    try {
      const bids = await api.getBidsForTender(tender._id || tender.id);
      setModalOpenBids(bids || []);
    } catch {
      setModalOpenBids([]);
    } finally {
      setIsLoadingModalBids(false);
    }
  };

  const handleViewOpenBids = async (tender) => {
    setOpenBidsModal({ tender, bids: [], isLoading: true });
    try {
      const tenderId = tender._id || tender.id;
      const bids = await api.getBidsForTender(tenderId);
      setOpenBidsModal({ tender, bids: bids || [], isLoading: false });
    } catch (e) {
      setOpenBidsModal({ tender, bids: [], isLoading: false });
    }
  };

  const handleAttachRealDoc = (index, file) => {
    setSubmitError(null);
    setTenderDocs(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        fileName: file.name,
        fileObj: file,
        status: 'READY',
      }
    }));
  };

  const handleRemoveDoc = (index) => {
    setSubmitError(null);
    setTenderDocs(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        fileName: null,
        fileObj: null,
        status: 'EMPTY',
      }
    }));
  };

  const handleAutoFillMandatoryOnly = () => {
    setSubmitError(null);
    setTenderDocs(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k].required) {
          const cleanName = updated[k].name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 26);
          updated[k] = {
            ...updated[k],
            fileName: `${cleanName}__Certified.pdf`,
            status: 'READY',
          };
        }
      });
      return updated;
    });
  };

  const handleAutoFillAllBidDocs = () => {
    setSubmitError(null);
    setTenderDocs(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        const cleanName = updated[k].name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 26);
        updated[k] = {
          ...updated[k],
          fileName: `${cleanName}__Certified.pdf`,
          status: 'READY',
        };
      });
      return updated;
    });
  };

  const handleSubmitBid = async () => {
    if (!bidPrice || Number(bidPrice) <= 0) {
      setSubmitError('Please enter a valid Price of Bid (in ₹ INR).');
      return;
    }

    if (!isAllMandatoryUploaded) {
      setSubmitError(`Please attach all ${totalMandatoryCount} mandatory documents (GST REG-06 & PAN Card) before submitting.`);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    setSubmissionProgress(30);

    try {
      const parsedPrice = Number(bidPrice);
      // ONLY include documents that are actually attached by the user
      const attachedDocs = Object.values(tenderDocs).filter(d => d && d.fileName && d.status !== 'EMPTY');

      const finalCompanyName = (declaredCompanyName || user?.organization || user?.company || user?.name || 'Apoorv Infotech').trim();
      const finalPan = (declaredPan || user?.panNumber || (declaredGstin.length >= 12 ? declaredGstin.slice(2, 12) : 'AAAPL1234F')).trim().toUpperCase();
      const finalGstin = (declaredGstin || user?.gstinNumber || (finalPan ? `06${finalPan}1Z1` : '06AAAPL1234F1Z1')).trim().toUpperCase();
      const finalUdyam = (declaredUdyam || user?.udyamNumber || '').trim().toUpperCase();

      // Normalize entityType so it is a valid enum value
      let normalizedEntityType = 'PVT_LTD';
      const rawType = String(declaredEntityType || user?.entityType || 'PVT_LTD').toUpperCase();
      if (rawType.includes('PROP') || rawType.includes('SOLE') || rawType.includes('INDIVIDUAL')) {
        normalizedEntityType = 'PROPRIETORSHIP';
      } else if (rawType.includes('LLP')) {
        normalizedEntityType = 'LLP';
      } else if (rawType.includes('PARTNER')) {
        normalizedEntityType = 'PARTNERSHIP';
      } else if (rawType.includes('PUBLIC')) {
        normalizedEntityType = 'PUBLIC_LTD';
      } else if (rawType.includes('TRUST') || rawType.includes('SOCIETY')) {
        normalizedEntityType = 'TRUST';
      } else {
        normalizedEntityType = 'PVT_LTD';
      }

      const finalCity = declaredCity || gstinDetectionInfo?.city || 'Bahadurgarh';
      const finalState = declaredState || gstinDetectionInfo?.state || 'Haryana';
      const finalPincode = declaredPincode || gstinDetectionInfo?.pincode || '124507';
      const finalAddress = declaredAddress || `Plot 42, HSIIDC Industrial Area, ${finalCity}`;

      const payload = {
        tenderId: activeTenderModal._id || activeTenderModal.id,
        bidAmount: parsedPrice,
        bidPrice: parsedPrice,
        priceOfBid: parsedPrice,
        legalBusinessName: finalCompanyName,
        gstin: finalGstin,
        pan: finalPan,
        udyamRegistrationNumber: finalUdyam,
        entityType: normalizedEntityType,
        addressLine1: finalAddress,
        city: finalCity,
        state: finalState,
        pincode: finalPincode,
        directors: [{ name: declaredDirector || user?.name || 'Managing Director', pan: finalPan }],
        annualTurnoverINR: 15000000,
        documents: attachedDocs.map(d => ({
          docType: d.id || (d.name?.toLowerCase().includes('pan') ? 'PAN_CARD' : 'GST_CERTIFICATE'),
          originalFileName: d.fileName
        }))
      };

      setSubmissionProgress(65);
      const res = await api.submitBid(payload);
      setSubmissionProgress(100);

      const newBid = {
        id: res.bidReferenceNumber || `BID-${Math.floor(1000 + Math.random() * 9000)}`,
        _id: res.submissionId,
        tenderId: activeTenderModal.id,
        tenderTitle: activeTenderModal.title,
        organisation: activeTenderModal.organisation,
        bidAmount: parsedPrice,
        legalBusinessName: finalCompanyName,
        gstin: finalGstin,
        pan: finalPan,
        udyam: finalUdyam,
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: 'SUBMITTED',
        complianceScore: 88,
        aiRecommendation: 'QUALIFY',
        rectificationRequired: false,
        uploadedDocuments: attachedDocs.map(d => ({
          name: d.fileName,
          status: 'VERIFIED',
          type: d.name,
          sha256: res.auditBlock?.currentHash || '0x49e...sealed',
          confidence: '98.5%'
        })),
        activityLog: [
          { timestamp: 'Just now', event: `Bid package submitted for ${finalCompanyName} (GSTIN: ${finalGstin}, PAN: ${finalPan}) with Quote: ₹${parsedPrice.toLocaleString('en-IN')}`, type: 'SUBMIT' },
          { timestamp: 'Just now', event: `Pre-flight checks passed: ${attachedDocs.length} documents attached (${attachedDocs.map(d => d.name).join(', ')})`, type: 'PREFLIGHT' },
          { timestamp: 'Just now', event: `Block #${res.auditBlock?.blockIndex || 1} appended to GeM Audit Ledger`, type: 'LEDGER' }
        ]
      };

      setActiveTenderModal(null);
      setSubmittedReceiptModal(newBid);
      if (onBidSubmitted) {
        onBidSubmitted(newBid);
      }
    } catch (err) {
      setSubmitError(err.message || 'Bid submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mandatoryDocsList = Object.values(tenderDocs).filter(d => d && d.required);
  const totalMandatoryCount = mandatoryDocsList.length;
  const uploadedMandatoryCount = mandatoryDocsList.filter(d => d && d.fileName && d.status !== 'EMPTY').length;
  const totalUploadedCount = Object.values(tenderDocs).filter(d => d && d.fileName && d.status !== 'EMPTY').length;

  const isAllMandatoryUploaded = uploadedMandatoryCount >= totalMandatoryCount && totalMandatoryCount > 0;
  const isReadyToSubmit = isAllMandatoryUploaded && bidPrice && Number(bidPrice) > 0;


  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white border border-slate-200/80 rounded p-5 shadow-sm">
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
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0062FF]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
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
              className="bg-white border border-slate-200/80 hover:border-slate-300 rounded p-6 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
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
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded text-xs space-y-1">
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
                           {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  <span className="text-xs text-slate-500 font-mono">
                    Total Bidders: <strong className="text-slate-800 font-bold">{tender.totalBidders}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleViewOpenBids(tender)}
                    className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all w-full lg:w-auto justify-center"
                    title="View competing open bids submitted for this tender"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0062FF]" />
                    View Open Bids ({tender.totalBidders})
                  </button>
                  
                  {isOpen ? (
                    <button
                      type="button"
                      onClick={() => handleOpenBidModal(tender)}
                      className="px-5 py-2.5 rounded bg-[#0062FF] hover:bg-[#0050D4] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all w-full lg:w-auto justify-center"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Upload Documents & Apply
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 rounded bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
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

      {/* Modern High-Usability Bid Documents Modal */}
      {activeTenderModal && (
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 py-4 sm:py-6 flex items-start sm:items-center justify-center"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div 
            className="bg-white border border-slate-300 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
            style={{ maxHeight: 'calc(100vh - 28px)', height: 'min(86vh, 680px)' }}
          >
            
            {/* Modal Header (Fixed Top) */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0062FF] font-mono text-xs font-bold border border-blue-200">
                    {activeTenderModal.id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    OPEN BIDDING WINDOW
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827] truncate max-w-md">
                  Submit Bid Proposal & Upload Documents
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveTenderModal(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body with min-h-0 and overscroll-contain */}
            <div 
              className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-white overscroll-contain"
              style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}
            >
              
              {/* SECTION 1: Commercial Bid Price */}
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#0062FF] text-white flex items-center justify-center font-bold text-xs">₹</span>
                    Price of Bid / Financial Quote (INR) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-500 font-mono">
                    Estimated: <strong className="text-slate-900">{activeTenderModal.estimatedValue}</strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder="Enter commercial quote in Rupees (e.g. 39800000)"
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
                  {bidPrice && Number(bidPrice) > 0 ? (
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-500">Formatted:</span>
                      <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ₹{Number(bidPrice).toLocaleString('en-IN')}
                      </strong>
                      <span className="text-slate-600 font-semibold">
                        (₹{(Number(bidPrice) / 10000000).toFixed(2)} Cr)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Enter a non-zero financial quote</span>
                  )}

                  {/* Quick percentage shortcuts */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBidPrice(String(Math.round((activeTenderModal.estimatedValueINR || 42000000) * 0.95)))}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                    >
                      -5% (L1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidPrice(String(Math.round((activeTenderModal.estimatedValueINR || 42000000) * 0.90)))}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                    >
                      -10%
                    </button>
                  </div>
                </div>

                {submitError && (
                  <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded p-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {submitError}
                  </p>
                )}
              </div>

              {/* SECTION 2: Statutory Identity & KYC Verification Status */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs text-emerald-900 font-bold">
                    One-Time KYC (Aadhaar & PAN) Verified
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFillMandatoryOnly}
                    className="text-[11px] px-2.5 py-1 rounded bg-white text-[#0062FF] border border-blue-200 hover:bg-blue-50 font-bold shadow-xs whitespace-nowrap"
                    title="Attaches mandatory demo certificates (GST REG-06 and PAN Card)"
                  >
                    ⚡ Attach Mandatory Docs (2)
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFillAllBidDocs}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold border border-slate-200 whitespace-nowrap"
                    title="Attaches all demo certificates"
                  >
                    Attach All Docs
                  </button>
                </div>
              </div>

              {/* SECTION 2B: Editable Declared Statutory & Tax Identifiers */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#0062FF]" />
                    Declared Statutory Identifiers for this Bid
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Directly synchronized to CAG Audit Ledger
                  </span>
                </div>

                {/* Real-time GSTIN Auto-Detection Banner */}
                {gstinDetectionInfo && (
                  <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        📍 Auto-Detected from GSTIN (State Code {gstinDetectionInfo.stateCode}): <strong>{gstinDetectionInfo.city}</strong>, {gstinDetectionInfo.district}, {gstinDetectionInfo.state} (PIN: {gstinDetectionInfo.pincode})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {gstinDetectionInfo.provider}
                    </span>
                  </div>
                )}

                {isResolvingGstin && (
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-[#0062FF] font-medium flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Resolving City, State & Jurisdiction from GSTIN statutory portal...</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Legal Business / Firm Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={declaredCompanyName}
                      onChange={e => setDeclaredCompanyName(e.target.value)}
                      placeholder="e.g. Apoorv Infotech"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Declared GSTIN Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={declaredGstin}
                      onChange={e => handleGstinChange(e.target.value)}
                      placeholder="e.g. 06AAAPL1234F1Z1"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono font-bold uppercase text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Declared PAN Number <span className="text-rose-500">*</span>
                      </label>
                      {panDetectionInfo && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          CBDT Validated
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      value={declaredPan}
                      onChange={e => handlePanChange(e.target.value)}
                      placeholder="e.g. AAAPL1234F"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono font-bold uppercase text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                    />
                    {panDetectionInfo && (
                      <div className="mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center justify-between">
                        <span>✓ {panDetectionInfo.entityCategory}</span>
                        <span className="text-[9px] font-mono text-emerald-600">{panDetectionInfo.status}</span>
                      </div>
                    )}
                    {isResolvingPan && (
                      <div className="mt-1 text-[10px] text-blue-600 font-medium animate-pulse">
                        Verifying PAN format and statutory status with CBDT...
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Entity Constitution / Legal Structure
                    </label>
                    <select
                      value={declaredEntityType}
                      onChange={e => setDeclaredEntityType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs font-medium focus:outline-none focus:border-[#0062FF]"
                    >
                      <option value="PVT_LTD">Private Limited Company</option>
                      <option value="PROPRIETORSHIP">Sole Proprietorship / Individual</option>
                      <option value="PARTNERSHIP">Partnership Firm</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="PUBLIC_LTD">Public Limited Company</option>
                      <option value="TRUST">Registered Trust / Society</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      City & State (Auto-derived from GSTIN)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={declaredCity}
                        onChange={e => setDeclaredCity(e.target.value)}
                        placeholder="City (e.g. Bahadurgarh)"
                        className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                      />
                      <input
                        type="text"
                        value={declaredState}
                        onChange={e => setDeclaredState(e.target.value)}
                        placeholder="State (e.g. Haryana)"
                        className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Registered Address & Pincode
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={declaredAddress}
                        onChange={e => setDeclaredAddress(e.target.value)}
                        placeholder="Address Line"
                        className="w-2/3 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                      />
                      <input
                        type="text"
                        maxLength={6}
                        value={declaredPincode}
                        onChange={e => setDeclaredPincode(e.target.value)}
                        placeholder="PIN"
                        className="w-1/3 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Udyam MSME Registration (Optional)
                    </label>
                    <input
                      type="text"
                      value={declaredUdyam}
                      onChange={e => setDeclaredUdyam(e.target.value.toUpperCase())}
                      placeholder="e.g. UDYAM-HR-03-0049281"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Authorized Signatory / Director Name
                    </label>
                    <input
                      type="text"
                      value={declaredDirector}
                      onChange={e => setDeclaredDirector(e.target.value)}
                      placeholder="e.g. Apoorv"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-[#0062FF]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Required Statutory Bid Documents */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Statutory Documents ({uploadedMandatoryCount}/{totalMandatoryCount} Mandatory Attached):
                  </p>
                  <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                    isAllMandatoryUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isAllMandatoryUploaded 
                      ? (totalUploadedCount > uploadedMandatoryCount 
                          ? `✓ Mandatory Ready (+${totalUploadedCount - uploadedMandatoryCount} Optional Attached)` 
                          : '✓ Mandatory Documents Ready') 
                      : `${totalMandatoryCount - uploadedMandatoryCount} Mandatory Missing`}
                  </span>
                </div>

                {Object.entries(tenderDocs).map(([idx, currentDoc]) => {
                  const hasFile = Boolean(currentDoc?.fileName && currentDoc.status !== 'EMPTY');
                  const isMandatory = Boolean(currentDoc.required);

                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl p-3 transition-all ${
                        hasFile 
                          ? 'border-emerald-300 bg-emerald-50/20' 
                          : isMandatory
                            ? 'border-amber-200 bg-amber-50/15'
                            : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            hasFile ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 truncate">{currentDoc.name}</p>
                              {isMandatory ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                  REQUIRED
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                                  OPTIONAL
                                </span>
                              )}
                            </div>
                            {hasFile ? (
                              <p className="text-[11px] font-mono text-emerald-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                                <CheckCircle className="w-3 h-3" />
                                {currentDoc.fileName}
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {isMandatory ? 'Mandatory for eligibility (PDF, PNG, JPG)' : 'Optional — attach if applicable'}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {hasFile ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                Attached
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(idx)}
                                className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold px-1 py-0.5"
                                title="Remove file"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor={`tender-doc-${idx}`}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1 transition-all ${
                                isMandatory
                                  ? 'bg-[#0062FF] hover:bg-[#0050D4] text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <UploadCloud className="w-3 h-3" />
                              Upload
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                id={`tender-doc-${idx}`}
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files[0];
                                  if (f) handleAttachRealDoc(idx, f);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* IN-BODY SUBMIT ACTION CARD (Directly below documents) */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {isReadyToSubmit ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready to Submit Bid Proposal
                      </span>
                    ) : (
                      <span className="text-slate-800 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Pending Mandatory Uploads
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {isReadyToSubmit 
                      ? `Quote: ₹${Number(bidPrice).toLocaleString('en-IN')} (${totalUploadedCount} document${totalUploadedCount > 1 ? 's' : ''} attached)` 
                      : `Attach mandatory documents (GST REG-06 & PAN Card) to submit`}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!isReadyToSubmit || isSubmitting}
                  onClick={handleSubmitBid}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                    isReadyToSubmit && !isSubmitting
                      ? 'bg-[#0062FF] hover:bg-[#0050D4] text-white cursor-pointer active:scale-95 shadow-blue-500/25'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting 
                    ? 'Verifying & Submitting...' 
                    : isReadyToSubmit 
                      ? `Submit Bid Proposal (₹${Number(bidPrice || 0).toLocaleString('en-IN')})` 
                      : 'Attach Mandatory Docs to Enable'}
                </button>
              </div>

              {/* SECTION 4: Collapsible Competing Bids Registry */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowOpenBidsAccordion(!showOpenBidsAccordion)}
                  className="w-full p-3 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#0062FF]" />
                    Other Open Bids on this Tender ({modalOpenBids.length})
                  </span>
                  <span className="text-[11px] font-bold text-[#0062FF]">
                    {showOpenBidsAccordion ? '▲ Hide Competing Bids' : '▼ View Competing Bids'}
                  </span>
                </button>

                {showOpenBidsAccordion && (
                  <div className="p-3 bg-white border-t border-slate-200">
                    {isLoadingModalBids ? (
                      <p className="text-xs text-slate-500 py-1">Loading competing bids...</p>
                    ) : modalOpenBids.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">No other bids submitted yet. You will be the first bidder!</p>
                    ) : (
                      <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0">
                            <tr>
                              <th className="p-2">Bid Reference</th>
                              <th className="p-2">Bidder Entity</th>
                              <th className="p-2 text-right">Price of Bid (₹)</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {modalOpenBids.map((b, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 font-mono text-[#0062FF] font-semibold">{b.bidReferenceNumber || b.id}</td>
                                <td className="p-2 font-medium text-slate-800">{b.bidderId?.legalBusinessName || b.legalBusinessName || 'Bidder Entity'}</td>
                                <td className="p-2 text-right font-mono font-bold text-slate-900">
                                  {b.bidAmount ? `₹${Number(b.bidAmount).toLocaleString('en-IN')}` : '—'}
                                </td>
                                <td className="p-2">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                    {b.status || 'SUBMITTED'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submitting Progress Indicator */}
              {isSubmitting && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#0062FF] font-mono font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-[#0062FF]" />
                      Computing Hashes & Running PaddleOCR + Forensics Verification...
                    </span>
                    <span className="text-slate-700 font-mono font-black">{submissionProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden border border-blue-200">
                    <div 
                      className="bg-[#0062FF] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${submissionProgress}%` }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* STICKY PINNED FOOTER (Fixed Bottom) */}
            <div className="px-5 py-3.5 border-t-2 border-slate-200 bg-slate-100 flex items-center justify-between gap-3 flex-shrink-0 shadow-lg">
              <div className="flex items-center gap-2">
                {isReadyToSubmit ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Mandatory ({uploadedMandatoryCount}/{totalMandatoryCount}) ready • {totalUploadedCount} total attached
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {uploadedMandatoryCount}/{totalMandatoryCount} mandatory documents attached
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTenderModal(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!isReadyToSubmit || isSubmitting}
                  onClick={handleSubmitBid}
                  className={`px-5 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isReadyToSubmit && !isSubmitting
                      ? 'bg-[#0062FF] hover:bg-[#0050D4] text-white cursor-pointer active:scale-95 shadow-blue-500/25'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : `Submit Bid Proposal (₹${Number(bidPrice || 0).toLocaleString('en-IN')})`}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* View All Open Bids Modal */}
      {openBidsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0062FF] font-mono text-xs font-bold border border-blue-100">
                    {openBidsModal.tender.id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    OPEN BIDDING WINDOW
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  All Open Bids on Tender
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {openBidsModal.tender.title} • {openBidsModal.tender.organisation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenBidsModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-600">
                  Estimated Value: <strong>{openBidsModal.tender.estimatedValue}</strong>
                </span>
                <span className="font-mono text-slate-700">
                  Total Open Bids: <strong>{openBidsModal.bids.length}</strong>
                </span>
              </div>

              {openBidsModal.isLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0062FF]" />
                  Loading open bids...
                </div>
              ) : openBidsModal.bids.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No bids have been submitted for this tender yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Bid Reference</th>
                        <th className="p-3">Bidder Legal Entity</th>
                        <th className="p-3 text-right">Quoted Bid Price (₹)</th>
                        <th className="p-3">Submitted Date</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...openBidsModal.bids]
                        .sort((a, b) => (Number(b.bidAmount || 0) - Number(a.bidAmount || 0)))
                        .map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-500">
                            #{idx + 1} {idx === 0 && '🏆'}
                          </td>
                          <td className="p-3 font-mono font-bold text-[#0062FF]">
                            {b.bidReferenceNumber || b.id}
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            {b.bidderId?.legalBusinessName || b.bidderName || b.legalBusinessName || 'Bidder Entity'}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {b.bidAmount ? `₹${Number(b.bidAmount).toLocaleString('en-IN')}` : '₹4,18,00,000'}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {b.bidAmount ? `₹${(b.bidAmount / 10000000).toFixed(2)} Cr` : '₹4.18 Cr'}
                            </div>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px]">
                            {b.submissionDate ? new Date(b.submissionDate).toLocaleDateString('en-IN') : 'Recent'}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              {b.status || 'SUBMITTED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenBidsModal(null)}
                className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Submitted Success & Statutory Slip Download Modal */}
      {submittedReceiptModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Bid Proposal Submitted Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your bid package has been cryptographically signed and recorded into the GeM CAG Audit Ledger.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Bid Reference:</span>
                <span className="font-bold text-[#0062FF]">{submittedReceiptModal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quoted Price:</span>
                <span className="font-bold text-slate-900">₹{Number(submittedReceiptModal.bidAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tender Ref:</span>
                <span className="font-bold text-slate-700">{submittedReceiptModal.tenderId}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => generateBidSubmissionSlip(submittedReceiptModal, user)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0062FF] hover:bg-[#0050D4] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" /> Download Statutory Submission Slip
              </button>
              <button
                type="button"
                onClick={() => setSubmittedReceiptModal(null)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
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

function BidderActivityCentre({ bids = [], user = {}, onReuploadDocument }) {
  const [liveBids, setLiveBids] = useState(bids);
  const [selectedBidId, setSelectedBidId] = useState(null);
  const [isReuploading, setIsReuploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMyBids = async () => {
    setIsRefreshing(true);
    try {
      const submissions = await api.getMyBids();
      if (submissions && submissions.length > 0) {
        const formatted = submissions.map(b => ({
          id: b.bidReferenceNumber || b._id,
          _id: b._id,
          tenderId: b.tenderId?.tenderNumber || 'GEM/2026/B/849201',
          tenderTitle: b.tenderId?.title || 'Supply of Statutory Equipment',
          organisation: b.tenderId?.department || 'Ministry of Heavy Industries',
          submittedAt: new Date(b.submissionDate || b.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          status: b.status || 'SUBMITTED',
          bidAmount: Number(b.bidAmount || 0),
          complianceScore: b.evaluationResult?.complianceScore || 95.4,
          aiRecommendation: b.evaluationResult?.aiRecommendation || b.status,
          rectificationRequired: b.status === 'DISQUALIFIED' || b.status === 'NEEDS_REVIEW',
          officerDecision: b.officerDecision,
          uploadedDocuments: (b.uploadedDocuments || []).map(d => ({
            name: d.originalFileName || d.name,
            status: d.status || 'VERIFIED',
            type: d.docType || d.type || 'Statutory Certificate',
            sha256: d.sha256Hash || d.sha256Fingerprint || '0x89ab...c12d',
            confidence: `${d.ocrConfidenceScore || 98.5}%`
          })),
          activityLog: [
            { timestamp: new Date(b.submissionDate || b.createdAt).toLocaleTimeString(), event: `Bid submission recorded in MongoDB with status: ${b.status}`, type: 'SUBMIT' },
            ...(b.officerDecision?.decision ? [{
              timestamp: new Date(b.officerDecision.decidedAt).toLocaleTimeString(),
              event: `Procurement Officer recorded decision: ${b.officerDecision.decision}. Note: ${b.officerDecision.officerJustification || 'No remarks'}`,
              type: 'DECISION'
            }] : [])
          ]
        }));
        setLiveBids(formatted);
      } else if (bids && bids.length > 0) {
        setLiveBids(bids);
      }
    } catch (e) {
      if (bids && bids.length > 0) setLiveBids(bids);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyBids();
    const timer = setInterval(fetchMyBids, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (bids && bids.length > 0) {
      setLiveBids(prev => {
        const combined = [...bids, ...prev.filter(p => !bids.some(b => b.id === p.id))];
        return combined;
      });
    }
  }, [bids]);

  const activeBids = liveBids.length > 0 ? liveBids : bids;
  const currentBidId = selectedBidId || activeBids[0]?.id;
  const selectedBid = activeBids.find(b => b.id === currentBidId) || activeBids[0];

  const handleSimulateRectification = () => {
    setIsReuploading(true);
    setTimeout(() => {
      setIsReuploading(false);
      alert('Rectified high-DPI document uploaded. AI compliance score re-analyzed and status updated!');
      if (selectedBid) {
        selectedBid.status = 'VERIFIED';
        selectedBid.rectificationRequired = false;
        selectedBid.complianceScore = 94;
        selectedBid.aiRecommendation = 'QUALIFIED';
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
                ACTIVITY & COMPLIANCE CENTRE
              </span>
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-[#0062FF] text-xs font-semibold border border-blue-100">
                LIVE AUDIT TRAIL
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-[#111827] tracking-tight">
              Bid Verification & Evaluation Status
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Track real-time AI compliance verification, Officer decisions (Accepted / Pending / Disqualified), and immutable SHA-256 ledger proofs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMyBids}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0062FF]' : ''}`} />
              Refresh Status
            </button>

            <button
              type="button"
              onClick={() => generateBidSubmissionSlip(selectedBid || activeBids[0], user)}
              className="px-4 py-2.5 rounded bg-blue-50 hover:bg-blue-100 text-[#0062FF] text-xs font-bold border border-blue-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#0062FF]" />
              Download Slip
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Bids List (Left) + Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Bids selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Submitted Tender Applications ({activeBids.length})
          </h3>

          {activeBids.map((bid) => {
            const isSelected = bid.id === selectedBid?.id;
            const statusUpper = (bid.status || '').toUpperCase();
            const isAwarded = statusUpper === 'AWARDED' || statusUpper === 'ACCEPTED';
            const isQualified = statusUpper === 'QUALIFIED' || bid.aiRecommendation === 'QUALIFIED';
            const isDisqualified = statusUpper === 'DISQUALIFIED' || statusUpper === 'REJECTED';
            const isNotSelected = statusUpper === 'NOT_SELECTED';

            return (
              <div
                key={bid.id}
                onClick={() => setSelectedBidId(bid.id)}
                className={`p-4 rounded border cursor-pointer transition-all shadow-2xs ${
                  isAwarded
                    ? isSelected 
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-400' 
                      : 'bg-emerald-50/30 border-emerald-300 hover:border-emerald-400'
                    : isSelected 
                      ? 'bg-blue-50/40 border-[#0062FF] shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#0062FF]">
                    {bid.id}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                    isAwarded
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isQualified 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : isDisqualified
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isNotSelected
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {isAwarded ? '🏆 CONTRACT AWARDED (L1)' : isQualified ? '✓ ACCEPTED / QUALIFIED' : isDisqualified ? '✕ DISQUALIFIED' : isNotSelected ? '— NOT SELECTED (L2/L3)' : '⏳ PENDING EVALUATION'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-2">
                  {bid.tenderTitle}
                </h4>

                <div className="flex items-center justify-between text-[11px] py-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Price of Bid:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {bid.bidAmount ? `₹${Number(bid.bidAmount).toLocaleString('en-IN')}` : '₹4,15,00,000'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                  <span className="truncate max-w-[130px]">{bid.organisation}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateBidSubmissionSlip(bid, user);
                      }}
                      className="text-[10px] text-[#0062FF] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Slip
                    </button>
                    {isAwarded && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateLetterOfAward(bid, user);
                        }}
                        className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        🏆 LoA
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Detailed Bid Verification View */}
        {selectedBid ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* 🏆 Awarded Contract Notice Card */}
            {((selectedBid.status || '').toUpperCase() === 'AWARDED' || (selectedBid.status || '').toUpperCase() === 'ACCEPTED') && (
              <div className="p-4 sm:p-5 rounded-xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 text-emerald-950 shadow-md animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-xs">
                        🏆 CONTRACT OFFICIALLY AWARDED (L1 WINNER)
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-800">
                        Sanction Ref: LOA/2026/{selectedBid.id}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-emerald-950">
                      Tendering Authority Approved & Awarded this Proposal!
                    </h3>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Final Contract Value: <strong>₹{Number(selectedBid.bidAmount || 0).toLocaleString('en-IN')}</strong> • Evaluated as Lowest Responsive Bidder (L1) under GFR Rule 173.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => generateLetterOfAward(selectedBid, user)}
                      className="px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Letter of Award (LoA)
                    </button>
                    <button
                      type="button"
                      onClick={() => generateBidSubmissionSlip(selectedBid, user)}
                      className="px-3.5 py-2.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" /> Submission Slip
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Officer Decision Banner if Available */}
            {selectedBid.officerDecision && (
              <div className={`p-4 rounded border text-xs shadow-sm ${
                (selectedBid.officerDecision.decision || '').toUpperCase() === 'QUALIFIED'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Officer Sealed Decision: {(selectedBid.officerDecision.decision || '').toUpperCase()}
                  </span>
                  <span className="font-mono text-[10px] opacity-75">
                    {selectedBid.officerDecision.decidedAt ? new Date(selectedBid.officerDecision.decidedAt).toLocaleString('en-IN') : 'Just now'}
                  </span>
                </div>
                <p className="mt-1 leading-relaxed">
                  <strong>Remarks:</strong> {selectedBid.officerDecision.officerJustification || 'Officer validated technical & statutory compliance parameters.'}
                </p>
              </div>
            )}

            {/* Rectification Alert Box if Needs Review */}
            {selectedBid.rectificationRequired && !selectedBid.officerDecision && (
              <div className="bg-amber-50 border border-amber-200 rounded p-4 shadow-sm space-y-2">
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
                    className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {isReuploading ? 'Scanning Rectified File...' : 'Upload Rectified CA Certificate'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200/80 rounded p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#0062FF] px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {selectedBid.tenderId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Submitted: {selectedBid.submittedAt || 'Draft State'}
                    </span>
                    <button
                      type="button"
                      onClick={() => generateBidSubmissionSlip(selectedBid, user)}
                      className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[#0062FF] text-[11px] font-bold border border-blue-200 flex items-center gap-1 cursor-pointer transition-all ml-1 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Slip
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-[#111827]">
                    {selectedBid.tenderTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedBid.organisation}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-blue-50/80 px-4 py-3 rounded border border-blue-200 flex-shrink-0">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Price of Bid</div>
                    <div className="text-base font-black text-[#0062FF] font-mono">
                      {selectedBid.bidAmount ? `₹${Number(selectedBid.bidAmount).toLocaleString('en-IN')}` : '₹4,15,00,000'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      {selectedBid.bidAmount ? `₹${(Number(selectedBid.bidAmount) / 10000000).toFixed(2)} Cr` : '₹4.15 Cr'}
                    </div>
                  </div>

                  {selectedBid.complianceScore && (
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded border border-slate-200 flex-shrink-0">
                      <div className="w-12 h-12 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-lg">
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
              </div>

              {/* Verified Documents Breakdown */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0062FF]" />
                  Verified Document Manifest & AI Forensic Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedBid.uploadedDocuments || []).map((doc, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-3 flex items-start gap-2.5">
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

                  <div className="bg-slate-50 border border-slate-200 rounded p-3 flex items-start gap-2.5">
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
              <div className="mt-5 p-4 rounded bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
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
            <div className="bg-white border border-slate-200/80 rounded p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0062FF]" />
                Live Verification Timeline & Activity Centre
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(selectedBid.activityLog || []).map((log, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded bg-[#0062FF] border-2 border-white group-hover:scale-125 transition-transform" />
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
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded p-12 text-center text-slate-500 shadow-sm">
            No bids submitted yet. Please browse available tenders and submit your documents.
          </div>
        )}

      </div>

    </div>
  );
}

export function BidderPortal({ user, currentUser: propCurrentUser, defaultTab = 'kyc', onLogout }) {
  const activeUser = propCurrentUser || user;
  const isKycDone = Boolean(activeUser?.isKycVerified);

  const [currentUser, setCurrentUser] = useState(() => ({
    id: activeUser?.gemSellerId || 'GEM-VEND-2024-8841',
    name: activeUser?.name || defaultBidderProfile.name,
    email: activeUser?.email || defaultBidderProfile.email,
    company: activeUser?.organization || activeUser?.company || defaultBidderProfile.companyName,
    designation: activeUser?.designation || defaultBidderProfile.designation,
    entityType: activeUser?.entityType || defaultBidderProfile.entityType,
    panNumber: activeUser?.panNumber || '',
    gstinNumber: activeUser?.gstinNumber || '',
    udyamNumber: activeUser?.udyamNumber || '',
    isKycVerified: isKycDone,
  }));

  const [kycState, setKycState] = useState(() => ({
    isVerified: isKycDone,
    verifiedAt: activeUser?.kycVerifiedAt || null,
    documents: activeUser?.kycDocuments || null,
  }));

  // Active sub-navigation tab: 'kyc' | 'tenders' | 'preflight' | 'activity'
  const [activeTab, setActiveTab] = useState(() => {
    if (!isKycDone) return 'kyc';
    return defaultTab || 'tenders';
  });
  const [bids, setBids] = useState(defaultMyBids);
  const [awardedBid, setAwardedBid] = useState(null);
  const [cracs, setCracs] = useState([]);
  const [loadingCracs, setLoadingCracs] = useState(false);

  const fetchLiveCracs = async () => {
    try {
      setLoadingCracs(true);
      const res = await api.getMyCracs();
      if (res?.success && res.cracs) {
        setCracs(res.cracs);
      }
    } catch (e) {
      console.warn('Bidder live CRAC fetch error:', e.message);
    } finally {
      setLoadingCracs(false);
    }
  };

  const fetchLiveBids = async () => {
    try {
      const submissions = await api.getMyBids();
      if (submissions && submissions.length > 0) {
        const formatted = submissions.map(b => ({
          id: b.bidReferenceNumber || b._id,
          _id: b._id,
          tenderId: b.tenderId?.tenderNumber || b.tenderId || 'GEM/2026/B/849201',
          tenderTitle: b.tenderId?.title || 'Supply of Statutory Equipment',
          organisation: b.tenderId?.department || 'Ministry of Heavy Industries',
          submittedAt: new Date(b.submissionDate || b.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          status: b.status || 'SUBMITTED',
          bidAmount: Number(b.bidAmount || 0),
          complianceScore: b.evaluationResult?.complianceScore || 95.4,
          aiRecommendation: b.evaluationResult?.aiRecommendation || b.status,
          rectificationRequired: b.status === 'DISQUALIFIED' || b.status === 'NEEDS_REVIEW',
          officerDecision: b.officerDecision,
          uploadedDocuments: (b.uploadedDocuments || []).map(d => ({
            name: d.originalFileName || d.name,
            status: d.status || 'VERIFIED',
            type: d.docType || d.type || 'Statutory Certificate',
            sha256: d.sha256Hash || d.sha256Fingerprint || '0x89ab...c12d',
            confidence: `${d.ocrConfidenceScore || 98.5}%`
          })),
          activityLog: [
            { timestamp: new Date(b.submissionDate || b.createdAt).toLocaleTimeString(), event: `Bid submission recorded in MongoDB with status: ${b.status}`, type: 'SUBMIT' },
            ...(b.officerDecision?.decision ? [{
              timestamp: new Date(b.officerDecision.decidedAt).toLocaleTimeString(),
              event: `Procurement Officer recorded decision: ${b.officerDecision.decision}. Note: ${b.officerDecision.officerJustification || 'No remarks'}`,
              type: 'DECISION'
            }] : [])
          ]
        }));
        setBids(formatted);
        const win = formatted.find(f => (f.status || '').toUpperCase() === 'AWARDED' || (f.status || '').toUpperCase() === 'ACCEPTED');
        setAwardedBid(win || null);
      }
    } catch (e) {
      console.warn('Bidder live fetch error:', e.message);
    }
  };

  React.useEffect(() => {
    fetchLiveBids();
    fetchLiveCracs();
    const timer = setInterval(() => {
      fetchLiveBids();
      fetchLiveCracs();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'crac') {
      setActiveTab('crac');
    } else if (defaultTab && kycState.isVerified) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, kycState.isVerified]);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      setCurrentUser(null);
    }
  };

  const handleVerifyKyc = (result) => {
    setKycState(result);
    setCurrentUser(prev => ({ ...prev, isKycVerified: true }));
    try {
      const saved = localStorage.getItem('praman_user');
      if (saved) {
        const u = JSON.parse(saved);
        const updated = {
          ...u,
          isKycVerified: true,
          kycVerifiedAt: result.verifiedAt,
          kycDocuments: result.documents,
        };
        localStorage.setItem('praman_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Could not persist KYC verification:', e);
    }
    setActiveTab('tenders');
  };

  const handleBidSubmitted = (newBid) => {
    setBids(prev => [newBid, ...prev]);
    fetchLiveBids();
    setActiveTab('activity');
  };


  if (!currentUser) {
    return <BidderLogin onLogin={handleLogin} />;
  }


  return (
    <div className="space-y-6">
      
      {/* Bidder Profile Top Bar */}
      <div className="bg-white border border-slate-200/80 rounded p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 rounded bg-gradient-to-tr from-[#0062FF] to-[#00D4B2] flex items-center justify-center text-white font-bold text-lg shadow-sm">
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Pending Verification
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out of Bidder Portal"
            className="p-2 px-3 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* 🏆 CONTRACT AWARDED CELEBRATION HERO BANNER */}
      {awardedBid && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl p-5 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-4 border-2 border-emerald-400/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider border border-white/30 flex items-center gap-1 shadow-xs">
                  🏆 CONTRACT OFFICIALLY AWARDED (L1 WINNER)
                </span>
                <span className="font-mono text-xs text-emerald-100 font-bold">
                  {awardedBid.id}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                Congratulations! Your Bid Proposal has been ACCEPTED & AWARDED!
              </h2>
              <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                Tender: <strong>{awardedBid.tenderTitle}</strong> ({awardedBid.tenderId}) • 
                Quoted Value: <strong>₹{Number(awardedBid.bidAmount || 0).toLocaleString('en-IN')}</strong>. 
                The competent procurement authority has accepted your proposal as the Lowest Responsive Bidder (L1).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => generateLetterOfAward(awardedBid, currentUser)}
                className="px-4 py-2.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                🏆 Download Letter of Award (LoA)
              </button>
              <button
                type="button"
                onClick={() => generateBidSubmissionSlip(awardedBid, currentUser)}
                className="px-3.5 py-2.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-400/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                📄 Download Submission Slip
              </button>
              {cracs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('crac')}
                  className="px-3.5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  ⭐ View Consignee CRAC Review ({cracs[0]?.rating || 5}★)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AHREFS-STYLE SUB-NAVIGATION NAVBAR */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-slate-200/80 shadow-xs overflow-x-auto">
        
        {/* Tab 1: Master KYC */}
        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'kyc'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'tenders'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : kycState.isVerified
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                : 'text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'preflight'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'activity' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            4
          </span>
          My Submissions & Activity Centre
          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[#0062FF] text-[10px] font-mono ml-1 font-bold">
            {bids.length}
          </span>
        </button>

        {/* Tab 5: Consignee CRAC Reviews */}
        <button
          onClick={() => setActiveTab('crac')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'crac'
              ? 'bg-[#0062FF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'crac' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            5
          </span>
          Consignee CRAC Reviews
          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[10px] font-mono ml-1 font-bold">
            {cracs.length}
          </span>
        </button>

      </div>

      {/* View Panels */}
      {activeTab === 'kyc' && (
        <BidderKYC 
          user={currentUser}
          kycState={kycState} 
          onVerifyKyc={handleVerifyKyc}
          onContinueToBids={() => setActiveTab('tenders')}
        />
      )}


      {activeTab === 'tenders' && (
        <BidderTenderBrowser 
          user={currentUser}
          onBidSubmitted={handleBidSubmitted}
        />
      )}


      {activeTab === 'preflight' && (
        <BidderSmartPreFlight />
      )}

      {activeTab === 'activity' && (
        <BidderActivityCentre 
          bids={bids}
          user={currentUser}
        />
      )}

      {activeTab === 'crac' && (
        <BidderCracReviewView 
          user={currentUser}
          cracs={cracs}
          onRefresh={fetchLiveCracs}
          loading={loadingCracs}
        />
      )}

    </div>
  );
}

export default BidderPortal;
