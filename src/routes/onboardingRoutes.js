const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get onboarding status
router.get('/status', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Check which onboarding steps are complete
    const businessInfoComplete = !!user.company.description;
    const productsComplete = user.products.length > 0;
    const socialMediaComplete = user.socialMediaCredentials.length > 0;
    const analyticsComplete = !!user.analyticsCredentials?.googleAnalytics?.id;
    
    // Calculate overall completion status
    const isOnboardingComplete = businessInfoComplete && productsComplete && socialMediaComplete && analyticsComplete;
    
    res.json({
      businessInfoComplete,
      productsComplete,
      socialMediaComplete,
      analyticsComplete,
      isOnboardingComplete,
      nextStep: !businessInfoComplete ? 'business-info' : 
               !productsComplete ? 'products' : 
               !socialMediaComplete ? 'social-media' : 
               !analyticsComplete ? 'analytics' : 'complete'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update business information
router.post('/business-info', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Update company information
    user.company = {
      ...user.company,
      ...req.body
    };
    
    await user.save();
    
    // Check if onboarding is complete
    const isOnboardingComplete = user.company.description && 
                               user.products.length > 0 && 
                               user.socialMediaCredentials.length > 0;
    
    res.json({ 
      success: true, 
      user, 
      isOnboardingComplete,
      nextStep: user.products.length > 0 ? 'social-media' : 'products'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add product
router.post('/products', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Add new product
    user.products.push(req.body);
    
    await user.save();
    
    // Check if onboarding is complete
    const isOnboardingComplete = user.company.description && 
                               user.products.length > 0 && 
                               user.socialMediaCredentials.length > 0;
    
    res.json({ 
      success: true, 
      user, 
      isOnboardingComplete,
      nextStep: user.socialMediaCredentials.length > 0 ? 'complete' : 'social-media'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.patch('/products/:index', auth, async (req, res) => {
  try {
    const user = req.user;
    const index = parseInt(req.params.index);
    
    if (index < 0 || index >= user.products.length) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product
    user.products[index] = {
      ...user.products[index],
      ...req.body
    };
    
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete('/products/:index', auth, async (req, res) => {
  try {
    const user = req.user;
    const index = parseInt(req.params.index);
    
    if (index < 0 || index >= user.products.length) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Remove product
    user.products.splice(index, 1);
    
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add social media credential
router.post('/social-media', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Add new social media credential
    user.socialMediaCredentials.push(req.body);
    
    await user.save();
    
    // Check if onboarding is complete
    const isOnboardingComplete = user.company.description && 
                               user.products.length > 0 && 
                               user.socialMediaCredentials.length > 0;
    
    res.json({ 
      success: true, 
      user, 
      isOnboardingComplete,
      nextStep: isOnboardingComplete ? 'complete' : 'products'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update social media credential
router.patch('/social-media/:index', auth, async (req, res) => {
  try {
    const user = req.user;
    const index = parseInt(req.params.index);
    
    if (index < 0 || index >= user.socialMediaCredentials.length) {
      return res.status(404).json({ message: 'Social media credential not found' });
    }
    
    // Update social media credential
    user.socialMediaCredentials[index] = {
      ...user.socialMediaCredentials[index],
      ...req.body
    };
    
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add or update Google Analytics credentials
router.post('/analytics', auth, async (req, res) => {
  try {
    const user = req.user;
    const { googleAnalyticsId } = req.body;
    
    // Update Google Analytics credentials
    user.analyticsCredentials = {
      googleAnalytics: {
        id: googleAnalyticsId,
        active: true,
        lastVerified: new Date()
      }
    };
    
    await user.save();
    
    // Check if onboarding is complete
    const isOnboardingComplete = user.company.description && 
                               user.products.length > 0 && 
                               user.socialMediaCredentials.length > 0 &&
                               user.analyticsCredentials?.googleAnalytics?.id;
    
    res.json({ 
      success: true, 
      user, 
      isOnboardingComplete,
      nextStep: isOnboardingComplete ? 'complete' : 'social-media'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete social media credential
router.delete('/social-media/:index', auth, async (req, res) => {
  try {
    const user = req.user;
    const index = parseInt(req.params.index);
    
    if (index < 0 || index >= user.socialMediaCredentials.length) {
      return res.status(404).json({ message: 'Social media credential not found' });
    }
    
    // Remove social media credential
    user.socialMediaCredentials.splice(index, 1);
    
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Complete onboarding
router.post('/complete', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if all required information is provided
    if (!user.company.description) {
      return res.status(400).json({ 
        message: 'Business information is incomplete', 
        nextStep: 'business-info' 
      });
    }
    
    if (user.products.length === 0) {
      return res.status(400).json({ 
        message: 'No products added', 
        nextStep: 'products' 
      });
    }
    
    if (user.socialMediaCredentials.length === 0) {
      return res.status(400).json({ 
        message: 'No social media credentials added', 
        nextStep: 'social-media' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      redirectUrl: '/dashboard'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;