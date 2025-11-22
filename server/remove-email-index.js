require('dotenv').config();
const mongoose = require('mongoose');

const removeEmailIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Drop the email unique index
    try {
      await collection.dropIndex('email_1');
      console.log('✓ Email unique index removed successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('Email index does not exist');
      } else {
        throw error;
      }
    }

    console.log('\nRemaining indexes:');
    const remainingIndexes = await collection.indexes();
    console.log(remainingIndexes);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

removeEmailIndex();
