const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas.
 * Exits the process if connection fails — no silent failures.
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('YOUR_USER')) {
    console.error('\n❌ MONGO_URI is not configured!');
    console.error('   Open .env and paste your MongoDB Atlas connection string.\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
