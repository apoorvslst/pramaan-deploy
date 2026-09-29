/**
 * PRAMAN Backend Engine — AI Microservice Bridge Client
 *
 * Connects the Express.js Backend (:5000) to the Python FastAPI AI Microservice (:8000).
 * Features:
 *   - Auto health-detection & circuit fallback
 *   - Unified Document Verification (Forensics + QR + OCR + Signatures)
 *   - Tender NIT Rule Extraction
 *   - NetworkX Cartel / Collusion Graph Detection
 *   - Local RAG Officer Assistant Q&A
 *   - Signature Detection & Cross-Bid Collusion Verification
 */

import fs from 'fs';
import path from 'path';

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AIClient {
  constructor(baseUrl = AI_BASE_URL) {
    this.baseUrl = baseUrl;
    this.timeoutMs = 15000;
  }

  /**
   * Check if the AI Microservice is alive and reachable
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Run full verification pipeline on a document PDF
   * (Forensics + QR + OCR + Signature Detection)
   */
  async verifyDocument(filePath, claimedType = null, claimedId = '') {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found for verification: ${filePath}`);
    }

    const formData = new FormData();
    const fileBlob = await fs.openAsBlob(filePath);
    const fileName = path.basename(filePath).toLowerCase().endsWith('.pdf') ? path.basename(filePath) : `${path.basename(filePath)}.pdf`;
    formData.append('file', fileBlob, fileName);

    if (claimedType) {
      formData.append('claimedType', claimedType);
    }
    if (claimedId) {
      formData.append('claimedId', claimedId);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/pipeline/verify-document`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI microservice verification returned HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Parse eligibility rules from a tender NIT/RFP PDF
   */
  async parseTenderRules(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found for parsing: ${filePath}`);
    }

    const formData = new FormData();
    const fileBlob = await fs.openAsBlob(filePath);
    const fileName = path.basename(filePath).toLowerCase().endsWith('.pdf') ? path.basename(filePath) : `${path.basename(filePath)}.pdf`;
    formData.append('file', fileBlob, fileName);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000); // 30s for large tender documents

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/tender/parse-rules`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI tender parser returned HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Detect cartels using NetworkX multi-entity relationship graph
   */
  async detectCartel(bidders, tenderId = null) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cartel/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidders, tenderId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI cartel detector returned HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Query the Grounded RAG Procurement Officer Assistant
   */
  async queryAssistant(question, tenderId = null, conversationHistory = []) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, tenderId, conversationHistory }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI assistant query returned HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Index bidder documents into ChromaDB for the assistant
   */
  async indexBidDocuments(tenderId, bidderId, bidderName, documents) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/assistant/index-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenderId, bidderId, bidderName, documents }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI bid indexing returned HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Extract signatures, visual crops, and embeddings from a PDF
   */
  async extractSignatures(filePath, maxPages = 5) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found for signature extraction: ${filePath}`);
    }

    const formData = new FormData();
    const fileBlob = await fs.openAsBlob(filePath);
    formData.append('file', fileBlob, path.basename(filePath));
    formData.append('maxPages', String(maxPages));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/signature/extract-and-embed`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI signature extraction returned HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Verify cross-bidder signatures to detect shared signers / cartel collusion
   */
  async verifyCrossBidSignatures(tenderId, similarityThreshold = 0.82) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/signature/verify-cross-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenderId, similarityThreshold }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI cross-bid signature check returned HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }
}

export const aiClient = new AIClient();
export default aiClient;
