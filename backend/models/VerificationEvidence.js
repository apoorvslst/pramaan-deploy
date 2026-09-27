import mongoose from 'mongoose';

const VerificationEvidenceSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BidSubmission',
    required: true,
    index: true,
  },
  tenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true,
    index: true,
  },
  docType: {
    type: String,
    required: true,
  },
  documentHash: {
    type: String,
    required: true,
  },

  // Pane 1 Data: Document Visual Markers (Bounding Boxes & Visual Snippets)
  visualData: {
    pageNumber: {
      type: Number,
      default: 1,
    },
    boundingBox: {
      x: { type: Number },
      y: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    imageSnippetUrl: {
      type: String,
    }, // High-res crop of the region
  },

  // Pane 2 Data: AI Extracted Claims
  extractedClaim: {
    extractedFields: {
      type: Map,
      of: String,
    }, // e.g. { gstin: "07AAAAA0000A1Z5", legalName: "ABC Corp" }
    ocrEngineConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    extractionModel: {
      type: String,
      default: 'PaddleOCR-v4 + LayoutLM',
    },
  },

  // Pane 3 Data: Government Registry Ground-Truth
  portalGroundTruth: {
    portalName: {
      type: String,
      enum: ['GSTN', 'UDYAM', 'INCOME_TAX_NSDL', 'MCA21', 'EPFO', 'GEM_DEBAR'],
    },
    rawApiResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    queryTimestamp: {
      type: Date,
      default: Date.now,
    },
    isLiveQuery: {
      type: Boolean,
      default: true,
    },
    isCached: {
      type: Boolean,
      default: false,
    },
  },

  // Discrepancy & Forensic Analysis
  forensicCheck: {
    hasMetadataTampering: {
      type: Boolean,
      default: false,
    },
    softwareDetected: {
      type: String,
    },
    qrDecodedPayload: {
      type: String,
    },
    qrMatchesClaim: {
      type: Boolean,
      default: true,
    },
    fontInconsistenciesDetected: {
      type: Boolean,
      default: false,
    },
    tamperConfidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
  },

  verificationStatus: {
    type: String,
    enum: ['MATCH', 'MISMATCH', 'PORTAL_UNAVAILABLE', 'TAMPERED', 'UNREADABLE'],
    required: true,
  },
  discrepancyDescription: {
    type: String,
  },
}, {
  timestamps: true,
});

export const VerificationEvidence = mongoose.model('VerificationEvidence', VerificationEvidenceSchema);
export default VerificationEvidence;
