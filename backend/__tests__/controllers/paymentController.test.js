const paymentController = require('../../src/controllers/paymentController');
const paymentService = require('../../src/services/PaymentService');
const Payment = require('../../src/models/Payment');
const Session = require('../../src/models/Session');
const Client = require('../../src/models/Client');
const notificationService = require('../../src/services/NotificationService');
const { invalidateCache } = require('../../src/controllers/analyticsController');

jest.mock('../../src/services/PaymentService');
jest.mock('../../src/models/Payment');
jest.mock('../../src/models/Session');
jest.mock('../../src/models/Client');
jest.mock('../../src/services/NotificationService', () => ({
  create: jest.fn().mockResolvedValue({})
}));
jest.mock('../../src/controllers/analyticsController', () => ({
  invalidateCache: jest.fn()
}));

describe('paymentController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 'client_123', role: 'CLIENT' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('createSessionOrder', () => {
    it('should return 400 if sessionId is missing', async () => {
      req.body = {};
      await paymentController.createSessionOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if session not found', async () => {
      req.body = { sessionId: 'sess_123' };
      Session.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await paymentController.createSessionOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if session is already paid', async () => {
      req.body = { sessionId: 'sess_123' };
      Session.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          paymentStatus: 'paid'
        })
      });

      await paymentController.createSessionOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Session has already been paid for' })
      );
    });

    it('should return 403 if client is attempting to pay for another client session', async () => {
      req.body = { sessionId: 'sess_123' };
      Session.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          paymentStatus: 'pending',
          clientId: { _id: { toString: () => 'other_client_999' } }
        })
      });

      await paymentController.createSessionOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Forbidden') })
      );
    });

    it('should create order and payment record when client owns the session', async () => {
      req.body = { sessionId: 'sess_123' };
      const mockSession = {
        _id: 'sess_123',
        amount: 2000,
        currency: 'INR',
        paymentStatus: 'pending',
        date: '2026-10-15',
        startTime: '11:00',
        clientId: { _id: { toString: () => 'client_123' } },
        therapistId: { _id: { toString: () => 'therapist_456' }, name: 'Dr. Jane' }
      };

      Session.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSession)
      });
      paymentService.createOrder.mockResolvedValue({ id: 'order_rzp_123' });
      Payment.create.mockResolvedValue({ _id: 'pay_rec_123' });

      await paymentController.createSessionOrder(req, res, next);

      expect(paymentService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 2000, currency: 'INR' })
      );
      expect(Payment.create).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order_rzp_123', status: 'created' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, orderId: 'order_rzp_123' })
      );
    });
  });

  describe('verifyPayment with duplicate invoice retry logic', () => {
    it('should retry invoice generation when MongoDB duplicate key error 11000 occurs', async () => {
      req.body = {
        orderId: 'order_123',
        paymentId: 'pay_123',
        signature: 'valid_sig_abc'
      };

      paymentService.verifyPaymentSignature.mockReturnValue(true);
      paymentService.generateInvoiceNumber
        .mockReturnValueOnce('INV-2026-111111')
        .mockReturnValueOnce('INV-2026-222222');

      const duplicateError = new Error('Duplicate invoice');
      duplicateError.code = 11000;

      let callCount = 0;
      const mockPaymentDoc = {
        _id: 'p_1',
        orderId: 'order_123',
        paymentId: 'pay_123',
        sessionId: 'sess_123',
        therapistId: 'therapist_1',
        clientId: 'client_123',
        amount: 2000,
        currency: 'INR',
        save: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(duplicateError);
          }
          return Promise.resolve(true);
        })
      };

      Payment.findById = jest.fn().mockResolvedValue(null);
      Payment.findOne = jest.fn().mockResolvedValue(mockPaymentDoc);
      Session.findByIdAndUpdate = jest.fn().mockResolvedValue({});
      Client.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ name: 'Client Alice' })
      });

      await paymentController.verifyPayment(req, res, next);

      expect(mockPaymentDoc.save).toHaveBeenCalledTimes(2);
      expect(mockPaymentDoc.status).toBe('captured');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
