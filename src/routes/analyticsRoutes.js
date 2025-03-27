const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Content = require('../models/Content');
const SocialMedia = require('../models/SocialMedia');
const moment = require('moment');
const auth = require('../middleware/auth');

// Get overall analytics dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get active campaigns count
    const activeCampaignsCount = await Campaign.countDocuments({ status: 'active' });
    
    // Get total content pieces count
    const contentCount = await Content.countDocuments();
    
    // Get content by type distribution
    const contentByType = await Content.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Get content by channel distribution
    const contentByChannel = await Content.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 } } }
    ]);
    
    // Get content by status distribution
    const contentByStatus = await Content.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get social media accounts count by platform
    const socialMediaByPlatform = await SocialMedia.aggregate([
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);
    
    // Get total followers across all platforms
    const socialMediaStats = await SocialMedia.aggregate([
      { 
        $group: { 
          _id: null, 
          totalFollowers: { $sum: '$followers' },
          totalAccounts: { $sum: 1 }
        } 
      }
    ]);
    
    // Get recent campaign performance
    const recentCampaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name performance');
    
    // Prepare dashboard data
    const dashboardData = {
      campaigns: {
        active: activeCampaignsCount,
        total: await Campaign.countDocuments(),
        recentPerformance: recentCampaigns
      },
      content: {
        total: contentCount,
        byType: contentByType,
        byChannel: contentByChannel,
        byStatus: contentByStatus,
        scheduled: await Content.countDocuments({ status: 'scheduled' }),
        published: await Content.countDocuments({ status: 'published' })
      },
      socialMedia: {
        platforms: socialMediaByPlatform,
        totalFollowers: socialMediaStats.length > 0 ? socialMediaStats[0].totalFollowers : 0,
        totalAccounts: socialMediaStats.length > 0 ? socialMediaStats[0].totalAccounts : 0
      }
    };
    
    res.json(dashboardData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get campaign performance over time
router.get('/campaign/:id/performance', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get time range from query params (default to last 30 days)
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
    const end = endDate ? new Date(endDate) : new Date();
    
    // Filter performance data by date range
    const performanceData = campaign.performance.filter(p => {
      const date = new Date(p.date);
      return date >= start && date <= end;
    });
    
    // Group by day and calculate metrics
    const performanceByDay = {};
    performanceData.forEach(p => {
      const day = moment(p.date).format('YYYY-MM-DD');
      if (!performanceByDay[day]) {
        performanceByDay[day] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          engagement: 0,
          roi: 0,
          count: 0
        };
      }
      
      performanceByDay[day].impressions += p.metrics.impressions || 0;
      performanceByDay[day].clicks += p.metrics.clicks || 0;
      performanceByDay[day].conversions += p.metrics.conversions || 0;
      performanceByDay[day].engagement += p.metrics.engagement || 0;
      performanceByDay[day].roi += p.metrics.roi || 0;
      performanceByDay[day].count += 1;
    });
    
    // Calculate averages for engagement and ROI
    Object.keys(performanceByDay).forEach(day => {
      if (performanceByDay[day].count > 0) {
        performanceByDay[day].engagement /= performanceByDay[day].count;
        performanceByDay[day].roi /= performanceByDay[day].count;
      }
      delete performanceByDay[day].count;
    });
    
    // Convert to array format for easier consumption by charts
    const performanceArray = Object.keys(performanceByDay).map(day => ({
      date: day,
      ...performanceByDay[day]
    }));
    
    // Sort by date
    performanceArray.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(performanceArray);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get content performance analytics
router.get('/content/performance', async (req, res) => {
  try {
    // Get filter parameters
    const { campaignId, contentType, channel, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (campaignId) filter.campaign = campaignId;
    if (contentType) filter.type = contentType;
    if (channel) filter.channel = channel;
    
    // Add date filter if provided
    if (startDate || endDate) {
      filter.publishedDate = {};
      if (startDate) filter.publishedDate.$gte = new Date(startDate);
      if (endDate) filter.publishedDate.$lte = new Date(endDate);
    }
    
    // Only include published content
    filter.status = 'published';
    
    // Get content with performance data
    const content = await Content.find(filter)
      .populate('campaign', 'name')
      .sort({ publishedDate: -1 });
    
    // Calculate performance metrics
    const totalImpressions = content.reduce((sum, c) => sum + (c.performance?.impressions || 0), 0);
    const totalClicks = content.reduce((sum, c) => sum + (c.performance?.clicks || 0), 0);
    const totalEngagement = content.reduce((sum, c) => sum + (c.performance?.engagement || 0), 0);
    const totalConversions = content.reduce((sum, c) => sum + (c.performance?.conversions || 0), 0);
    
    // Calculate averages
    const contentCount = content.length;
    const avgImpressions = contentCount > 0 ? totalImpressions / contentCount : 0;
    const avgClicks = contentCount > 0 ? totalClicks / contentCount : 0;
    const avgEngagement = contentCount > 0 ? totalEngagement / contentCount : 0;
    const avgConversions = contentCount > 0 ? totalConversions / contentCount : 0;
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    
    // Get performance by content type
    const performanceByType = await Content.aggregate([
      { $match: { ...filter } },
      { 
        $group: { 
          _id: '$type', 
          impressions: { $sum: { $ifNull: ['$performance.impressions', 0] } },
          clicks: { $sum: { $ifNull: ['$performance.clicks', 0] } },
          engagement: { $avg: { $ifNull: ['$performance.engagement', 0] } },
          conversions: { $sum: { $ifNull: ['$performance.conversions', 0] } },
          count: { $sum: 1 }
        } 
      }
    ]);
    
    // Get performance by channel
    const performanceByChannel = await Content.aggregate([
      { $match: { ...filter } },
      { 
        $group: { 
          _id: '$channel', 
          impressions: { $sum: { $ifNull: ['$performance.impressions', 0] } },
          clicks: { $sum: { $ifNull: ['$performance.clicks', 0] } },
          engagement: { $avg: { $ifNull: ['$performance.engagement', 0] } },
          conversions: { $sum: { $ifNull: ['$performance.conversions', 0] } },
          count: { $sum: 1 }
        } 
      }
    ]);
    
    // Prepare response
    const analyticsData = {
      summary: {
        totalContent: contentCount,
        totalImpressions,
        totalClicks,
        totalEngagement,
        totalConversions,
        avgImpressions,
        avgClicks,
        avgEngagement,
        avgConversions,
        avgCTR,
        avgConversionRate
      },
      byType: performanceByType,
      byChannel: performanceByChannel,
      content: content.map(c => ({
        id: c._id,
        title: c.title,
        type: c.type,
        channel: c.channel,
        campaign: c.campaign?.name,
        publishedDate: c.publishedDate,
        performance: c.performance || {}
      }))
    };
    
    res.json(analyticsData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;