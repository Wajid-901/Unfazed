const Session = require('../models/Session');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const mongoose = require('mongoose');

// Return full practice analytics: revenue, sessions, client growth
const getAnalyticsDashboard = async (req, res, next) => {
  try {
    const therapistId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Core Summary Metrics
    const [totalRevenueResult, sessionStats, totalClientsCount] = await Promise.all([
      Payment.aggregate([
        { $match: { therapistId, status: 'captured' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Session.aggregate([
        { $match: { therapistId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Client.countDocuments({ therapistId, status: { $ne: 'archived' } })
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const capturedTransactions = totalRevenueResult[0]?.count || 0;

    let totalSessions = 0;
    let completedSessions = 0;
    let cancelledSessions = 0;
    let noShowSessions = 0;

    sessionStats.forEach((s) => {
      totalSessions += s.count;
      if (s._id === 'completed') completedSessions = s.count;
      if (s._id === 'cancelled') cancelledSessions = s.count;
      if (s._id === 'no-show') noShowSessions = s.count;
    });

    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    const cancellationRate = totalSessions > 0 ? Math.round((cancelledSessions / totalSessions) * 100) : 0;
    const noShowRate = totalSessions > 0 ? Math.round((noShowSessions / totalSessions) * 100) : 0;

    // 2. Monthly Revenue Over Past 6 Months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueRaw = await Payment.aggregate([
      {
        $match: {
          therapistId,
          status: 'captured',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          bookingsCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format months array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${monthNames[d.getMonth()]} ${year.toString().slice(-2)}`;

      const found = monthlyRevenueRaw.find(
        (item) => item._id.year === year && item._id.month === month
      );

      monthlyRevenue.push({
        month: monthLabel,
        revenue: found ? found.revenue : 0,
        sessions: found ? found.bookingsCount : 0
      });
    }

    // 3. Client Growth Trend (Monthly Client Signups over last 6 months)
    const clientGrowthRaw = await Client.aggregate([
      {
        $match: {
          therapistId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newClients: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const clientGrowth = [];
    let runningTotal = Math.max(0, totalClientsCount - clientGrowthRaw.reduce((acc, curr) => acc + curr.newClients, 0));

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${monthNames[d.getMonth()]}`;

      const found = clientGrowthRaw.find(
        (item) => item._id.year === year && item._id.month === month
      );

      const added = found ? found.newClients : 0;
      runningTotal += added;

      clientGrowth.push({
        month: monthLabel,
        newClients: added,
        totalClients: runningTotal
      });
    }

    // 4. Session Status Distribution Breakdown
    const sessionDistribution = [
      { name: 'Completed', value: completedSessions, color: '#10B981' },
      { name: 'Scheduled / Upcoming', value: Math.max(0, totalSessions - completedSessions - cancelledSessions - noShowSessions), color: '#3B82F6' },
      { name: 'Cancelled', value: cancelledSessions, color: '#EF4444' },
      { name: 'No-Show', value: noShowSessions, color: '#F59E0B' }
    ].filter((item) => item.value > 0);

    // If zero sessions exist yet, provide placeholder distribution for clean display
    const finalDistribution = sessionDistribution.length > 0 ? sessionDistribution : [
      { name: 'Scheduled', value: 1, color: '#3B82F6' }
    ];

    res.status(200).json({
      success: true,
      metrics: {
        totalRevenue,
        capturedTransactions,
        totalClientsCount,
        totalSessions,
        completedSessions,
        completionRate,
        cancellationRate,
        noShowRate
      },
      monthlyRevenue,
      clientGrowth,
      sessionDistribution: finalDistribution
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsDashboard
};
