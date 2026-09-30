import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pramaan_db';

async function run() {
  await mongoose.connect(uri);
  const bidders = await mongoose.connection.db.collection('bidders').find({}).toArray();
  console.log('=== BIDDERS (' + bidders.length + ') ===');
  bidders.forEach(b => {
    console.log({
      _id: b._id,
      legalBusinessName: b.legalBusinessName,
      gstin: b.gstin,
      pan: b.pan,
      udyam: b.udyamRegistrationNumber,
      userId: b.userId,
      directors: b.directors,
      address: b.registeredAddress
    });
  });

  const bids = await mongoose.connection.db.collection('bidsubmissions').find({}).toArray();
  console.log('=== BIDS (' + bids.length + ') ===');
  bids.forEach(b => {
    console.log({
      _id: b._id,
      bidRef: b.bidReferenceNumber,
      bidderId: b.bidderId,
      legalName: b.legalBusinessName,
      gstin: b.gstin,
      pan: b.pan,
      udyam: b.udyamRegistrationNumber,
      status: b.status,
      uploadedDocs: b.uploadedDocuments
    });
  });

  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
