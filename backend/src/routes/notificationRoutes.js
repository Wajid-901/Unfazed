const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require('../controllers/notificationController');

// All notification endpoints require authentication (clients & therapists)
router.get('/', authenticate, getNotifications);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.patch('/:id/read', authenticate, markNotificationRead);

module.exports = router;
