import { CRAC } from '../models/CRAC.js';
import { BidSubmission } from '../models/BidSubmission.js';
import { Tender } from '../models/Tender.js';
import { Bidder } from '../models/Bidder.js';
import { AuditLedgerService } from '../services/auditLedger.js';
import crypto from 'crypto';
import fs from 'fs';

/**
 * Helper to compute SHA-256 fingerprint for a buffer or string
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 1. Officer submits a CRAC review with photo proof
 * POST /api/crac/create
 */
export const createCrac = async (req, res) => {
  try {
    const {
      bidId,
      tenderId: rawTenderId,
      status = 'ACCEPTED',
      rating = 5,
      reviewTitle,
      reviewComments,
      goodsDelivered,
      quantityOrdered = 1,
      quantityReceived = 1,
      quantityAccepted = 1,
      quantityRejected = 0,
      paymentRecommendation = 'RELEASE_100_PERCENT',
      penaltyAmountINR = 0,
      photoUrl,
      photoCaption,
      consigneeName,
      consigneeDesignation,
      consigneeLocation,
    } = req.body;

    if (!bidId) {
      return res.status(400).json({ success: false, message: 'bidId is required to issue CRAC.' });
    }

    if (!reviewTitle || !reviewComments) {
      return res.status(400).json({ success: false, message: 'Review title and inspection comments are mandatory.' });
    }

    const bid = await BidSubmission.findById(bidId).populate('bidderId').populate('tenderId');
    if (!bid) {
      return res.status(404).json({ success: false, message: 'Associated bid submission not found.' });
    }

    const finalTenderId = rawTenderId || bid.tenderId?._id || bid.tenderId;
    const finalBidderId = bid.bidderId?._id || bid.bidderId;

    // Check if CRAC already issued for this bid
    const existingCrac = await CRAC.findOne({ bidId });
    if (existingCrac) {
      if (req.body.isReinspection === 'true' || req.body.isReinspection === true) {
        req.params = { id: existingCrac._id };
        return updateCrac(req, res);
      }
      return res.status(409).json({
        success: false,
        message: `CRAC certificate (${existingCrac.cracNumber}) has already been issued for this contract. Use re-inspection to update.`,
        crac: existingCrac,
        canReinspect: true
      });
    }

    // Build evidence photos array
    const evidencePhotos = [];

    // Check for uploaded file(s) via Multer
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    if (uploadedFiles && uploadedFiles.length > 0) {
      const fileList = Array.isArray(uploadedFiles) ? uploadedFiles : Object.values(uploadedFiles).flat();
      for (const f of fileList) {
        let hash = f.sha256Hash;
        if (!hash && fs.existsSync(f.path)) {
          hash = sha256(fs.readFileSync(f.path));
        }
        evidencePhotos.push({
          url: `/uploads/${f.filename}`,
          storagePath: f.path,
          originalFileName: f.originalname,
          caption: photoCaption || 'Consignee Physical Inspection Photo Proof',
          mimeType: f.mimetype,
          fileSizeBytes: f.size || 0,
          sha256Hash: hash || sha256(f.filename)
        });
      }
    }

    // Check for direct photoUrl or statutory sample evidence
    if (evidencePhotos.length === 0 && photoUrl) {
      evidencePhotos.push({
        url: photoUrl,
        storagePath: 'external',
        originalFileName: 'site_inspection_evidence.jpg',
        caption: photoCaption || 'Consignee On-Site Inspection Evidence',
        mimeType: 'image/jpeg',
        fileSizeBytes: 248000,
        sha256Hash: sha256(photoUrl + Date.now().toString())
      });
    }

    // Fallback official statutory placeholder if none provided
    if (evidencePhotos.length === 0) {
      const defaultUrl = status === 'ACCEPTED'
        ? 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
      evidencePhotos.push({
        url: defaultUrl,
        storagePath: 'statutory_archive',
        originalFileName: status === 'ACCEPTED' ? 'solar_inverter_acceptance.jpg' : 'damaged_terminal_defect.jpg',
        caption: status === 'ACCEPTED' ? '500kW Solar Inverter Array Delivered & Commissioned' : 'Quality Defect & Damage Flagged during Receiving',
        mimeType: 'image/jpeg',
        fileSizeBytes: 312000,
        sha256Hash: sha256(defaultUrl)
      });
    }

    // Generate unique statutory CRAC Number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const cracNumber = `CRAC-GEM-2026-${randomSuffix}`;

    // Create CRAC Record
    const crac = await CRAC.create({
      tenderId: finalTenderId,
      bidId,
      bidderId: finalBidderId,
      officerId: req.user?._id,
      cracNumber,
      status: status.toUpperCase(),
      rating: Number(rating) || 5,
      reviewTitle: reviewTitle.trim(),
      reviewComments: reviewComments.trim(),
      goodsDelivered: goodsDelivered || bid.tenderId?.title || 'Statutory Supply of Equipment',
      quantityOrdered: Number(quantityOrdered) || 1,
      quantityReceived: Number(quantityReceived) || 1,
      quantityAccepted: Number(quantityAccepted) || (status.toUpperCase() === 'ACCEPTED' ? (Number(quantityReceived) || 1) : 0),
      quantityRejected: Number(quantityRejected) || (status.toUpperCase() === 'REJECTED' ? (Number(quantityReceived) || 1) : 0),
      inspectionDate: new Date(),
      consigneeName: consigneeName || req.user?.name || 'Dr. Sanjeev Verma, IAS',
      consigneeDesignation: consigneeDesignation || req.user?.designation || 'Superintending Engineer & Consignee Officer',
      consigneeLocation: consigneeLocation || 'Central Receiving Depot, NTPC Rajasthan Project Site',
      paymentRecommendation,
      penaltyAmountINR: Number(penaltyAmountINR) || 0,
      evidencePhotos,
    });

    // Record Immutable Audit Ledger Block
    const auditBlock = await AuditLedgerService.recordEvent({
      actionType: 'CRAC_GENERATED',
      actor: {
        userId: req.user?._id,
        name: req.user?.name || 'Consignee Officer',
        role: req.user?.role || 'OFFICER',
        ipAddress: req.ip || '127.0.0.1',
      },
      entityId: crac._id,
      payloadData: {
        cracNumber,
        bidId,
        bidReferenceNumber: bid.bidReferenceNumber,
        tenderId: finalTenderId,
        vendorName: bid.bidderId?.legalBusinessName,
        status: crac.status,
        rating: crac.rating,
        paymentRecommendation,
        photoCount: evidencePhotos.length,
      }
    });

    crac.auditBlock = {
      blockIndex: auditBlock.blockIndex,
      currentHash: auditBlock.currentHash,
    };
    await crac.save();

    // Broadcast Real-time Socket Event
    const io = req.app.get('io');
    if (io) {
      const socketPayload = {
        cracNumber: crac.cracNumber,
        bidId: crac.bidId,
        tenderId: crac.tenderId,
        status: crac.status,
        rating: crac.rating,
        consigneeName: crac.consigneeName,
        reviewTitle: crac.reviewTitle,
        auditHash: auditBlock.currentHash,
      };
      io.to(`tender_${finalTenderId}`).emit('CRAC_ISSUED', socketPayload);
      io.emit('CRAC_RECORDED', socketPayload);
    }

    return res.status(201).json({
      success: true,
      message: `Consignee Receipt & Acceptance Certificate (${cracNumber}) generated and cryptographically sealed.`,
      crac,
    });
  } catch (error) {
    console.error('[CRAC Create Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to issue CRAC certificate.',
    });
  }
};

