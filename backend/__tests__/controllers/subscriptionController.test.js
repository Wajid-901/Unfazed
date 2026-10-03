const subscriptionController = require('../../src/controllers/subscriptionController');
const paymentService = require('../../src/services/PaymentService');
const Therapist = require('../../src/models/Therapist');
const Client = require('../../src/models/Client');
const Payment = require('../../src/models/Payment');
const notificationService = require('../../src/services/NotificationService');

jest.mock('../../src/services/PaymentService');
jest.mock('../../src/models/Therapist');
jest.mock('../../src/models/Client');
jest.mock('../../src/models/Payment');
jest.mock('../../src/services/NotificationService', () => ({
  create: jest.fn().mockResolvedValue({})
}));

describe('subscriptionController with Razorpay', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 'therapist_123', role: 'THERAPIST' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('createSubscriptionOrder', () => {
    it('should return 400 if planKey is invalid', async () => {
      req.body = { planKey: 'NON_EXISTENT_PLAN' };
      await subscriptionController.createSubscriptionOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Invalid subscription plan') })
      );
    });

    it('should return 400 if attempting to create paid order for FREE plan', async () => {
      req.body = { planKey: 'FREE' };
      await subscriptionController.createSubscriptionOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if active clients exceed plan capacity', async () => {
      req.body = { planKey: 'STARTER' }; // STARTER limit is 25 clients
      Therapist.findById.mockResolvedValue({
        _id: 'therapist_123',
        subscriptionPlan: 'PRO'
      });
      Client.countDocuments.mockResolvedValue(30); // 30 > 25

      await subscriptionController.createSubscriptionOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('active clients') })
      );
    });

    it('should create Razorpay order and Payment record for valid subscription tier', async () => {
      req.body = { planKey: 'PRO' };
      Therapist.findById.mockResolvedValue({
        _id: 'therapist_123',
        subscriptionPlan: 'FREE'
      });
      Client.countDocuments.mockResolvedValue(3);
      paymentService.createOrder.mockResolvedValue({ id: 'order_sub_rzp_123' });
      Payment.create.mockResolvedValue({ _id: 'pay_sub_rec_123' });

      await subscriptionController.createSubscriptionOrder(req, res, next);

      expect(paymentService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2499,
          currency: 'INR',
          notes: expect.objectContaining({ planKey: 'PRO', type: 'SUBSCRIPTION' })
        })
      );
      expect(Payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          therapistId: 'therapist_123',
          type: 'SUBSCRIPTION',
          planKey: 'PRO',
          amount: 2499
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, orderId: 'order_sub_rzp_123' })
      );
    });
  });

  describe('verifySubscriptionPayment', () => {
    it('should return 400 if payment signature is invalid', async () => {
      req.body = {
        orderId: 'order_sub_123',
        paymentId: 'pay_123',
        signature: 'fake_signature',
        planKey: 'PRO'
      };

      paymentService.verifyPaymentSignature.mockReturnValue(false);

      await subscriptionController.verifySubscriptionPayment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid payment signature.' })
      );
    });

    it('should capture payment, update therapist plan, and create notification on valid signature', async () => {
      req.body = {
        orderId: 'order_sub_123',
        paymentId: 'pay_123',
        signature: 'valid_signature',
        planKey: 'PRO'
      };

      paymentService.verifyPaymentSignature.mockReturnValue(true);
      paymentService.generateInvoiceNumber.mockReturnValue('INV-2026-999999');

      const mockPaymentDoc = {
        _id: 'pay_sub_123',
        therapistId: 'therapist_123',
        amount: 2499,
        status: 'created',
        save: jest.fn().mockResolvedValue(true)
      };

      Payment.findById.mockResolvedValue(null);
      Payment.findOne.mockResolvedValue(mockPaymentDoc);

      const mockTherapist = {
        _id: 'therapist_123',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'active',
        save: jest.fn().mockResolvedValue(true)
      };
      Therapist.findById.mockResolvedValue(mockTherapist);

      await subscriptionController.verifySubscriptionPayment(req, res, next);

      expect(mockPaymentDoc.status).toBe('captured');
      expect(mockPaymentDoc.paymentId).toBe('pay_123');
      expect(mockPaymentDoc.invoiceNumber).toBe('INV-2026-999999');
      expect(mockTherapist.subscriptionPlan).toBe('PRO');
      expect(mockTherapist.subscriptionStatus).toBe('active');
      expect(mockTherapist.save).toHaveBeenCalled();
      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'therapist_123',
          type: 'PAYMENT'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          subscriptionPlan: 'PRO'
        })
      );
    });
  });

  describe('switchFreePlan', () => {
    it('should return 400 if client count exceeds Free limit of 5', async () => {
      Therapist.findById.mockResolvedValue({
        _id: 'therapist_123',
        subscriptionPlan: 'PRO'
      });
      Client.countDocuments.mockResolvedValue(8); // 8 > 5

      await subscriptionController.switchFreePlan(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('active clients') })
      );
    });

    it('should switch plan to FREE when client count is within limits', async () => {
      const mockTherapist = {
        _id: 'therapist_123',
        subscriptionPlan: 'PRO',
        save: jest.fn().mockResolvedValue(true)
      };
      Therapist.findById.mockResolvedValue(mockTherapist);
      Client.countDocuments.mockResolvedValue(4);

      await subscriptionController.switchFreePlan(req, res, next);

      expect(mockTherapist.subscriptionPlan).toBe('FREE');
      expect(mockTherapist.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
