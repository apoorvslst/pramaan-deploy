import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Uses MONGO_URI from environment variables or defaults to local MongoDB
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/praman_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`\x1b[32m[DB Connected]\x1b[0m MongoDB Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`\x1b[31m[DB Connection Error]\x1b[0m ${error.message}`);
    console.error('Make sure MongoDB is running locally (127.0.0.1:27017) or update MONGO_URI in backend/.env');
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('\x1b[33m[DB Disconnected]\x1b[0m MongoDB connection lost.');
});
