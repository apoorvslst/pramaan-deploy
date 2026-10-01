import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { BidSubmission, Bidder } from '../models/index.js';
import { ensureBidderCertificates } from '../services/bidderDocumentGenerator.js';

dotenv.config({ path: path.resolve('backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/praman_db';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  const bidders = await Bidder.find();
  console.log(`Found ${bidders.length} bidders.`);

  for (const bidder of bidders) {
    if (bidder.tradeName === 'OM Hotels' || !bidder.tradeName) {
      bidder.tradeName = bidder.legalBusinessName;
      await bidder.save();
    }
    console.log(`\nGenerating & verifying certificates for ${bidder.legalBusinessName || bidder._id}...`);
    const certs = await ensureBidderCertificates(bidder, true);

    const bids = await BidSubmission.find({ bidderId: bidder._id });
    console.log(`Updating ${bids.length} bids for bidder ${bidder.legalBusinessName}...`);

    for (const bid of bids) {
      const updatedDocs = [];
      const standardTypes = ['UDYAM_CERTIFICATE', 'GST_CERTIFICATE', 'PAN_CARD', 'CA_TURNOVER_CERTIFICATE', 'DEBARMENT_AFFIDAVIT'];

      for (const docType of standardTypes) {
        const cert = certs[docType];
        if (cert) {
          updatedDocs.push(cert);
        }
      }

      bid.uploadedDocuments = updatedDocs;
      await bid.save();
      console.log(`  Updated bid ${bid.bidReferenceNumber} with ${updatedDocs.length} dedicated certificates.`);
    }
  }

  console.log('\nAll bidder documents successfully synchronized!');
  process.exit(0);
}

run().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
