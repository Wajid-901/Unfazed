const PLANS = require('../constants/plans');
const Therapist = require('../models/Therapist');
const entitlementService = require('../services/EntitlementService');

const getPlans = (req, res) => {
  res.status(200).json({
    success: true,
    plans: Object.values(PLANS)
  });
};

const getMyEntitlements = async (req, res, next) => {
  try {
    const entitlements = await entitlementService.getTherapistEntitlements(req.user.id);
    res.status(200).json({
      success: true,
      entitlements
    });
  } catch (error) {
    next(error);
  }
};

const upgradePlan = async (req, res, next) => {
  try {
    const { planKey } = req.body;
    if (!PLANS[planKey]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    therapist.subscriptionPlan = planKey;
    therapist.subscriptionStatus = 'active';
    // Set 30 days renewal
    therapist.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await therapist.save();

    res.status(200).json({
      success: true,
      message: `Plan updated to ${PLANS[planKey].name} successfully`,
      subscriptionPlan: therapist.subscriptionPlan
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  getMyEntitlements,
  upgradePlan
};
