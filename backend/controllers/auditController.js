import { AuditLedger } from '../models/AuditLedger.js';
import { Tender } from '../models/Tender.js';
import { BidSubmission } from '../models/BidSubmission.js';
import { AuditLedgerService } from '../services/auditLedger.js';

export const getChainByTender = async (req, res) => {
  try {
    const { tenderId } = req.params;

    // Find all bid submissions under this tender to include their audit blocks
    const submissions = await BidSubmission.find({ tenderId }).select('_id');
    const submissionIds = submissions.map(s => s._id.toString());

    const entityIds = [tenderId.toString(), ...submissionIds];

    const blocks = await AuditLedger.find({
      entityId: { $in: entityIds }
    }).sort({ blockIndex: 1 });

    return res.status(200).json({
      success: true,
      tenderId,
      totalBlocks: blocks.length,
      blocks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyChainIntegrity = async (req, res) => {
  try {
    const { tenderId } = req.params;
    const verification = await AuditLedgerService.verifyLedgerIntegrity(tenderId || null);

    return res.status(200).json({
      success: true,
      ...verification,
      verifiedAt: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBlocks = async (req, res) => {
  try {
    const { actionType, limit = 50, page = 1 } = req.query;
    const query = {};

    if (actionType) {
      query.actionType = actionType;
    }

    const total = await AuditLedger.countDocuments(query);
    const blocks = await AuditLedger.find(query)
      .sort({ blockIndex: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      blocks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCAGReport = async (req, res) => {
  try {
    const { tenderId } = req.params;
    const tender = await Tender.findById(tenderId).populate('createdBy', 'name email designation department');

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found for CAG audit report.',
      });
    }

    const submissions = await BidSubmission.find({ tenderId })
      .populate('bidderId')
      .populate('officerDecision.decidedBy', 'name email designation');

    const submissionIds = submissions.map(s => s._id.toString());
    const entityIds = [tenderId.toString(), ...submissionIds];

    const auditBlocks = await AuditLedger.find({
      entityId: { $in: entityIds }
    }).sort({ blockIndex: 1 });

    const chainVerification = await AuditLedgerService.verifyLedgerIntegrity();

    const overrides = submissions
      .filter(s => s.officerDecision?.isOverridden)
      .map(s => ({
        bidReferenceNumber: s.bidReferenceNumber,
        bidder: s.bidderId?.legalBusinessName,
        aiRecommendation: s.evaluationResult?.aiRecommendation,
        officerDecision: s.officerDecision?.decision,
        justification: s.officerDecision?.officerJustification,
        decidedBy: s.officerDecision?.decidedBy?.name,
        decidedAt: s.officerDecision?.decidedAt,
      }));

    return res.status(200).json({
      success: true,
      dossierTitle: 'CAG-Ready Public Procurement Statutory Audit Dossier',
      generatedAt: new Date().toISOString(),
      tender: {
        id: tender._id,
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        department: tender.department,
        estimatedValueINR: tender.estimatedValueINR,
        status: tender.status,
        auditRootHash: tender.auditRootHash,
      },
      biddersEvaluatedCount: submissions.length,
      chainIntegrity: {
        isValid: chainVerification.isValid,
        totalBlocks: auditBlocks.length,
        merkleRoot: chainVerification.merkleRoot,
        status: chainVerification.isValid ? 'TAMPER_PROOF_VERIFIED' : 'TAMPERED',
      },
      officerOverrides: overrides,
      auditBlocks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getChainByTender,
  verifyChainIntegrity,
  getAllBlocks,
  getCAGReport
};
