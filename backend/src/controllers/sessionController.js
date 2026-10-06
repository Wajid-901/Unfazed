const Session = require('../models/Session');
const Client = require('../models/Client');
const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const Payment = require('../models/Payment');
const notificationService = require('../services/NotificationService');
const emailService = require('../services/EmailService');
const crypto = require('crypto');
const { invalidateCache } = require('./analyticsController');

const getSessions = async (req, res, next) => {
    try {
        const {
            startDate,
            endDate,
            status,
            clientId
        } = req.query;
        const query = {
            therapistId: req.user.id
        };

        if (clientId) query.clientId = clientId;
        if (status) query.status = status;

        if (startDate && endDate) {
            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        } else if (startDate) {
            query.date = {
                $gte: startDate
            };
        }

        const sessions = await Session.find(query)
            .populate('clientId', 'name email phone tags intakeData')
            .sort({
                date: 1,
                startTime: 1
            });

        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        next(error);
    }
};

const createSession = async (req, res, next) => {
    try {
        const {
            clientId,
            date,
            startTime,
            duration = 50,
            amount = 1500,
            meetingLink
        } = req.body;

        if (!date || !startTime) {
            return res.status(400).json({
                success: false,
                message: 'Date and start time are required.'
            });
        }

        const client = await Client.findOne({
            _id: clientId,
            therapistId: req.user.id
        });
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Availability check
        const avail = await Availability.findOne({ therapistId: req.user.id });
        if (avail && avail.weeklySchedule && avail.weeklySchedule.length > 0) {
            const dateObj = new Date(`${date}T00:00:00`);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid calendar date'
                });
            }
            const dayIndex = dateObj.getDay();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const daySchedule = avail.weeklySchedule.find((d) => d.dayOfWeek === dayIndex);

            if (daySchedule) {
                if (!daySchedule.isActive) {
                    return res.status(400).json({
                        success: false,
                        message: `Therapist is not available on ${dayNames[dayIndex]}`
                    });
                }

                if (daySchedule.slots && daySchedule.slots.length > 0) {
                    const [sh, sm] = startTime.split(':').map(Number);
                    const sessionStartMin = sh * 60 + sm;
                    const sessionEndMin = sessionStartMin + Number(duration);

                    const withinSlot = daySchedule.slots.some((slot) => {
                        const [slotSh, slotSm] = slot.start.split(':').map(Number);
                        const [slotEh, slotEm] = slot.end.split(':').map(Number);
                        const slotStartMin = slotSh * 60 + slotSm;
                        const slotEndMin = slotEh * 60 + slotEm;
                        return sessionStartMin >= slotStartMin && sessionEndMin <= slotEndMin;
                    });

                    if (!withinSlot) {
                        const slotsText = daySchedule.slots.map((s) => `${s.start}–${s.end}`).join(', ');
                        return res.status(400).json({
                            success: false,
                            message: `Time is outside working hours (${slotsText})`
                        });
                    }
                }
            }
        }

        const [h, m] = startTime.split(':').map(Number);
        const endMinutes = h * 60 + m + Number(duration);
        const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
        const endM = String(endMinutes % 60).padStart(2, '0');
        const endTime = `${endH}:${endM}`;

        const session = await Session.create({
            therapistId: req.user.id,
            clientId,
            date,
            startTime,
            endTime,
            duration: Number(duration),
            amount: Number(amount),
            meetingLink: meetingLink || '',
            status: 'scheduled',
            paymentStatus: 'pending'
        });

        const populated = await Session.findById(session._id).populate('clientId', 'name email phone');

        // Invalidate analytics cache and notify client
        invalidateCache(req.user.id);
        await notificationService.create({
            recipientId: clientId,
            recipientModel: 'Client',
            title: 'New Session Scheduled',
            message: `New session scheduled for ${date} at ${startTime}.`,
            type: 'BOOKING',
            metadata: { sessionId: session._id, date, startTime }
        });

        res.status(201).json({
            success: true,
            message: 'Session scheduled successfully',
            session: populated
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'A session is already scheduled for this time slot.'
            });
        }
        next(error);
    }
};

