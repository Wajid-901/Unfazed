const notificationService = require('../../src/services/NotificationService');
const Notification = require('../../src/models/Notification');
const { sendSocketNotification } = require('../../src/sockets/socketHandler');

jest.mock('../../src/models/Notification');
jest.mock('../../src/sockets/socketHandler', () => ({
  sendSocketNotification: jest.fn()
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create notification and broadcast via socket', async () => {
      const mockCreated = {
        _id: 'notif_123',
        recipientId: 'user_456',
        recipientModel: 'Therapist',
        title: 'New Booking',
        message: 'A client booked a session',
        type: 'BOOKING',
        isRead: false
      };

      Notification.create.mockResolvedValue(mockCreated);

      const result = await notificationService.create({
        recipientId: 'user_456',
        recipientModel: 'Therapist',
        title: 'New Booking',
        message: 'A client booked a session',
        type: 'BOOKING'
      });

      expect(Notification.create).toHaveBeenCalledWith({
        recipientId: 'user_456',
        recipientModel: 'Therapist',
        title: 'New Booking',
        message: 'A client booked a session',
        type: 'BOOKING',
        metadata: {},
        isRead: false
      });
      expect(sendSocketNotification).toHaveBeenCalledWith('user_456', mockCreated);
      expect(result).toEqual(mockCreated);
    });

    it('should return null when required fields are missing', async () => {
      const result = await notificationService.create({
        recipientId: 'user_456',
        title: 'Missing message and recipientModel'
      });
      expect(result).toBeNull();
      expect(Notification.create).not.toHaveBeenCalled();
    });
  });

  describe('markRead', () => {
    it('should find and mark notification as read', async () => {
      const mockDoc = {
        _id: 'notif_123',
        recipientId: 'user_456',
        isRead: false,
        save: jest.fn().mockResolvedValue(true)
      };

      Notification.findOne.mockResolvedValue(mockDoc);

      const result = await notificationService.markRead('notif_123', 'user_456');

      expect(Notification.findOne).toHaveBeenCalledWith({
        _id: 'notif_123',
        recipientId: 'user_456'
      });
      expect(mockDoc.isRead).toBe(true);
      expect(mockDoc.save).toHaveBeenCalled();
      expect(result).toBe(mockDoc);
    });

    it('should return null if notification not found', async () => {
      Notification.findOne.mockResolvedValue(null);
      const result = await notificationService.markRead('notif_missing', 'user_456');
      expect(result).toBeNull();
    });
  });

  describe('markAllRead', () => {
    it('should update all unread notifications for recipient', async () => {
      Notification.updateMany.mockResolvedValue({ modifiedCount: 5 });

      const result = await notificationService.markAllRead('user_456');

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { recipientId: 'user_456', isRead: false },
        { isRead: true }
      );
      expect(result).toEqual({ success: true, count: 5 });
    });
  });

  describe('getForUser and getUnreadCount', () => {
    it('should query unread count', async () => {
      Notification.countDocuments.mockResolvedValue(3);
      const count = await notificationService.getUnreadCount('user_456');
      expect(count).toBe(3);
      expect(Notification.countDocuments).toHaveBeenCalledWith({
        recipientId: 'user_456',
        isRead: false
      });
    });
  });
});
