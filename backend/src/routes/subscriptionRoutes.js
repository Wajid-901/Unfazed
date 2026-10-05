const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  getPlans,
  getMyEntitlements,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  switchFreePlan,
  cancelSubscription,
  reactivateSubscription
} = require('../controllers/subscriptionController');

// Public route to view plans
router.get('/plans', getPlans);

// Protected routes for therapist subscription lifecycle with Razorpay
router.get('/entitlements', authenticate, authorize('THERAPIST'), getMyEntitlements);
router.post('/create-order', authenticate, authorize('THERAPIST'), createSubscriptionOrder);
router.post('/verify-payment', authenticate, authorize('THERAPIST'), verifySubscriptionPayment);
router.post('/switch-free', authenticate, authorize('THERAPIST'), switchFreePlan);
router.post('/cancel', authenticate, authorize('THERAPIST'), cancelSubscription);
router.post('/reactivate', authenticate, authorize('THERAPIST'), reactivateSubscription);

module.exports = router;
