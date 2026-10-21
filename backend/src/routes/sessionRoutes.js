const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
    getSessions,
    createSession,
    updateSessionStatus,
    getClientSessions,
    cancelClientSession,
    approveSession,
    rejectSession
} = require('../controllers/sessionController');

// CLIENT routes
router.get('/mine', authenticate, authorize('CLIENT'), getClientSessions);
router.patch('/:id/cancel', authenticate, authorize('CLIENT'), cancelClientSession);

// THERAPIST routes
router.get('/', authenticate, authorize('THERAPIST'), getSessions);
router.post('/', authenticate, authorize('THERAPIST'), createSession);
router.patch('/:id/approve', authenticate, authorize('THERAPIST'), approveSession);
router.patch('/:id/reject', authenticate, authorize('THERAPIST'), rejectSession);
router.put('/:id', authenticate, authorize('THERAPIST'), updateSessionStatus);

module.exports = router;