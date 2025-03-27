require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const campaignRoutes = require('./routes/campaignRoutes');
const marketAnalysisRoutes = require('./routes/marketAnalysisRoutes');
const contentGenerationRoutes = require('./routes/contentGenerationRoutes');
const socialMediaRoutes = require('./routes/socialMediaRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const culturalAnalyticsRoutes = require('./routes/culturalAnalyticsRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/market-analysis', marketAnalysisRoutes);
app.use('/api/content', contentGenerationRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cultural-analytics', culturalAnalyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Root route
app.get('/', (req, res) => {
  res.send('Agentic Marketing AI API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});