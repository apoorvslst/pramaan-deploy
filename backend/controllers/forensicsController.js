import { Bidder } from '../models/Bidder.js';
import { BidSubmission } from '../models/BidSubmission.js';
import { Tender } from '../models/Tender.js';
import { CollusionDetector } from '../services/collusionDetector.js';
import { AnomalyDetector } from '../services/anomalyDetector.js';
import { AuditLedgerService } from '../services/auditLedger.js';

/**
 * @desc    Run full cartel & collusion graph analysis across all bidders on a tender
 * @route   POST /api/forensics/:tenderId/collusion
 * @access  Private (OFFICER, AUDITOR)
 */
export const runCollusionAnalysis = async (req, res) => {
  try {
    const { tenderId } = req.params;

    const tender = await Tender.findById(tenderId);
    if (!tender) {
      return res.status(404).json({ success: false, message: 'Tender not found.' });
    }

    const submissions = await BidSubmission.find({ tenderId }).populate('bidderId');
    const bidders = submissions
      .map(s => s.bidderId)
      .filter(Boolean)
      .filter((b, i, arr) => arr.findIndex(x => x._id.toString() === b._id.toString()) === i);

    if (bidders.length < 2) {
      return res.status(200).json({
        success: true,
        collusionDetected: false,
        message: 'Insufficient bidders for collusion analysis (minimum 2 required).',
      });
    }

    const report = CollusionDetector.analyze(bidders, submissions);

    // Record collusion analysis in audit ledger
    await AuditLedgerService.recordEvent({
      actionType: 'COLLUSION_ANALYSIS_RUN',
      actor: {
        userId: req.user?._id,
        name: req.user?.name || 'Procurement Officer',
        role: req.user?.role || 'OFFICER',
        ipAddress: req.ip || '127.0.0.1',
      },
      entityId: tenderId,
      payloadData: {
        tenderId,
        tenderNumber: tender.tenderNumber,
        biddersAnalyzed: bidders.length,
        collusionDetected: report.collusionDetected,
        clustersFound: report.riskClusters.length,
        totalSignals: report.totalSignals,
      },
    });

    // Emit via Socket.io if collusion is detected
    if (report.collusionDetected) {
      const io = req.app.get('io');
      if (io) {
        io.to(`tender_${tenderId}`).emit('COLLUSION_ALERT', {
          tenderId,
          clusters: report.riskClusters.length,
          severity: report.riskClusters[0]?.severity || 'HIGH',
          verdict: report.verdict,
        });
      }
    }

    return res.status(200).json({
      success: true,
      tender: {
        id: tender._id,
        tenderNumber: tender.tenderNumber,
        title: tender.title,
      },
      ...report,
    });
  } catch (error) {
    console.error('[Collusion Analysis Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Run anomaly detection on a specific bid submission
 * @route   POST /api/forensics/:bidId/anomalies
 * @access  Private (OFFICER, AUDITOR)
 */
export const runAnomalyDetection = async (req, res) => {
  try {
    const { bidId } = req.params;

    const submission = await BidSubmission.findById(bidId)
      .populate('bidderId')
      .populate('tenderId');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Bid submission not found.' });
    }

    const allSubmissions = await BidSubmission.find({ tenderId: submission.tenderId._id })
      .populate('bidderId');

    const report = AnomalyDetector.detect({
      bidder: submission.bidderId,
      submission,
      tender: submission.tenderId,
      allSubmissions,
    });

    // Record anomaly scan in audit ledger
    await AuditLedgerService.recordEvent({
      actionType: 'ANOMALY_SCAN_RUN',
      actor: {
        userId: req.user?._id,
        name: req.user?.name || 'Procurement Officer',
        role: req.user?.role || 'OFFICER',
        ipAddress: req.ip || '127.0.0.1',
      },
      entityId: submission._id,
      payloadData: {
        submissionId: submission._id,
        bidReferenceNumber: submission.bidReferenceNumber,
        anomaliesDetected: report.totalAnomalies,
        criticalAnomalies: report.criticalAnomalies,
        anomalyRiskMultiplier: report.anomalyRiskMultiplier,
      },
    });

    // Update submission with anomaly metadata
    if (report.anomaliesDetected) {
      submission.evaluationResult = {
        ...submission.evaluationResult?.toObject?.() || submission.evaluationResult || {},
        anomalyReport: {
          totalAnomalies: report.totalAnomalies,
          criticalAnomalies: report.criticalAnomalies,
          riskMultiplier: report.anomalyRiskMultiplier,
          lastScanned: new Date(),
        },
      };
      await submission.save();
    }

    return res.status(200).json({
      success: true,
      submissionId: submission._id,
      bidReferenceNumber: submission.bidReferenceNumber,
      bidder: submission.bidderId?.legalBusinessName,
      ...report,
    });
  } catch (error) {
    console.error('[Anomaly Detection Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Full forensic dashboard — combines collusion + anomaly for all bidders on a tender
 * @route   GET /api/forensics/:tenderId/dashboard
 * @access  Private (OFFICER, AUDITOR)
 */
export const getForensicDashboard = async (req, res) => {
  try {
    const { tenderId } = req.params;

    const tender = await Tender.findById(tenderId);
    if (!tender) {
      return res.status(404).json({ success: false, message: 'Tender not found.' });
    }

    const submissions = await BidSubmission.find({ tenderId }).populate('bidderId');
    const bidders = submissions
      .map(s => s.bidderId)
      .filter(Boolean)
      .filter((b, i, arr) => arr.findIndex(x => x._id.toString() === b._id.toString()) === i);

    // Run collusion analysis
    const collusionReport = CollusionDetector.analyze(bidders, submissions);

    // Run anomaly detection for each submission
    const anomalyReports = [];
    for (const sub of submissions) {
      const anomaly = AnomalyDetector.detect({
        bidder: sub.bidderId,
        submission: sub,
        tender,
        allSubmissions: submissions,
      });
      anomalyReports.push({
        submissionId: sub._id,
        bidReferenceNumber: sub.bidReferenceNumber,
        bidder: sub.bidderId?.legalBusinessName,
        ...anomaly,
      });
    }

    const totalCritical = anomalyReports.reduce((a, r) => a + r.criticalAnomalies, 0) +
      collusionReport.riskClusters.filter(c => c.severity === 'CRITICAL').length;

    return res.status(200).json({
      success: true,
      tender: {
        id: tender._id,
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        department: tender.department,
      },
      overallRiskLevel: totalCritical > 0 ? 'CRITICAL' : (collusionReport.collusionDetected ? 'HIGH' : 'LOW'),
      collusion: collusionReport,
      anomalies: anomalyReports,
      summary: {
        totalBidders: bidders.length,
        totalSubmissions: submissions.length,
        collusionClusters: collusionReport.riskClusters.length,
        totalAnomaliesAcrossBidders: anomalyReports.reduce((a, r) => a + r.totalAnomalies, 0),
        criticalFlags: totalCritical,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Forensic Dashboard Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  runCollusionAnalysis,
  runAnomalyDetection,
  getForensicDashboard,
};
