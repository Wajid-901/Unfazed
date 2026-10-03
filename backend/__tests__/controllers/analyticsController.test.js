const analyticsController = require('../../src/controllers/analyticsController');
const Payment = require('../../src/models/Payment');
const Session = require('../../src/models/Session');
const Client = require('../../src/models/Client');
const mongoose = require('mongoose');

jest.mock('../../src/models/Payment');
jest.mock('../../src/models/Session');
jest.mock('../../src/models/Client');

describe('analyticsController & Cache System', () => {
  let req, res, next;
  const therapistId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsController.analyticsCache.clear();

    req = {
      user: { id: therapistId },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('In-memory cache behavior', () => {
    it('should return cached response on subsequent requests without querying DB again', async () => {
      // 1st Payment.aggregate: core revenue summary
      // 2nd Payment.aggregate: monthly revenue breakdown
      Payment.aggregate
        .mockResolvedValueOnce([{ total: 50000, count: 10 }])
        .mockResolvedValueOnce([{ _id: { year: 2026, month: 10 }, revenue: 15000, bookingsCount: 5 }]);

      Session.aggregate.mockResolvedValue([
        { _id: 'completed', count: 8 },
        { _id: 'cancelled', count: 1 }
      ]);
      Client.countDocuments.mockResolvedValue(15);
      Client.aggregate.mockResolvedValue([
        { _id: { year: 2026, month: 10 }, newClients: 3 }
      ]);

      // First call (cache miss)
      await analyticsController.getAnalyticsDashboard(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(Payment.aggregate).toHaveBeenCalled();

      // Reset mock tracking
      Payment.aggregate.mockClear();
      Session.aggregate.mockClear();
      Client.countDocuments.mockClear();
      Client.aggregate.mockClear();

      // Second call (cache hit)
      await analyticsController.getAnalyticsDashboard(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      // DB queries should NOT be executed on cache hit
      expect(Payment.aggregate).not.toHaveBeenCalled();
      expect(Session.aggregate).not.toHaveBeenCalled();
      expect(Client.countDocuments).not.toHaveBeenCalled();
      expect(Client.aggregate).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ cached: true }));
    });

    it('should invalidate cache when invalidateCache is called', async () => {
      // Manually set cache
      analyticsController.analyticsCache.set(`analytics_${therapistId}`, {
        data: { totalRevenue: 1000 },
        expiresAt: Date.now() + 100000
      });

      expect(analyticsController.analyticsCache.has(`analytics_${therapistId}`)).toBe(true);

      analyticsController.invalidateCache(therapistId);

      expect(analyticsController.analyticsCache.has(`analytics_${therapistId}`)).toBe(false);
    });

    it('should handle invalidateAnalyticsCacheHandler endpoint', async () => {
      analyticsController.analyticsCache.set(`analytics_${therapistId}`, {
        data: { totalRevenue: 1000 },
        expiresAt: Date.now() + 100000
      });

      await analyticsController.invalidateAnalyticsCacheHandler(req, res);

      expect(analyticsController.analyticsCache.has(`analytics_${therapistId}`)).toBe(false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: expect.stringContaining('invalidated') })
      );
    });
  });
});
