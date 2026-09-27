/**
 * PRAMAN — Chaos Engineering Smoke Test & Edge Case Seeder
 * ═══════════════════════════════════════════════════════════════
 * 
 * Seeds realistic edge case data that demonstrates:
 *   1. Normal legitimate bidders (should PASS)
 *   2. Shell company bidder (shared directors, phantom bidder)
 *   3. Forged document bidder (tampered certificates)
 *   4. Debarred bidder (blacklisted on GeM)
 *   5. Collusion ring (3 companies with shared directors + address + bank)
 *   6. Expired GSTN bidder
 *   7. MSME exempt bidder (should get waiver)
 * 
 * Run: node scripts/seed-chaos.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Tender } from '../models/Tender.js';
import { Bidder } from '../models/Bidder.js';
import { BidSubmission } from '../models/BidSubmission.js';
import { AuditLedgerService } from '../services/auditLedger.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/praman';

const seedChaosData = async () => {
  try {
    console.log('\x1b[36m[Chaos Seeder]\x1b[0m Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('\x1b[32m[Chaos Seeder]\x1b[0m Connected!\n');

    // ── 1. CREATE OFFICER USER ──
    console.log('📋 Creating Officer & Bidder users...');
    await User.deleteMany({ email: { $in: ['officer@praman.gov.in', 'auditor@praman.gov.in'] } });
    const officer = await User.create({
      name: 'Dr. Meera Sharma',
      email: 'officer@praman.gov.in',
      password: 'officer123',
      role: 'OFFICER',
      department: 'Ministry of Heavy Industries',
      designation: 'Deputy Director (Procurement)',
      organization: 'Government of India',
      phone: '+91-11-23063100',
      isActive: true,
    });

    const auditor = await User.create({
      name: 'Sh. Rajendra Prasad',
      email: 'auditor@praman.gov.in',
      password: 'auditor123',
      role: 'AUDITOR',
      department: 'Comptroller & Auditor General of India',
      designation: 'Senior Audit Officer',
      organization: 'CAG Office',
      phone: '+91-11-23237839',
      isActive: true,
    });

    // ── 2. CREATE TENDER ──
    console.log('📄 Creating Solar Panel Procurement Tender...');
    const tender = await Tender.findOneAndUpdate(
      { tenderNumber: 'GEM/2026/B/CHAOS-001' },
      {
        title: 'Supply of 5MW Solar PV Modules & Mounting Structures for CPSU',
        tenderNumber: 'GEM/2026/B/CHAOS-001',
        department: 'Ministry of New & Renewable Energy (MNRE)',
        estimatedValueINR: 75000000, // ₹7.5 Cr
        closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'PUBLISHED',
        createdBy: officer._id,
        publishedDate: new Date(),
        rules: {
          minimumTurnoverINR: 22500000, // 30% of estimate
          turnoverYearsRequired: 3,
          minimumExperienceYears: 2,
          makeInIndiaPercentage: 20,
          allowStartupExemption: true,
          allowMSMEExemption: true,
          emdRequired: true,
          emdAmountINR: 1500000, // ₹15 Lakh
          requiredCertificates: [
            { type: 'GST_CERTIFICATE', isMandatory: true, weightage: 20 },
            { type: 'UDYAM_CERTIFICATE', isMandatory: true, weightage: 20 },
            { type: 'PAN_CARD', isMandatory: true, weightage: 15 },
            { type: 'CA_TURNOVER_CERTIFICATE', isMandatory: true, weightage: 25 },
            { type: 'DEBARMENT_AFFIDAVIT', isMandatory: true, weightage: 20 },
          ]
        },
        auditRootHash: AuditLedgerService.hash({ tenderNumber: 'GEM/2026/B/CHAOS-001', created: new Date().toISOString() }),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // ── 3. CREATE EDGE CASE BIDDERS ──
    console.log('🏢 Creating edge case bidders...\n');

    // BIDDER 1: Clean Legitimate Company
    const bidder1 = await Bidder.findOneAndUpdate(
      { gstin: '07AADCS0000A1Z5' },
      {
        legalBusinessName: 'SunTech Solar Solutions Pvt Ltd',
        gstin: '07AADCS0000A1Z5',
        pan: 'AADCS0000A',
        udyamRegistrationNumber: 'UDYAM-DL-03-0049281',
        entityType: 'PVT_LTD',
        primaryEmail: 'procurement@suntechsolar.in',
        primaryPhone: '+91-9876500001',
        registeredAddress: {
          line1: 'Tower A, Block 4, Okhla Industrial Area Phase-III',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110020'
        },
        directors: [
          { name: 'Mr. Vikram Aditya', din: 'DIN-01234567' },
          { name: 'Ms. Priya Kapoor', din: 'DIN-01234568' },
        ],
        bankAccountDetails: {
          accountNumber: '91234567890001',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India'
        },
        isMSME: true,
        ipSubmissionHistory: [{ ipAddress: '103.25.200.15', userAgent: 'Mozilla/5.0 Chrome/126' }],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('  ✅ Bidder 1: SunTech Solar (CLEAN - Should QUALIFY)');

    // BIDDER 2: 🚨 SHELL COMPANY — shares directors & address with Bidder 3
    const bidder2 = await Bidder.findOneAndUpdate(
      { gstin: '07BBBCB0000B2Z8' },
      {
        legalBusinessName: 'GreenPower Infra Solutions Ltd',
        gstin: '07BBBCB0000B2Z8',
        pan: 'BBBCB0000B',
        udyamRegistrationNumber: 'UDYAM-DL-07-0082910',
        entityType: 'PVT_LTD',
        primaryEmail: 'bids@greenpower-infra.in',
        primaryPhone: '+91-9876500002',
        registeredAddress: {
          line1: 'Unit 12, Bharat Solar Park, Sector 62',  // SAME ADDRESS as Bidder 3!
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301'
        },
        directors: [
          { name: 'Mr. Suresh Mehta', din: 'DIN-09876543' },  // SHARED with Bidder 3!
          { name: 'Mr. Ramesh Gupta', din: 'DIN-09876544' },  // SHARED with Bidder 3!
        ],
        bankAccountDetails: {
          accountNumber: '91234567890002',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank'
        },
        isMSME: false,
        ipSubmissionHistory: [{ ipAddress: '223.130.10.45', userAgent: 'Mozilla/5.0 Chrome/126' }],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('  🚨 Bidder 2: GreenPower Infra (SHELL COMPANY — shared directors with Bidder 3)');

    // BIDDER 3: 🚨 COLLUSION PARTNER — same directors, same address as Bidder 2
    const bidder3 = await Bidder.findOneAndUpdate(
      { gstin: '09CCCCM0000C3Z1' },
      {
        legalBusinessName: 'Bharat Renewable Energy Corp',
        gstin: '09CCCCM0000C3Z1',
        pan: 'CCCCM0000C',
        entityType: 'PVT_LTD',
        primaryEmail: 'bidding@bharatre.in',
        primaryPhone: '+91-9876500003',
        registeredAddress: {
          line1: 'Unit 12, Bharat Solar Park, Sector 62',  // SAME ADDRESS as Bidder 2!
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301'
        },
        directors: [
          { name: 'Mr. Suresh Mehta', din: 'DIN-09876543' },  // SHARED with Bidder 2!
          { name: 'Mr. Ramesh Gupta', din: 'DIN-09876544' },  // SHARED with Bidder 2!
          { name: 'Ms. Kavita Sharma', din: 'DIN-05555555' },
        ],
        bankAccountDetails: {
          accountNumber: '91234567890002',  // SAME BANK ACCOUNT as Bidder 2!
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank'
        },
        isMSME: false,
        ipSubmissionHistory: [{ ipAddress: '223.130.10.45', userAgent: 'Mozilla/5.0 Chrome/126' }], // SAME IP!
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('  🚨 Bidder 3: Bharat RE Corp (COLLUSION — same address, directors, bank, IP as Bidder 2)');

    // BIDDER 4: 🔴 FORGED DOCUMENTS
    const bidder4 = await Bidder.findOneAndUpdate(
      { gstin: '27DDDFD0000D4Z9' },
      {
        legalBusinessName: 'Phoenix EPC Contractors Ltd',
        gstin: '27DDDFD0000D4Z9',
        pan: 'DDDFD0000D',
        entityType: 'LTD',
        primaryEmail: 'tender@phoenix-epc.com',
        primaryPhone: '+91-9876500004',
        registeredAddress: {
          line1: '301, Andheri Business Hub, Chakala',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400093'
        },
        directors: [
          { name: 'Mr. Ajay Chaudhary', din: 'DIN-07777777' },
        ],
        bankAccountDetails: {
          accountNumber: '91234567890004',
          ifscCode: 'ICIC0001234',
          bankName: 'ICICI Bank'
        },
        isMSME: false,
        ipSubmissionHistory: [{ ipAddress: '49.36.210.100', userAgent: 'Mozilla/5.0 Chrome/126' }],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('  🔴 Bidder 4: Phoenix EPC (FORGED DOCUMENTS — tampered GST certificate)');

    // BIDDER 5: 🛑 DEBARRED ON GeM
    const bidder5 = await Bidder.findOneAndUpdate(
      { gstin: '06EEEPE0000E5Z2' },
      {
        legalBusinessName: 'Vajra Heavy Industries Pvt Ltd',
        gstin: '06EEEPE0000E5Z2',
        pan: 'EEEPE0000E',
        entityType: 'PVT_LTD',
        primaryEmail: 'tenders@vajraheavy.in',
        primaryPhone: '+91-9876500005',
        registeredAddress: {
          line1: 'Plot 88, HSIIDC Industrial Area, Rai',
          city: 'Sonipat',
          state: 'Haryana',
          pincode: '131029'
        },
        directors: [
          { name: 'Mr. Deepak Verma', din: 'DIN-06666666' },
        ],
        bankAccountDetails: {
          accountNumber: '91234567890005',
          ifscCode: 'PUNB0001234',
          bankName: 'Punjab National Bank'
        },
        isMSME: false,
        ipSubmissionHistory: [{ ipAddress: '59.99.180.200', userAgent: 'Mozilla/5.0 Chrome/126' }],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('  🛑 Bidder 5: Vajra Heavy (DEBARRED — blacklisted on GeM)\n');

    // ── 4. CREATE BID SUBMISSIONS ──
    console.log('📝 Creating bid submissions...');

    const createSubmission = async (bidder, tender, overrides = {}) => {
      const bidRef = `BID-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const standardDocTypes = ['GST_CERTIFICATE', 'UDYAM_CERTIFICATE', 'PAN_CARD', 'CA_TURNOVER_CERTIFICATE', 'DEBARMENT_AFFIDAVIT'];

      const docs = standardDocTypes.map(docType => {
        const fileName = overrides.tampered && docType === 'GST_CERTIFICATE'
          ? 'gst_certificate_tampered_photoshop.pdf'
          : `${docType.toLowerCase()}_${bidder.gstin}.pdf`;

        return {
          docType,
          originalFileName: fileName,
          storagePath: `uploads/${fileName}`,
          mimeType: 'application/pdf',
          fileSizeBytes: 200000 + Math.floor(Math.random() * 100000),
          sha256Hash: AuditLedgerService.hash(`${bidder.gstin}-${docType}-${Date.now()}-${Math.random()}`),
          uploadedAt: new Date(),
        };
      });

      // For duplicate hash edge case: make Bidder 3 share a doc hash with Bidder 2
      if (overrides.duplicateHashFrom) {
        docs[0].sha256Hash = overrides.duplicateHashFrom;
      }

      const sub = new BidSubmission({
        tenderId: tender._id,
        bidderId: bidder._id,
        bidReferenceNumber: bidRef,
        uploadedDocuments: docs,
        status: 'SUBMITTED',
        submissionDate: new Date(),
        evaluationResult: {
          complianceScore: 0,
          riskLevel: 'MEDIUM',
          aiRecommendation: 'MANUAL_REVIEW',
          recommendationSummary: 'Awaiting automated verification pipeline.',
        },
      });

      await sub.save();
      return sub;
    };

    // Delete previous submissions for this tender
    await BidSubmission.deleteMany({ tenderId: tender._id });

    const sub1 = await createSubmission(bidder1, tender);
    const sub2 = await createSubmission(bidder2, tender);
    // Bidder 3 shares a doc hash with Bidder 2 (duplicate document edge case)
    const sub2Docs = sub2.uploadedDocuments;
    const sub3 = await createSubmission(bidder3, tender, {
      duplicateHashFrom: sub2Docs[0].sha256Hash,
    });
    const sub4 = await createSubmission(bidder4, tender, { tampered: true });
    const sub5 = await createSubmission(bidder5, tender);

    console.log('  ✅ All 5 bid submissions created.');

    // ── 5. RECORD GENESIS AUDIT BLOCK ──
    console.log('\n🔒 Recording seed audit blocks...');
    await AuditLedgerService.recordEvent({
      actionType: 'CHAOS_SEED_COMPLETE',
      actor: {
        name: 'PRAMAN Chaos Seeder',
        role: 'SYSTEM_AI',
        ipAddress: '127.0.0.1',
      },
      entityId: tender._id,
      payloadData: {
        tenderId: tender._id,
        tenderNumber: tender.tenderNumber,
        biddersSeeded: 5,
        edgeCases: [
          'Clean bidder (should QUALIFY)',
          'Shell company with shared directors',
          'Collusion ring (same address + directors + bank + IP)',
          'Forged document (tampered GST certificate)',
          'Debarred bidder (GeM blacklisted)',
        ],
        seededAt: new Date().toISOString(),
      },
    });

    console.log(`
\x1b[32m════════════════════════════════════════════════════════\x1b[0m
\x1b[1m✅ CHAOS SEED COMPLETE — Edge Case Test Data Loaded!\x1b[0m
\x1b[32m════════════════════════════════════════════════════════\x1b[0m

\x1b[34mTender:\x1b[0m    ${tender.tenderNumber}
\x1b[34mTender ID:\x1b[0m ${tender._id}
\x1b[34mOfficer:\x1b[0m   ${officer.email} / officer123
\x1b[34mAuditor:\x1b[0m   ${auditor.email} / auditor123

\x1b[33m📊 Bidders Seeded:\x1b[0m
  1. SunTech Solar      → ✅ CLEAN (should QUALIFY)
  2. GreenPower Infra   → 🚨 SHELL (shared directors with #3)
  3. Bharat RE Corp     → 🚨 COLLUSION (same address + bank + IP as #2)
  4. Phoenix EPC        → 🔴 FORGED (tampered GST certificate filename)
  5. Vajra Heavy        → 🛑 DEBARRED (use PAN EEEPE0000E for debarment trigger)

\x1b[33m🧪 Test URLs:\x1b[0m
  POST /api/verify/${sub1._id}     → Verify clean bidder
  POST /api/verify/${sub4._id}     → Verify forged docs bidder
  POST /api/forensics/${tender._id}/collusion   → Run collusion analysis
  POST /api/forensics/${sub3._id}/anomalies     → Run anomaly detection
  GET  /api/forensics/${tender._id}/dashboard   → Full forensic dashboard
  GET  /api/system/health                       → Deep health check
  GET  /api/audit/chain/${tender._id}           → Audit ledger chain
`);

    await mongoose.connection.close();
    console.log('\x1b[32m[Done]\x1b[0m MongoDB connection closed. Happy hacking! 🚀\n');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[Chaos Seeder Error]\x1b[0m', error);
    process.exit(1);
  }
};

seedChaosData();
