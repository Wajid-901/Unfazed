const Client = require('../models/Client');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const SessionNote = require('../models/SessionNote');
const crypto = require('crypto');

const getClients = async (req, res, next) => {
  try {
    const { search, tag, status, page = 1, limit = 20 } = req.query;
    const query = { therapistId: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = { $ne: 'archived' };
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [clients, total] = await Promise.all([
      Client.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Client.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      clients,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({ _id: id, therapistId: req.user.id });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const [sessions, payments, notes] = await Promise.all([
      Session.find({ clientId: id, therapistId: req.user.id }).sort({ date: -1, startTime: -1 }),
      Payment.find({ clientId: id, therapistId: req.user.id }).sort({ createdAt: -1 }),
      SessionNote.find({ clientId: id, therapistId: req.user.id }).sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      client,
      sessions,
      payments,
      notes
    });
  } catch (error) {
    next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, tags, dateOfBirth, gender, notes } = req.body;

    const existingClient = await Client.findOne({
      therapistId: req.user.id,
      email: email.toLowerCase().trim()
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: 'A client with this email already exists in your practice.'
      });
    }

    // Generate a secure invite token the client uses to set their own password
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');

    const client = await Client.create({
      therapistId: req.user.id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      tags: tags || ['Active'],
      dateOfBirth,
      gender,
      intakeData: { presentingConcerns: notes || '' },
      inviteToken: inviteTokenHash,
      inviteTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Invite link for therapist to share with their client
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/client/setup-password?token=${inviteToken}`;

    res.status(201).json({
      success: true,
      message: 'Client added successfully. Share the invite link with your client.',
      client,
      inviteLink
    });
  } catch (error) {
    next(error);
  }
};

// Resend invite link for existing client (in case token expired)
const resendInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({ _id: id, therapistId: req.user.id });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');

    client.inviteToken = inviteTokenHash;
    client.inviteTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await client.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/client/setup-password?token=${inviteToken}`;

    res.status(200).json({ success: true, inviteLink });
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, tags, status, intakeData, gender, dateOfBirth } = req.body;

    const client = await Client.findOne({ _id: id, therapistId: req.user.id });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    if (name) client.name = name.trim();
    if (phone !== undefined) client.phone = phone;
    if (tags) client.tags = tags;
    if (status) client.status = status;
    if (gender) client.gender = gender;
    if (dateOfBirth) client.dateOfBirth = dateOfBirth;
    if (intakeData) client.intakeData = { ...client.intakeData, ...intakeData };

    await client.save();

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    next(error);
  }
};

const archiveClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findOneAndUpdate(
      { _id: id, therapistId: req.user.id },
      { status: 'archived' },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Client archived successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  archiveClient,
  resendInvite
};
