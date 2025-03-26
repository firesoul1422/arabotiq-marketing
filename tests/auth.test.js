const axios = require('axios');
require('dotenv').config();
const { startServer, stopServer } = require('./mockServer');

// Test configuration
const API_URL = process.env.TEST_PORT ? `http://localhost:${process.env.TEST_PORT}/api` : 'http://localhost:3001/api';
let authToken;
let userId;
let server;

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Password123!',
  company: {
    name: 'Test Company',
    industry: 'Technology',
    location: 'Dubai, UAE'
  },
  language: 'ar',
  preferences: {
    rtlLayout: true,
    emailNotifications: true,
    dialect: 'gulf'
  }
};

// Setup and teardown
beforeAll(async () => {
  // Start mock server
  server = startServer();
});

afterAll(async () => {
  // Stop mock server
  stopServer();
});

// Helper function for API requests
const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        status: error.response.status,
        message: error.response.data.message || 'Unknown error'
      };
    }
    throw error;
  }
};

// Test suite for authentication routes
describe('Authentication API', () => {
  // Test user registration
  test('Should register a new user', async () => {
    const response = await apiRequest('post', '/auth/register', testUser);
    
    expect(response.error).toBeFalsy();
    expect(response.user).toBeDefined();
    expect(response.token).toBeDefined();
    expect(response.isOnboardingComplete).toBeDefined();
    expect(response.redirectUrl).toBeDefined();
    
    // Save token and user ID for subsequent tests
    authToken = response.token;
    userId = response.user._id;
    
    // Verify user data
    expect(response.user.name).toBe(testUser.name);
    expect(response.user.email).toBe(testUser.email);
    expect(response.user.language).toBe(testUser.language);
    expect(response.user.preferences.rtlLayout).toBe(testUser.preferences.rtlLayout);
    expect(response.user.preferences.emailNotifications).toBe(testUser.preferences.emailNotifications);
    expect(response.user.preferences.dialect).toBe(testUser.preferences.dialect);
  });
  
  // Test duplicate registration
  test('Should not register a duplicate user', async () => {
    const response = await apiRequest('post', '/auth/register', testUser);
    
    expect(response.error).toBeTruthy();
    expect(response.status).toBe(400);
    expect(response.message).toContain('User already exists');
  });
  
  // Test user login
  test('Should login an existing user', async () => {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const response = await apiRequest('post', '/auth/login', loginData);
    
    expect(response.error).toBeFalsy();
    expect(response.user).toBeDefined();
    expect(response.token).toBeDefined();
    
    // Update token for subsequent tests
    authToken = response.token;
  });
  
  // Test invalid login
  test('Should not login with invalid credentials', async () => {
    const invalidLoginData = {
      email: testUser.email,
      password: 'WrongPassword123!'
    };
    
    const response = await apiRequest('post', '/auth/login', invalidLoginData);
    
    expect(response.error).toBeTruthy();
    expect(response.status).toBe(401);
    expect(response.message).toContain('Invalid login credentials');
  });
  
  // Test token validation
  test('Should validate a valid token', async () => {
    const response = await apiRequest('get', '/auth/validate-token', null, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.valid).toBe(true);
    expect(response.user).toBeDefined();
    expect(response.subscriptionActive).toBeDefined();
  });
  
  // Test invalid token
  test('Should reject an invalid token', async () => {
    const response = await apiRequest('get', '/auth/validate-token', null, 'invalid-token');
    
    expect(response.error).toBeTruthy();
    expect(response.status).toBe(401);
  });
  
  // Test profile retrieval
  test('Should get user profile', async () => {
    const response = await apiRequest('get', '/auth/profile', null, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response._id).toBeDefined();
    expect(response.name).toBe(testUser.name);
    expect(response.email).toBe(testUser.email);
  });
  
  // Test profile update
  test('Should update user profile', async () => {
    const updateData = {
      name: 'Updated Test User',
      preferences: {
        dialect: 'egyptian'
      }
    };
    
    const response = await apiRequest('patch', '/auth/profile', updateData, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.user).toBeDefined();
    expect(response.user.name).toBe(updateData.name);
    expect(response.user.preferences.dialect).toBe(updateData.preferences.dialect);
    // Original preferences should be preserved
    expect(response.user.preferences.rtlLayout).toBe(testUser.preferences.rtlLayout);
    expect(response.user.preferences.emailNotifications).toBe(testUser.preferences.emailNotifications);
  });
  
  // Test subscription update
  test('Should update subscription', async () => {
    const subscriptionData = {
      tier: 'pro',
      status: 'active',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };
    
    const response = await apiRequest('patch', '/auth/subscription', subscriptionData, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.user).toBeDefined();
    expect(response.token).toBeDefined(); // Should get a new token with updated expiration
    expect(response.user.subscription.tier).toBe(subscriptionData.tier);
    expect(response.user.subscription.status).toBe(subscriptionData.status);
    
    // Update token for subsequent tests
    authToken = response.token;
  });
  
  // Test logout
  test('Should logout user', async () => {
    const response = await apiRequest('post', '/auth/logout', null, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.message).toContain('Logged out successfully');
    
    // Verify token is no longer valid
    const validateResponse = await apiRequest('get', '/auth/validate-token', null, authToken);
    expect(validateResponse.error).toBeTruthy();
    expect(validateResponse.status).toBe(401);
  });
});