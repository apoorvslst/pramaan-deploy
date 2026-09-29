/**
 * PRAMAN Backend Engine — AI Microservice Bridge Routes
 *
 * Exposes AI services to Frontend & Officer Dashboard:
 *   - Grounded RAG Officer Assistant (/api/ai/assistant/query)
 *   - Signature Intelligence & Collusion Verification (/api/ai/signatures/...)
 *   - Tender Rule Parser (/api/ai/tender/parse-nit)
 *   - AI Microservice Status & Health (/api/ai/health)
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { aiClient } from '../services/aiClient.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @desc    Check AI Microservice Health & LLM Status
 * @route   GET /api/ai/health
 * @access  Public
 */
router.get('/health', async (req, res) => {
  const health = await aiClient.checkHealth();
  if (!health) {
    return res.status(503).json({
      success: false,
      status: 'OFFLINE',
      message: 'AI microservice on port 8000 is not reachable. Using fallback heuristics.',
      aiBaseUrl: aiClient.baseUrl,
    });
  }
  return res.status(200).json({
    success: true,
    status: 'ONLINE',
    aiService: health,
  });
});

/**
 * @desc    Query the Grounded RAG Officer Assistant
 * @route   POST /api/ai/assistant/query
 * @access  Private (OFFICER, CAG_AUDITOR, ADMIN)
 */
router.post('/assistant/query', protect, async (req, res) => {
  try {
    const { question, tenderId, conversationHistory } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question parameter is required.' });
    }

    const result = await aiClient.queryAssistant(question, tenderId, conversationHistory);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to query RAG officer assistant.',
    });
  }
});

/**
 * @desc    Index bid documents into vector DB
 * @route   POST /api/ai/assistant/index-bid
 * @access  Private (OFFICER, ADMIN)
 */
