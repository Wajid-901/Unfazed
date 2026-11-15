const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const main = async () => {
  if (!process.argv.includes('--confirm-production')) {
    throw new Error('Pass --confirm-production to permanently delete all stored session notes.');
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error('This cleanup can only run when NODE_ENV is production.');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be configured for the production database.');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await mongoose.connection
      .collection('sessionnotes')
      .deleteMany({});

    console.log(`Deleted ${result.deletedCount} stored session note records.`);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

main().catch((error) => {
  console.error('Failed to purge session notes:', error.message);
  process.exitCode = 1;
});
