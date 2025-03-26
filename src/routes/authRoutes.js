const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      company: req.body.company || {},
      language: req.body.language || 'ar',
      preferences: {
        rtlLayout: req.body.preferences?.rtlLayout !== false, // Default to true
        emailNotifications: req.body.preferences?.emailNotifications !== false, // Default to true
        dialect: req.body.preferences?.dialect || 'msa'
      },
      products: req.body.products || [],
      socialMediaCredentials: req.body.socialMediaCredentials || []
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
        // Merge preferences instead of replacing
        req.user.preferences = { ...req.user.preferences, ...req.body.preferences };
      } else if (update === 'company') {
        // Merge company info instead of replacing
        req.user.company = { ...req.user.company, ...req.body.company };
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

// Update subscription
router.patch('/subscription', auth, async (req, res) => {
  try {
    const { tier, status, endDate, paymentInfo } = req.body;
    
    if (tier) {
      req.user.subscription.tier = tier;
    }
    
    if (status) {
      req.user.subscription.status = status;
    }
    
    if (endDate) {
      req.user.subscription.endDate = new Date(endDate);
    }
    
    if (paymentInfo) {
      req.user.subscription.paymentInfo = {
        ...req.user.subscription.paymentInfo,
        ...paymentInfo
      };
    }
    
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