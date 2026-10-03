const sessionController = require('../../src/controllers/sessionController');
const Session = require('../../src/models/Session');
const Client = require('../../src/models/Client');
const Availability = require('../../src/models/Availability');
const notificationService = require('../../src/services/NotificationService');
const { invalidateCache } = require('../../src/controllers/analyticsController');

jest.mock('../../src/models/Session');
jest.mock('../../src/models/Client');
jest.mock('../../src/models/Availability');
jest.mock('../../src/services/NotificationService', () => ({
  create: jest.fn().mockResolvedValue({})
}));
jest.mock('../../src/controllers/analyticsController', () => ({
  invalidateCache: jest.fn()
}));

describe('sessionController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 'therapist_1' },
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('createSession availability checks', () => {
    it('should return 400 if date or startTime is missing', async () => {
      req.body = { clientId: 'client_1' };
      await sessionController.createSession(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Date and start time are required.' })
      );
    });

    it('should return 404 if client not found for therapist', async () => {
      req.body = { clientId: 'client_1', date: '2026-10-12', startTime: '10:00' };
      Client.findOne.mockResolvedValue(null);

      await sessionController.createSession(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Client not found' })
      );
    });

    it('should return 400 if therapist is not available on selected day', async () => {
      // 2026-10-11 is Sunday (dayIndex 0)
      req.body = { clientId: 'client_1', date: '2026-10-11', startTime: '10:00' };
      Client.findOne.mockResolvedValue({ _id: 'client_1' });
      Availability.findOne.mockResolvedValue({
        weeklySchedule: [
          { dayOfWeek: 0, isActive: false, slots: [] },
          { dayOfWeek: 1, isActive: true, slots: [{ start: '09:00', end: '17:00' }] }
        ]
      });

      await sessionController.createSession(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Therapist is not available on Sunday' })
      );
    });

    it('should return 400 if session time falls outside working hours slots', async () => {
      // 2026-10-12 is Monday (dayIndex 1)
      req.body = { clientId: 'client_1', date: '2026-10-12', startTime: '18:00', duration: 50 };
      Client.findOne.mockResolvedValue({ _id: 'client_1' });
      Availability.findOne.mockResolvedValue({
        weeklySchedule: [
          { dayOfWeek: 1, isActive: true, slots: [{ start: '09:00', end: '17:00' }] }
        ]
      });

      await sessionController.createSession(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('outside working hours') })
      );
    });

    it('should create session and invalidate cache when slot is within availability', async () => {
      // 2026-10-12 Monday 10:00
      req.body = { clientId: 'client_1', date: '2026-10-12', startTime: '10:00', duration: 50 };
      Client.findOne.mockResolvedValue({ _id: 'client_1' });
      Availability.findOne.mockResolvedValue({
        weeklySchedule: [
          { dayOfWeek: 1, isActive: true, slots: [{ start: '09:00', end: '17:00' }] }
        ]
      });

      const mockSession = { _id: 'sess_1', date: '2026-10-12', startTime: '10:00' };
      Session.create.mockResolvedValue(mockSession);
      Session.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ ...mockSession, clientId: { name: 'Client A' } })
      });

      await sessionController.createSession(req, res, next);

      expect(Session.create).toHaveBeenCalled();
      expect(invalidateCache).toHaveBeenCalledWith('therapist_1');
      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({ recipientId: 'client_1', type: 'BOOKING' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('cancelClientSession', () => {
    it('should return 404 if session does not belong to client', async () => {
      req.user = { id: 'client_user_1', role: 'CLIENT' };
      req.params = { id: 'sess_999' };
      Session.findOne.mockResolvedValue(null);

      await sessionController.cancelClientSession(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if session is not in scheduled state', async () => {
      req.user = { id: 'client_user_1', role: 'CLIENT' };
      req.params = { id: 'sess_1' };
      Session.findOne.mockResolvedValue({
        _id: 'sess_1',
        clientId: 'client_user_1',
        status: 'completed'
      });

      await sessionController.cancelClientSession(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Only scheduled sessions can be cancelled' })
      );
    });

    it('should cancel scheduled session, notify therapist, and invalidate analytics cache', async () => {
      req.user = { id: 'client_user_1', role: 'CLIENT' };
      req.params = { id: 'sess_1' };
      req.body = { reason: 'Schedule conflict' };

      const mockSessionDoc = {
        _id: 'sess_1',
        clientId: 'client_user_1',
        therapistId: 'therapist_1',
        date: '2026-10-12',
        startTime: '10:00',
        status: 'scheduled',
        save: jest.fn().mockResolvedValue(true)
      };

      Session.findOne.mockResolvedValue(mockSessionDoc);
      Client.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ name: 'Alice Client' })
      });

      await sessionController.cancelClientSession(req, res, next);

      expect(mockSessionDoc.status).toBe('cancelled');
      expect(mockSessionDoc.cancelledBy).toBe('client');
      expect(mockSessionDoc.cancellationReason).toBe('Schedule conflict');
      expect(mockSessionDoc.save).toHaveBeenCalled();
      expect(invalidateCache).toHaveBeenCalledWith('therapist_1');
      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'therapist_1',
          recipientModel: 'Therapist',
          type: 'BOOKING'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
