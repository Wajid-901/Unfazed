const paymentService = require('../services/PaymentService');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Session = require('../models/Session');
const Client = require('../models/Client');
const notificationService = require('../services/NotificationService');
const { activateSubscriptionForPayment } = require('../services/SubscriptionService');
const { invalidateCache } = require('./analyticsController');

// Create Razorpay order for a therapy session
const createSessionOrder = async (req, res, next) => {
    try {
        const {
            sessionId
        } = req.body;
        if (!mongoose.isValidObjectId(sessionId)) {
            return res.status(400).json({
                success: false,
                message: 'A valid sessionId is required'
            });
        }

        const session = await Session.findById(sessionId).populate('therapistId clientId');
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (!session.clientId || !session.therapistId) {
            return res.status(404).json({
                success: false,
                message: 'Session participants could not be found.'
            });
        }

        if (session.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Session has already been paid for'
            });
        }

        if (session.status !== 'scheduled' || session.paymentStatus !== 'pending') {
            return res.status(409).json({
                success: false,
                message: 'Only scheduled, unpaid sessions can be paid.'
            });
        }

        if (session.clientId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only pay for your own sessions.'
            });
        }

        if (!Number.isFinite(session.amount) || session.amount <= 0 || session.currency !== 'INR') {
            return res.status(400).json({
                success: false,
                message: 'The session has an invalid payment amount or currency.'
            });
        }

        const order = await paymentService.createOrder({
            amount: session.amount,
            currency: session.currency || 'INR',
            receipt: `sess_${session._id}`,
            notes: {
                sessionId: session._id.toString(),
                therapistId: session.therapistId._id.toString(),
                clientId: session.clientId._id.toString()
            }
        });

        const payment = await Payment.create({
            clientId: session.clientId._id,
            therapistId: session.therapistId._id,
            sessionId: session._id,
            type: 'SESSION',
            amount: session.amount,
            currency: session.currency || 'INR',
            gateway: 'Razorpay',
            orderId: order.id,
            status: 'created'
        });

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: session.amount,
            currency: session.currency || 'INR',
            keyId: paymentService.isConfigured() ? paymentService.keyId : null,
            paymentRecordId: payment._id,
            session: {
                id: session._id,
                date: session.date,
                startTime: session.startTime,
                therapistName: session.therapistId.name
            }
        });
    } catch (error) {
        next(error);
    }
};

// Verify payment signature after Razorpay checkout success
const verifyPayment = async (req, res, next) => {
    try {
        const {
            orderId,
            paymentId,
            signature,
            paymentRecordId
        } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({
                success: false,
                message: 'orderId, paymentId, and signature are required for verification.'
            });
        }

        const isValid = paymentService.verifyPaymentSignature({
            orderId,
            paymentId,
            signature
        });
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature.'
            });
        }

        if (paymentRecordId && !mongoose.isValidObjectId(paymentRecordId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment record ID.'
            });
        }

        const paymentQuery = {
            orderId,
            clientId: req.user.id,
            type: 'SESSION'
        };
        if (paymentRecordId) paymentQuery._id = paymentRecordId;
        const payment = await Payment.findOne(paymentQuery);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found.'
            });
        }

        if (payment.status === 'captured') {
            if (payment.paymentId !== paymentId) {
                return res.status(409).json({
                    success: false,
                    message: 'This order has already been captured with a different payment.'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Payment was already verified.',
                payment: {
                    id: payment._id,
                    orderId: payment.orderId,
                    paymentId: payment.paymentId,
                    status: payment.status,
                    amount: payment.amount,
                    currency: payment.currency,
                    invoiceNumber: payment.invoiceNumber
                }
            });
        }

        if (payment.status !== 'created') {
            return res.status(409).json({
                success: false,
                message: 'This payment is no longer available for verification.'
            });
        }

        payment.paymentId = paymentId;
        payment.status = 'captured';

        let retries = 0;
        while (retries < 3) {
            try {
                payment.invoiceNumber = payment.invoiceNumber || paymentService.generateInvoiceNumber();
                await payment.save();
                break;
            } catch (e) {
                if (e.code !== 11000 || retries === 2) throw e;
                payment.invoiceNumber = null;
                retries++;
            }
        }

        if (payment.sessionId) {
            await Session.findByIdAndUpdate(payment.sessionId, {
                paymentStatus: 'paid'
            });
        }

        invalidateCache(payment.therapistId);
        const clientObj = await Client.findById(payment.clientId).select('name');
        await notificationService.create({
            recipientId: payment.therapistId,
            recipientModel: 'Therapist',
            title: 'Payment Received',
            message: `${clientObj?.name || 'A client'} completed payment of ₹${payment.amount}.`,
            type: 'PAYMENT',
            metadata: { paymentId: payment._id, amount: payment.amount, invoiceNumber: payment.invoiceNumber }
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified and captured successfully.',
            payment: {
                id: payment._id,
                orderId: payment.orderId,
                paymentId: payment.paymentId,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                invoiceNumber: payment.invoiceNumber
            }
        });
    } catch (error) {
        next(error);
    }
};

