const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production requires MONGO_URI to point to a remote MongoDB deployment.');
    }
  }

  try {
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/unfazed', {
      serverSelectionTimeoutMS: 5000 // Fail after 5 seconds instead of 30s
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
