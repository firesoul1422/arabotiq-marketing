const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with matching id and token
    const user = await User.findOne({ 
      _id: decoded._id, 
      'tokens.token': token,
      'tokens.expiresAt': { $gt: new Date() }
    });
    
    if (!user) {
      throw new Error('Authentication failed');
    }
    
    // Check if subscription is active
    const hasActiveSubscription = user.hasActiveSubscription();
    
    // Allow access to auth and onboarding routes even with inactive subscription
    const isAuthRoute = req.originalUrl.startsWith('/api/auth/');
    const isOnboardingRoute = req.originalUrl.startsWith('/api/onboarding/');
    
    if (!hasActiveSubscription && !isAuthRoute && !isOnboardingRoute) {
      return res.status(402).json({ 
        message: 'Subscription expired', 
        redirectUrl: '/subscription/request',
        subscriptionStatus: user.subscription.status
      });
    }
    
    // Add user and token to request
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;