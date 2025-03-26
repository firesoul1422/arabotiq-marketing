const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Content = require('../models/Content');
const SocialMedia = require('../models/SocialMedia');
const moment = require('moment');
const auth = require('../middleware/auth');

// Helper function to check if date is during Ramadan
const isRamadan = (date) => {
  // This is a simplified check - in a real app, you would use a proper Hijri calendar library
  // For example: hijri-date, moment-hijri, or an API
  // This is just a placeholder implementation
  const ramadanDates = {
    2023: { start: '2023-03-22', end: '2023-04-21' },
    2024: { start: '2024-03-10', end: '2024-04-09' }
  };
  
  const year = date.getFullYear();
  if (ramadanDates[year]) {
    const startDate = new Date(ramadanDates[year].start);
    const endDate = new Date(ramadanDates[year].end);
    return date >= startDate && date <= endDate;
  }
  
  return false;
};

// Helper function to check if date is during Eid
const isEid = (date) => {
  // This is a simplified check - in a real app, you would use a proper Hijri calendar library
  // Eid al-Fitr and Eid al-Adha dates
  const eidDates = {
    2023: [
      { name: 'Eid al-Fitr', start: '2023-04-21', end: '2023-04-23' },
      { name: 'Eid al-Adha', start: '2023-06-28', end: '2023-07-02' }
    ],
    2024: [
      { name: 'Eid al-Fitr', start: '2024-04-10', end: '2024-04-12' },
      { name: 'Eid al-Adha', start: '2024-06-16', end: '2024-06-20' }
    ]
  };
  
  const year = date.getFullYear();
  if (eidDates[year]) {
    for (const eid of eidDates[year]) {
      const startDate = new Date(eid.start);
      const endDate = new Date(eid.end);
      if (date >= startDate && date <= endDate) {
        return { isEid: true, name: eid.name };
      }
    }
  }
  
  return { isEid: false };
};

