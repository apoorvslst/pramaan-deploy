import { BidSubmission } from '../models/BidSubmission.js';
import { VerificationEvidence } from '../models/VerificationEvidence.js';
import { VerificationPipeline } from '../services/verificationPipeline.js';
import { AuditLedgerService } from '../services/auditLedger.js';

export const triggerVerification = async (req, res) => {
  try {
    const { bidId } = req.params;
    const io = req.app.get('io');

    const result = await VerificationPipeline.run({
      submissionId: bidId,
      io,
      actor: {
        userId: req.user?._id,
        name: req.user?.name || 'Procurement Officer',
        role: req.user?.role || 'OFFICER'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Verification pipeline executed successfully.',
      bidReferenceNumber: result.submission.bidReferenceNumber,
      complianceScore: result.evaluationResult.complianceScore,
      riskLevel: result.evaluationResult.riskLevel,
      aiRecommendation: result.evaluationResult.aiRecommendation,
      recommendationSummary: result.evaluationResult.recommendationSummary,
      evidenceGeneratedCount: result.evidenceList.length,
      auditBlock: {
        blockIndex: result.auditBlock.blockIndex,
        actionType: result.auditBlock.actionType,
        currentHash: result.auditBlock.currentHash
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEvidenceByBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const evidenceList = await VerificationEvidence.find({ submissionId: bidId })
      .populate('tenderId', 'tenderNumber title')
      .sort({ createdAt: 1 });

    const submission = await BidSubmission.findById(bidId)
      .populate('bidderId')
      .populate('tenderId');

    return res.status(200).json({
      success: true,
      submissionId: bidId,
      bidReferenceNumber: submission?.bidReferenceNumber,
      bidAmount: submission?.bidAmount || 0,
      bidder: submission?.bidderId?.legalBusinessName,
      evaluationResult: submission?.evaluationResult,
      officerDecision: submission?.officerDecision,
      evidenceCount: evidenceList.length,
      evidenceList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitOfficerDecision = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { decision, officerJustification } = req.body;

    if (!decision || !['QUALIFIED', 'DISQUALIFIED'].includes(decision.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Valid decision ("QUALIFIED" or "DISQUALIFIED") is required.',
      });
    }

    const submission = await BidSubmission.findById(bidId)
      .populate('bidderId')
      .populate('tenderId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Bid submission not found.',
      });
    }

    const normalizedDecision = decision.toUpperCase();
    const aiRec = submission.evaluationResult?.aiRecommendation;
    const isOverridden = (aiRec === 'QUALIFY' && normalizedDecision === 'DISQUALIFIED') ||
                         (aiRec === 'DISQUALIFY' && normalizedDecision === 'QUALIFIED');

    if (isOverridden && !officerJustification) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory justification text is legally required when overriding an AI recommendation.',
      });
    }

    submission.status = normalizedDecision;
    submission.officerDecision = {
      decidedBy: req.user?._id,
      decision: normalizedDecision,
      isOverridden,
      officerJustification: officerJustification || (isOverridden ? 'Officer administrative override' : 'Accepted AI recommendation'),
      decidedAt: new Date()
    };

    await submission.save();

    // Record Immutable Audit Block
    const actionType = isOverridden ? 'OFFICER_OVERRIDE' : 'FINAL_AWARD_DECISION';
    const auditBlock = await AuditLedgerService.recordEvent({
      actionType,
      actor: {
        userId: req.user?._id,
        name: req.user?.name || 'Procurement Officer',
        role: req.user?.role || 'OFFICER',
        ipAddress: req.ip || '127.0.0.1'
      },
      entityId: submission._id,
      payloadData: {
        submissionId: submission._id,
        bidReferenceNumber: submission.bidReferenceNumber,
        tenderId: submission.tenderId?._id,
        decision: normalizedDecision,
        aiRecommendation: aiRec,
        isOverridden,
        officerJustification: submission.officerDecision.officerJustification,
        decidedAt: submission.officerDecision.decidedAt
      }
    });

    // Notify room via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`tender_${submission.tenderId?._id}`).emit('OFFICER_DECISION_RECORDED', {
        submissionId: submission._id,
        decision: normalizedDecision,
        isOverridden,
        officer: req.user?.name,
        auditBlock: {
          blockIndex: auditBlock.blockIndex,
          currentHash: auditBlock.currentHash
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Officer decision (${normalizedDecision}) recorded and cryptographically sealed.`,
      submissionId: submission._id,
      decision: submission.officerDecision,
      auditBlock: {
        blockIndex: auditBlock.blockIndex,
        actionType: auditBlock.actionType,
        currentHash: auditBlock.currentHash
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTenderEvaluations = async (req, res) => {
  try {
    const { tenderId } = req.params;

    const submissions = await BidSubmission.find({ tenderId })
      .populate('bidderId')
      .populate('officerDecision.decidedBy', 'name email designation')
      .sort({ bidAmount: -1, 'evaluationResult.complianceScore': -1 });

    const rankedBidders = submissions.map((sub, index) => ({
      rank: index + 1,
      submissionId: sub._id,
      bidReferenceNumber: sub.bidReferenceNumber,
      bidAmount: sub.bidAmount || 0,
      bidder: {
        id: sub.bidderId?._id,
        name: sub.bidderId?.legalBusinessName,
        gstin: sub.bidderId?.gstin,
        pan: sub.bidderId?.pan,
        isMSME: sub.bidderId?.isMSME || Boolean(sub.bidderId?.udyamRegistrationNumber)
      },
      status: sub.status,
      score: sub.evaluationResult?.complianceScore || 0,
      riskLevel: sub.evaluationResult?.riskLevel || 'MEDIUM',
      aiRecommendation: sub.evaluationResult?.aiRecommendation,
      officerDecision: sub.officerDecision,
      submittedAt: sub.submissionDate
    }));

    return res.status(200).json({
      success: true,
      tenderId,
      totalBidders: rankedBidders.length,
      rankedBidders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  triggerVerification,
  getEvidenceByBid,
  submitOfficerDecision,
  getTenderEvaluations
};
