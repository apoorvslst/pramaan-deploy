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
 * @desc    Parse eligibility rules from a tender NIT/RFP PDF
 * @route   POST /api/ai/tender/parse-nit
 * @access  Private (OFFICER, ADMIN)
 */
router.post('/tender/parse-nit', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tender NIT PDF is required.' });
    }

    const result = await aiClient.parseTenderRules(req.file.path);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
