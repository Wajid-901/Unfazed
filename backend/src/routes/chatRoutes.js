const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getConversations, getMessages } = require('../controllers/chatController');

// All chat routes require authentication (both Therapist and Client can chat)
router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);

module.exports = router;
