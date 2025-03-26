const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  product: {
    type: String,
    required: true,
    trim: true
  },
  brandVoice: {
    type: String,
    required: true
  },
  targetAudience: [{
    demographic: String,
    ageRange: String,
    interests: [String],
    painPoints: [String]
  }],
  uniqueSellingPoints: [String],
  marketChallenges: [String],
  goals: [{
    type: String,
    metric: String,
    target: Number
  }],
  channels: [{
    name: String,
    priority: Number,
    contentTypes: [String]
  }],
  budget: {
    total: Number,
    allocation: [{
      channel: String,
      amount: Number
    }]
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      name: String,
      date: Date,
      description: String,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'delayed'],
        default: 'pending'
      }
    }]
  },
  content: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  marketAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketAnalysis'
  },
  performance: [{
    date: Date,
    metrics: {
      impressions: Number,
      clicks: Number,
      conversions: Number,
      engagement: Number,
      roi: Number
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
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
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);