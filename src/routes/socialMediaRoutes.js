const express = require('express');
const router = express.Router();
const SocialMedia = require('../models/SocialMedia');
const Campaign = require('../models/Campaign');
const Content = require('../models/Content');
const auth = require('../middleware/auth');

// Get all social media accounts
router.get('/', auth, async (req, res) => {
  try {
    const socialMediaAccounts = await SocialMedia.find().sort({ createdAt: -1 });
    res.json(socialMediaAccounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific social media account
router.get('/:id', auth, async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id)
      .populate('campaign')
      .populate('posts')
      .populate('scheduledContent');
    
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media account not found' });
    }
    
    res.json(socialMedia);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get social media accounts for a specific campaign
router.get('/campaign/:campaignId', auth, async (req, res) => {
  try {
    const socialMediaAccounts = await SocialMedia.find({ campaign: req.params.campaignId })
      .populate('posts')
      .populate('scheduledContent');
    
    res.json(socialMediaAccounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new social media account
router.post('/', auth, async (req, res) => {
  try {
    // Check if campaign exists
    const campaign = await Campaign.findById(req.body.campaign);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    const socialMedia = new SocialMedia({
      campaign: req.body.campaign,
      platform: req.body.platform,
      accountName: req.body.accountName,
      accountUrl: req.body.accountUrl,
      followers: req.body.followers || 0,
      engagement: req.body.engagement || {
        likes: 0,
        comments: 0,
        shares: 0,
        averageEngagementRate: 0
      },
      insights: req.body.insights || {
        audienceDemographics: {
          ageRanges: [],
          genderDistribution: [],
          topLocations: []
        },
        bestPerformingContent: [],
        growthRate: 0
      }
    });
    
    const newSocialMedia = await socialMedia.save();
    res.status(201).json(newSocialMedia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a social media account
router.patch('/:id', auth, async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);
    
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media account not found' });
    }
    
    // Update only the fields that are provided in the request
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'campaign' && key !== 'createdAt') {
        socialMedia[key] = req.body[key];
      }
    });
    
    const updatedSocialMedia = await socialMedia.save();
    res.json(updatedSocialMedia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a social media account
router.delete('/:id', async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);
    
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media account not found' });
    }
    
    await socialMedia.remove();
    res.json({ message: 'Social media account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Schedule content for posting
router.post('/:id/schedule', async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);
    
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media account not found' });
    }
    
    const contentId = req.body.contentId;
    const scheduledDate = req.body.scheduledDate;
    
    if (!contentId || !schedule