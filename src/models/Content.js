const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  type: {
    type: String,
    enum: ['social-post', 'email', 'ad-copy', 'blog-post', 'press-release', 'video-script', 'infographic'],
    required: true
  },
  channel: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'email', 'website', 'youtube', 'tiktok', 'snapchat', 'tiktok-arabia', 'linkedin-mena', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  arabicBody: {
    type: String,
    required: function() {
      return this.language === 'ar';
    }
  },
  language: {
    type: String,
    enum: ['ar', 'en', 'both'],
    default: 'ar'
  },
  dialect: {
    type: String,
    enum: ['msa', 'gulf', 'levantine', 'egyptian'],
    default: 'msa'
  },
  direction: {
    type: String,
    enum: ['rtl', 'ltr'],
    default: function() {
      return this.language === 'ar' || this.language === 'both' ? 'rtl' : 'ltr';
    }
  },
  callToAction: String,
  hashtags: [String],
  imagePrompt: String,
  imageUrl: String,
  scheduledDate: Date,
  publishedDate: Date,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  performance: {
    impressions: Number,
    clicks: Number,
    engagement: Number,
    conversions: Number
  },
  aiGenerated: {
    type: Boolean,
    default: true
  },
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
contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Content', contentSchema);