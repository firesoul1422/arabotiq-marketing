const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'snapchat', 'pinterest', 'tiktok-arabia', 'linkedin-mena', 'other'],
    required: true
  },
  region: {
    type: String,
    enum: ['global', 'mena', 'gulf', 'levant', 'north-africa', 'other'],
    default: 'mena'
  },
  accountName: {
    type: String,
    required: true
  },
  accountUrl: String,
  followers: Number,
  engagement: {
    likes: Number,
    comments: Number,
    shares: Number,
    averageEngagementRate: Number
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  insights: {
    audienceDemographics: {
      ageRanges: [{
        range: String,
        percentage: Number
      }],
      genderDistribution: [{
        gender: String,
        percentage: Number
      }],
      topLocations: [{
        location: String,
        percentage: Number
      }]
    },
    bestPerformingContent: [{
      contentType: String,
      engagementRate: Number,
      timeOfDay: String,
      dayOfWeek: String
    }],
    growthRate: Number
  },
  scheduledContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
socialMediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SocialMedia', socialMediaSchema);