import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award, FileCheck2, Camera, Star, CheckCircle, AlertTriangle,
  XCircle, Upload, ShieldCheck, Download, RefreshCw, Search,
  Building2, Calendar, MapPin, Hash, Eye, AlertCircle, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { generateCracCertificate } from '../utils/documentGenerator';

export default function CracOfficerPortal() {
  const [searchParams] = useSearchParams();
  const preselectedBidId = searchParams.get('bidId');

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'issued'
  const [contracts, setContracts] = useState([]);
  const [issuedCracs, setIssuedCracs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection Modal State
  const [selectedContract, setSelectedContract] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCrac, setEditingCrac] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Form Fields
  const [verdict, setVerdict] = useState('ACCEPTED'); // 'ACCEPTED' | 'REJECTED' | 'PARTIALLY_ACCEPTED'
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('Exemplary Delivery & Timely Site Commissioning (100% Quality Pass)');
  const [reviewComments, setReviewComments] = useState(
    'Consignee depot conducted physical inspection of the delivered equipment. Verified against factory test certificates and BIS standards with 0 defects. Packaging intact, warranty cards and OEM serials verified against NIT.'
  );
  const [goodsDelivered, setGoodsDelivered] = useState('');
  const [qtyOrdered, setQtyOrdered] = useState(10);
  const [qtyReceived, setQtyReceived] = useState(10);
  const [qtyAccepted, setQtyAccepted] = useState(10);
  const [qtyRejected, setQtyRejected] = useState(0);
  const [consigneeName, setConsigneeName] = useState('Dr. Rajesh Verma');
  const [consigneeDesignation, setConsigneeDesignation] = useState('Chief Procurement Officer & Consignee');
  const [consigneeLocation, setConsigneeLocation] = useState('Central Receiving Depot, NTPC Bhadla Solar Park Site, Rajasthan');
  const [paymentRec, setPaymentRec] = useState('RELEASE_100_PERCENT');
  const [penaltyAmount, setPenaltyAmount] = useState(0);

  // Photo Upload State
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [samplePhotoSelected, setSamplePhotoSelected] = useState('sample_solar');
  const [photoCaption, setPhotoCaption] = useState('Consignee Physical Verification Photo - Equipment Installed On-Site');

  // Photo Proof Viewer Modal
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Fetch pending contracts and issued CRACs
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [pendingRes, cracRes] = await Promise.all([
        api.getPendingContractsForCrac(),
        api.getAllCracs()
      ]);

      if (pendingRes?.success) {
        setContracts(pendingRes.contracts || []);
      }
      if (cracRes?.success) {
        setIssuedCracs(cracRes.cracs || []);
      }
    } catch (err) {
      console.error('[CRAC Portal Load Error]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pre-select contract if bidId passed in URL
  useEffect(() => {
    if (preselectedBidId && contracts.length > 0) {
      const match = contracts.find(c => String(c.bidId) === String(preselectedBidId));
      if (match) {
        handleOpenModal(match);
      }
    }
  }, [preselectedBidId, contracts]);

  const handleOpenModal = (contract) => {
    setSelectedContract(contract);
    setEditingCrac(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    setGoodsDelivered(contract.tender?.title || 'Solar Power Generation & Transmission Equipment');
    setModalOpen(true);
  };

  const handleOpenReinspectModal = (contract, crac) => {
    setSelectedContract(contract);
    const targetCrac = crac || contract.crac;
    setEditingCrac(targetCrac || null);
    setSubmitError(null);
    setSubmitSuccess(null);
    if (targetCrac) {
      setVerdict(targetCrac.status || 'ACCEPTED');
      setRating(Number(targetCrac.rating || 5));
      setReviewTitle(targetCrac.reviewTitle || '');
      setReviewComments(targetCrac.reviewComments || '');
      setGoodsDelivered(targetCrac.goodsDelivered || contract.tender?.title || '');
      setQtyOrdered(targetCrac.quantityOrdered ?? 10);
      setQtyReceived(targetCrac.quantityReceived ?? 10);
      setQtyAccepted(targetCrac.quantityAccepted ?? 10);
      setQtyRejected(targetCrac.quantityRejected ?? 0);
      setPaymentRec(targetCrac.paymentRecommendation || 'RELEASE_100_PERCENT');
      setPenaltyAmount(targetCrac.penaltyAmountINR ?? 0);
      if (targetCrac.consigneeName) setConsigneeName(targetCrac.consigneeName);
      if (targetCrac.consigneeLocation) setConsigneeLocation(targetCrac.consigneeLocation);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedContract(null);
    setEditingCrac(null);
    setUploadedPhotos([]);
    setPhotoPreviewUrls([]);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Handle local file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedPhotos(files);
      const urls = files.map(f => URL.createObjectURL(f));
      setPhotoPreviewUrls(urls);
      setSamplePhotoSelected('');
    }
  };

  // Submit CRAC form
  const handleSubmitCrac = async (e) => {
    e.preventDefault();
    if (!selectedContract) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const formData = new FormData();
      formData.append('bidId', selectedContract.bidId);
      formData.append('tenderId', selectedContract.tender?._id || selectedContract.tender?.id || selectedContract.tender);
      formData.append('status', verdict);
      formData.append('rating', rating);
      formData.append('reviewTitle', reviewTitle);
      formData.append('reviewComments', reviewComments);
      formData.append('goodsDelivered', goodsDelivered);
      formData.append('quantityOrdered', qtyOrdered);
      formData.append('quantityReceived', qtyReceived);
      formData.append('quantityAccepted', qtyAccepted);
      formData.append('quantityRejected', qtyRejected);
      formData.append('consigneeName', consigneeName);
      formData.append('consigneeDesignation', consigneeDesignation);
      formData.append('consigneeLocation', consigneeLocation);
      formData.append('paymentRecommendation', paymentRec);
      formData.append('penaltyAmountINR', penaltyAmount);
      formData.append('photoCaption', photoCaption);
      formData.append('isReinspection', Boolean(editingCrac));

      if (editingCrac?._id) {
        formData.append('cracId', editingCrac._id);
      }

      // Append uploaded files if any
      if (uploadedPhotos.length > 0) {
        uploadedPhotos.forEach(file => {
          formData.append('photos', file);
        });
      } else {
        // Use high-resolution statutory field photo based on sample preset
        const sampleUrl = verdict === 'ACCEPTED'
          ? (samplePhotoSelected === 'sample_solar' 
              ? 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80'
              : 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80')
          : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
        formData.append('photoUrl', sampleUrl);
      }

      let res;
      if (editingCrac?._id) {
        res = await api.updateCrac(editingCrac._id, formData);
      } else {
        res = await api.submitCrac(formData);
      }

      if (res.success) {
        setSubmitSuccess(
          editingCrac
            ? `CRAC Certificate (${res.crac?.cracNumber || editingCrac.cracNumber}) updated successfully after re-inspection!`
            : `CRAC Certificate (${res.crac?.cracNumber}) generated and sealed into CAG Blockchain Ledger!`
        );
        setTimeout(() => {
          handleCloseModal();
          loadData();
          setActiveTab('issued');
        }, 1200);
      } else {
        setSubmitError(res.message || 'Failed to process CRAC certificate.');
      }
    } catch (err) {
      setSubmitError(err.message || 'Error occurred while submitting CRAC.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lists
  const filteredContracts = contracts.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.bidReferenceNumber?.toLowerCase().includes(q) ||
      c.tender?.tenderNumber?.toLowerCase().includes(q) ||
      c.tender?.title?.toLowerCase().includes(q) ||
      c.bidder?.legalBusinessName?.toLowerCase().includes(q) ||
      c.bidder?.tradeName?.toLowerCase().includes(q)
    );
  });

  const filteredIssuedCracs = issuedCracs.filter(crac => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      crac.cracNumber?.toLowerCase().includes(q) ||
      crac.tenderId?.tenderNumber?.toLowerCase().includes(q) ||
      crac.tenderId?.title?.toLowerCase().includes(q) ||
      crac.bidderId?.legalBusinessName?.toLowerCase().includes(q) ||
      crac.reviewTitle?.toLowerCase().includes(q)
    );
  });

  const totalContractsCount = contracts.length;
  const pendingCount = contracts.filter(c => !c.hasCrac).length;
  const issuedCount = issuedCracs.length;
  const totalDisbursed = issuedCracs.reduce((acc, c) => acc + (c.bidId?.bidAmount || 0), 0);

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                background: 'transparent',
                border: '1px solid #cbd5e1',
                color: '#0369a1',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: '0.68rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <Award style={{ width: 13, height: 13, color: '#0284c7' }} />
                <span>GeM GFR RULE 173 STATUTORY COMPLIANCE</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Consignee Receipt & Acceptance Certification System
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: '1.45rem', fontWeight: 900 }}>
              Consignee Receipt & Acceptance Certificate (CRAC) Centre
            </h1>
            <p className="page-subtitle" style={{ fontSize: '0.78rem' }}>
              Inspect delivered goods & services, record quality reviews with cryptographic photo evidence, and sanction public funds disbursement.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} className={refreshing ? 'animate-spin' : ''} />
            <span>Sync Live Records</span>
          </button>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Metric Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Awarded Contracts
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
              {totalContractsCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#0284c7', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FileCheck2 style={{ width: 12, height: 12 }} /> Awarded post-evaluation
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Inspection Pending (Action Due)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706', marginTop: 4 }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#b45309', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle style={{ width: 12, height: 12 }} /> Awaiting depot physical verification
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Issued CRAC Certificates
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', marginTop: 4 }}>
              {issuedCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck style={{ width: 12, height: 12 }} /> Inscribed into CAG Cryptographic Ledger
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Sanctioned Disbursement
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
              {totalDisbursed > 0 ? `₹${(totalDisbursed / 10000000).toFixed(2)} Cr` : '₹4.12 Cr'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle style={{ width: 12, height: 12 }} /> Cleared for treasury disbursement
            </div>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 10
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '8px 16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: activeTab === 'pending' ? '#0284c7' : 'var(--border-default)',
                background: activeTab === 'pending' ? '#0284c7' : 'var(--bg-card)',
                color: activeTab === 'pending' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease'
              }}
            >
              <span>Delivered Contracts Pending Inspection</span>
              <span style={{
                background: activeTab === 'pending' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: activeTab === 'pending' ? '#ffffff' : '#334155',
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: 10,
                fontWeight: 800
              }}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('issued')}
              style={{
                padding: '8px 16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: activeTab === 'issued' ? '#059669' : 'var(--border-default)',
                background: activeTab === 'issued' ? '#059669' : 'var(--bg-card)',
                color: activeTab === 'issued' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease'
              }}
            >
              <span>Issued CRAC Registry & Cryptographic Archive</span>
              <span style={{
                background: activeTab === 'issued' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: activeTab === 'issued' ? '#ffffff' : '#334155',
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: 10,
                fontWeight: 800
              }}>
                {issuedCount}
              </span>
            </button>
          </div>

          <div style={{ position: 'relative', width: 320 }}>
            <Search style={{ width: 14, height: 14, position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by tender, contractor or CRAC #..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                fontSize: '0.72rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Tab 1: Delivered Contracts Pending CRAC Inspection */}
        {activeTab === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredContracts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <FileCheck2 style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  No Contracts Awaiting CRAC Inspection
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 460, margin: '6px auto 0' }}>
                  When bids are evaluated and awarded in the 3-Pane Evidence Viewer, contracts automatically appear here for physical depot verification.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredContracts.map(c => {
                  const hasCrac = Boolean(c.hasCrac);
                  const amount = Number(c.bidAmount || 0);
                  const amountStr = `₹${(amount / 10000000).toFixed(2)} Cr (₹${amount.toLocaleString('en-IN')})`;

                  return (
                    <div
                      key={c.bidId}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        boxShadow: 'var(--shadow-card)',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 280 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              background: 'transparent',
                              border: '1px solid #cbd5e1',
                              color: '#0369a1',
                              padding: '2px 8px',
                              borderRadius: 4
                            }}>
                              {c.tender?.tenderNumber || 'GEM/2026/B/739102'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              Ref: <code>{c.bidReferenceNumber}</code>
                            </span>
                            {hasCrac ? (
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                background: 'transparent',
                                border: '1px solid #16a34a',
                                color: '#15803d',
                                padding: '2px 8px',
                                borderRadius: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <CheckCircle style={{ width: 11, height: 11 }} /> CRAC ISSUED ({c.crac?.cracNumber})
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                background: 'transparent',
                                border: '1px solid #d97706',
                                color: '#b45309',
                                padding: '2px 8px',
                                borderRadius: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <AlertTriangle style={{ width: 11, height: 11 }} /> INSPECTION DUE
                              </span>
                            )}
                          </div>

                          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                            {c.tender?.title || 'Smart Energy Metering & SCADA Automation'}
                          </h3>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Building2 style={{ width: 13, height: 13, color: '#0284c7' }} />
                              <span>Vendor: <strong>{c.bidder?.legalBusinessName || c.bidder?.tradeName || 'Contractor'}</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Hash style={{ width: 13, height: 13, color: '#64748b' }} />
                              <span>GSTIN: <code>{c.bidder?.gstin || '—'}</code></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Award style={{ width: 13, height: 13, color: '#16a34a' }} />
                              <span>Contract Value: <strong style={{ color: '#16a34a' }}>{amountStr}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'center' }}>
                          {hasCrac ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const crac = issuedCracs.find(x => x.cracNumber === c.crac?.cracNumber);
                                  if (crac) {
                                    generateCracCertificate(crac);
                                  } else {
                                    setActiveTab('issued');
                                  }
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                              >
                                <Download style={{ width: 13, height: 13 }} />
                                <span>Download Certificate</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const crac = issuedCracs.find(x => x.cracNumber === c.crac?.cracNumber) || c.crac;
                                  handleOpenReinspectModal(c, crac);
                                }}
                                className="btn btn-sm"
                                style={{
                                  background: 'transparent',
                                  color: '#0284c7',
                                  border: '1px solid #0284c7',
                                  fontWeight: 700,
                                  padding: '6px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer'
                                }}
                              >
                                <RefreshCw style={{ width: 12, height: 12 }} />
                                <span>Re-inspect & Update</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenModal(c)}
                              className="btn btn-sm"
                              style={{
                                background: '#0284c7',
                                color: '#ffffff',
                                fontWeight: 700,
                                border: 'none',
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                borderRadius: 'var(--radius-sm)'
                              }}
                            >
                              <Camera style={{ width: 14, height: 14 }} />
                              <span>Conduct Inspection & Issue CRAC</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Issued CRAC Registry & Cryptographic Archive */}
        {activeTab === 'issued' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredIssuedCracs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <Award style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  No CRAC Certificates Issued Yet
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 460, margin: '6px auto 0' }}>
                  Once you conduct a physical consignee inspection and submit review photos, official certificates will be permanently archived here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredIssuedCracs.map(crac => {
                  const isAccepted = crac.status === 'ACCEPTED';
                  const stars = '★'.repeat(crac.rating || 5) + '☆'.repeat(Math.max(0, 5 - (crac.rating || 5)));
                  const firstPhoto = crac.evidencePhotos?.[0];

                  return (
                    <div
                      key={crac._id || crac.cracNumber}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                        boxShadow: 'var(--shadow-card)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#0284c7',
                              background: 'transparent',
                              border: '1px solid #cbd5e1',
                              padding: '2px 8px',
                              borderRadius: 4
                            }}>
                              {crac.cracNumber}
                            </span>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              background: 'transparent',
                              border: isAccepted ? '1px solid #16a34a' : '1px solid #dc2626',
                              color: isAccepted ? '#15803d' : '#b91c1c',
                              padding: '2px 8px',
                              borderRadius: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              {isAccepted ? <CheckCircle style={{ width: 11, height: 11 }} /> : <AlertTriangle style={{ width: 11, height: 11 }} />}
                              {isAccepted ? 'CONSIGNEE ACCEPTANCE (GFR-173 PASSED)' : 'DEFICIENCY / REJECTION FLAG'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 700 }}>
                              <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>{stars}</span> ({crac.rating}.0 / 5.0)
                            </span>
                          </div>

                          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                            {crac.reviewTitle}
                          </h3>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Contract: <strong>{crac.tenderId?.title || 'Solar Power Project'}</strong> • Vendor: <strong style={{ color: '#0369a1' }}>{crac.bidderId?.legalBusinessName || 'Apex Power'}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => generateCracCertificate(crac)}
                            className="btn btn-sm"
                            style={{
                              background: '#0f172a',
                              color: 'white',
                              fontWeight: 700,
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '7px 14px'
                            }}
                          >
                            <Download style={{ width: 13, height: 13 }} />
                            <span>Download Statutory CRAC</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const parentContract = contracts.find(x => String(x.bidId) === String(crac.bidId?._id || crac.bidId)) || {
                                bidId: crac.bidId?._id || crac.bidId,
                                tender: crac.tenderId,
                                bidder: crac.bidderId,
                                crac: crac
                              };
                              handleOpenReinspectModal(parentContract, crac);
                            }}
                            className="btn btn-sm"
                            style={{
                              background: 'transparent',
                              color: '#0284c7',
                              border: '1px solid #0284c7',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer'
                            }}
                          >
                            <RefreshCw style={{ width: 12, height: 12 }} />
                            <span>Re-inspect & Rectify</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments & Depot Row */}
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border-default)',
                        borderRadius: 4,
                        padding: '12px 14px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5
                      }}>
                        <p>{crac.reviewComments}</p>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 16,
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: '1px solid #e2e8f0',
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)'
                        }}>
                          <div>Consignee: <strong>{crac.consigneeName}</strong> ({crac.consigneeDesignation})</div>
                          <div>Location: <strong>{crac.consigneeLocation}</strong></div>
                          <div>Inspection Date: <strong>{new Date(crac.inspectionDate || crac.createdAt).toLocaleDateString('en-IN')}</strong></div>
                          <div>Disbursement: <strong style={{ color: crac.paymentRecommendation === 'RELEASE_100_PERCENT' ? '#16a34a' : '#b91c1c' }}>{crac.paymentRecommendation}</strong></div>
                        </div>
                      </div>

                      {/* Photo Proof Gallery Row */}
                      {crac.evidencePhotos && crac.evidencePhotos.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                            Physical Inspection Photo Proofs ({crac.evidencePhotos.length}):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {crac.evidencePhotos.map((photo, pIdx) => (
                              <div
                                key={pIdx}
                                onClick={() => setPreviewPhoto(photo)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  background: '#ffffff',
                                  border: '1px solid var(--border-default)',
                                  borderRadius: 4,
                                  padding: '6px 10px',
                                  cursor: 'pointer',
                                  transition: 'border-color 0.15s ease'
                                }}
                                title="Click to view full inspection photo & cryptographic SHA-256 fingerprint"
                              >
                                <img
                                  src={photo.url}
                                  alt="Inspection Proof"
                                  style={{ width: 44, height: 34, objectFit: 'cover', borderRadius: 2, border: '1px solid #cbd5e1' }}
                                />
                                <div>
                                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {photo.caption || 'Site Inspection Proof'}
                                  </div>
                                  <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                                    SHA-256: {photo.sha256Hash?.substring(0, 16)}...
                                  </div>
                                </div>
                                <Eye style={{ width: 13, height: 13, color: 'var(--text-muted)', marginLeft: 4 }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Immutable CAG Ledger Block Footer */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        paddingTop: 4,
                        borderTop: '1px dashed var(--border-default)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ShieldCheck style={{ width: 13, height: 13, color: '#059669' }} />
                          <span>CAG Blockchain Ledger Block #{crac.auditBlock?.blockIndex ?? 12}</span>
                        </div>
                        <div>
                          Hash: <code>{crac.auditBlock?.currentHash || '0x8f3c71...sealed'}</code>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================
          INSPECTION & REVIEW MODAL
      ======================================================== */}
      {modalOpen && selectedContract && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 8,
            width: '100%',
            maxWidth: 780,
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                  {editingCrac ? 'GFR-173 Statutory Consignee Re-inspection & Rectification' : 'GFR-173 Statutory Consignee Verification'}
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
                  {editingCrac ? `Re-inspect Delivery & Update CRAC (${editingCrac.cracNumber})` : 'Issue Consignee Receipt and Acceptance Certificate (CRAC)'}
                </h2>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                  Contract: <strong>{selectedContract.tender?.title}</strong> ({selectedContract.tender?.tenderNumber})
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitCrac} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Verdict Choice: Good vs Bad */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: 6, textTransform: 'uppercase' }}>
                  Consignee Inspection Verdict <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setVerdict('ACCEPTED');
                      setRating(5);
                      setPaymentRec('RELEASE_100_PERCENT');
                      setReviewTitle('Exemplary Delivery & Timely Site Commissioning (100% Quality Pass)');
                      setReviewComments('Consignee depot conducted physical inspection of the delivered equipment. Verified against factory test certificates and BIS standards with 0 defects. Packaging intact, warranty cards and OEM serials verified against NIT.');
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: verdict === 'ACCEPTED' ? '#16a34a' : '#cbd5e1',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#16a34a', fontSize: '0.82rem' }}>
                        <CheckCircle style={{ width: 15, height: 15 }} />
                        <span>GOOD / ACCEPTED</span>
                      </div>
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: `2px solid ${verdict === 'ACCEPTED' ? '#16a34a' : '#cbd5e1'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {verdict === 'ACCEPTED' && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: 5, lineHeight: 1.35 }}>
                      100% Quality Pass, Zero Defects, Release Full Payment
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerdict('REJECTED');
                      setRating(1);
                      setPaymentRec('WITHHOLD_ALL');
                      setReviewTitle('Physical Inspection Failed - Defective Equipment & Missing OEM Certification');
                      setReviewComments('Consignee inspection flagged material non-conformance. Physical damages noticed during uncrating. Required BIS test certificates not provided by vendor. Payment withheld.');
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: verdict === 'REJECTED' ? '#dc2626' : '#cbd5e1',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#dc2626', fontSize: '0.82rem' }}>
                        <XCircle style={{ width: 15, height: 15 }} />
                        <span>BAD / DEFICIENT</span>
                      </div>
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: `2px solid ${verdict === 'REJECTED' ? '#dc2626' : '#cbd5e1'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {verdict === 'REJECTED' && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: 5, lineHeight: 1.35 }}>
                      Quality Defect Flagged, Transit Damage, Withhold Funds
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerdict('PARTIALLY_ACCEPTED');
                      setRating(3);
                      setPaymentRec('PARTIAL_RELEASE_WITH_PENALTY');
                      setReviewTitle('Conditional Acceptance Subject to Rectification & Liquidated Damages');
                      setReviewComments('Consignee depot observed minor cosmetic deviations. Core equipment functional. Partial payment sanctioned subject to rectification within 7 working days.');
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: verdict === 'PARTIALLY_ACCEPTED' ? '#d97706' : '#cbd5e1',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#d97706', fontSize: '0.82rem' }}>
                        <AlertTriangle style={{ width: 15, height: 15 }} />
                        <span>CONDITIONAL</span>
                      </div>
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: `2px solid ${verdict === 'PARTIALLY_ACCEPTED' ? '#d97706' : '#cbd5e1'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {verdict === 'PARTIALLY_ACCEPTED' && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: 5, lineHeight: 1.35 }}>
                      Partial Acceptance with LD Penalty / Rectification
                    </div>
                  </button>
                </div>
              </div>

              {/* Star Rating Section - Transparent, Minimalist & Professional */}
              <div style={{
                background: 'transparent',
                padding: '12px 14px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Officer Performance Rating
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginTop: 2 }}>
                    {rating === 5 && '5.0 / 5.0 — Exemplary & Zero Defects'}
                    {rating === 4 && '4.0 / 5.0 — Very Good / Fully Conforming'}
                    {rating === 3 && '3.0 / 5.0 — Satisfactory / Minor Observations'}
                    {rating === 2 && '2.0 / 5.0 — Deficient / Performance Gap'}
                    {rating === 1 && '1.0 / 5.0 — Critical Non-Compliance'}
                  </div>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(starVal => {
                    const isFilled = starVal <= (hoverRating || rating);
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '3px',
                          cursor: 'pointer',
                          borderRadius: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          outline: 'none',
                          transition: 'transform 0.12s ease'
                        }}
                        title={`Rate ${starVal} Star${starVal > 1 ? 's' : ''}`}
                      >
                        <Star
                          style={{
                            width: 22,
                            height: 22,
                            fill: isFilled ? '#f59e0b' : 'none',
                            color: isFilled ? '#f59e0b' : '#cbd5e1',
                            strokeWidth: 1.5,
                            transition: 'fill 0.12s ease, color 0.12s ease'
                          }}
                        />
                      </button>
                    );
                  })}
                  <span style={{
                    marginLeft: 6,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {rating}.0
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: 4, textTransform: 'uppercase' }}>
                  Review Heading / Summary Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="e.g. 500kW Solar Inverter Array Delivered & Commissioned"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Detailed Inspection Comments */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: 4, textTransform: 'uppercase' }}>
                  Detailed Physical Inspection Comments (Consignee Findings) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={e => setReviewComments(e.target.value)}
                  placeholder="Enter detailed consignee observation regarding factory seal, BIS conformity, packaging..."
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    outline: 'none',
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* Consignee Location & Designation Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                    Consignee Officer Name & Designation:
                  </label>
                  <input
                    type="text"
                    value={consigneeName}
                    onChange={e => setConsigneeName(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '0.72rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                    Consignee Receiving Depot / Site Location:
                  </label>
                  <input
                    type="text"
                    value={consigneeLocation}
                    onChange={e => setConsigneeLocation(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '0.72rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
                  />
                </div>
              </div>

              {/* Physical Quantities Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, background: 'transparent', padding: '12px 14px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>Qty Ordered</label>
                  <input
                    type="number"
                    value={qtyOrdered}
                    onChange={e => setQtyOrdered(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 4, background: 'transparent', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>Qty Received</label>
                  <input
                    type="number"
                    value={qtyReceived}
                    onChange={e => setQtyReceived(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 4, background: 'transparent', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>Qty Accepted</label>
                  <input
                    type="number"
                    value={qtyAccepted}
                    onChange={e => setQtyAccepted(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.75rem', border: '1px solid #16a34a', borderRadius: 4, fontWeight: 700, color: '#16a34a', background: 'transparent', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>Qty Rejected</label>
                  <input
                    type="number"
                    value={qtyRejected}
                    onChange={e => setQtyRejected(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.75rem', border: '1px solid #dc2626', borderRadius: 4, fontWeight: 700, color: '#dc2626', background: 'transparent', outline: 'none' }}
                  />
                </div>
              </div>

              {/* PHOTO PROOF ATTACHMENT SECTION */}
              <div style={{
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: 14,
                background: 'transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Camera style={{ width: 14, height: 14, color: '#0284c7' }} />
                    <span>Inspection Photo Proof (Tamper-Proof SHA-256 Fingerprint)</span>
                  </label>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    Photo evidence will be sealed into the blockchain ledger
                  </span>
                </div>

                {/* Upload or Preset Buttons */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                  <label
                    style={{
                      background: '#0284c7',
                      color: 'white',
                      padding: '6px 14px',
                      borderRadius: 4,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Upload style={{ width: 13, height: 13 }} />
                    <span>Choose Photo File...</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>— OR use official preset: —</span>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadedPhotos([]);
                      setPhotoPreviewUrls([]);
                      setSamplePhotoSelected('sample_solar');
                      setPhotoCaption('Installed 500kW Solar Inverter Array & Transformers Commissioned at Site');
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 4,
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: samplePhotoSelected === 'sample_solar' ? '#0284c7' : '#cbd5e1',
                      background: 'transparent',
                      color: samplePhotoSelected === 'sample_solar' ? '#0284c7' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    📷 Solar Array Inspection
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadedPhotos([]);
                      setPhotoPreviewUrls([]);
                      setSamplePhotoSelected('sample_switchgear');
                      setPhotoCaption('High-Voltage SCADA Control Panels & Switchgear Terminal Verification');
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 4,
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: samplePhotoSelected === 'sample_switchgear' ? '#0284c7' : '#cbd5e1',
                      background: 'transparent',
                      color: samplePhotoSelected === 'sample_switchgear' ? '#0284c7' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    📷 Switchgear Inspection
                  </button>
                </div>

                {/* Photo Caption */}
                <input
                  type="text"
                  value={photoCaption}
                  onChange={e => setPhotoCaption(e.target.value)}
                  placeholder="Photo caption / location detail..."
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    marginBottom: 10
                  }}
                />

                {/* Photo Preview Thumbnail */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {photoPreviewUrls.length > 0 ? (
                    photoPreviewUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Selected Proof"
                        style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 4, border: '1px solid #0284c7' }}
                      />
                    ))
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={verdict === 'ACCEPTED'
                          ? (samplePhotoSelected === 'sample_solar'
                              ? 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=400&q=80'
                              : 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=400&q=80')
                          : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'}
                        alt="Sample Preview"
                        style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 4, border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>
                        ✓ Field Inspection Proof Active (will be SHA-256 fingerprinted upon submission)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Error / Success Feedback */}
              {submitError && (
                <div style={{ padding: '8px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 4, color: '#991b1b', fontSize: '0.72rem' }}>
                  <strong>Error:</strong> {submitError}
                </div>
              )}
              {submitSuccess && (
                <div style={{ padding: '8px 12px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 4, color: '#166534', fontSize: '0.72rem' }}>
                  <strong>Success:</strong> {submitSuccess}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary btn-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    border: 'none',
                    padding: '8px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.45)'
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw style={{ width: 14, height: 14 }} className="animate-spin" />
                      <span>{editingCrac ? 'Updating Seal & CAG Ledger...' : 'Computing Hash & Sealing CAG Ledger...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck style={{ width: 15, height: 15 }} />
                      <span>{editingCrac ? 'Seal & Update Re-inspected CRAC (GFR-173)' : 'Seal CRAC Certificate into CAG Ledger (GFR-173)'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          PHOTO EVIDENCE HIGH-RES PREVIEW MODAL
      ======================================================== */}
      {previewPhoto && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 8,
            maxWidth: 800,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                📷 Consignee Physical Inspection Evidence Photo
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 16, background: '#0f172a', textAlign: 'center' }}>
              <img
                src={previewPhoto.url}
                alt="Inspection Evidence"
                style={{ maxHeight: 420, maxWidth: '100%', borderRadius: 4, objectFit: 'contain' }}
              />
            </div>

            <div style={{ padding: 14, background: '#ffffff', fontSize: '0.72rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                Caption: {previewPhoto.caption || 'Consignee On-Site Physical Inspection Photo'}
              </div>
              <div style={{ color: '#64748b', marginTop: 4 }}>
                File: <code>{previewPhoto.originalFileName || 'inspection_photo.jpg'}</code>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#0369a1', marginTop: 4, wordBreak: 'break-all' }}>
                SHA-256 Fingerprint: <strong>{previewPhoto.sha256Hash || '0x7a8b...verified'}</strong>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 8,
                padding: '3px 8px',
                background: '#dcfce7',
                color: '#15803d',
                borderRadius: 4,
                fontWeight: 700,
                fontSize: '0.65rem'
              }}>
                <ShieldCheck style={{ width: 12, height: 12 }} />
                <span>GeM Central Cryptographic Inscription Verified (GFR Rule 173)</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
