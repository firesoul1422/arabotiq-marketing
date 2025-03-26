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
  name: 'Onboarding Test User',
  email: `onboarding${Date.now()}@example.com`,
  password: 'Password123!',
  language: 'ar'
};

// Business info data
const businessInfo = {
  name: 'Test Company MENA',
  industry: 'E-commerce',
  location: 'Riyadh, Saudi Arabia',
  description: 'A leading e-commerce platform for the MENA region specializing in electronics and home goods.'
};

// Product data
const product = {
  name: 'Smart Home Hub',
  description: 'A centralized control system for smart home devices with Arabic voice commands.',
  category: 'Electronics',
  targetAudience: 'Tech-savvy homeowners in Gulf countries',
  uniqueSellingPoints: [
    'Full Arabic language support',
    'Compatible with regional smart home brands',
    'Optimized for Gulf Arabic dialect recognition'
  ]
};

// Social media credential data
const socialMediaCredential = {
  platform: 'linkedin-mena',
  accountName: 'Test Company MENA',
  accountUrl: 'https://linkedin.com/company/test-company-mena',
  apiKey: 'test-api-key',
  apiSecret: 'test-api-secret',
  accessToken: 'test-access-token'
};

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

// Test suite for onboarding process
describe('Onboarding Process', () => {
  // Start mock server and register a test user before running tests
  beforeAll(async () => {
    server = startServer();
    const response = await apiRequest('post', '/auth/register', testUser);
    authToken = response.token;
    userId = response.user._id;
  });
  
  // Stop mock server after tests
  afterAll(async () => {
    stopServer();
  });
  
  // Test getting onboarding status
  test('Should get initial onboarding status', async () => {
    const response = await apiRequest('get', '/onboarding/status', null, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.businessInfoComplete).toBe(false);
    expect(response.productsComplete).toBe(false);
    expect(response.socialMediaComplete).toBe(false);
    expect(response.isOnboardingComplete).toBe(false);
    expect(response.nextStep).toBe('business-info');
  });
  
  // Test updating business information
  test('Should update business information', async () => {
    const response = await apiRequest('post', '/onboarding/business-info', businessInfo, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.success).toBe(true);
    expect(response.user.company.name).toBe(businessInfo.name);
    expect(response.user.company.industry).toBe(businessInfo.industry);
    expect(response.user.company.location).toBe(businessInfo.location);
    expect(response.user.company.description).toBe(businessInfo.description);
    expect(response.nextStep).toBe('products');
  });
  
  // Test adding a product
  test('Should add a product', async () => {
    const response = await apiRequest('post', '/onboarding/products', product, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.success).toBe(true);
    expect(response.user.products.length).toBe(1);
    expect(response.user.products[0].name).toBe(product.name);
    expect(response.user.products[0].description).toBe(product.description);
    expect(response.nextStep).toBe('social-media');
  });
  
  // Test adding social media credentials
  test('Should add social media credentials', async () => {
    const response = await apiRequest('post', '/onboarding/social-media', socialMediaCredential, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.success).toBe(true);
    expect(response.user.socialMediaCredentials.length).toBe(1);
    expect(response.user.socialMediaCredentials[0].platform).toBe(socialMediaCredential.platform);
    expect(response.user.socialMediaCredentials[0].accountName).toBe(socialMediaCredential.accountName);
    expect(response.isOnboardingComplete).toBe(true);
    expect(response.nextStep).toBe('complete');
  });
  
  // Test getting final onboarding status
  test('Should confirm onboarding is complete', async () => {
    const response = await apiRequest('get', '/onboarding/status', null, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.businessInfoComplete).toBe(true);
    expect(response.productsComplete).toBe(true);
    expect(response.socialMediaComplete).toBe(true);
    expect(response.isOnboardingComplete).toBe(true);
    expect(response.nextStep).toBe('complete');
  });
  
  // Test updating a product
  test('Should update a product', async () => {
    const updatedProduct = {
      name: 'Enhanced Smart Home Hub',
      targetAudience: 'Tech-savvy homeowners across all MENA regions'
    };
    
    const response = await apiRequest('patch', '/onboarding/products/0', updatedProduct, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.success).toBe(true);
    expect(response.user.products[0].name).toBe(updatedProduct.name);
    expect(response.user.products[0].targetAudience).toBe(updatedProduct.targetAudience);
    // Original fields should be preserved
    expect(response.user.products[0].description).toBe(product.description);
  });
  
  // Test updating social media credentials
  test('Should update social media credentials', async () => {
    const updatedCredential = {
      accountName: 'Updated Test Company MENA',
      accessToken: 'updated-test-access-token'
    };
    
    const response = await apiRequest('patch', '/onboarding/social-media/0', updatedCredential, authToken);
    
    expect(response.error).toBeFalsy();
    expect(response.success).toBe(true);
    expect(response.user.socialMediaCredentials[0].accountName).toBe(updatedCredential.accountName);
    expect(response.user.socialMediaCredentials[0].accessToken).toBe(updatedCredential.accessToken);
    // Original fields should be preserved
    expect(response.user.socialMediaCredentials[0].platform).toBe(socialMediaCredential.platform);
  });
});