// Get Friday engagement analytics
router.get('/friday-engagement', auth, async (req, res) => {
  try {
    // Get date range from query params (default to last 12 weeks)
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : moment().subtract(12, 'weeks').toDate();
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get all content published in the date range
    const content = await Content.find({
      publishedDate: { $gte: start, $lte: end },
      status: 'published'
    }).populate('campaign', 'name');
    
    // Group content by day of week
    const performanceByDayOfWeek = {
      0: { day: 'Sunday', impressions: 0, clicks: 0, engagement: 0, count: 0 },
      1: { day: 'Monday', impressions: 0, clicks: 0, engagement: 0, count: 0 },
      2: { day: 'Tuesday', impressions: 0, clicks: 0, engagement: 0, count: 0 },
      3: { day: 'Wednesday', impressions: 0, clicks: 0, engagement: 0, count: 0 },
      4: { day: 'Thursday', impressions: 0, clicks: 0, engagement: 0, count: 0 },
      5: { day: 'Friday', impressions: 0, clicks: 0, engagement: 0, count: 0 },
      6: { day: 'Saturday', impressions: 0, clicks: 0, engagement: 0, count: 0 }
    };
    
    // Calculate metrics by day of week
    content.forEach(c => {
      if (c.publishedDate && c.performance) {
        const dayOfWeek = c.publishedDate.getDay();
        performanceByDayOfWeek[dayOfWeek].impressions += c.performance.impressions || 0;
        performanceByDayOfWeek[dayOfWeek].clicks += c.performance.clicks || 0;
        performanceByDayOfWeek[dayOfWeek].engagement += c.performance.engagement || 0;
        performanceByDayOfWeek[dayOfWeek].count += 1;
      }
    });
    
    // Calculate averages and engagement rate
    Object.keys(performanceByDayOfWeek).forEach(day => {
      const data = performanceByDayOfWeek[day];
      if (data.count > 0) {
        data.avgImpressions = data.impressions / data.count;
        data.avgClicks = data.clicks / data.count;
        data.avgEngagement = data.engagement / data.count;
        data.engagementRate = data.impressions > 0 ? (data.engagement / data.impressions) * 100 : 0;
      }
    });
    
    // Calculate Friday vs. other days comparison
    const fridayData = performanceByDayOfWeek[5];
    const otherDaysData = {
      impressions: 0,
      clicks: 0,
      engagement: 0,
      count: 0
    };
    
    Object.keys(performanceByDayOfWeek).forEach(day => {
      if (day !== '5') { // Not Friday
        const data = performanceByDayOfWeek[day];
        otherDaysData.impressions += data.impressions;
        otherDaysData.clicks += data.clicks;
        otherDaysData.engagement += data.engagement;
        otherDaysData.count += data.count;
      }
    });
    
    // Calculate averages for other days
    if (otherDaysData.count > 0) {
      otherDaysData.avgImpressions = otherDaysData.impressions / otherDaysData.count;
      otherDaysData.avgClicks = otherDaysData.clicks / otherDaysData.count;
      otherDaysData.avgEngagement = otherDaysData.engagement / otherDaysData.count;
      otherDaysData.engagementRate = otherDaysData.impressions > 0 ? 
        (otherDaysData.engagement / otherDaysData.impressions) * 100 : 0;
    }
    
    // Calculate percentage difference
    const fridayVsOtherDays = {
      impressionsDiff: otherDaysData.avgImpressions > 0 ? 
        ((fridayData.avgImpressions - otherDaysData.avgImpressions) / otherDaysData.avgImpressions) * 100 : 0,
      clicksDiff: otherDaysData.avgClicks > 0 ? 
        ((fridayData.avgClicks - otherDaysData.avgClicks) / otherDaysData.avgClicks) * 100 : 0,
      engagementDiff: otherDaysData.avgEngagement > 0 ? 
        ((fridayData.avgEngagement - otherDaysData.avgEngagement) / otherDaysData.avgEngagement) * 100 : 0,
      engagementRateDiff: otherDaysData.engagementRate > 0 ? 
        ((fridayData.engagementRate - otherDaysData.engagementRate) / otherDaysData.engagementRate) * 100 : 0
    };
    
    res.json({
      byDayOfWeek: Object.values(performanceByDayOfWeek),
      fridayVsOtherDays,
      fridayData,
      otherDaysData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Ramadan campaign performance
router.get('/ramadan-performance', auth, async (req, res) => {
  try {
    // Get year from query params (default to current year)
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Get all content
    const allContent = await Content.find({
      status: 'published',
      publishedDate: { 
        $gte: new Date(`${targetYear}-01-01`), 
        $lte: new Date(`${targetYear}-12-31`) 
      }
    }).populate('campaign', 'name');
    
    // Separate Ramadan and non-Ramadan content
    const ramadanContent = [];
    const nonRamadanContent = [];
    
    allContent.forEach(content => {
      if (content.publishedDate && isRamadan(content.publishedDate)) {
        ramadanContent.push(content);
      } else {
        nonRamadanContent.push(content);
      }
    });
    
    // Calculate performance metrics
    const calculateMetrics = (contentArray) => {
      const totalImpressions = contentArray.reduce((sum, c) => sum + (c.performance?.impressions || 0), 0);
      const totalClicks = contentArray.reduce((sum, c) => sum + (c.performance?.clicks || 0), 0);
      const totalEngagement = contentArray.reduce((sum, c) => sum + (c.performance?.engagement || 0), 0);
      const totalConversions = contentArray.reduce((sum, c) => sum + (c.performance?.conversions || 0), 0);
      
      const count = contentArray.length;
      return {
        count,
        totalImpressions,
        totalClicks,
        totalEngagement,
        totalConversions,
        avgImpressions: count > 0 ? totalImpressions / count : 0,
        avgClicks: count > 0 ? totalClicks / count : 0,
        avgEngagement: count > 0 ? totalEngagement / count : 0,
        avgConversions: count > 0 ? totalConversions / count : 0,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        engagementRate: totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0
      };
    };
    
    const ramadanMetrics = calculateMetrics(ramadanContent);
    const nonRamadanMetrics = calculateMetrics(nonRamadanContent);
    
    // Calculate percentage difference
    const calculateDiff = (ramadan, nonRamadan) => {
      return nonRamadan > 0 ? ((ramadan - nonRamadan) / nonRamadan) * 100 : 0;
    };
    
    const comparison = {
      impressionsDiff: calculateDiff(ramadanMetrics.avgImpressions, nonRamadanMetrics.avgImpressions),
      clicksDiff: calculateDiff(ramadanMetrics.avgClicks, nonRamadanMetrics.avgClicks),
      engagementDiff: calculateDiff(ramadanMetrics.avgEngagement, nonRamadanMetrics.avgEngagement),
      conversionsDiff: calculateDiff(ramadanMetrics.avgConversions, nonRamadanMetrics.avgConversions),
      ctrDiff: calculateDiff(ramadanMetrics.ctr, nonRamadanMetrics.ctr),
      conversionRateDiff: calculateDiff(ramadanMetrics.conversionRate, nonRamadanMetrics.conversionRate),
      engagementRateDiff: calculateDiff(ramadanMetrics.engagementRate, nonRamadanMetrics.engagementRate)
    };
    
    res.json({
      ramadan: ramadanMetrics,
      nonRamadan: nonRamadanMetrics,
      comparison
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Eid campaign performance
router.get('/eid-performance', auth, async (req, res) => {
  try {
    // Get year and Eid type from query params
    const { year, eidType } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Get all content
    const allContent = await Content.find({
      status: 'published',
      publishedDate: { 
        $gte: new Date(`${targetYear}-01-01`), 
        $lte: new Date(`${targetYear}-12-31`) 
      }
    }).populate('campaign', 'name');
    
    // Separate Eid and non-Eid content
    const eidContent = [];
    const nonEidContent = [];
    let eidName = '';
    
    allContent.forEach(content => {
      if (content.publishedDate) {
        const eidCheck = isEid(content.publishedDate);
        if (eidCheck.isEid && (!eidType || eidCheck.name.toLowerCase().includes(eidType.toLowerCase()))) {
          eidContent.push(content);
          if (!eidName && eidCheck.name) {
            eidName = eidCheck.name;
          }
        } else {
          nonEidContent.push(content);
        }
      }
    });
    
    // Calculate performance metrics (reusing the function from Ramadan route)
    const calculateMetrics = (contentArray) => {
      const totalImpressions = contentArray.reduce((sum, c) => sum + (c.performance?.impressions || 0), 0);
      const totalClicks = contentArray.reduce((sum, c) => sum + (c.performance?.clicks || 0), 0);
      const totalEngagement = contentArray.reduce((sum, c) => sum + (c.performance?.engagement || 0), 0);
      const totalConversions = contentArray.reduce((sum, c) => sum + (c.performance?.conversions || 0), 0);
      
      const count = contentArray.length;
      return {
        count,
        totalImpressions,
        totalClicks,
        totalEngagement,
        totalConversions,
        avgImpressions: count > 0 ? totalImpressions / count : 0,
        avgClicks: count > 0 ? totalClicks / count : 0,
        avgEngagement: count > 0 ? totalEngagement / count : 0,
        avgConversions: count > 0 ? totalConversions / count : 0,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        engagementRate: totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0
      };
    };
    
    const eidMetrics = calculateMetrics(eidContent);
    const nonEidMetrics = calculateMetrics(nonEidContent);
    
    // Calculate percentage difference
    const calculateDiff = (eid, nonEid) => {
      return nonEid > 0 ? ((eid - nonEid) / nonEid) * 100 : 0;
    };
    
    const comparison = {
      impressionsDiff: calculateDiff(eidMetrics.avgImpressions, nonEidMetrics.avgImpressions),
      clicksDiff: calculateDiff(eidMetrics.avgClicks, nonEidMetrics.avgClicks),
      engagementDiff: calculateDiff(eidMetrics.avgEngagement, nonEidMetrics.avgEngagement),
      conversionsDiff: calculateDiff(eidMetrics.avgConversions, nonEidMetrics.avgConversions),
      ctrDiff: calculateDiff(eidMetrics.ctr, nonEidMetrics.ctr),
      conversionRateDiff: calculateDiff(eidMetrics.conversionRate, nonEidMetrics.conversionRate),
      engagementRateDiff: calculateDiff(eidMetrics.engagementRate, nonEidMetrics.engagementRate)
    };
    
    res.json({
      eidName,
      eid: eidMetrics,
      nonEid: nonEidMetrics,
      comparison
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;