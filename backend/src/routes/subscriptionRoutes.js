const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  getPlans,
  getMyEntitlements,
  upgradePlan,
  cancelSubscription,
  reactivateSubscription
} = require('../controllers/subscriptionController');

// Public route to view plans
router.get('/plans', getPlans);

// Protected routes for therapist subscription lifecycle
router.get('/entitlements', authenticate, authorize('THERAPIST'), getMyEntitlements);
router.post('/upgrade', authenticate, authorize('THERAPIST'), upgradePlan);
router.post('/cancel', authenticate, authorize('THERAPIST'), cancelSubscription);
router.post('/reactivate', authenticate, authorize('THERAPIST'), reactivateSubscription);

module.exports = router;

