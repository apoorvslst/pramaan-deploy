export { User } from './User.js';
export { Tender } from './Tender.js';
export { Bidder } from './Bidder.js';
export { BidSubmission } from './BidSubmission.js';
export { VerificationEvidence } from './VerificationEvidence.js';
export { AuditLedger } from './AuditLedger.js';

export default {
  User: (await import('./User.js')).User,
  Tender: (await import('./Tender.js')).Tender,
  Bidder: (await import('./Bidder.js')).Bidder,
  BidSubmission: (await import('./BidSubmission.js')).BidSubmission,
  VerificationEvidence: (await import('./VerificationEvidence.js')).VerificationEvidence,
  AuditLedger: (await import('./AuditLedger.js')).AuditLedger,
};
