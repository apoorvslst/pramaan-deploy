import mongoose from 'mongoose';

/**
 * Auto-seed helper to ensure officer@praman.test and bidder@praman.test exist
 */
async function autoSeedDefaults() {
  try {
    const { User, Tender } = await import('../models/index.js');
    const officerCount = await User.countDocuments({ email: 'officer@praman.test' });
    if (officerCount === 0) {
      const officer = await User.create({
        name: 'Dr. Rajesh Verma',
        email: 'officer@praman.test',
        password: 'password123',
        role: 'OFFICER',
        department: 'Ministry of Heavy Industries',
        designation: 'Chief Procurement Officer',
        organization: 'Ministry of Heavy Industries',
        isKycVerified: true
      });

      const bidder = await User.create({
        name: 'Vikram Solar Enterprises',
        email: 'bidder@praman.test',
        password: 'password123',
        role: 'BIDDER',
        organization: 'Vikram Solar Green Energy Pvt Ltd',
        panNumber: 'AAACS9981F',
        gstinNumber: '07AAACS9981F1Z2',
        udyamNumber: 'UDYAM-DL-03-0049281',
        isKycVerified: false
      });

      const tenderCount = await Tender.countDocuments();
      if (tenderCount === 0) {
        await Tender.create({
          tenderNumber: 'GEM/2026/B/849201',
          title: 'Supply, Installation & Commissioning of 500kW Solar Grid Inverters & Transformers',
          department: 'NTPC Limited - Renewable Energy Division',
          category: 'Solar & Renewable Power Equipment',
          estimatedValueINR: 42000000,
          status: 'PUBLISHED',
          closingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          createdBy: officer._id
        });
      }
      console.log('\x1b[32m[DB AutoSeed]\x1b[0m Demo accounts and default published tenders seeded.');
    }
  } catch (e) {
    console.warn('[DB AutoSeed Notice]', e.message);
  }
}

/**
 * Connect to MongoDB database
 * Uses MONGO_URI from environment variables or defaults to local MongoDB / Memory fallback
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/praman_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });

    console.log(`\x1b[32m[DB Connected]\x1b[0m MongoDB Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    await autoSeedDefaults();
    return conn;
  } catch (error) {
    console.warn(`\x1b[33m[DB Notice]\x1b[0m Could not connect to local MongoDB at ${uri} (${error.message}).`);
    
    // Try MongoMemoryServer if available
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`\x1b[32m[DB Connected]\x1b[0m In-Memory MongoDB running at: ${memUri}`);
      await autoSeedDefaults();
      return conn;
    } catch (memErr) {
      console.error(`\x1b[31m[DB Connection Error]\x1b[0m ${error.message}`);
      console.error('Make sure MongoDB is running locally (127.0.0.1:27017) or update MONGO_URI in backend/.env');
      return null;
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('\x1b[33m[DB Disconnected]\x1b[0m MongoDB connection lost.');
});
