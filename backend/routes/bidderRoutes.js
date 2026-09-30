import express from 'express';
import { Bidder } from '../models/Bidder.js';
import { BidSubmission } from '../models/BidSubmission.js';

const router = express.Router();

/**
 * @desc    Get all registered bidder entities from the database
 * @route   GET /api/bidders
 * @access  Public (for dashboard directory listing)
 */
router.get('/', async (req, res) => {
  try {
    const bidders = await Bidder.find()
      .sort({ createdAt: -1 })
      .lean();

    // Enrich each bidder with their submission stats
    const enrichedBidders = await Promise.all(
      bidders.map(async (bidder) => {
        const submissions = await BidSubmission.find({ bidderId: bidder._id })
          .select('status evaluationResult uploadedDocuments bidAmount')
          .lean();

        const totalSubmissions = submissions.length;
        const submittedDocs = submissions.reduce(
          (sum, s) => sum + (s.uploadedDocuments?.length || 0),
          0
        );
        const verifiedDocs = submissions.reduce(
          (sum, s) => sum + (s.uploadedDocuments?.filter(d => d.sha256Hash)?.length || 0),
          0
        );
        const forensicFlags = submissions.reduce(
          (sum, s) => sum + (s.evaluationResult?.breakdown?.forensicDeductions ? 1 : 0),
          0
        );

        // Compute aggregate score and risk from the latest submission
        const latestSub = submissions[0];
        const score = latestSub?.evaluationResult?.complianceScore || 0;
        const riskLevel = latestSub?.evaluationResult?.riskLevel || 'MEDIUM';
        const aiRecommendation = latestSub?.evaluationResult?.aiRecommendation || 'MANUAL_REVIEW';
        const status = latestSub?.status || 'REGISTERED';
        const isCollusionFlagged = latestSub?.evaluationResult?.isCollusionFlagged || false;
        const bidAmount = latestSub?.bidAmount || 0;

        return {
          _id: bidder._id,
          id: bidder._id,
          legalName: bidder.legalBusinessName,
          gstin: bidder.gstin,
          pan: bidder.pan,
          udyam: bidder.udyamRegistrationNumber || null,
          entityType: bidder.entityType || 'PVT_LTD',
          isMSME: Boolean(bidder.udyamRegistrationNumber),
          msmeCategory: bidder.udyamRegistrationNumber ? 'Small' : null,
          address: bidder.registeredAddress
            ? `${bidder.registeredAddress.line1}, ${bidder.registeredAddress.city} - ${bidder.registeredAddress.pincode}`
            : 'Not provided',
          phone: bidder.primaryPhone || 'N/A',
          email: bidder.primaryEmail || 'N/A',
          bidAmount,
          score,
          riskLevel,
          aiRecommendation,
          status,
          isCollusionFlagged,
          collusionNote: null,
          submittedDocs,
          verifiedDocs,
          forensicFlags,
          totalSubmissions,
          directors: bidder.directors || [],
          createdAt: bidder.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enrichedBidders.length,
      bidders: enrichedBidders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc    Get a single bidder entity by ID
 * @route   GET /api/bidders/:id
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const bidder = await Bidder.findById(req.params.id).lean();
    if (!bidder) {
      return res.status(404).json({
        success: false,
        message: 'Bidder entity not found.',
      });
    }

    const submissions = await BidSubmission.find({ bidderId: bidder._id })
      .populate('tenderId', 'tenderNumber title status')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      bidder: {
        ...bidder,
        submissions,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
