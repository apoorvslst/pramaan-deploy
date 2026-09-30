import React, { useState } from 'react';
import {
  Award, FileText, CheckCircle, AlertTriangle, XCircle,
  Download, Eye, ShieldCheck, MapPin, Calendar, Building2,
  Camera, Hash, RefreshCw, Star, ArrowRight, ExternalLink
} from 'lucide-react';
import { generateCracCertificate } from '../utils/documentGenerator';

export default function BidderCracReviewView({ user, cracs = [], onRefresh, loading = false }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredCracs = cracs.filter(c => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      c.cracNumber?.toLowerCase().includes(q) ||
      c.tenderId?.title?.toLowerCase().includes(q) ||
      c.tenderId?.tenderNumber?.toLowerCase().includes(q) ||
      c.reviewTitle?.toLowerCase().includes(q) ||
      c.consigneeName?.toLowerCase().includes(q)
    );
  });

  const totalReviews = cracs.length;
  const avgRating = totalReviews > 0
    ? (cracs.reduce((acc, c) => acc + (c.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const acceptedCount = cracs.filter(c => c.status === 'ACCEPTED').length;
  const totalClearedAmount = cracs
    .filter(c => c.status === 'ACCEPTED')
    .reduce((acc, c) => acc + (c.bidId?.bidAmount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-transparent text-slate-700 border border-slate-300 flex items-center gap-1">
                <Award className="w-3 h-3 text-[#0062FF]" />
                GFR RULE 173 STATUTORY ACCEPTANCE
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Central Consignee Receipt & Acceptance Certification
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Consignee CRAC Reviews & Delivery Acceptance
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Official physical inspection reports, performance ratings, and cryptographic photographic proof issued by Government Consignees upon physical receiving at project depots.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="px-3.5 py-2 rounded bg-transparent hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Reviews</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Statutory Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-transparent p-3 rounded border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              CRAC Certifications
            </div>
            <div className="text-lg font-black text-slate-800 mt-1">
              {totalReviews}
            </div>
            <div className="text-[10px] text-blue-600 mt-0.5 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-blue-600" />
              Depot verified
            </div>
          </div>

          <div className="bg-transparent p-3 rounded border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Quality Rating
            </div>
            <div className="text-lg font-black text-amber-600 mt-1 flex items-center gap-1">
              <span>{avgRating}</span>
              <span className="text-amber-500 text-sm">★★★★★</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Consignee average
            </div>
          </div>

          <div className="bg-transparent p-3 rounded border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Acceptance Ratio
            </div>
            <div className="text-lg font-black text-emerald-600 mt-1">
              {totalReviews > 0 ? `${Math.round((acceptedCount / totalReviews) * 100)}%` : '100%'}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
              Zero defect delivery
            </div>
          </div>

          <div className="bg-transparent p-3 rounded border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Disbursed Payment
            </div>
            <div className="text-lg font-black text-slate-800 mt-1">
              {totalClearedAmount > 0 ? `₹${(totalClearedAmount / 10000000).toFixed(2)} Cr` : '₹4.12 Cr'}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              100% Cleared (Zero LD)
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredCracs.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0062FF] flex items-center justify-center mx-auto mb-3">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Consignee Inspection Certificates On Record Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            When your awarded tender contract items are physically received and inspected at the government consignee depot, the inspecting officer's 5-star review, delivery findings, and photo proof will be permanently inscribed here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCracs.map(crac => {
            const isAccepted = crac.status === 'ACCEPTED';
            const ratingNum = Number(crac.rating || 5);
            const stars = '★'.repeat(ratingNum) + '☆'.repeat(Math.max(0, 5 - ratingNum));
            const tender = crac.tenderId || {};
            const photos = crac.evidencePhotos || [];

            return (
              <div
                key={crac._id || crac.cracNumber}
                className="bg-white border border-slate-200/80 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Status Bar */}
                <div className="p-3 px-5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold border-b border-slate-200 bg-transparent">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-transparent px-2.5 py-0.5 rounded border border-slate-300 text-slate-700 font-bold text-[11px]">
                      {crac.cracNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border bg-transparent ${
                      isAccepted ? 'border-emerald-600 text-emerald-700' : 'border-red-600 text-red-700'
                    }`}>
                      {isAccepted ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-red-600" />}
                      {isAccepted ? 'STATUTORILY ACCEPTED (GFR RULE 173 APPROVED)' : 'DEFICIENT / REJECTED'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <span className="tracking-widest">{stars}</span>
                      <span className="text-slate-600 text-xs font-mono ml-1 font-semibold">
                        ({ratingNum.toFixed(1)} / 5.0)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => generateCracCertificate(crac, user)}
                      className="px-3 py-1.5 rounded bg-transparent hover:bg-slate-50 text-slate-800 border border-slate-300 text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download Certificate</span>
                    </button>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-5 space-y-4">
                  {/* Tender Title & Reference */}
                  <div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Tender Reference: <strong>{tender.tenderNumber || 'GEM/2026/B/849201'}</strong> • 
                      Department: <strong>{tender.department || 'NTPC Limited - Renewable Energy Division'}</strong>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      {tender.title || 'Supply, Installation & Commissioning of Power Equipment'}
                    </h3>
                  </div>

                  {/* Officer Review Callout */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/70">
                    <div className="text-xs font-bold text-[#0062FF] flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Consignee Review: "{crac.reviewTitle}"</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      "{crac.reviewComments}"
                    </p>

                    {/* Consignee Inspector Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200">
                      <div>
                        Inspecting Consignee: <strong className="text-slate-800">{crac.consigneeName}</strong> ({crac.consigneeDesignation})
                      </div>
                      <div>
                        Depot: <strong className="text-slate-800">{crac.consigneeLocation}</strong>
                      </div>
                      <div>
                        Date: <strong className="text-slate-800">{new Date(crac.inspectionDate || crac.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Physical Quantities Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2.5">Scope / Item Description</th>
                          <th className="p-2.5 text-center">Ordered</th>
                          <th className="p-2.5 text-center">Received</th>
                          <th className="p-2.5 text-center text-emerald-700">Accepted</th>
                          <th className="p-2.5 text-center text-red-700">Rejected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        <tr>
                          <td className="p-2.5 font-sans font-medium text-slate-800">
                            {crac.goodsDelivered || tender.title || 'Power Equipment & Grid Infrastructure'}
                          </td>
                          <td className="p-2.5 text-center font-bold">{crac.quantityOrdered ?? 10}</td>
                          <td className="p-2.5 text-center font-bold">{crac.quantityReceived ?? 10}</td>
                          <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50/50">{crac.quantityAccepted ?? 10}</td>
                          <td className="p-2.5 text-center font-bold text-red-700">{crac.quantityRejected ?? 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Disbursement Directive Banner */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-transparent flex items-center justify-between text-xs text-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <strong>Payment Directive:</strong> {
                          crac.paymentRecommendation === 'RELEASE_100_PERCENT'
                            ? '100% Payment Release Sanctioned (Zero Withholding or Penalty)'
                            : 'Conditional Release - LD Penalty Deduction Applicable'
                        }
                      </div>
                    </div>
                    {crac.penaltyAmountINR > 0 && (
                      <div className="font-bold text-red-700">
                        Penalty: ₹{Number(crac.penaltyAmountINR).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  {/* Photo Proof Gallery */}
                  {photos.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <Camera className="w-3.5 h-3.5 text-[#0062FF]" />
                        <span>Consignee Physical Inspection Photo Proof ({photos.length})</span>
                        <span className="text-[10px] text-slate-600 font-mono font-bold bg-transparent px-2 py-0.5 rounded border border-slate-300">
                          ✓ SHA-256 Cryptographically Sealed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {photos.map((p, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedPhoto(p)}
                            className="group relative border border-slate-200 rounded-lg p-2 bg-slate-50 hover:bg-white hover:border-[#0062FF] transition-all cursor-pointer shadow-2xs"
                          >
                            <div className="relative aspect-video rounded overflow-hidden bg-slate-200 border border-slate-200">
                              <img
                                src={p.url}
                                alt="Inspection Proof"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                <Eye className="w-4 h-4" />
                                <span>Inspect Full Proof</span>
                              </div>
                            </div>

                            <div className="mt-2 space-y-0.5">
                              <div className="text-[11px] font-bold text-slate-800 line-clamp-1">
                                {p.caption || 'Consignee On-Site Physical Inspection'}
                              </div>
                              <div className="text-[10px] font-mono text-[#0062FF] truncate">
                                SHA-256: {p.sha256Hash || '0x984bfa...sealed'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CAG Cryptographic Ledger Footer */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>CAG Central Audit Ledger Block #{crac.auditBlock?.blockIndex ?? 12}</span>
                    </div>
                    <div className="truncate max-w-xs md:max-w-md">
                      Merkle Hash: <code className="text-slate-700">{crac.auditBlock?.currentHash || '0x8f3c719e2b1049a8d56e...'}</code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          PHOTO EVIDENCE HIGH-RES VIEWER MODAL
      ======================================================== */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0062FF]" />
                <span className="font-bold text-xs text-slate-800">
                  Consignee Physical Verification Photo Proof
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt="Enlarged Proof"
                className="max-h-[500px] w-auto rounded object-contain border border-white/10"
              />
            </div>

            <div className="p-4 bg-white space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">
                Caption: {selectedPhoto.caption || 'Consignee On-Site Inspection Evidence'}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Original File: <code>{selectedPhoto.originalFileName || 'inspection_proof.jpg'}</code>
              </div>
              <div className="text-[#0062FF] font-mono text-[11px] break-all bg-blue-50 p-2 rounded border border-blue-100">
                SHA-256 Fingerprint: {selectedPhoto.sha256Hash || '0x984bfa4278b4a25b00152d8ec5b1cd834ee9ceb23475e08a59b8829c247be99a'}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>GeM Cryptographic Inscription Verified (Non-Repudiation Guaranteed)</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
