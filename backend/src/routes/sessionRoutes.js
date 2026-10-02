const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
    getSessions,
    createSession,
    updateSessionStatus,
    getClientSessions
} = require('../controllers/sessionController');

// CLIENT route — must come before /:id wildcards (none here, but good practice)
router.get('/mine', authenticate, authorize('CLIENT'), getClientSessions);

// THERAPIST routes
router.get('/', authenticate, authorize('THERAPIST'), getSessions);
router.post('/', authenticate, authorize('THERAPIST'), createSession);
router.put('/:id', authenticate, authorize('THERAPIST'), updateSessionStatus);

module.exports = router;