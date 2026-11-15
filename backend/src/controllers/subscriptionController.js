const PLANS = require('../constants/plans');
const mongoose = require('mongoose');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const entitlementService = require('../services/EntitlementService');
const paymentService = require('../services/PaymentService');
const { activateSubscriptionForPayment } = require('../services/SubscriptionService');

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

// Create a Razorpay order for upgrading/purchasing a paid subscription
const createSubscriptionOrder = async (req, res, next) => {
  try {
    const { planKey } = req.body;
    if (!planKey || !PLANS[planKey]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan selected.' });
    }

    if (planKey === 'FREE') {
      return res.status(400).json({ success: false, message: 'Free plan does not require payment. Use the switch-to-free option.' });
    }

    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    if (therapist.subscriptionPlan === planKey && therapist.subscriptionStatus === 'active') {
      return res.status(400).json({ success: false, message: `You are already subscribed to the ${PLANS[planKey].name} plan.` });
    }

    // Check client limit if downgrading to a lower paid tier
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

    const planPrice = PLANS[planKey].monthlyPrice;

    // Create Razorpay order
    const order = await paymentService.createOrder({
      amount: planPrice,
      currency: 'INR',
      receipt: `sub_${therapist._id.toString().substring(0, 10)}_${Date.now()}`,
      notes: {
        therapistId: therapist._id.toString(),
        planKey,
        type: 'SUBSCRIPTION'
      }
    });

    const payment = await Payment.create({
      therapistId: therapist._id,
      clientId: null,
      amount: planPrice,
      currency: 'INR',
      gateway: 'Razorpay',
      orderId: order.id,
      status: 'created',
      type: 'SUBSCRIPTION',
      planKey
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: planPrice,
      currency: 'INR',
      keyId: paymentService.isConfigured() ? paymentService.keyId : null,
      paymentRecordId: payment._id,
      plan: {
        key: planKey,
        name: PLANS[planKey].name,
        price: planPrice
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify Razorpay payment and activate paid subscription
const verifySubscriptionPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, planKey, paymentRecordId } = req.body;

    if (!orderId || !paymentId || !signature || !planKey) {
      return res.status(400).json({
        success: false,
        message: 'orderId, paymentId, signature, and planKey are required for verification.'
      });
    }

    if (!PLANS[planKey] || planKey === 'FREE') {
      return res.status(400).json({ success: false, message: 'Invalid planKey.' });
    }

    const isValid = paymentService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    if (paymentRecordId && !mongoose.isValidObjectId(paymentRecordId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment record ID.' });
    }

    const paymentQuery = {
      orderId,
      therapistId: req.user.id,
      type: 'SUBSCRIPTION',
      planKey
    };
    if (paymentRecordId) paymentQuery._id = paymentRecordId;
    const payment = await Payment.findOne(paymentQuery);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (payment.amount !== PLANS[planKey].monthlyPrice || payment.currency !== 'INR') {
      return res.status(409).json({ success: false, message: 'Payment amount does not match the selected plan.' });
    }

    if (payment.status === 'captured') {
      if (payment.paymentId !== paymentId) {
        return res.status(409).json({ success: false, message: 'This order has already been captured with a different payment.' });
      }
    } else if (payment.status !== 'created') {
      return res.status(409).json({ success: false, message: 'This payment is no longer available for verification.' });
    } else {
      payment.paymentId = paymentId;
      payment.status = 'captured';

      let retries = 0;
      while (retries < 3) {
        try {
          payment.invoiceNumber = payment.invoiceNumber || paymentService.generateInvoiceNumber();
          await payment.save();
          break;
        } catch (e) {
          if (e.code !== 11000 || retries === 2) throw e;
          payment.invoiceNumber = null;
          retries++;
        }
      }
    }

    const therapist = await activateSubscriptionForPayment(payment);

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${PLANS[planKey].name} plan!`,
      subscriptionPlan: therapist.subscriptionPlan,
      subscriptionStatus: therapist.subscriptionStatus,
      invoiceNumber: payment.invoiceNumber
    });
  } catch (error) {
    next(error);
  }
};

// Switch / Downgrade to FREE plan (no payment required)
const switchFreePlan = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    if (therapist.subscriptionPlan === 'FREE') {
      return res.status(400).json({ success: false, message: 'You are already on the Free Starter plan.' });
    }

    const currentClients = await Client.countDocuments({
      therapistId: therapist._id,
      status: { $ne: 'archived' }
    });

    const freeMaxClients = PLANS.FREE.limits.maxClients;
    if (currentClients > freeMaxClients) {
      return res.status(400).json({
        success: false,
        message: `Cannot switch to Free Starter because you currently have ${currentClients} active clients (free limit is ${freeMaxClients}). Please archive unused clients first.`
      });
    }

    therapist.subscriptionPlan = 'FREE';
    therapist.subscriptionStatus = 'active';
    therapist.subscriptionExpiresAt = null;
    await therapist.save();

    res.status(200).json({
      success: true,
      message: 'Successfully switched to Free Starter plan.',
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'active'
    });
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
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
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
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
  createSubscriptionOrder,
  verifySubscriptionPayment,
  switchFreePlan,
  cancelSubscription,
  reactivateSubscription
};
