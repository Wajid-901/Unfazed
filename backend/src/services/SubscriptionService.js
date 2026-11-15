const PLANS = require('../constants/plans');
const Therapist = require('../models/Therapist');
const notificationService = require('./NotificationService');

const BILLING_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const activateSubscriptionForPayment = async (payment) => {
  if (payment.type !== 'SUBSCRIPTION' || !PLANS[payment.planKey]) {
    throw new Error('Payment does not reference a valid subscription plan.');
  }

  const therapist = await Therapist.findById(payment.therapistId);
  if (!therapist) {
    const error = new Error('Therapist not found for subscription payment.');
    error.statusCode = 404;
    throw error;
  }

  const expiresAt = new Date(
    new Date(payment.createdAt || Date.now()).getTime() + BILLING_PERIOD_MS
  );
  const changed =
    therapist.subscriptionPlan !== payment.planKey ||
    therapist.subscriptionStatus !== 'active' ||
    therapist.subscriptionExpiresAt?.getTime() !== expiresAt.getTime();

  if (changed) {
    therapist.subscriptionPlan = payment.planKey;
    therapist.subscriptionStatus = 'active';
    therapist.subscriptionExpiresAt = expiresAt;
    await therapist.save();

    await notificationService.create({
      recipientId: therapist._id,
      recipientModel: 'Therapist',
      title: 'Subscription Activated',
      message: `Your ${PLANS[payment.planKey].name} subscription is now active! Payment of ₹${payment.amount} was confirmed.`,
      type: 'PAYMENT',
      metadata: {
        paymentId: payment._id,
        planKey: payment.planKey,
        invoiceNumber: payment.invoiceNumber
      }
    });
  }

  return therapist;
};

module.exports = { activateSubscriptionForPayment };