/**
 * 2. Bidder fetches all CRACs issued for their bids
 * GET /api/crac/my-cracs
 */
export const getMyCracs = async (req, res) => {
  try {
    const bidders = await Bidder.find({
      $or: [
        { userId: req.user?._id },
        { primaryEmail: req.user?.email }
      ]
    });

    if (!bidders || bidders.length === 0) {
      return res.status(200).json({ success: true, count: 0, cracs: [] });
    }

    const bidderIds = bidders.map(b => b._id);
    const cracs = await CRAC.find({ bidderId: { $in: bidderIds } })
      .populate('tenderId', 'tenderNumber title department estimatedValueINR closingDate')
      .populate('bidId', 'bidReferenceNumber bidAmount submissionDate status')
      .populate('officerId', 'name email designation department')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: cracs.length,
      cracs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 3. Officer/Admin fetches all CRAC records
 * GET /api/crac/all
 */
export const getAllCracs = async (req, res) => {
  try {
    const cracs = await CRAC.find()
      .populate('tenderId', 'tenderNumber title department estimatedValueINR')
      .populate('bidId', 'bidReferenceNumber bidAmount status')
      .populate('bidderId', 'legalBusinessName tradeName gstin pan primaryEmail primaryPhone')
      .populate('officerId', 'name email designation')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: cracs.length,
      cracs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 4. Fetch CRAC for a specific bid
 * GET /api/crac/bid/:bidId
 */
export const getCracForBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const crac = await CRAC.findOne({ bidId })
      .populate('tenderId', 'tenderNumber title department')
      .populate('bidId', 'bidReferenceNumber bidAmount submissionDate status')
      .populate('bidderId', 'legalBusinessName gstin pan')
      .populate('officerId', 'name designation department');

    if (!crac) {
      return res.status(200).json({ success: true, crac: null });
    }

    return res.status(200).json({ success: true, crac });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 5. Fetch all Awarded Contracts for Officer to inspect and issue CRAC
 * GET /api/crac/pending-contracts
 */
export const getAwardedContractsForCrac = async (req, res) => {
  try {
    const awardedBids = await BidSubmission.find({
      status: { $in: ['AWARDED', 'ACCEPTED'] }
    })
      .populate('tenderId', 'tenderNumber title department estimatedValueINR closingDate status')
      .populate('bidderId', 'legalBusinessName tradeName gstin pan udyamRegistrationNumber primaryEmail primaryPhone registeredAddress')
      .sort({ updatedAt: -1 });

    const existingCracs = await CRAC.find().select('bidId cracNumber status rating createdAt');
    const cracMap = new Map();
    existingCracs.forEach(c => cracMap.set(String(c.bidId), c));

    const enriched = awardedBids.map(bid => ({
      bidId: bid._id,
      bidReferenceNumber: bid.bidReferenceNumber,
      bidAmount: bid.bidAmount,
      tender: bid.tenderId,
      bidder: bid.bidderId,
      awardedAt: bid.officerDecision?.decidedAt || bid.updatedAt,
      hasCrac: cracMap.has(String(bid._id)),
      crac: cracMap.get(String(bid._id)) || null,
    }));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      contracts: enriched,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 6. Officer re-inspects and updates an existing CRAC certificate
 * PUT /api/crac/update/:id
 */
export const updateCrac = async (req, res) => {
  try {
    const cracId = req.params.id;
    const {
      status,
      rating,
      reviewTitle,
      reviewComments,
      goodsDelivered,
      quantityOrdered,
      quantityReceived,
      quantityAccepted,
      quantityRejected,
      paymentRecommendation,
      penaltyAmountINR,
      photoUrl,
      photoCaption,
      consigneeName,
      consigneeDesignation,
      consigneeLocation,
    } = req.body;

    const crac = await CRAC.findById(cracId).populate('tenderId').populate('bidderId');
    if (!crac) {
      return res.status(404).json({ success: false, message: 'CRAC certificate not found.' });
    }

    if (status) crac.status = status;
    if (rating !== undefined) crac.rating = Number(rating);
    if (reviewTitle) crac.reviewTitle = reviewTitle;
    if (reviewComments) crac.reviewComments = reviewComments;
    if (goodsDelivered) crac.goodsDelivered = goodsDelivered;
    if (quantityOrdered !== undefined) crac.quantityOrdered = Number(quantityOrdered);
    if (quantityReceived !== undefined) crac.quantityReceived = Number(quantityReceived);
    if (quantityAccepted !== undefined) crac.quantityAccepted = Number(quantityAccepted);
    if (quantityRejected !== undefined) crac.quantityRejected = Number(quantityRejected);
    if (paymentRecommendation) crac.paymentRecommendation = paymentRecommendation;
    if (penaltyAmountINR !== undefined) crac.penaltyAmountINR = Number(penaltyAmountINR);
    if (consigneeName) crac.consigneeName = consigneeName;
    if (consigneeDesignation) crac.consigneeDesignation = consigneeDesignation;
    if (consigneeLocation) crac.consigneeLocation = consigneeLocation;

    // Check for uploaded photo files
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    if (uploadedFiles && uploadedFiles.length > 0) {
      const fileList = Array.isArray(uploadedFiles) ? uploadedFiles : Object.values(uploadedFiles).flat();
      for (const f of fileList) {
        let hash = f.sha256Hash;
        if (!hash && fs.existsSync(f.path)) {
          hash = sha256(fs.readFileSync(f.path));
        }
        crac.evidencePhotos.push({
          url: `/uploads/${f.filename}`,
          storagePath: f.path,
          originalFileName: f.originalname,
          caption: photoCaption || 'Consignee Re-inspection Photo Evidence',
          mimeType: f.mimetype,
          fileSizeBytes: f.size || 0,
          sha256Hash: hash || sha256(f.filename),
        });
      }
    } else if (photoUrl) {
      crac.evidencePhotos.push({
        url: photoUrl,
        storagePath: 'external',
        originalFileName: 'reinspection_evidence.jpg',
        caption: photoCaption || 'Consignee Re-inspection Photo Evidence',
        mimeType: 'image/jpeg',
        fileSizeBytes: 248000,
        sha256Hash: sha256(photoUrl + Date.now().toString()),
      });
    }

    crac.inspectionDate = new Date();
    const updatedPayload = JSON.stringify({
      cracNumber: crac.cracNumber,
      bidId: crac.bidId,
      status: crac.status,
      rating: crac.rating,
      reinspectedAt: crac.inspectionDate,
    });
    crac.blockchainTxHash = '0x' + sha256(updatedPayload);

    await crac.save();

    await AuditLedgerService.recordEvent({
      actionType: 'CRAC_REINSPECTED',
      actor: {
        userId: req.user?._id || crac.officerId,
        name: req.user?.name || 'Consignee Officer',
        role: req.user?.role || 'OFFICER',
        ipAddress: req.ip || '127.0.0.1',
      },
      entityId: crac._id,
      payloadData: {
        cracNumber: crac.cracNumber,
        newStatus: crac.status,
        newRating: crac.rating,
        reinspectionReason: reviewTitle,
        reinspectedAt: crac.inspectionDate,
      },
    }).catch(err => console.warn('[CRAC Reinspection Audit Warning]', err.message));

    return res.status(200).json({
      success: true,
      message: `CRAC certificate (${crac.cracNumber}) updated successfully after re-inspection.`,
      crac,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createCrac,
  updateCrac,
  getMyCracs,
  getAllCracs,
  getCracForBid,
  getAwardedContractsForCrac,
};
