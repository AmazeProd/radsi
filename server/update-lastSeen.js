const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateLastSeen = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const result = await User.updateMany(
      {},
      { 
        $set: { 
          isOnline: false, 
          lastSeen: new Date() 
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} users with lastSeen field`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateLastSeen();
