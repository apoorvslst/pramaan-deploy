import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User, Tender, Bidder, BidSubmission, VerificationEvidence, AuditLedger } from '../models/index.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\x1b[36m[Seed]\x1b[0m Clearing existing test records...');

    await Promise.all([
      User.deleteMany({ email: /@praman\.test$/ }),
      Tender.deleteMany({ tenderNumber: /^GEM\/2026\// }),
      Bidder.deleteMany({ gstin: /^07AAAAA/ }),
    ]);

    console.log('\x1b[36m[Seed]\x1b[0m Creating Officer & Bidder users...');
    const officer = await User.create({
      name: 'Dr. Rajesh Verma',
      email: 'officer@praman.test',
      password: 'password123',
      role: 'OFFICER',
      department: 'Ministry of Heavy Industries',
      designation: 'Chief Procurement Officer',
    });

    const bidderUser = await User.create({
      name: 'Vikram Solar Enterprises',
      email: 'bidder@praman.test',
      password: 'password123',
      role: 'BIDDER',
      organization: 'Vikram Solar Green Energy Pvt Ltd',
    });

    console.log('\x1b[36m[Seed]\x1b[0m Creating sample Tender...');
    const tender = await Tender.create({
      tenderNumber: 'GEM/2026/B/901245',
      title: 'Procurement of High-Capacity 500kW Solar Rooftop Inverters',
      department: 'Ministry of Heavy Industries & Public Enterprises',
      estimatedValueINR: 25000000,
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'PUBLISHED',
      createdBy: officer._id,
      rules: {
        minimumTurnoverINR: 10000000,
        turnoverYearsRequired: 3,
        minimumExperienceYears: 3,
        makeInIndiaPercentage: 50,
        allowStartupExemption: true,
        allowMSMEExemption: true,
        emdRequired: true,
        emdAmountINR: 500000,
        requiredCertificates: [
          { type: 'GST_CERTIFICATE', isMandatory: true, weightage: 20 },
          { type: 'UDYAM_CERTIFICATE', isMandatory: false, weightage: 15 },
          { type: 'PAN_CARD', isMandatory: true, weightage: 15 },
          { type: 'CA_TURNOVER_CERTIFICATE', isMandatory: true, weightage: 25 },
          { type: 'DEBARMENT_AFFIDAVIT', isMandatory: true, weightage: 25 },
        ],
      },
    });

    console.log('\x1b[36m[Seed]\x1b[0m Creating sample Bidder entity profile...');
    const bidder = await Bidder.create({
      legalBusinessName: 'Vikram Solar Green Energy Private Limited',
      tradeName: 'Vikram Solar',
      entityType: 'PVT_LTD',
      gstin: '07AAAAA0000A1Z5',
      pan: 'AAAAA0000A',
      udyamRegistrationNumber: 'UDYAM-DL-01-0012345',
      isDPIITStartup: true,
      startupCertificateNumber: 'DPIIT102938',
      primaryEmail: 'contact@vikramsolar.test',
      primaryPhone: '+91 9876543210',
      registeredAddress: {
        line1: 'Plot 45, Okhla Industrial Area Phase-III',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110020',
        geoCoordinates: { lat: 28.5355, lng: 77.2732 },
      },
      directors: [
        { din: '00123456', name: 'Vikram Sharma', pan: 'ABCPS1234F' },
        { din: '00987654', name: 'Sunita Sharma', pan: 'ABCPS5678G' },
      ],
      bankAccountDetails: {
        accountNumber: '918020012345678',
        ifscCode: 'UTIB0000123',
        bankName: 'Axis Bank',
      },
    });

    console.log('\x1b[36m[Seed]\x1b[0m Creating sample BidSubmission...');
    const submission = await BidSubmission.create({
      tenderId: tender._id,
      bidderId: bidder._id,
      bidReferenceNumber: 'BID-REF-2026-0001',
      uploadedDocuments: [
        {
          docType: 'GST_CERTIFICATE',
          originalFileName: 'gst_certificate.pdf',
          storagePath: 'uploads/gst_certificate_sample.pdf',
          mimeType: 'application/pdf',
          fileSizeBytes: 245892,
          sha256Hash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
        },
      ],
      status: 'VERIFIED',
      evaluationResult: {
        complianceScore: 92,
        riskLevel: 'LOW',
        aiRecommendation: 'QUALIFY',
        recommendationSummary: 'All statutory certificates verified with 100% portal matches.',
        isCollusionFlagged: false,
      },
    });

    console.log('\x1b[36m[Seed]\x1b[0m Creating sample VerificationEvidence (3-Pane)...');
    const evidence = await VerificationEvidence.create({
      submissionId: submission._id,
      tenderId: tender._id,
      docType: 'GST_CERTIFICATE',
      documentHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
      visualData: {
        pageNumber: 1,
        boundingBox: { x: 120, y: 340, width: 250, height: 40 },
        imageSnippetUrl: '/api/evidence/snippets/gst_header.png',
      },
      extractedClaim: {
        extractedFields: {
          gstin: '07AAAAA0000A1Z5',
          legalName: 'Vikram Solar Green Energy Private Limited',
          registrationDate: '2018-04-01',
        },
        ocrEngineConfidence: 0.98,
        extractionModel: 'PaddleOCR-v4 + LayoutLM',
      },
      portalGroundTruth: {
        portalName: 'GSTN',
        rawApiResponse: {
          gstin: '07AAAAA0000A1Z5',
          legalName: 'Vikram Solar Green Energy Private Limited',
          status: 'Active',
          taxpayerType: 'Regular',
        },
        isLiveQuery: true,
      },
      forensicCheck: {
        hasMetadataTampering: false,
        qrMatchesClaim: true,
        tamperConfidenceScore: 0.02,
      },
      verificationStatus: 'MATCH',
    });

    console.log('\x1b[36m[Seed]\x1b[0m Creating sample AuditLedger genesis block...');
    const auditBlock = await AuditLedger.create({
      blockIndex: 0,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: new Date(),
      actionType: 'TENDER_CREATED',
      actor: {
        userId: officer._id,
        role: 'OFFICER',
        ipAddress: '127.0.0.1',
      },
      entityId: tender._id.toString(),
      payloadData: {
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        estimatedValueINR: tender.estimatedValueINR,
      },
      payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      currentHash: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    });

    console.log('\x1b[32m[Seed Success]\x1b[0m All 6 Mongoose Schemas successfully verified in MongoDB:');
    console.log(`- 1. User:                 ${officer._id} (${officer.email})`);
    console.log(`- 2. Tender:               ${tender._id} (${tender.tenderNumber})`);
    console.log(`- 3. Bidder:               ${bidder._id} (${bidder.legalBusinessName})`);
    console.log(`- 4. BidSubmission:        ${submission._id} (${submission.bidReferenceNumber})`);
    console.log(`- 5. VerificationEvidence: ${evidence._id} (${evidence.docType} -> ${evidence.verificationStatus})`);
    console.log(`- 6. AuditLedger:          Block #${auditBlock.blockIndex} (${auditBlock.actionType})`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[Seed Error]\x1b[0m', error);
    process.exit(1);
  }
};

seedDatabase();
