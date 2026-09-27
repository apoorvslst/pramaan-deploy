import React from 'react';
import { ShieldCheck, Building, User, LogOut, CheckCircle } from './Icons';

export const Header = ({ currentRole, currentUser, onLogout }) => {
  const isOfficer = currentRole === 'OFFICER';

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

        {/* Dynamic Authenticated Role Pill */}
        {isOfficer ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-[#635BFF] shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#635BFF]" />
            <span>GeM Procurement Officer Console</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white text-[10px] font-mono font-bold text-indigo-700 border border-indigo-100">
              OFFICER ONLY
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-800 shadow-2xs">
            <Building className="w-4 h-4 text-cyan-700" />
            <span>Verified Bidder & Vendor Portal</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white text-[10px] font-mono font-bold text-cyan-700 border border-cyan-100">
              BIDDER ONLY
            </span>
          </div>
        )}

        {/* User Identity & Logout Button (Strictly No Role Switching) */}
        <div className="flex items-center gap-3">
          
          {/* Active User Identity Pill */}
          {currentUser && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs shadow-2xs">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                isOfficer ? 'bg-indigo-100 text-[#635BFF]' : 'bg-cyan-100 text-cyan-800'
              }`}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left">
                <div className="font-bold text-[#0A2540] text-[11px] leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">
                  {currentUser.organisation || (isOfficer ? 'NTPC Ltd' : 'Solarix Green Energy')}
                </div>
              </div>
            </div>
          )}

          {/* Secure Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all shadow-2xs"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

export default Header;
