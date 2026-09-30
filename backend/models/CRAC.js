import mongoose from 'mongoose';

const EvidencePhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  storagePath: {
    type: String,
  },
  originalFileName: {
    type: String,
    default: 'inspection_evidence.jpg',
  },
  caption: {
    type: String,
    default: 'Site Inspection Evidence',
  },
  mimeType: {
    type: String,
    default: 'image/jpeg',
  },
  fileSizeBytes: {
    type: Number,
    default: 0,
  },
  sha256Hash: {
    type: String,
    default: '',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const CRACSchema = new mongoose.Schema({
  tenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true,
    index: true,
  },
  bidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BidSubmission',
    required: true,
    index: true,
  },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
    required: true,
    index: true,
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cracNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['ACCEPTED', 'REJECTED', 'PARTIALLY_ACCEPTED'],
    default: 'ACCEPTED',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
    required: true,
  },
  reviewTitle: {
    type: String,
    required: true,
  },
  reviewComments: {
    type: String,
    required: true,
  },
  goodsDelivered: {
    type: String,
    default: 'Supply, Installation & Commissioning of 500kW Solar Grid Inverters & Transformers',
  },
  quantityOrdered: {
    type: Number,
    default: 1,
  },
  quantityReceived: {
    type: Number,
    default: 1,
  },
  quantityAccepted: {
    type: Number,
    default: 1,
  },
  quantityRejected: {
    type: Number,
    default: 0,
  },
  inspectionDate: {
    type: Date,
    default: Date.now,
  },
  consigneeName: {
    type: String,
    default: 'Dr. Sanjeev Verma, IAS',
  },
  consigneeDesignation: {
    type: String,
    default: 'Superintending Engineer & Consignee Officer',
  },
  consigneeLocation: {
    type: String,
    default: 'Central Receiving Depot, NTPC Rajasthan Project Site',
  },
  paymentRecommendation: {
    type: String,
    enum: ['RELEASE_100_PERCENT', 'WITHHOLD_PAYMENT', 'DEDUCT_PENALTY'],
    default: 'RELEASE_100_PERCENT',
  },
  penaltyAmountINR: {
    type: Number,
    default: 0,
  },
  evidencePhotos: [EvidencePhotoSchema],
  auditBlock: {
    blockIndex: { type: Number },
    currentHash: { type: String },
  },
}, {
  timestamps: true,
});

export const CRAC = mongoose.model('CRAC', CRACSchema);
export default CRAC;
