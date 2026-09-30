import mongoose from 'mongoose';

/**
 * Auto-seed helper to ensure officer@praman.test and bidder@praman.test exist
 */
async function autoSeedDefaults() {
  try {
    const { User, Tender, Bidder, BidSubmission } = await import('../models/index.js');
    
    // 1. Ensure Officer account exists
    let officer = await User.findOne({ email: 'officer@praman.test' });
    if (!officer) {
      officer = await User.create({
        name: 'Dr. Rajesh Verma',
        email: 'officer@praman.test',
        password: 'password123',
        role: 'OFFICER',
        department: 'Ministry of Heavy Industries',
        designation: 'Chief Procurement Officer',
        organization: 'Ministry of Heavy Industries',
        isKycVerified: true
      });
    }
    const officerUser = officer;

    // 2. Ensure Bidder 1 (OM Hotels & Hospitality) exists
    let bidderUser1 = await User.findOne({ email: 'bidder1@praman.test' });
    if (!bidderUser1) {
      bidderUser1 = await User.create({
        name: 'Om Prakash Sharma',
        email: 'bidder1@praman.test',
        password: 'password123',
        role: 'BIDDER',
        organization: 'OM Hotels & Hospitality Pvt Ltd',
        panNumber: 'AAAAI9231N',
        gstinNumber: '08AAAAI9231N1ZC',
        udyamNumber: 'UDYAM-RJ-14-0012984',
        gemSellerId: 'GEM-VEND-2024-1011',
        isKycVerified: true,
        kycVerifiedAt: new Date()
      });
    }

    // 3. Ensure Bidder 2 (Vikram Solar Green Energy) exists
    let bidderUser2 = await User.findOne({ email: 'bidder2@praman.test' });
    if (!bidderUser2) {
      bidderUser2 = await User.create({
        name: 'Vikram Sharma',
        email: 'bidder2@praman.test',
        password: 'password123',
        role: 'BIDDER',
        organization: 'Vikram Solar Green Energy Pvt Ltd',
        panNumber: 'AAACS9981F',
        gstinNumber: '07AAACS9981F1Z2',
        udyamNumber: 'UDYAM-DL-03-0049281',
        gemSellerId: 'GEM-VEND-2024-8841',
        isKycVerified: true,
        kycVerifiedAt: new Date()
      });
    }

    // 4. Ensure Bidder 3 (Apex Power & Infrastructure) exists
    let bidderUser3 = await User.findOne({ email: 'bidder3@praman.test' });
    if (!bidderUser3) {
      bidderUser3 = await User.create({
        name: 'Rajiv Khanna',
        email: 'bidder3@praman.test',
        password: 'password123',
        role: 'BIDDER',
        organization: 'Apex Power & Infrastructure Ltd',
        panNumber: 'AABCA1234B',
        gstinNumber: '27AABCA1234B1Z9',
        udyamNumber: 'UDYAM-MH-01-0084721',
        gemSellerId: 'GEM-VEND-2024-9922',
        isKycVerified: true,
        kycVerifiedAt: new Date()
      });
    }

    // Keep bidder@praman.test as alias for Vikram Solar
    let legacyBidder = await User.findOne({ email: 'bidder@praman.test' });
    if (!legacyBidder) {
      await User.create({
        name: 'Vikram Solar Enterprises',
        email: 'bidder@praman.test',
        password: 'password123',
        role: 'BIDDER',
        organization: 'Vikram Solar Green Energy Pvt Ltd',
        panNumber: 'AAACS9981F',
        gstinNumber: '07AAACS9981F1Z2',
        udyamNumber: 'UDYAM-DL-03-0049281',
        isKycVerified: true
      });
    }

    // 5. Ensure Published Demo Tender exists
    let tenderDoc = await Tender.findOne({ tenderNumber: 'GEM/2026/B/849201' });
    if (!tenderDoc) {
      tenderDoc = await Tender.create({
        tenderNumber: 'GEM/2026/B/849201',
        title: 'Supply, Installation & Commissioning of 500kW Solar Grid Inverters & Transformers',
        department: 'NTPC Limited - Renewable Energy Division',
        category: 'Solar & Renewable Power Equipment',
        estimatedValueINR: 42000000,
        status: 'PUBLISHED',
        closingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdBy: officer._id
      });
    }

    // 6. Ensure Bidder Entity Profiles exist and are linked to user accounts
    let bidderEntity1 = await Bidder.findOne({ gstin: '08AAAAI9231N1ZC' });
    if (!bidderEntity1) {
      bidderEntity1 = await Bidder.create({
        userId: bidderUser1._id,
        legalBusinessName: 'OM Hotels & Hospitality Private Limited',
        tradeName: 'OM Hotels',
        entityType: 'PVT_LTD',
        gstin: '08AAAAI9231N1ZC',
        pan: 'AAAAI9231N',
        udyamRegistrationNumber: 'UDYAM-RJ-14-0012984',
        isDPIITStartup: false,
        primaryEmail: 'bidder1@praman.test',
        primaryPhone: '+91 9829012345',
        registeredAddress: {
          line1: 'Plot 42, HSIIDC Industrial Area, Phase-I',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302001'
        },
        bankAccountDetails: {
          accountNumber: '91234567890123',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India'
        },
        directors: [
          { din: '08912345', name: 'Om Prakash Sharma', pan: 'AAAAI9231N' }
        ]
      });
    } else if (!bidderEntity1.userId) {
      bidderEntity1.userId = bidderUser1._id;
      bidderEntity1.primaryEmail = 'bidder1@praman.test';
      await bidderEntity1.save();
    }

    let bidderEntity2 = await Bidder.findOne({ gstin: '07AAACS9981F1Z2' });
    if (!bidderEntity2) {
      bidderEntity2 = await Bidder.create({
        userId: bidderUser2._id,
        legalBusinessName: 'Vikram Solar Green Energy Private Limited',
        tradeName: 'Vikram Solar',
        entityType: 'PVT_LTD',
        gstin: '07AAACS9981F1Z2',
        pan: 'AAACS9981F',
        udyamRegistrationNumber: 'UDYAM-DL-03-0049281',
        isDPIITStartup: true,
        primaryEmail: 'bidder2@praman.test',
        primaryPhone: '+91 9876543210',
        registeredAddress: {
          line1: 'Plot 45, Okhla Industrial Area Phase-III',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110020'
        },
        bankAccountDetails: {
          accountNumber: '918020012345678',
          ifscCode: 'UTIB0000123',
          bankName: 'Axis Bank'
        },
        directors: [
          { din: '00123456', name: 'Vikram Sharma', pan: 'ABCPS1234F' },
          { din: '00987654', name: 'Sunita Sharma', pan: 'ABCPS5678G' }
        ]
      });
    } else if (!bidderEntity2.userId) {
      bidderEntity2.userId = bidderUser2._id;
      bidderEntity2.primaryEmail = 'bidder2@praman.test';
      await bidderEntity2.save();
    }

    let bidderEntity3 = await Bidder.findOne({ gstin: '27AABCA1234B1Z9' });
    if (!bidderEntity3) {
      bidderEntity3 = await Bidder.create({
        userId: bidderUser3._id,
        legalBusinessName: 'Apex Power & Infrastructure Limited',
        tradeName: 'Apex Infra',
        entityType: 'PUBLIC_LTD',
        gstin: '27AABCA1234B1Z9',
        pan: 'AABCA1234B',
        udyamRegistrationNumber: 'UDYAM-MH-01-0084721',
        isDPIITStartup: false,
        primaryEmail: 'bidder3@praman.test',
        primaryPhone: '+91 9820123456',
        registeredAddress: {
          line1: 'Tower B, Bandra Kurla Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400051'
        },
        bankAccountDetails: {
          accountNumber: '50200019283746',
          ifscCode: 'HDFC0000050',
          bankName: 'HDFC Bank'
        },
        directors: [
          { din: '00543210', name: 'Rajiv Khanna', pan: 'AAPK9876T' }
        ]
      });
    } else if (!bidderEntity3.userId) {
      bidderEntity3.userId = bidderUser3._id;
      bidderEntity3.primaryEmail = 'bidder3@praman.test';
      await bidderEntity3.save();
    }

    // 7. Ensure Bids on the Tender have variable, realistic high compliance scores
    // Bidder 1 (OM Hotels): 95.4%
    let subOm = await BidSubmission.findOne({ bidderId: bidderEntity1._id, tenderId: tenderDoc._id });
    if (!subOm) {
      subOm = await BidSubmission.create({
        tenderId: tenderDoc._id,
        bidderId: bidderEntity1._id,
        bidReferenceNumber: 'BID-2026-ES87WT',
        bidAmount: 39900000,
        status: 'QUALIFIED',
        evaluationResult: {
          complianceScore: 95.4,
          riskLevel: 'LOW',
          aiRecommendation: 'QUALIFY',
          isCollusionFlagged: false,
          recommendationSummary: 'CBDT Real Live PAN (AAAAI9231N) & GSTIN (08AAAAI9231N1ZC) statutory validation passed with 95.4% compliance.',
          breakdown: {
            gstVerificationScore: 98,
            panVerificationScore: 100,
            udyamVerificationScore: 92,
            forensicDeductions: 0
          }
        },
        uploadedDocuments: [
          { docType: 'GST_CERTIFICATE', originalFileName: 'GST_Registration_Certificate_OM.pdf', storagePath: 'uploads/gst_om.pdf', mimeType: 'application/pdf', fileSizeBytes: 254000, sha256Hash: 'bc4ebb4278b4a25b00152d8ec5b1cd834ee9ceb23475e08a59b8829c247beb1f' },
          { docType: 'PAN_CARD', originalFileName: 'Permanent_Account_Number_OM.pdf', storagePath: 'uploads/pan_om.pdf', mimeType: 'application/pdf', fileSizeBytes: 182000, sha256Hash: 'fce920eeb3efb47669ccc21b23b5eb9721c165baed1bec96cf16d17800998b84' },
          { docType: 'UDYAM_CERTIFICATE', originalFileName: 'Udyam_MSME_OM.pdf', storagePath: 'uploads/udyam_om.pdf', mimeType: 'application/pdf', fileSizeBytes: 310000, sha256Hash: '984bfa4278b4a25b00152d8ec5b1cd834ee9ceb23475e08a59b8829c247be99a' }
        ]
      });
    } else {
      subOm.evaluationResult.complianceScore = 95.4;
      await subOm.save();
    }

    // Bidder 2 (Vikram Solar): 96.8%
    let subVikram = await BidSubmission.findOne({ bidderId: bidderEntity2._id, tenderId: tenderDoc._id });
    if (!subVikram) {
      subVikram = await BidSubmission.create({
        tenderId: tenderDoc._id,
        bidderId: bidderEntity2._id,
        bidReferenceNumber: 'BID-2026-001',
        bidAmount: 38500000,
        status: 'QUALIFIED',
        evaluationResult: {
          complianceScore: 96.8,
          riskLevel: 'LOW',
          aiRecommendation: 'QUALIFY',
          isCollusionFlagged: false,
          recommendationSummary: 'Full technical compliance, Class-I Local Supplier (MII 68%), MSME waiver applicable.',
          breakdown: {
            gstVerificationScore: 100,
            panVerificationScore: 100,
            udyamVerificationScore: 98,
            forensicDeductions: 0
          }
        },
        uploadedDocuments: [
          { docType: 'GST_CERTIFICATE', originalFileName: 'gst_vikram.pdf', storagePath: 'uploads/gst_vikram.pdf', mimeType: 'application/pdf', fileSizeBytes: 1048576, sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
          { docType: 'PAN_CARD', originalFileName: 'pan_vikram.pdf', storagePath: 'uploads/pan_vikram.pdf', mimeType: 'application/pdf', fileSizeBytes: 524288, sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb' },
          { docType: 'UDYAM_CERTIFICATE', originalFileName: 'udyam_vikram.pdf', storagePath: 'uploads/udyam_vikram.pdf', mimeType: 'application/pdf', fileSizeBytes: 819200, sha256Hash: '88d4066917f16e7638c0e6107b30d33d5088f6b09783f50b81a28e3bd3fe8634' }
        ]
      });
    } else {
      subVikram.evaluationResult.complianceScore = 96.8;
      await subVikram.save();
    }

    // Bidder 3 (Apex Infra): 93.6%
    let subApex = await BidSubmission.findOne({ bidderId: bidderEntity3._id, tenderId: tenderDoc._id });
    if (!subApex) {
      subApex = await BidSubmission.create({
        tenderId: tenderDoc._id,
        bidderId: bidderEntity3._id,
        bidReferenceNumber: 'BID-2026-002',
        bidAmount: 41200000,
        status: 'QUALIFIED',
        evaluationResult: {
          complianceScore: 93.6,
          riskLevel: 'LOW',
          aiRecommendation: 'QUALIFY',
          isCollusionFlagged: false,
          recommendationSummary: 'Statutory GSTIN and PAN valid. Financial turnover exceeds threshold requirement.',
          breakdown: {
            gstVerificationScore: 94,
            panVerificationScore: 95,
            udyamVerificationScore: 90,
            forensicDeductions: 0
          }
        },
        uploadedDocuments: [
          { docType: 'GST_CERTIFICATE', originalFileName: 'gst_apex.pdf', storagePath: 'uploads/gst_apex.pdf', mimeType: 'application/pdf', fileSizeBytes: 1048576, sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' },
          { docType: 'PAN_CARD', originalFileName: 'pan_apex.pdf', storagePath: 'uploads/pan_apex.pdf', mimeType: 'application/pdf', fileSizeBytes: 524288, sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a' }
        ]
      });
    } else {
      subApex.evaluationResult.complianceScore = 93.6;
      await subApex.save();
    }

    // 8. Seed an Awarded Contract ready for CRAC Inspection (Vikram Solar)
    let tenderAwarded = await Tender.findOne({ tenderNumber: 'GEM/2026/B/739102' });
    if (!tenderAwarded) {
      tenderAwarded = await Tender.create({
        tenderNumber: 'GEM/2026/B/739102',
        title: 'Smart Energy Metering & SCADA Automation - Northern Grid',
        department: 'Power Grid Corporation of India Limited (PGCIL)',
        category: 'Automation & SCADA Equipment',
        estimatedValueINR: 28500000,
        status: 'AWARDED',
        closingDate: new Date('2026-09-15T18:00:00Z'),
        createdBy: officerUser._id,
        awardedBidderId: bidderEntity2._id,
        awardedAmount: 26800000,
        awardedAt: new Date('2026-09-20T11:00:00Z')
      });
    }

    let subAwardedVikram = await BidSubmission.findOne({ tenderId: tenderAwarded._id });
    if (!subAwardedVikram) {
      subAwardedVikram = await BidSubmission.create({
        tenderId: tenderAwarded._id,
        bidderId: bidderEntity2._id,
        bidReferenceNumber: 'BID-PGCIL-2026-981',
        bidAmount: 26800000,
        status: 'AWARDED',
        officerDecision: {
          decision: 'AWARDED',
          officerJustification: 'Lowest responsive bidder (L1) with 96.8% technical compliance.',
          decidedAt: new Date('2026-09-20T11:00:00Z'),
          decidedBy: officerUser._id
        },
        evaluationResult: {
          complianceScore: 96.8,
          riskLevel: 'LOW',
          aiRecommendation: 'QUALIFY'
        }
      });
      tenderAwarded.awardedBidId = subAwardedVikram._id;
      await tenderAwarded.save();
    }

    // 9. Seed a Completed Contract with Issued Statutory CRAC (Apex Infra)
    let tenderCompleted = await Tender.findOne({ tenderNumber: 'GEM/2026/B/654321' });
    if (!tenderCompleted) {
      tenderCompleted = await Tender.create({
        tenderNumber: 'GEM/2026/B/654321',
        title: 'Supply & Commissioning of High-Voltage Switchgear & Transformers',
        department: 'NTPC Limited - Renewable Energy Division',
        category: 'Electrical Switchgear',
        estimatedValueINR: 41200000,
        status: 'AWARDED',
        closingDate: new Date('2026-09-10T18:00:00Z'),
        createdBy: officerUser._id,
        awardedBidderId: bidderEntity3._id,
        awardedAmount: 41200000,
        awardedAt: new Date('2026-09-22T10:00:00Z')
      });
    }

    let subCompletedApex = await BidSubmission.findOne({ tenderId: tenderCompleted._id });
    if (!subCompletedApex) {
      subCompletedApex = await BidSubmission.create({
        tenderId: tenderCompleted._id,
        bidderId: bidderEntity3._id,
        bidReferenceNumber: 'BID-NTPC-2026-442',
        bidAmount: 41200000,
        status: 'AWARDED',
        officerDecision: {
          decision: 'AWARDED',
          officerJustification: 'Selected responsive bidder with full statutory compliance.',
          decidedAt: new Date('2026-09-22T10:00:00Z'),
          decidedBy: officerUser._id
        },
        evaluationResult: {
          complianceScore: 93.6,
          riskLevel: 'LOW',
          aiRecommendation: 'QUALIFY'
        }
      });
      tenderCompleted.awardedBidId = subCompletedApex._id;
      await tenderCompleted.save();
    }

    // 10. Seed statutory CRAC for demonstration (linked to Apex Infra contract)
    const { CRAC } = await import('../models/CRAC.js');
    let cracSample = await CRAC.findOne({ cracNumber: 'CRAC-GEM-2026-894102' });
    if (!cracSample && subCompletedApex) {
      await CRAC.create({
        tenderId: tenderCompleted._id,
        bidId: subCompletedApex._id,
        bidderId: bidderEntity3._id,
        officerId: officerUser._id,
        cracNumber: 'CRAC-GEM-2026-894102',
        status: 'ACCEPTED',
        rating: 5,
        reviewTitle: 'Exemplary Delivery & Timely Site Commissioning (100% Quality Pass)',
        reviewComments: 'Consignee depot conducted physical inspection of the delivered 500kW Solar Grid Inverters & Step-Up Transformers. Equipment was verified against factory test certificates and BIS standards with 0 defects. Packaging intact, warranty and OEM serials matched NIT requirements.',
        goodsDelivered: '500kW Solar Grid Inverters & Step-Up Transformers',
        quantityOrdered: 10,
        quantityReceived: 10,
        quantityAccepted: 10,
        quantityRejected: 0,
        inspectionDate: new Date('2026-09-28T10:30:00Z'),
        consigneeName: 'Dr. Sanjeev Verma, IAS',
        consigneeDesignation: 'Superintending Engineer & Consignee Officer',
        consigneeLocation: 'Central Receiving Depot, NTPC Bhadla Solar Park Site',
        paymentRecommendation: 'RELEASE_100_PERCENT',
        penaltyAmountINR: 0,
        evidencePhotos: [
          {
            url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
            originalFileName: 'Installed_Inverters_Inspection_Passed.jpg',
            caption: 'Installed 500kW Solar Inverter Array & Transformers Commissioned at Bhadla Site (Passed 100%)',
            mimeType: 'image/jpeg',
            fileSizeBytes: 312000,
            sha256Hash: '984bfa4278b4a25b00152d8ec5b1cd834ee9ceb23475e08a59b8829c247be99a'
          }
        ],
        auditBlock: {
          blockIndex: 12,
          currentHash: '0x8f3c719e2b1049a8d56e72b4c10a991823abce491028374619a8bc471928374a'
        }
      });
    }

    console.log('\x1b[32m[DB AutoSeed]\x1b[0m 1 Officer (officer@praman.test) & 3 Bidders (bidder1@, bidder2@, bidder3@ with password123) seeded with variable high compliance scores (96.8%, 95.4%, 93.6%) and statutory CRAC record.');
  } catch (e) {
    console.warn('[DB AutoSeed Notice]', e.message);
  }
}

/**
 * Connect to MongoDB database
 * Uses MONGO_URI from environment variables or defaults to local MongoDB / Memory fallback
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/praman_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });

    console.log(`\x1b[32m[DB Connected]\x1b[0m MongoDB Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    await autoSeedDefaults();
    return conn;
  } catch (error) {
    console.warn(`\x1b[33m[DB Notice]\x1b[0m Could not connect to local MongoDB at ${uri} (${error.message}).`);
    
    // Try MongoMemoryServer if available
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`\x1b[32m[DB Connected]\x1b[0m In-Memory MongoDB running at: ${memUri}`);
      await autoSeedDefaults();
      return conn;
    } catch (memErr) {
      console.error(`\x1b[31m[DB Connection Error]\x1b[0m ${error.message}`);
      console.error('Make sure MongoDB is running locally (127.0.0.1:27017) or update MONGO_URI in backend/.env');
      return null;
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('\x1b[33m[DB Disconnected]\x1b[0m MongoDB connection lost.');
});
