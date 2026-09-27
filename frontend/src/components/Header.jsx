import React from 'react';
import { ShieldCheck, Building, User, LogOut } from './Icons';

export const Header = ({ currentRole, currentUser, onLogout }) => {
  const isOfficer = currentRole === 'OFFICER' || currentRole === 'CAG_AUDITOR';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-[#0062FF] text-white font-bold text-sm tracking-wider">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  PRAMAN
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  GeM Verification Engine
                </span>
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded bg-emerald-500"></span>
              Live
            </span>
          </div>
        </div>

        {/* User Identity, Role Tag & Logout */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded bg-emerald-500"></span>
            <span>Microservice: <strong>Ready</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            {isOfficer ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#0062FF]" />
            ) : (
              <Building className="w-3.5 h-3.5 text-cyan-700" />
            )}
            <span>{isOfficer ? 'Procurement Officer' : 'Bidder'}</span>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800">{currentUser.name}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 font-mono text-[11px]">{currentUser.organisation || 'NTPC Ltd'}</span>
            </div>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

export default Header;
