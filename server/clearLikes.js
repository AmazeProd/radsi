require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');

const clearAllLikes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Post.updateMany(
      {},
      { $set: { likes: [], likesCount: 0 } }
    );

    console.log(`Cleared likes from ${result.modifiedCount} posts`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearAllLikes();