const updateSessionStatus = async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const {
            status,
            cancellationReason,
            paymentStatus
        } = req.body;

        const session = await Session.findOne({
            _id: id,
            therapistId: req.user.id
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (status) session.status = status;
        if (cancellationReason) session.cancellationReason = cancellationReason;
        if (paymentStatus) session.paymentStatus = paymentStatus;

        await session.save();

        invalidateCache(req.user.id);

        if (status === 'cancelled') {
            // Void any pending payment records so Pay Now is no longer shown
            await Payment.updateMany(
                { sessionId: session._id, status: 'created' },
                { $set: { status: 'failed' } }
            );
            await notificationService.create({
                recipientId: session.clientId,
                recipientModel: 'Client',
                title: 'Session Cancelled',
                message: `Your session scheduled for ${session.date} at ${session.startTime} has been cancelled by your therapist.`,
                type: 'BOOKING',
                metadata: { sessionId: session._id, cancelledBy: 'therapist' }
            });
        }

        if (status === 'completed') {
            await notificationService.create({
                recipientId: session.clientId,
                recipientModel: 'Client',
                title: 'Session Completed',
                message: 'Your therapy session has completed. Notes and follow-ups may be shared soon.',
                type: 'BOOKING',
                metadata: { sessionId: session._id }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session status updated',
            session
        });
    } catch (error) {
        next(error);
    }
};

const getClientSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({
                clientId: req.user.id
            })
            .populate('therapistId', 'name title')
            .sort({
                date: -1,
                startTime: -1
            });

        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        next(error);
    }
};

const cancelClientSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const session = await Session.findOne({ _id: id, clientId: req.user.id });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (session.status !== 'scheduled' && session.status !== 'pending_approval') {
            return res.status(400).json({
                success: false,
                message: 'Only scheduled or pending sessions can be cancelled'
            });
        }

        session.status = 'cancelled';
        session.cancelledBy = 'client';
        session.cancellationReason = req.body.reason ? String(req.body.reason).trim() : 'Cancelled by client';
        await session.save();

        // Void any pending payment records for this session so Pay Now is no longer shown
        await Payment.updateMany(
            { sessionId: session._id, status: 'created' },
            { $set: { status: 'failed' } }
        );

        invalidateCache(session.therapistId);

        const client = await Client.findById(req.user.id).select('name');
        await notificationService.create({
            recipientId: session.therapistId,
            recipientModel: 'Therapist',
            title: 'Session Cancelled',
            message: `${client?.name || 'A client'} cancelled their session scheduled for ${session.date} at ${session.startTime}.`,
            type: 'BOOKING',
            metadata: { sessionId: session._id, cancelledBy: 'client' }
        });

        res.status(200).json({
            success: true,
            message: 'Session cancelled successfully',
            session
        });
    } catch (error) {
        next(error);
    }
};

const approveSession = async (req, res, next) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            therapistId: req.user.id,
            status: 'pending_approval'
        });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found or already processed' });
        }

        session.status = 'scheduled';
        await session.save();

        const client = await Client.findById(session.clientId).select('+password +inviteToken +inviteTokenExpires');
        let emailSent = false;
        if (client && !client.password) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            client.inviteToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            client.inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await client.save();

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const inviteLink = `${frontendUrl}/client/setup-password?token=${rawToken}`;

            const therapist = await Therapist.findById(req.user.id).select('name');
            const emailResult = await emailService.sendClientInvite({
                toEmail: client.email,
                toName: client.name,
                therapistName: therapist?.name || 'Your therapist',
                inviteLink
            });
            emailSent = emailResult?.success === true;
        }

        invalidateCache(req.user.id);

        return res.status(200).json({
            success: true,
            message: emailSent
                ? 'Session approved and activation email sent to client.'
                : 'Session approved. Note: activation email could not be sent — please check your email service configuration.',
            emailSent,
            session
        });
    } catch (error) {
        next(error);
    }
};

const rejectSession = async (req, res, next) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            therapistId: req.user.id,
            status: 'pending_approval'
        });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found or already processed' });
        }

        session.status = 'cancelled';
        session.cancelledBy = 'therapist';
        session.cancellationReason = req.body.reason || 'Booking rejected by therapist';
        await session.save();

        // Void any pending payment records so Pay Now is no longer shown
        await Payment.updateMany(
            { sessionId: session._id, status: 'created' },
            { $set: { status: 'failed' } }
        );

        // Remove the client record if they never activated their account
        const client = await Client.findById(session.clientId).select('+password');
        if (client && client.consentSignedAt == null && !client.password) {
            await Client.deleteOne({ _id: client._id });
        }

        invalidateCache(req.user.id);

        res.status(200).json({ success: true, message: 'Session rejected.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSessions,
    createSession,
    updateSessionStatus,
    getClientSessions,
    cancelClientSession,
    approveSession,
    rejectSession
};