const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  getPlans,
  getMyEntitlements,
  upgradePlan
} = require('../controllers/subscriptionController');

// Public route to view plans
router.get('/plans', getPlans);

// Protected routes for therapist
router.get('/entitlements', authenticate, authorize('THERAPIST'), getMyEntitlements);
router.post('/upgrade', authenticate, authorize('THERAPIST'), upgradePlan);

module.exports = router;
