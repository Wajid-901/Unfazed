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

    // If downgrading, check if active client count exceeds target tier
    const Client = require('../models/Client');
    const currentClients = await Client.countDocuments({
      therapistId: therapist._id,
      status: { $ne: 'archived' }
    });

    const targetMaxClients = PLANS[planKey].limits.maxClients;
    if (currentClients > targetMaxClients) {
      return res.status(400).json({
        success: false,
        message: `Cannot switch to ${PLANS[planKey].name} because you currently have ${currentClients} active clients (plan limit is ${targetMaxClients}). Please archive unused clients first.`
      });
    }

    const isUpgrade = PLANS[planKey].monthlyPrice >= (PLANS[therapist.subscriptionPlan]?.monthlyPrice || 0);

    therapist.subscriptionPlan = planKey;
    therapist.subscriptionStatus = 'active';
    therapist.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await therapist.save();

    res.status(200).json({
      success: true,
      message: isUpgrade
        ? `Successfully upgraded to ${PLANS[planKey].name} plan!`
        : `Successfully switched to ${PLANS[planKey].name} plan.`,
      subscriptionPlan: therapist.subscriptionPlan,
      subscriptionStatus: therapist.subscriptionStatus
    });
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    if (therapist.subscriptionPlan === 'FREE') {
      return res.status(400).json({ success: false, message: 'You are currently on the Free plan.' });
    }

    therapist.subscriptionStatus = 'cancelled';
    await therapist.save();

    res.status(200).json({
      success: true,
      message: `Your ${PLANS[therapist.subscriptionPlan].name} plan subscription has been cancelled. You retain access until ${therapist.subscriptionExpiresAt ? new Date(therapist.subscriptionExpiresAt).toLocaleDateString() : 'the end of billing period'}.`,
      subscriptionStatus: 'cancelled'
    });
  } catch (error) {
    next(error);
  }
};

const reactivateSubscription = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    therapist.subscriptionStatus = 'active';
    if (!therapist.subscriptionExpiresAt || new Date(therapist.subscriptionExpiresAt) < new Date()) {
      therapist.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    await therapist.save();

    res.status(200).json({
      success: true,
      message: 'Subscription has been reactivated successfully.',
      subscriptionStatus: 'active'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  getMyEntitlements,
  upgradePlan,
  cancelSubscription,
  reactivateSubscription
};

