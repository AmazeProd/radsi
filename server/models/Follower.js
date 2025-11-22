const mongoose = require('mongoose');

const FollowerSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'accepted',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique follow relationships
FollowerSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowerSchema.index({ follower: 1 });
FollowerSchema.index({ following: 1 });

module.exports = mongoose.model('Follower', FollowerSchema);
