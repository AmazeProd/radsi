// Sample Celebration Post Creator
// Run this in MongoDB shell or use Postman with your API

// Example 1: 1.1K Members Celebration (like the Telegram screenshot)
const celebration1100 = {
  // Replace with actual user ID from your database
  user: "YOUR_USER_ID_HERE",
  content: "We've reached an amazing milestone! Thank you all for being part of our growing community. Your support means everything! 🎉✨",
  isCelebration: true,
  celebrationData: {
    count: 1100,
    type: "EDUHELPER [COMMUNITY]",
    milestone: "1.1K"
  },
  reactions: [],
  reactionCounts: {
    "❤️": 40,
    "🔥": 16,
    "👏": 4,
    "🎉": 2,
    "💯": 2,
    "😍": 1,
    "🙌": 6,
    "👍": 2
  },
  likes: [],
  likesCount: 0,
  commentsCount: 0,
  images: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Example 2: 5K Members Celebration
const celebration5000 = {
  user: "YOUR_USER_ID_HERE",
  content: "🎊 5,000 AMAZING MEMBERS! 🎊\n\nWhat an incredible journey! Each one of you makes this community special. Here's to many more milestones together!",
  isCelebration: true,
  celebrationData: {
    count: 5000,
    type: "STUDY COMMUNITY",
    milestone: "5K"
  },
  reactions: [],
  reactionCounts: {
    "🔥": 89,
    "❤️": 156,
    "🎉": 45,
    "👏": 32,
    "💯": 28,
    "😍": 21,
    "🙌": 67,
    "👍": 19
  },
  likes: [],
  likesCount: 0,
  commentsCount: 12,
  images: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Example 3: 10K Members Celebration
const celebration10000 = {
  user: "YOUR_USER_ID_HERE",
  content: "🌟 10,000 MEMBERS STRONG! 🌟\n\nWe did it! 10K incredible people in our family. This is just the beginning of something amazing. Thank you for believing in us!",
  isCelebration: true,
  celebrationData: {
    count: 10000,
    type: "LEARNING COMMUNITY",
    milestone: "10K"
  },
  reactions: [],
  reactionCounts: {
    "❤️": 234,
    "🔥": 189,
    "🎉": 156,
    "👏": 98,
    "💯": 87,
    "😍": 76,
    "🙌": 145,
    "👍": 54
  },
  likes: [],
  likesCount: 0,
  commentsCount: 34,
  images: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

// MongoDB Shell Commands
// Copy and paste these into your MongoDB shell

// First, get your user ID
// db.users.findOne({ username: "your_username" })._id

// Then create a celebration post (replace YOUR_USER_ID with actual ObjectId)
/*
db.posts.insertOne({
  user: ObjectId("YOUR_USER_ID_HERE"),
  content: "We've reached an amazing milestone! Thank you all for being part of our growing community. 🎉✨",
  isCelebration: true,
  celebrationData: {
    count: 1100,
    type: "EDUHELPER [COMMUNITY]",
    milestone: "1.1K"
  },
  reactions: [],
  reactionCounts: {
    "❤️": 40,
    "🔥": 16,
    "👏": 4,
    "🎉": 2,
    "💯": 2,
    "😍": 1,
    "🙌": 6,
    "👍": 2
  },
  likes: [],
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  images: [],
  hashtags: [],
  mentions: [],
  isEdited: false,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date()
});
*/

// Postman/API Request Example
/*
POST http://your-api-url/api/posts
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "content": "We've reached an amazing milestone! 🎉",
  "isCelebration": true,
  "celebrationData": {
    "count": 1100,
    "type": "EDUHELPER [COMMUNITY]",
    "milestone": "1.1K"
  }
}
*/

// Express/Node.js Code to Create Celebration Post
/*
const createCelebrationPost = async (userId, count, type) => {
  const post = new Post({
    user: userId,
    content: `🎉 Thank you for being part of our ${count.toLocaleString()} member family! 🎉`,
    isCelebration: true,
    celebrationData: {
      count: count,
      type: type,
      milestone: count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count
    },
    reactions: [],
    reactionCounts: {
      "❤️": 0,
      "🔥": 0,
      "👏": 0,
      "😍": 0,
      "💯": 0,
      "🎉": 0,
      "👍": 0,
      "🙌": 0
    }
  });
  
  await post.save();
  return post;
};

// Usage:
// await createCelebrationPost(userId, 1100, "EDUHELPER [COMMUNITY]");
*/

module.exports = {
  celebration1100,
  celebration5000,
  celebration10000
};
