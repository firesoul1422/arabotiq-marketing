const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user with validated data
    const user = new User({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      company: {
        name: req.body.company?.name || '',
        size: req.body.company?.size || '',
        industry: req.body.company?.industry || '',
        location: req.body.company?.location || '',
        description: req.body.company?.description || ''
      },
      language: req.body.language || 'ar',
      preferences: {
        rtlLayout: req.body.preferences?.rtlLayout !== false,
        emailNotifications: req.body.preferences?.emailNotifications !== false,
        dialect: req.body.preferences?.dialect || 'msa'
      },
      products: Array.isArray(req.body.products) ? req.body.products : [],
      socialMediaCredentials: Array.isArray(req.body.socialMediaCredentials) ? req.body.socialMediaCredentials : []
    });
    
    await user.save();
    
    // Generate auth token
    const token = await user.generateAuthToken();
    
    // Check if onboarding is complete
    const isOnboardingComplete = user.company.description && 
                               user.products.length > 0 && 
                               user.socialMediaCredentials.length > 0;
    
    res.status(201).json({ 
      user, 
      token, 
      isOnboardingComplete,
      redirectUrl: isOnboardingComplete ? '/dashboard' : '/onboarding'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    
    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ message: 'Invalid login credentials' });
  }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(tokenObj => tokenObj.token !== req.token);
    await req.user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout from all devices
router.post('/logout-all', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    
    res.json({ message: 'Logged out from all devices' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password', 'company', 'language', 'preferences', 'products', 'socialMediaCredentials'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }
  
  try {
    updates.forEach(update => {
      if (update === 'preferences') {
        // Validate and merge preferences
        const newPreferences = req.body.preferences || {};
        req.user.preferences = {
          rtlLayout: newPreferences.rtlLayout !== undefined ? newPreferences.rtlLayout : req.user.preferences.rtlLayout,
          emailNotifications: newPreferences.emailNotifications !== undefined ? newPreferences.emailNotifications : req.user.preferences.emailNotifications,
          dialect: newPreferences.dialect || req.user.preferences.dialect
        };
      } else if (update === 'company') {
        // Validate and merge company info
        const newCompany = req.body.company || {};
        req.user.company = {
          name: newCompany.name || req.user.company.name || '',
          size: newCompany.size || req.user.company.size || '',
          industry: newCompany.industry || req.user.company.industry || '',
          location: newCompany.location || req.user.company.location || '',
          description: newCompany.description || req.user.company.description || ''
        };
      } else if (update === 'password') {
        req.user.password = req.body.password;
      } else {
        req.user[update] = req.body[update];
      }
    });
    
    await req.user.save();
    
    // Check if onboarding is complete after profile update
    const isOnboardingComplete = req.user.company.description && 
                               req.user.products.length > 0 && 
                               req.user.socialMediaCredentials.length > 0;
    
    res.json({
      user: req.user,
      isOnboardingComplete
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Request subscription
router.post('/subscription/request', auth, async (req, res) => {
  try {
    const { tier, contactInfo } = req.body;
    
    // Generate a unique access URL
    const accessUrl = crypto.randomBytes(32).toString('hex');
    const accessUrlExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    req.user.subscription = {
      tier,
      status: 'pending',
      startDate: new Date(),
      accessUrl,
      accessUrlExpiry,
      contactInfo
    };
    
    await req.user.save();
    
    res.json({
      message: 'Subscription request submitted successfully',
      accessUrl
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Owner: Approve subscription
router.patch('/subscription/approve/:userId', auth, async (req, res) => {
  try {
    if (!req.user.isOwner) {
      return res.status(403).json({ message: 'Only owner can approve subscriptions' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { endDate } = req.body;
    
    user.subscription.status = 'active';
    user.subscription.endDate = new Date(endDate);
    user.subscription.approvedBy = req.user._id;
    user.subscription.approvalDate = new Date();
    
    await user.save();
    
    res.json({ message: 'Subscription approved successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Owner: Reject subscription
router.patch('/subscription/reject/:userId', auth, async (req, res) => {
  try {
    if (!req.user.isOwner) {
      return res.status(403).json({ message: 'Only owner can reject subscriptions' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.subscription.status = 'rejected';
    await user.save();
    
    res.json({ message: 'Subscription rejected successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update subscription
router.patch('/subscription/update', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['tier', 'status', 'endDate'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid subscription updates' });
    }
    
    updates.forEach(update => {
      req.user.subscription[update] = req.body[update];
    });
    
    await req.user.save();
    
    // If subscription is updated, regenerate token with new expiration
    const token = await req.user.generateAuthToken();
    
    res.json({ user: req.user, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Check token validity and subscription status
router.get('/validate-token', auth, async (req, res) => {
  try {
    const hasActiveSubscription = req.user.hasActiveSubscription();
    
    res.json({
      valid: true,
      user: req.user,
      subscriptionActive: hasActiveSubscription
    });
  } catch (err) {
    res.status(401).json({ valid: false, message: err.message });
  }
});

module.exports = router;