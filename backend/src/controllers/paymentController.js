const paymentService = require('../services/PaymentService');
const Payment = require('../models/Payment');
const Session = require('../models/Session');

// Create Razorpay order for a therapy session
const createSessionOrder = async (req, res, next) => {
    try {
        const {
            sessionId
        } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'sessionId is required'
            });
        }

        const session = await Session.findById(sessionId).populate('therapistId clientId');
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (session.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Session has already been paid for'
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
            keyId: process.env.RAZORPAY_KEY_ID,
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

        let payment = paymentRecordId ? await Payment.findById(paymentRecordId) : null;
        if (!payment) payment = await Payment.findOne({
            orderId
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found.'
            });
        }

        const invoiceNumber = paymentService.generateInvoiceNumber();
        payment.paymentId = paymentId;
        payment.signature = signature;
        payment.status = 'captured';
        payment.invoiceNumber = invoiceNumber;
        await payment.save();

        if (payment.sessionId) {
            await Session.findByIdAndUpdate(payment.sessionId, {
                paymentStatus: 'paid'
            });
        }

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
        const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

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

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
            const p = payload.payment.entity;
            const payment = await Payment.findOne({
                orderId: p.order_id
            });
            if (payment && payment.status !== 'captured') {
                payment.status = 'captured';
                payment.paymentId = p.id;
                payment.invoiceNumber = payment.invoiceNumber || paymentService.generateInvoiceNumber();
                await payment.save();
                if (payment.sessionId) {
                    await Session.findByIdAndUpdate(payment.sessionId, {
                        paymentStatus: 'paid'
                    });
                }
            }
        } else if (event === 'payment.failed') {
            const p = payload.payment.entity;
            const payment = await Payment.findOne({
                orderId: p.order_id
            });
            if (payment) {
                payment.status = 'failed';
                await payment.save();
            }
        }

        res.status(200).json({
            status: 'ok'
        });
    } catch (error) {
        console.error('[Payment Webhook Error]:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing error'
        });
    }
};

// Get all payment transactions for therapist billing dashboard
const getTherapistPayments = async (req, res, next) => {
    try {
        const therapistId = req.user.id;
        const payments = await Payment.find({
                therapistId
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
        const isOwnerTherapist = payment.therapistId._id.toString() === userId;
        const isOwnerClient = payment.clientId._id.toString() === userId;

        if (!isOwnerTherapist && !isOwnerClient) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this invoice'
            });
        }

        res.status(200).json({
            success: true,
            invoice: {
                invoiceNumber: payment.invoiceNumber || `INV-${payment._id.toString().substring(0, 6).toUpperCase()}`,
                date: payment.createdAt,
                therapist: payment.therapistId,
                client: payment.clientId,
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
                clientId: req.user.id
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