const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const PLANS = require('../constants/plans');

class EntitlementService {
  // Check if therapist's active plan includes the given feature
  async canAccess(therapistId, featureName) {
    try {
      const therapist = await Therapist.findById(therapistId).select('subscriptionPlan subscriptionStatus subscriptionExpiresAt');
      if (!therapist) return false;

      // Check if subscription has expired
      if (therapist.subscriptionExpiresAt && therapist.subscriptionExpiresAt < new Date()) {
        // Fall back to free plan permissions
        return PLANS.FREE.features.includes(featureName);
      }

      const planKey = therapist.subscriptionPlan || 'FREE';
      const plan = PLANS[planKey] || PLANS.FREE;

      return plan.features.includes(featureName);
    } catch (err) {
      console.error('[EntitlementService] error:', err);
      return false;
    }
  }

  // Check if therapist can add more clients within their plan's client limit
  async checkClientLimit(therapistId) {
    try {
      const therapist = await Therapist.findById(therapistId).select('subscriptionPlan');
      const planKey = therapist?.subscriptionPlan || 'FREE';
      const plan = PLANS[planKey] || PLANS.FREE;

      const currentCount = await Client.countDocuments({ therapistId, status: { $ne: 'archived' } });
      const limit = plan.limits.maxClients;

      return {
        allowed: currentCount < limit,
        currentCount,
        limit
      };
    } catch (err) {
      console.error('[EntitlementService] checkClientLimit error:', err);
      return { allowed: false, currentCount: 0, limit: 0 };
    }
  }

  // Return all plan features and current usage limits for a therapist
  async getTherapistEntitlements(therapistId) {
    const therapist = await Therapist.findById(therapistId).select('subscriptionPlan subscriptionStatus subscriptionExpiresAt');
    const planKey = therapist?.subscriptionPlan || 'FREE';
    const plan = PLANS[planKey] || PLANS.FREE;

    const currentClients = await Client.countDocuments({ therapistId, status: { $ne: 'archived' } });

    return {
      planKey,
      planName: plan.name,
      status: therapist?.subscriptionStatus || 'active',
      expiresAt: therapist?.subscriptionExpiresAt || null,
      features: plan.features,
      limits: {
        maxClients: plan.limits.maxClients,
        currentClients,
        maxStorageMB: plan.limits.maxStorageMB,
        analyticsLevel: plan.limits.analyticsLevel
      }
    };
  }
}

module.exports = new EntitlementService();