// Webhook handler for async Razorpay payment events
const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.rawBody;

        const isValid = paymentService.verifyWebhookSignature({
            rawBody,
            signature
        });
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        const event = req.body?.event;
        const paymentEntity = req.body?.payload?.payment?.entity;

        if (event === 'payment.captured' && paymentEntity?.order_id && paymentEntity?.id) {
            const p = paymentEntity;
            const payment = await Payment.findOne({
                orderId: p.order_id
            });
            if (payment) {
                if (
                    p.amount !== Math.round(payment.amount * 100) ||
                    p.currency !== payment.currency
                ) {
                    return res.status(400).json({
                        success: false,
                        message: 'Webhook amount or currency does not match the payment order.'
                    });
                }

                const newlyCaptured = payment.status !== 'captured';
                if (newlyCaptured) {
                    payment.status = 'captured';
                    payment.paymentId = p.id;
                    let hookRetries = 0;
                    while (hookRetries < 3) {
                        try {
                            payment.invoiceNumber = payment.invoiceNumber || paymentService.generateInvoiceNumber();
                            await payment.save();
                            break;
                        } catch (e) {
                            if (e.code !== 11000 || hookRetries === 2) throw e;
                            payment.invoiceNumber = null;
                            hookRetries++;
                        }
                    }
                }

                if (payment.sessionId) {
                    await Session.findByIdAndUpdate(payment.sessionId, {
                        paymentStatus: 'paid'
                    });
                } else if (payment.type === 'SUBSCRIPTION') {
                    await activateSubscriptionForPayment(payment);
                }
                invalidateCache(payment.therapistId);
                if (newlyCaptured && payment.sessionId) {
                    const hookClient = await Client.findById(payment.clientId).select('name');
                    await notificationService.create({
                        recipientId: payment.therapistId,
                        recipientModel: 'Therapist',
                        title: 'Payment Received',
                        message: `${hookClient?.name || 'A client'} completed payment of ₹${payment.amount}.`,
                        type: 'PAYMENT',
                        metadata: { paymentId: payment._id, amount: payment.amount, invoiceNumber: payment.invoiceNumber }
                    });
                }
            }
        } else if (event === 'payment.failed' && paymentEntity?.order_id) {
            const p = paymentEntity;
            const payment = await Payment.findOne({
                orderId: p.order_id
            });
            if (payment?.status === 'created') {
                payment.status = 'failed';
                await payment.save();
            }
        }

        res.status(200).json({
            status: 'ok'
        });
    } catch (error) {
        next(error);
    }
};

// Get all payment transactions for therapist billing dashboard
const getTherapistPayments = async (req, res, next) => {
    try {
        const therapistId = req.user.id;
        const payments = await Payment.find({
                therapistId,
                type: 'SESSION',
                clientId: { $ne: null }
            })
            .populate('clientId', 'name email phone')
            .populate('sessionId', 'date startTime duration status')
            .sort({
                createdAt: -1
            });

        const totalRevenue = payments
            .filter((p) => p.status === 'captured')
            .reduce((sum, p) => sum + p.amount, 0);

        res.status(200).json({
            success: true,
            payments,
            summary: {
                totalRevenue,
                totalTransactions: payments.length,
                capturedCount: payments.filter((p) => p.status === 'captured').length
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get single invoice for printing or client/therapist view
const getInvoiceDetails = async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid invoice ID.' });
        }
        const payment = await Payment.findById(id)
            .populate('therapistId', 'name title clinicAddress phone email')
            .populate('clientId', 'name email phone')
            .populate('sessionId', 'date startTime endTime duration');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        const userId = req.user.id;
        const isOwnerTherapist = payment.therapistId?._id?.toString() === userId;
        const isOwnerClient = payment.clientId?._id?.toString() === userId;

        if (!isOwnerTherapist && !isOwnerClient) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this invoice'
            });
        }

        if (payment.status !== 'captured') {
            return res.status(409).json({
                success: false,
                message: 'An invoice is available only after payment has been captured.'
            });
        }

        res.status(200).json({
            success: true,
            invoice: {
                invoiceNumber: payment.invoiceNumber || `INV-${payment._id.toString().substring(0, 6).toUpperCase()}`,
                date: payment.createdAt,
                type: payment.type,
                planKey: payment.planKey,
                therapist: payment.therapistId,
                client: payment.clientId || null,
                session: payment.sessionId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                gateway: payment.gateway,
                transactionId: payment.paymentId || payment.orderId
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get payment history for a logged-in client
const getClientPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({
                clientId: req.user.id,
                type: 'SESSION'
            })
            .populate('sessionId', 'date startTime duration status')
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            payments
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSessionOrder,
    verifyPayment,
    handleWebhook,
    getTherapistPayments,
    getInvoiceDetails,
    getClientPayments
};