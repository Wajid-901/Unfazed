const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '\n=================================================================\n' +
        '[CRITICAL ACTION REQUIRED] MONGO_URI is not set in Render!\n' +
        'Your service is currently trying to connect to localhost:27017 which does not exist on Render.\n' +
        'Go to Render Dashboard > Environment > Add Environment Variable:\n' +
        'MONGO_URI = mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/unfazed?retryWrites=true&w=majority\n' +
        '=================================================================\n'
      );
    }
  }

  try {
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/unfazed', {
      serverSelectionTimeoutMS: 5000 // Fail after 5 seconds instead of 30s
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error('[MongoDB] The API is running, but database queries will fail until a valid MONGO_URI is provided in Render Environment.');
  }
};

module.exports = connectDB;
