const notificationService = require('../services/NotificationService');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 20;

    const [notifications, unreadCount] = await Promise.all([
      notificationService.getForUser(userId, limit),
      notificationService.getUnreadCount(userId)
    ]);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markRead(id, userId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
