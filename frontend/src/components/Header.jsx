import React from 'react';
import { ShieldCheck, Building, User, LogOut } from './Icons';

export const Header = ({ currentRole, currentUser, onLogout }) => {
  const isOfficer = currentRole === 'OFFICER' || currentRole === 'CAG_AUDITOR';

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-4 lg:px-8 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand / Logo (Ahrefs-Inspired Crisp Identity) */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0062FF] text-white font-extrabold text-base tracking-wider shadow-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#111827] flex items-center gap-1.5">
                  PRAMAN
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold bg-[#EAF2FF] text-[#0062FF] border border-[#BFDBFE]">
                    GeM AI Engine
                  </span>
                </h1>
                <span className="text-[11px] px-1.5 py-0.2 rounded font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  SIH 26100
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                Autonomous Statutory Bid Verification & Cartel Detection
              </p>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
        </div>

        {/* Role Pill Indicator */}
        {isOfficer ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs font-semibold text-[#0062FF] shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#0062FF]" />
            <span>GeM Procurement Officer Console</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white text-[10px] font-mono font-bold text-[#0062FF] border border-blue-200">
              {currentRole === 'CAG_AUDITOR' ? 'CAG AUDITOR' : 'OFFICER'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-800 shadow-2xs">
            <Building className="w-4 h-4 text-cyan-700" />
            <span>Verified Bidder & Vendor Portal</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white text-[10px] font-mono font-bold text-cyan-700 border border-cyan-100">
              BIDDER
            </span>
          </div>
        )}

        {/* User Identity, AI Microservice status, & Logout */}
        <div className="flex items-center gap-3">
          
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">AI Microservice:</span>
            <span className="font-semibold text-slate-700">:8000 Ready</span>
          </div>

          {/* Active User Identity Pill */}
          {currentUser && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs shadow-2xs">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                isOfficer ? 'bg-blue-100 text-[#0062FF]' : 'bg-cyan-100 text-cyan-800'
              }`}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left">
                <div className="font-bold text-[#111827] text-[11px] leading-tight">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
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
