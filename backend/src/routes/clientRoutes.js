const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
    requireClientQuota
} = require('../middleware/entitlement');
const {
    getClients,
    getClientById,
    createClient,
    updateClient,
    archiveClient,
    resendInvite,
    getInviteLink,
    getMyProfile,
    updateMyProfile
} = require('../controllers/clientController');

const inviteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many invite requests, please try again in a minute.'
    }
});

// CLIENT-facing profile routes — must come BEFORE /:id to avoid wildcard collision
router.get('/profile', authenticate, authorize('CLIENT'), getMyProfile);
router.put('/profile', authenticate, authorize('CLIENT'), updateMyProfile);

// THERAPIST-only routes
router.get('/', authenticate, authorize('THERAPIST'), getClients);
router.post('/', authenticate, authorize('THERAPIST'), requireClientQuota, createClient);

// Specific sub-resource routes must come BEFORE bare /:id to avoid wildcard collision
router.post('/:id/resend-invite', authenticate, authorize('THERAPIST'), inviteLimiter, resendInvite);
router.get('/:id/invite-link', authenticate, authorize('THERAPIST'), inviteLimiter, getInviteLink);

router.get('/:id', authenticate, authorize('THERAPIST'), getClientById);
router.put('/:id', authenticate, authorize('THERAPIST'), updateClient);
router.delete('/:id', authenticate, authorize('THERAPIST'), archiveClient);

module.exports = router;
