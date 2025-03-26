const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.TEST_PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Mock user database
let users = [];
let products = [];
let socialMediaCredentials = [];

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, language } = req.body;
  
  // Check if user exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: true, message: 'User already exists' });
  }
  
  // Create new user
  const userId = Date.now().toString();
  const user = {
    _id: userId,
    name,
    email,
    password, // In a real app, this would be hashed
    language: language || 'en',
    company: {},
    products: [],
    socialMediaCredentials: [],
    preferences: req.body.preferences || {}
  };
  
  users.push(user);
  
  // Generate token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
  
  res.status(201).json({
    user: { ...user, password: undefined },
    token,
    isOnboardingComplete: false,
    redirectUrl: '/onboarding'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ error: true, message: 'Invalid login credentials' });
  }
  
  // Generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
  
  res.json({
    user: { ...user, password: undefined },
    token
  });
});

app.get('/api/auth/validate-token', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const user = users.find(user => user._id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid token' });
    }
    
    res.json({
      valid: true,
      user: { ...user, password: undefined },
      subscriptionActive: true
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const user = users.find(user => user._id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    res.json({ ...user, password: undefined });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.patch('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const userIndex = users.findIndex(user => user._id === decoded.userId);
    
    if (userIndex === -1) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    // Update user
    const user = users[userIndex];
    users[userIndex] = {
      ...user,
      ...req.body,
      // Merge nested objects
      preferences: { ...user.preferences, ...(req.body.preferences || {}) },
      company: { ...user.company, ...(req.body.company || {}) }
    };
    
    res.json({
      user: { ...users[userIndex], password: undefined }
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.patch('/api/auth/subscription', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const userIndex = users.findIndex(user => user._id === decoded.userId);
    
    if (userIndex === -1) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    // Update subscription
    users[userIndex].subscription = {
      ...users[userIndex].subscription,
      ...req.body
    };
    
    // Generate new token
    const newToken = jwt.sign({ userId: users[userIndex]._id }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    
    res.json({
      user: { ...users[userIndex], password: undefined },
      token: newToken
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    message: 'Logged out successfully'
  });
});

// Onboarding routes
app.get('/api/onboarding/status', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const user = users.find(user => user._id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    // Check which onboarding steps are complete
    const businessInfoComplete = !!user.company.description;
    const productsComplete = user.products.length > 0;
    const socialMediaComplete = user.socialMediaCredentials.length > 0;
    const isOnboardingComplete = businessInfoComplete && productsComplete && socialMediaComplete;
    
    res.json({
      businessInfoComplete,
      productsComplete,
      socialMediaComplete,
      isOnboardingComplete,
      nextStep: !businessInfoComplete ? 'business-info' : 
               !productsComplete ? 'products' : 
               !socialMediaComplete ? 'social-media' : 'complete'
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.post('/api/onboarding/business-info', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const userIndex = users.findIndex(user => user._id === decoded.userId);
    
    if (userIndex === -1) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    // Update company info
    users[userIndex].company = {
      ...users[userIndex].company,
      ...req.body
    };
    
    // Check onboarding status
    const businessInfoComplete = !!users[userIndex].company.description;
    const productsComplete = users[userIndex].products.length > 0;
    const socialMediaComplete = users[userIndex].socialMediaCredentials.length > 0;
    const isOnboardingComplete = businessInfoComplete && productsComplete && socialMediaComplete;
    
    res.json({
      success: true,
      user: { ...users[userIndex], password: undefined },
      nextStep: !productsComplete ? 'products' : 
               !socialMediaComplete ? 'social-media' : 'complete'
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.post('/api/onboarding/products', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const userIndex = users.findIndex(user => user._id === decoded.userId);
    
    if (userIndex === -1) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    // Add product
    users[userIndex].products.push(req.body);
    
    // Check onboarding status
    const businessInfoComplete = !!users[userIndex].company.description;
    const productsComplete = users[userIndex].products.length > 0;
    const socialMediaComplete = users[userIndex].socialMediaCredentials.length > 0;
    const isOnboardingComplete = businessInfoComplete && productsComplete && socialMediaComplete;
    
    res.json({
      success: true,
      user: { ...users[userIndex], password: undefined },
      nextStep: !socialMediaComplete ? 'social-media' : 'complete'
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.post('/api/onboarding/social-media', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const userIndex = users.findIndex(user => user._id === decoded.userId);
    
    if (userIndex === -1) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    // Add social media credential
    users[userIndex].socialMediaCredentials.push(req.body);
    
    // Check onboarding status
    const businessInfoComplete = !!users[userIndex].company.description;
    const productsComplete = users[userIndex].products.length > 0;
    const socialMediaComplete = users[userIndex].socialMediaCredentials.length > 0;
    const isOnboardingComplete = businessInfoComplete && productsComplete && socialMediaComplete;
    
    res.json({
      success: true,
      user: { ...users[userIndex], password: undefined },
      isOnboardingComplete: true,
      nextStep: 'complete'
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.patch('/api/onboarding/products/:index', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const index = parseInt(req.params.index);
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const userIndex = users.findIndex(user => user._id === decoded.userId);
    
    if (userIndex === -1) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    if (index < 0 || index >= users[userIndex].products.length) {
      return res.status(404).json({ error: true, message: 'Product not found' });
    }
    
    // Update product
    users[userIndex].products[index] = {
      ...users[userIndex].products[index],
      ...req.body
    };
    
    res.json({
      success: true,
      user: { ...users[userIndex], password: undefined }
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

app.patch('/api/onboarding/social-media/:index', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const index = parseInt(req.params.index);
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    const userIndex = users.findIndex(user => user._id === decoded.userId);
    
    if (userIndex === -1) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    if (index < 0 || index >= users[userIndex].socialMediaCredentials.length) {
      return res.status(404).json({ error: true, message: 'Social media credential not found' });
    }
    
    // Update social media credential
    users[userIndex].socialMediaCredentials[index] = {
      ...users[userIndex].socialMediaCredentials[index],
      ...req.body
    };
    
    res.json({
      success: true,
      user: { ...users[userIndex], password: undefined }
    });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Invalid token' });
  }
});

// Start server
let server;
const startServer = () => {
  server = app.listen(PORT, () => {
    console.log(`Mock server running on port ${PORT}`);
  });
  return server;
};

const stopServer = () => {
  if (server) {
    server.close();
  }
};

module.exports = { startServer, stopServer };