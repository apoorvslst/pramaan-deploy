import mongoose from 'mongoose';

const AuditLedgerSchema = new mongoose.Schema({
  blockIndex: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  previousHash: {
    type: String,
    required: true, 
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  actionType: {
    type: String,
    enum: [
      'TENDER_CREATED',
      'TENDER_PUBLISHED',
      'TENDER_RULES_UPDATED',
      'BID_SUBMITTED',
      'FORENSIC_FLAG_RAISED',
      'OCR_EXTRACTION_COMPLETED',
      'PORTAL_VERIFIED',
      'SCORE_CALCULATED',
      'COLLUSION_DETECTED',
      'COLLUSION_ANALYSIS_RUN',
      'ANOMALY_SCAN_RUN',
      'OFFICER_OVERRIDE',
      'FINAL_AWARD_DECISION',
      'FINAL_CONTRACT_AWARDED',
      'BID_AWARDED',
      'CRAC_GENERATED',
      'CRAC_ISSUED',
      'CHAOS_SEED_COMPLETE',
      'CHAOS_INJECTION',
      'SYSTEM_ALERT',
    ],
    required: true,
    index: true,
  },
  actor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['BIDDER', 'OFFICER', 'SYSTEM_AI', 'AUDITOR'],
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  entityId: {
    type: String,
    required: true,
    index: true, // Tender ID or BidSubmission ID
  },
  payloadData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  payloadHash: {
    type: String,
    required: true,
  },
  currentHash: {
    type: String,
    required: true,
    unique: true, // SHA-256 of index + prevHash + time + action + payloadHash
  },
}, {
  // Ledger blocks are immutable append-only, so we disable automatic update timestamps
  timestamps: false,
});

export const AuditLedger = mongoose.model('AuditLedger', AuditLedgerSchema);
export default AuditLedger;