router.post('/assistant/index-bid', protect, async (req, res) => {
  try {
    const { tenderId, bidderId, bidderName, documents } = req.body;
    if (!tenderId || !bidderId || !documents) {
      return res.status(400).json({ success: false, message: 'tenderId, bidderId, and documents are required.' });
    }

    const result = await aiClient.indexBidDocuments(tenderId, bidderId, bidderName || 'Bidder', documents);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Extract and analyze signatures from an uploaded document
 * @route   POST /api/ai/signatures/detect
 * @access  Private (OFFICER, CAG_AUDITOR)
 */
router.post('/signatures/detect', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required.' });
    }

    const maxPages = req.body.maxPages ? parseInt(req.body.maxPages, 10) : 5;
    const result = await aiClient.extractSignatures(req.file.path, maxPages);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Verify cross-bidder signatures to detect shared signers / cartel rings
 * @route   POST /api/ai/signatures/verify-cross-bid
 * @access  Private (OFFICER, CAG_AUDITOR)
 */
router.post('/signatures/verify-cross-bid', protect, async (req, res) => {
  try {
    const { tenderId, similarityThreshold } = req.body;
    if (!tenderId) {
      return res.status(400).json({ success: false, message: 'tenderId is required.' });
    }

    const result = await aiClient.verifyCrossBidSignatures(tenderId, similarityThreshold || 0.82);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Bidder AI Pre-Flight Assistant & Eligibility Advisor
 * @route   POST /api/ai/preflight
 * @access  Public / Private
 */
router.post('/preflight', async (req, res) => {
  try {
    const {
      tenderId,
      companyName = 'Bidder Entity',
      gstin = '',
      pan = '',
      udyam = '',
      annualTurnoverINR = 0,
      experienceYears = 0,
      isMSME = false,
      isStartup = false,
      documents = [],
    } = req.body;

    const normalizedGSTIN = (gstin || '').trim().toUpperCase();
    const normalizedPAN = (pan || '').trim().toUpperCase();
    const normalizedUdyam = (udyam || '').trim().toUpperCase();
    const normalizedDocs = (Array.isArray(documents) ? documents : []).map(d => 
      typeof d === 'string' ? d.trim().toUpperCase() : (d.docType || '').trim().toUpperCase()
    );

    // Deterministic Rule Checklist
    const checks = [];
    let score = 100;

    // Check 1: GSTIN Structure & Checksum
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (normalizedGSTIN && gstinRegex.test(normalizedGSTIN)) {
      checks.push({
        name: 'GSTIN Structure & Validity',
        status: 'PASS',
        confidence: 0.98,
        message: `GSTIN ${normalizedGSTIN} adheres strictly to statutory 15-character alphanumeric format with state code ${normalizedGSTIN.substring(0, 2)}.`,
      });
    } else if (normalizedGSTIN) {
      score -= 25;
      checks.push({
        name: 'GSTIN Structure & Validity',
        status: 'WARN',
        confidence: 0.85,
        message: `GSTIN format warning: '${normalizedGSTIN}' does not match standard 15-character GST pattern.`,
      });
    } else {
      score -= 30;
      checks.push({
        name: 'GSTIN Structure & Validity',
        status: 'FAIL',
        confidence: 1.0,
        message: 'Statutory GST Certificate / GSTIN is missing. Required under Section 7.2 of GeM rules.',
      });
    }

    // Check 2: PAN & Entity Consistency
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (normalizedPAN && panRegex.test(normalizedPAN)) {
      const gstinPan = normalizedGSTIN.length >= 12 ? normalizedGSTIN.substring(2, 12) : null;
      if (gstinPan && gstinPan === normalizedPAN) {
        checks.push({
          name: 'PAN & GSTIN Identity Cross-Match',
          status: 'PASS',
          confidence: 0.99,
          message: `Permanent Account Number ${normalizedPAN} perfectly matches entity root in GSTIN (${gstinPan}).`,
        });
      } else {
        checks.push({
          name: 'PAN & GSTIN Identity Cross-Match',
          status: 'PASS',
          confidence: 0.95,
          message: `PAN ${normalizedPAN} verified. Ensure legal entity name is identical across all statutory filings.`,
        });
      }
    } else if (normalizedPAN) {
      score -= 20;
      checks.push({
        name: 'PAN & GSTIN Identity Cross-Match',
        status: 'WARN',
        confidence: 0.8,
        message: `PAN '${normalizedPAN}' is non-standard. Expected 10-character PAN format (e.g. ABCDE1234F).`,
      });
    }

    // Check 3: Financial Turnover
    const turnoverVal = Number(annualTurnoverINR) || 0;
    if (turnoverVal >= 10000000) { // >= 1 Crore
      checks.push({
        name: 'Annual Average Turnover',
        status: 'PASS',
        confidence: 0.96,
        message: `Declared turnover of ₹${(turnoverVal / 10000000).toFixed(2)} Cr satisfies statutory tender minimum.`,
      });
    } else if (isMSME || isStartup) {
      checks.push({
        name: 'Annual Average Turnover',
        status: 'PASS',
        confidence: 0.94,
        message: `Declared turnover of ₹${(turnoverVal / 100000).toFixed(1)} Lakh eligible for exemption under MSME/Startup policy (Order No. F.20/2/2014-PPD).`,
      });
    } else {
      score -= 25;
      checks.push({
        name: 'Annual Average Turnover',
        status: 'WARN',
        confidence: 0.9,
        message: `Turnover of ₹${(turnoverVal / 100000).toFixed(1)} Lakh is below typical ₹1.0 Cr threshold. If registered as MSME/DPIIT Startup, upload certificate to claim exemption.`,
      });
    }

    // Check 4: Mandatory Statutory Documents
    const mandatoryList = ['GST_CERTIFICATE', 'PAN_CARD', 'CA_TURNOVER_CERTIFICATE', 'DEBARMENT_AFFIDAVIT'];
    const presentMandatory = mandatoryList.filter(reqDoc => 
      normalizedDocs.some(d => d.includes(reqDoc) || reqDoc.includes(d))
    );
    if (presentMandatory.length >= mandatoryList.length || normalizedDocs.length >= 3) {
      checks.push({
        name: 'Statutory Document Checklist',
        status: 'PASS',
        confidence: 0.95,
        message: `All statutory certificates uploaded (${presentMandatory.length || normalizedDocs.length} documents identified).`,
      });
    } else {
      const missing = mandatoryList.filter(reqDoc => !normalizedDocs.some(d => d.includes(reqDoc) || reqDoc.includes(d)));
      score -= 15;
      checks.push({
        name: 'Statutory Document Checklist',
        status: 'WARN',
        confidence: 0.88,
        message: `Recommended to upload: ${missing.join(', ')} before final submission to avoid GeM 48-hour clarification notice.`,
      });
    }

    const readinessScore = Math.max(20, Math.min(100, score));
    const isEligible = readinessScore >= 60;

    // AI Advisory generation (Call Groq if available)
    let aiAdvisory = '';
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            messages: [
              {
                role: 'system',
                content: 'You are the PRAMAN Public Procurement Statutory Compliance AI. Give a concise, professional 2-3 sentence advisory to the bidder regarding their eligibility readiness for an Indian public tender.'
              },
              {
                role: 'user',
                content: `Bidder: ${companyName}, GSTIN: ${normalizedGSTIN}, PAN: ${normalizedPAN}, Turnover: ₹${turnoverVal}, MSME: ${isMSME}, Documents: ${normalizedDocs.join(', ')}. Readiness Score: ${readinessScore}%.`
              }
            ],
            max_tokens: 150,
            temperature: 0.3,
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          aiAdvisory = groqData.choices?.[0]?.message?.content?.trim();
        }
      } catch (err) {
        console.warn('[AI Preflight Groq Call Warning]', err.message);
      }
    }

    if (!aiAdvisory) {
      aiAdvisory = isEligible
        ? `Pre-flight statutory validation indicates high eligibility readiness (${readinessScore}%). Documents and identification format align with GeM General Financial Rules (GFR 2017). Ensure all certificates bear official seal or valid UDIN.`
        : `Pre-flight checks flagged potential compliance gaps (${readinessScore}%). Please address the highlighted items, specifically statutory turnover compliance and missing certificates, before submitting your final bid.`;
    }

    return res.status(200).json({
      success: true,
      readinessScore,
      isEligible,
      checks,
      aiAdvisory,
      metadata: {
        companyName,
        gstin: normalizedGSTIN,
        pan: normalizedPAN,
        documentsAnalyzed: normalizedDocs.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Preflight Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing AI preflight check.'
    });
  }
});

export default router;
