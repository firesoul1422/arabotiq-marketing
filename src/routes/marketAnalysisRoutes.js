const express = require('express');
const router = express.Router();
const MarketAnalysis = require('../models/MarketAnalysis');
const Campaign = require('../models/Campaign');
const axios = require('axios');
const auth = require('../middleware/auth');

// Get all market analyses
router.get('/', auth, async (req, res) => {
  try {
    const marketAnalyses = await MarketAnalysis.find().sort({ createdAt: -1 });
    res.json(marketAnalyses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific market analysis
router.get('/:id', auth, async (req, res) => {
  try {
    const marketAnalysis = await MarketAnalysis.findById(req.params.id)
      .populate('campaign');
    
    if (!marketAnalysis) {
      return res.status(404).json({ message: 'Market analysis not found' });
    }
    
    res.json(marketAnalysis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get market analysis for a specific campaign
router.get('/campaign/:campaignId', auth, async (req, res) => {
  try {
    const marketAnalysis = await MarketAnalysis.findOne({ campaign: req.params.campaignId });
    
    if (!marketAnalysis) {
      return res.status(404).json({ message: 'Market analysis not found for this campaign' });
    }
    
    res.json(marketAnalysis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new market analysis
router.post('/', auth, async (req, res) => {
  try {
    // Check if campaign exists
    const campaign = await Campaign.findById(req.body.campaign);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Check if market analysis already exists for this campaign
    const existingAnalysis = await MarketAnalysis.findOne({ campaign: req.body.campaign });
    if (existingAnalysis) {
      return res.status(400).json({ message: 'Market analysis already exists for this campaign' });
    }
    
    const marketAnalysis = new MarketAnalysis({
      campaign: req.body.campaign,
      industryTrends: req.body.industryTrends || [],
      competitorAnalysis: req.body.competitorAnalysis || [],
      targetAudienceInsights: req.body.targetAudienceInsights || [],
      keywordAnalysis: req.body.keywordAnalysis || [],
      marketSize: req.body.marketSize || {
        value: 0,
        unit: 'USD',
        growthRate: 0,
        source: ''
      },
      swotAnalysis: req.body.swotAnalysis || {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      },
      recommendations: req.body.recommendations || []
    });
    
    const newMarketAnalysis = await marketAnalysis.save();
    
    // Update campaign with market analysis reference
    campaign.marketAnalysis = newMarketAnalysis._id;
    await campaign.save();
    
    res.status(201).json(newMarketAnalysis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a market analysis
router.patch('/:id', auth, async (req, res) => {
  try {
    const marketAnalysis = await MarketAnalysis.findById(req.params.id);
    
    if (!marketAnalysis) {
      return res.status(404).json({ message: 'Market analysis not found' });
    }
    
    // Update only the fields that are provided in the request
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'campaign' && key !== 'createdAt') {
        marketAnalysis[key] = req.body[key];
      }
    });
    
    const updatedMarketAnalysis = await marketAnalysis.save();
    res.json(updatedMarketAnalysis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Generate AI-powered market analysis
router.post('/generate/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Find existing market analysis or create a new one
    let marketAnalysis = await MarketAnalysis.findOne({ campaign: campaign._id });
    
    if (!marketAnalysis) {
      marketAnalysis = new MarketAnalysis({
        campaign: campaign._id,
        industryTrends: [],
        competitorAnalysis: [],
        targetAudienceInsights: [],
        keywordAnalysis: [],
        marketSize: {
          value: 0,
          unit: 'USD',
          growthRate: 0,
          source: ''
        },
        swotAnalysis: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        },
        recommendations: []
      });
    }
    
    // This is where you would integrate with OpenAI or another AI service
    // to generate market analysis based on campaign data and external sources
    // For now, we'll generate placeholder data
    
    // Generate industry trends
    marketAnalysis.industryTrends = [
      {
        trend: 'Increased focus on sustainability',
        relevance: 8.5,
        description: 'Consumers are increasingly valuing sustainable and eco-friendly products',
        source: 'Industry Report 2023'
      },
      {
        trend: 'Growth in mobile shopping',
        relevance: 9.2,
        description: 'Mobile commerce continues to grow, with more consumers shopping via smartphones',
        source: 'E-commerce Statistics 2023'
      },
      {
        trend: 'Video content dominance',
        relevance: 8.8,
        description: 'Video content is becoming the preferred medium for product discovery and engagement',
        source: 'Social Media Trends Report'
      }
    ];
    
    // Generate competitor analysis
    marketAnalysis.competitorAnalysis = [
      {
        name: 'Competitor A',
        strengths: ['Strong brand recognition', 'Wide product range', 'Effective social media presence'],
        weaknesses: ['Higher pricing', 'Limited customer service', 'Slow innovation cycle'],
        marketShare: 28.5,
        keyStrategies: ['Premium positioning', 'Influencer marketing', 'Loyalty program'],
        socialPresence: {
          platforms: ['Instagram', 'Facebook', 'TikTok'],
          engagementRate: 3.2,
          contentTypes: ['Product showcases', 'User testimonials', 'Lifestyle content']
        }
      },
      {
        name: 'Competitor B',
        strengths: ['Competitive pricing', 'Fast shipping', 'Strong customer service'],
        weaknesses: ['Limited product range', 'Lower brand recognition', 'Inconsistent marketing'],
        marketShare: 15.3,
        keyStrategies: ['Value pricing', 'Customer service focus', 'Email marketing'],
        socialPresence: {
          platforms: ['Facebook', 'Twitter', 'LinkedIn'],
          engagementRate: 2.1,
          contentTypes: ['Promotions', 'Product information', 'Customer reviews']
        }
      }
    ];
    
    // Generate target audience insights
    marketAnalysis.targetAudienceInsights = [
      {
        segment: 'Young Professionals',
        demographics: {
          ageRange: '25-34',
          gender: 'Mixed',
          location: 'Urban areas',
          income: 'Middle to upper-middle',
          education: 'College degree or higher'
        },
        psychographics: {
          interests: ['Technology', 'Fitness', 'Travel', 'Sustainability'],
          values: ['Quality', 'Convenience', 'Social responsibility'],
          painPoints: ['Time constraints', 'Value for money', 'Authenticity concerns'],
          behaviors: ['Mobile-first', 'Research before purchase', 'Brand loyal if satisfied']
        },
        channelPreferences: ['Instagram', 'YouTube', 'Email', 'Podcasts'],
        buyingPatterns: 'Frequent small purchases, occasional large investments'
      },
      {
        segment: 'Parents',
        demographics: {
          ageRange: '30-45',
          gender: 'Mixed',
          location: 'Suburban areas',
          income: 'Middle income',
          education: 'Varied'
        },
        psychographics: {
          interests: ['Family activities', 'Education', 'Home improvement', 'Health'],
          values: ['Safety', 'Reliability', 'Value', 'Convenience'],
          painPoints: ['Time management', 'Budget constraints', 'Product safety'],
          behaviors: ['Research-heavy', 'Recommendation-driven', 'Loyalty program participants']
        },
        channelPreferences: ['Facebook', 'Email', 'Pinterest', 'Search engines'],
        buyingPatterns: