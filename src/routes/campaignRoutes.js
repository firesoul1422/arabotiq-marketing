const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all campaigns
router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('socialMediaAccounts');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific campaign
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user._id })
      .populate('socialMediaAccounts')
      .populate('content');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new campaign
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, startDate, endDate, goals, targetAudience } = req.body;

    if (!name || !description || !startDate || !endDate) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const campaign = new Campaign({
      user: req.user._id,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      goals: goals || [],
      targetAudience: targetAudience || {},
      status: 'active'
    });

    const newCampaign = await campaign.save();
    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a campaign
router.patch('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'startDate', 'endDate', 'goals', 'targetAudience', 'status'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    updates.forEach(update => {
      campaign[update] = req.body[update];
    });

    await campaign.save();
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;