const entitlementService = require('../services/EntitlementService');

const requireEntitlement = (featureName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'THERAPIST') {
        return res.status(403).json({ success: false, message: 'Access denied: Therapist only' });
      }

      const allowed = await entitlementService.canAccess(req.user.id, featureName);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          code: 'UPGRADE_REQUIRED',
          message: `The '${featureName}' feature requires a subscription plan upgrade.`,
          feature: featureName
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

const requireClientQuota = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'THERAPIST') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { allowed, currentCount, limit } = await entitlementService.checkClientLimit(req.user.id);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        code: 'CLIENT_LIMIT_REACHED',
        message: `You have reached your limit of ${limit} active clients. Please upgrade your subscription to add more clients.`,
        currentCount,
        limit
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireEntitlement,
  requireClientQuota
};
