import React from 'react';
import { ShieldCheck, Activity, Users, Lock, Sparkles, FileText, Database } from './Icons';

export const Header = ({ currentRole, setRole, activeTab, setActiveTab }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & GeM Seal */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#00D4B2] shadow-sm text-white font-extrabold text-xl tracking-wider">
              P
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-[#0A2540] flex items-center gap-1.5">
                  PRAMAN <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-[#635BFF] font-bold border border-indigo-100">v1.0 AI</span>
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono font-medium border border-amber-200">
                  SIH PS 26100
                </span>
              </div>
              <p className="text-xs text-[#425466] font-medium">
                AI-Powered Integrated Bid Compliance Verification Engine for GeM
              </p>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Pipeline
            </span>
          </div>
        </div>

        {/* Navigation Mode Pill */}
        {currentRole === 'BIDDER' ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Bidder Portal: One-Time KYC & Live Tender Bids
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-[#635BFF] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#635BFF] animate-pulse"></span>
            {currentRole === 'OFFICER' ? 'GeM Procurement Officer Workspace' : 'CAG Statutory Audit Mode (Read-Only)'}
          </div>
        )}

        {/* Role Switcher & Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-mono text-slate-400">AI Service:</span>
            <span className="font-semibold text-emerald-600">CONNECTED</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <span className="text-xs px-2 font-mono text-slate-500">Role:</span>
            {['OFFICER', 'CAG_AUDITOR', 'BIDDER'].map((role) => (
              <button
                key={role}
                onClick={() => setRole(role)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === role
                    ? 'bg-white text-[#0A2540] shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {role === 'OFFICER' ? 'GeM Officer' : role === 'CAG_AUDITOR' ? 'CAG Auditor' : 'Bidder Portal'}
              </button>
            ))}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
