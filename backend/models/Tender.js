import mongoose from 'mongoose';

const CertificateRuleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'GST_CERTIFICATE',
      'UDYAM_CERTIFICATE',
      'PAN_CARD',
      'ITR_ACKNOWLEDGEMENT',
      'CA_TURNOVER_CERTIFICATE',
      'EPFO_REGISTRATION',
      'ESIC_REGISTRATION',
      'DEBARMENT_AFFIDAVIT',
      'OEM_AUTHORIZATION',
      'LOCAL_CONTENT_DECLARATION',
    ],
    required: true,
  },
  isMandatory: {
    type: Boolean,
    default: true,
  },
  weightage: {
    type: Number,
    default: 10,
  },
}, { _id: false });

const TenderSchema = new mongoose.Schema({
  tenderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  estimatedValueINR: {
    type: Number,
    required: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  closingDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'EVALUATION', 'AWARDED', 'CANCELLED'],
    default: 'DRAFT',
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Extracted & Configured Eligibility Rules
  rules: {
    minimumTurnoverINR: { type: Number, default: 0 },
    turnoverYearsRequired: { type: Number, default: 3 },
    minimumExperienceYears: { type: Number, default: 0 },
    makeInIndiaPercentage: { type: Number, default: 20 }, // MII local content min %
    allowStartupExemption: { type: Boolean, default: true },
    allowMSMEExemption: { type: Boolean, default: true },
    emdRequired: { type: Boolean, default: true },
    emdAmountINR: { type: Number, default: 0 },
    requiredCertificates: [CertificateRuleSchema],
  },

  auditRootHash: {
    type: String,
    default: null,
  }, // Merkle root of tender setup
}, {
  timestamps: true,
});

export const Tender = mongoose.model('Tender', TenderSchema);
export default Tender;
