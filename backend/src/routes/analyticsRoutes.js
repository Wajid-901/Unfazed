const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { getAnalyticsDashboard } = require('../controllers/analyticsController');

// All analytics routes require therapist authentication
router.use(authenticate, authorize('THERAPIST'));

router.get('/dashboard', getAnalyticsDashboard);
router.get('/revenue', getAnalyticsDashboard); // Convenience alias
router.get('/clients', getAnalyticsDashboard); // Convenience alias

module.exports = router;
