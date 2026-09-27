import mongoose from 'mongoose';

const DirectorSchema = new mongoose.Schema({
  din: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pan: {
    type: String,
    uppercase: true,
    trim: true,
  },
}, { _id: false });

const IpHistorySchema = new mongoose.Schema({
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userAgent: {
    type: String,
  },
}, { _id: false });

const BidderSchema = new mongoose.Schema({
  legalBusinessName: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  tradeName: {
    type: String,
    trim: true,
  },
  entityType: {
    type: String,
    enum: ['PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PVT_LTD', 'PUBLIC_LTD', 'TRUST'],
  },
  gstin: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  pan: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  udyamRegistrationNumber: {
    type: String,
    trim: true,
    index: true,
  },
  isDPIITStartup: {
    type: Boolean,
    default: false,
  },
  startupCertificateNumber: {
    type: String,
    trim: true,
  },
  primaryEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  primaryPhone: {
    type: String,
    required: true,
    trim: true,
  },
  registeredAddress: {
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, index: true },
    geoCoordinates: {
      lat: Number,
      lng: Number,
    },
  },
  directors: [DirectorSchema],
  bankAccountDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String },
  },
  ipSubmissionHistory: [IpHistorySchema],
}, {
  timestamps: true,
});

export const Bidder = mongoose.model('Bidder', BidderSchema);
export default Bidder;
