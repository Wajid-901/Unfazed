const chatController = require('../../src/controllers/chatController');
const Chat = require('../../src/models/Chat');

jest.mock('../../src/models/Chat');
jest.mock('../../src/models/Client');
jest.mock('../../src/models/Therapist');

describe('chatController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 'user_123', role: 'THERAPIST' },
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('getMessages cursor pagination', () => {
    it('should return 403 if user is not a member of the conversation', async () => {
      req.params = { conversationId: 'therapist999_client888' };
      req.user = { id: 'intruder_777' };

      await chatController.getMessages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unauthorized access to conversation' })
      );
    });

    it('should return paginated messages, hasMore, and nextCursor', async () => {
      req.params = { conversationId: 'user_123_client_456' };
      req.query = { limit: '2' };

      const time1 = new Date('2026-10-01T10:00:00Z');
      const time2 = new Date('2026-10-01T10:05:00Z');
      const time3 = new Date('2026-10-01T10:10:00Z');

      // Return 3 raw messages (limit + 1) to test hasMore
      const mockRawMessages = [
        { _id: 'm3', message: 'Third msg', createdAt: time3 },
        { _id: 'm2', message: 'Second msg', createdAt: time2 },
        { _id: 'm1', message: 'First msg', createdAt: time1 }
      ];

      const limitMock = jest.fn().mockResolvedValue(mockRawMessages);
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      Chat.find.mockReturnValue({ sort: sortMock });
      Chat.updateMany.mockResolvedValue({ modifiedCount: 1 });

      await chatController.getMessages(req, res, next);

      expect(Chat.find).toHaveBeenCalledWith(expect.objectContaining({
        conversationId: 'user_123_client_456'
      }));
      expect(limitMock).toHaveBeenCalledWith(3); // limit(2 + 1)
      expect(Chat.updateMany).toHaveBeenCalledWith(
        {
          conversationId: 'user_123_client_456',
          receiverId: 'user_123',
          status: { $ne: 'read' }
        },
        expect.objectContaining({ status: 'read' })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          hasMore: true,
          nextCursor: time2
        })
      );
    });

    it('should filter by before timestamp if query parameter is provided', async () => {
      const beforeStr = '2026-10-01T12:00:00.000Z';
      req.params = { conversationId: 'user_123_client_456' };
      req.query = { before: beforeStr };

      const limitMock = jest.fn().mockResolvedValue([]);
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      Chat.find.mockReturnValue({ sort: sortMock });
      Chat.updateMany.mockResolvedValue({ modifiedCount: 0 });

      await chatController.getMessages(req, res, next);

      expect(Chat.find).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 'user_123_client_456',
          createdAt: { $lt: new Date(beforeStr) }
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
