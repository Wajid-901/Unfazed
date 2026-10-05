const Client = require('../models/Client');
const Therapist = require('../models/Therapist');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const SessionNote = require('../models/SessionNote');
const emailService = require('../services/EmailService');
const crypto = require('crypto');

const getClients = async (req, res, next) => {
    try {
        const {
            search,
            tag,
            status,
            page = 1,
            limit = 20
        } = req.query;
        const query = {
            therapistId: req.user.id
        };

        if (status && status !== 'all') {
            query.status = status;
        } else {
            query.status = {
                $ne: 'archived'
            };
        }

        if (tag) {
            query.tags = tag;
        }

        if (search) {
            query.$or = [{
                    name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    phone: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [clients, total] = await Promise.all([
            Client.find(query).sort({
                createdAt: -1
            }).skip(skip).limit(Number(limit)),
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
        const {
            id
        } = req.params;
        const client = await Client.findOne({
            _id: id,
            therapistId: req.user.id
        });
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const [sessions, payments, notes] = await Promise.all([
            Session.find({
                clientId: id,
                therapistId: req.user.id
            }).sort({
                date: -1,
                startTime: -1
            }),
            Payment.find({
                clientId: id,
                therapistId: req.user.id
            }).sort({
                createdAt: -1
            }),
            SessionNote.find({
                clientId: id,
                therapistId: req.user.id
            }).sort({
                createdAt: -1
            })
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
        const {
            name,
            email,
            phone,
            tags,
            dateOfBirth,
            gender,
            notes
        } = req.body;

        // Check for duplicate client email within this therapist's practice
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

        // Step 1: Prevent a therapist's own email from being added as a client
        const therapistWithEmail = await Therapist.findOne({ email: email.toLowerCase().trim() });
        if (therapistWithEmail) {
            return res.status(409).json({
                success: false,
                message: 'This email belongs to a registered therapist and cannot be used for a client account.'
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
            intakeData: {
                presentingConcerns: notes || ''
            },
            inviteToken: inviteTokenHash,
            inviteTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        // Invite link for therapist to share with their client
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${frontendUrl}/client/setup-password?token=${inviteToken}`;

        const therapist = await Therapist.findById(req.user.id).select('name');
        const therapistName = therapist?.name || req.user.name || 'Your therapist';
        await emailService.sendClientInvite({
            toEmail: client.email,
            toName: client.name,
            therapistName,
            inviteLink
        });

        // Step 2: Always return inviteLink
        res.status(201).json({
            success: true,
            message: 'Client added successfully and invitation emailed.',
            client,
            inviteLink: inviteLink
        });
    } catch (error) {
        next(error);
    }
};

// Resend invite link for existing client (in case token expired)
const resendInvite = async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const client = await Client.findOne({
            _id: id,
            therapistId: req.user.id
        }).select('+password');
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        if (client.password) {
            return res.status(400).json({
                success: false,
                message: 'This client has already activated their account.'
            });
        }

        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');

        client.inviteToken = inviteTokenHash;
        client.inviteTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await client.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${frontendUrl}/client/setup-password?token=${inviteToken}`;

        const therapist = await Therapist.findById(req.user.id).select('name');
        const therapistName = therapist?.name || req.user.name || 'Your therapist';
        await emailService.sendClientInvite({
            toEmail: client.email,
            toName: client.name,
            therapistName,
            inviteLink
        });

        // Step 2: Always return inviteLink
        res.status(200).json({
            success: true,
            message: 'Invitation link resent to client email.',
            inviteLink: inviteLink
        });
    } catch (error) {
        next(error);
    }
};

// Step 3: Get (or regenerate) invite link without sending email
const getInviteLink = async (req, res, next) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, therapistId: req.user.id }).select('+password +inviteToken +inviteTokenExpires');
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        if (client.password) return res.status(400).json({ success: false, message: 'Client has already activated their account.' });

        const rawToken = crypto.randomBytes(32).toString('hex');
        client.inviteToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        client.inviteTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await client.save();

        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/setup-password?token=${rawToken}`;
        res.json({ success: true, inviteLink });
    } catch (err) {
        next(err);
    }
};

// Step 4: Update client — supports email editing with validation
const updateClient = async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const {
            name,
            phone,
            tags,
            status,
            intakeData,
            gender,
            dateOfBirth,
            email
        } = req.body;

        // Select +password to check activation status for email-change guard
        const client = await Client.findOne({
            _id: id,
            therapistId: req.user.id
        }).select('+password');
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Handle email change with validation
        let inviteLinkForResponse;
        if (email !== undefined && email !== '') {
            const normalizedEmail = email.toLowerCase().trim();

            if (client.password) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot change email of an activated client account.'
                });
            }

            const emailTakenByClient = await Client.findOne({ therapistId: req.user.id, email: normalizedEmail, _id: { $ne: client._id } });
            if (emailTakenByClient) {
                return res.status(409).json({
                    success: false,
                    message: 'A client with this email already exists in your practice.'
                });
            }

            const emailTakenByTherapist = await Therapist.findOne({ email: normalizedEmail });
            if (emailTakenByTherapist) {
                return res.status(409).json({
                    success: false,
                    message: 'This email belongs to a registered therapist and cannot be used for a client account.'
                });
            }

            client.email = normalizedEmail;
            // Regenerate invite token so the new email address gets a fresh invite
            const rawToken = crypto.randomBytes(32).toString('hex');
            client.inviteToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            client.inviteTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            inviteLinkForResponse = `${frontendUrl}/client/setup-password?token=${rawToken}`;
        }

        if (name) client.name = name.trim();
        if (phone !== undefined) client.phone = phone;
        if (tags) client.tags = tags;
        if (status) client.status = status;
        if (gender) client.gender = gender;
        if (dateOfBirth) client.dateOfBirth = dateOfBirth;
        if (intakeData) client.intakeData = {
            ...client.intakeData,
            ...intakeData
        };

        await client.save();

        res.status(200).json({
            success: true,
            message: 'Client updated successfully',
            client,
            inviteLink: inviteLinkForResponse
        });
    } catch (error) {
        next(error);
    }
};

const archiveClient = async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const client = await Client.findOneAndUpdate({
            _id: id,
            therapistId: req.user.id
        }, {
            status: 'archived'
        }, {
            new: true
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Client archived successfully'
        });
    } catch (error) {
        next(error);
    }
};

// CLIENT-facing: get own profile
const getMyProfile = async (req, res, next) => {
    try {
        const client = await Client.findById(req.user.id).populate('therapistId', 'name title profileImageUrl');
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client profile not found'
            });
        }
        res.status(200).json({
            success: true,
            client
        });
    } catch (error) {
        next(error);
    }
};

// CLIENT-facing: update own profile (restricted fields only)
const updateMyProfile = async (req, res, next) => {
    try {
        const client = await Client.findById(req.user.id);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client profile not found'
            });
        }

        const {
            name,
            phone,
            intakeData
        } = req.body;

        if (name) client.name = name.trim();
        if (phone !== undefined) client.phone = phone;

        if (intakeData) {
            const allowed = ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
            const filteredIntake = {};
            allowed.forEach((key) => {
                if (intakeData[key] !== undefined) filteredIntake[key] = intakeData[key];
            });
            client.intakeData = {
                ...client.intakeData,
                ...filteredIntake
            };
        }

        await client.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            client
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
    resendInvite,
    getInviteLink,
    getMyProfile,
    updateMyProfile
};
