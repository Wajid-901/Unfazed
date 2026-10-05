const Notification = require('../models/Notification');
const { sendSocketNotification } = require('../sockets/socketHandler');

class NotificationService {
  async create({ recipientId, recipientModel, title, message, type = 'SYSTEM', metadata = {} }) {
    try {
      if (!recipientId || !recipientModel || !title || !message) {
        console.warn('[NotificationService] Missing required fields for notification');
        return null;
      }

      const notification = await Notification.create({
        recipientId,
        recipientModel,
        title,
        message,
        type,
        metadata,
        isRead: false
      });

      sendSocketNotification(recipientId, notification);
      return notification;
    } catch (err) {
      console.error('[NotificationService] Failed to create notification:', err.message);
      return null;
    }
  }

  async markRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipientId: userId
      });
      if (!notification) return null;
      notification.isRead = true;
      await notification.save();
      return notification;
    } catch (err) {
      console.error('[NotificationService] markRead error:', err.message);
      return null;
    }
  }

  async markAllRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
      );
      return { success: true, count: result.modifiedCount };
    } catch (err) {
      console.error('[NotificationService] markAllRead error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async getForUser(userId, limit = 20) {
    try {
      const safeLimit = Math.min(parseInt(limit) || 20, 100);
      return await Notification.find({ recipientId: userId })
        .sort({ isRead: 1, createdAt: -1 })
        .limit(safeLimit);
    } catch (err) {
      console.error('[NotificationService] getForUser error:', err.message);
      return [];
    }
  }

  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ recipientId: userId, isRead: false });
    } catch (err) {
      console.error('[NotificationService] getUnreadCount error:', err.message);
      return 0;
    }
  }
}

module.exports = new NotificationService();
