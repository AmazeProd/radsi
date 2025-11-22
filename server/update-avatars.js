require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateAvatars = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Update all users with old avatar URL
    const users = await User.find({
      profilePicture: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
    });

    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      const displayName = user.firstName || user.username;
      user.profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=200`;
      await user.save();
      console.log(`Updated avatar for ${user.username}`);
    }

    console.log('All avatars updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateAvatars();
