import mongoose from 'mongoose';

const UploadedDocumentSchema = new mongoose.Schema({
  docType: {
    type: String,
    enum: [
      'GST_CERTIFICATE',
      'UDYAM_CERTIFICATE',
      'PAN_CARD',
      'ITR_V',
      'CA_TURNOVER',
      'EPFO_CHALLAN',
      'ESIC_CHALLAN',
      'OEM_AUTH',
      'DEBARMENT_AFFIDAVIT',
      'MII_DECLARATION',
    ],
    required: true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  storagePath: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileSizeBytes: {
    type: Number,
    required: true,
  },
  sha256Hash: {
    type: String,
    required: true, // Client and server verified fingerprint
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const BidSubmissionSchema = new mongoose.Schema({
  tenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true,
    index: true,
  },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
    required: true,
    index: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  bidReferenceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  uploadedDocuments: [UploadedDocumentSchema],

  status: {
    type: String,
    enum: ['SUBMITTED', 'PROCESSING', 'VERIFIED', 'NEEDS_REVIEW', 'QUALIFIED', 'DISQUALIFIED'],
    default: 'SUBMITTED',
    index: true,
  },

  evaluationResult: {
    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    aiRecommendation: {
      type: String,
      enum: ['QUALIFY', 'DISQUALIFY', 'MANUAL_REVIEW'],
    },
    recommendationSummary: {
      type: String,
    },
    isCollusionFlagged: {
      type: Boolean,
      default: false,
    },
    collusionRiskNotes: {
      type: String,
    },
  },

  officerDecision: {
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    decision: {
      type: String,
      enum: ['QUALIFIED', 'DISQUALIFIED'],
    },
    isOverridden: {
      type: Boolean,
      default: false,
    },
    officerJustification: {
      type: String,
    },
    decidedAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

export const BidSubmission = mongoose.model('BidSubmission', BidSubmissionSchema);
export default BidSubmission;
