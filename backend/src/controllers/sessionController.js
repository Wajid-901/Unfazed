const Session = require('../models/Session');
const Client = require('../models/Client');
const Availability = require('../models/Availability');

const getSessions = async (req, res, next) => {
  try {
    const { startDate, endDate, status, clientId } = req.query;
    const query = { therapistId: req.user.id };

    if (clientId) query.clientId = clientId;
    if (status) query.status = status;

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    }

    const sessions = await Session.find(query)
      .populate('clientId', 'name email phone tags')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

const createSession = async (req, res, next) => {
  try {
    const { clientId, date, startTime, duration = 50, amount = 1500, meetingLink } = req.body;

    const client = await Client.findOne({ _id: clientId, therapistId: req.user.id });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
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
    const { id } = req.params;
    const { status, cancellationReason, paymentStatus } = req.body;

    const session = await Session.findOne({ _id: id, therapistId: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (status) session.status = status;
    if (cancellationReason) session.cancellationReason = cancellationReason;
    if (paymentStatus) session.paymentStatus = paymentStatus;

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session status updated',
      session
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  createSession,
  updateSessionStatus
};
