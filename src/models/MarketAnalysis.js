const mongoose = require('mongoose');

const marketAnalysisSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  industryTrends: [{
    trend: String,
    relevance: Number,
    description: String,
    source: String
  }],
  competitorAnalysis: [{
    name: String,
    strengths: [String],
    weaknesses: [String],
    marketShare: Number,
    keyStrategies: [String],
    socialPresence: {
      platforms: [String],
      engagementRate: Number,
      contentTypes: [String]
    }
  }],
  targetAudienceInsights: [{
    segment: String,
    demographics: {
      ageRange: String,
      gender: String,
      location: String,
      income: String,
      education: String
    },
    psychographics: {
      interests: [String],
      values: [String],
      painPoints: [String],
      behaviors: [String]
    },
    channelPreferences: [String],
    buyingPatterns: String
  }],
  keywordAnalysis: [{
    keyword: String,
    searchVolume: Number,
    competition: Number,
    relevance: Number,
    suggestedUsage: String
  }],
  marketSize: {
    value: Number,
    unit: String,
    growthRate: Number,
    source: String
  },
  swotAnalysis: {
    strengths: [String],
    weaknesses: [String],
    opportunities: [String],
    threats: [String]
  },
  recommendations: [{
    area: String,
    suggestion: String,
    priority: Number,
    expectedImpact: String
  }],
  dataCollectionDate: {
    type: Date,
    default: Date.now
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
marketAnalysisSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MarketAnalysis', marketAnalysisSchema);