const authService = require('../services/AuthService');
const { getRefreshCookieOptions } = require('../config/jwt');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');

const register = async (req, res, next) => {
  try {
    const { name, email, password, slug } = req.body;
    const result = await authService.registerTherapist({ name, email, password, slug });

    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Therapist account registered successfully',
      accessToken: result.accessToken,
      user: {
        id: result.therapist._id,
        name: result.therapist.name,
        email: result.therapist.email,
        slug: result.therapist.slug,
        role: 'THERAPIST',
        subscriptionPlan: result.therapist.subscriptionPlan
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginTherapist({ email, password });

    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      accessToken: result.accessToken,
      user: {
        id: result.therapist._id,
        name: result.therapist.name,
        email: result.therapist.email,
        slug: result.therapist.slug,
        role: 'THERAPIST',
        subscriptionPlan: result.therapist.subscriptionPlan
      }
    });
  } catch (error) {
    next(error);
  }
};

const clientLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginClient({ email, password });

    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Client logged in successfully',
      accessToken: result.accessToken,
      user: {
        id: result.client._id,
        therapistId: result.client.therapistId,
        name: result.client.name,
        email: result.client.email,
        role: 'CLIENT'
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const result = await authService.refreshSession(token);

    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', getRefreshCookieOptions());
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (req.user.role === 'THERAPIST') {
      const therapist = await Therapist.findById(req.user.id);
      if (!therapist) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({
        success: true,
        user: {
          id: therapist._id,
          name: therapist.name,
          email: therapist.email,
          slug: therapist.slug,
          role: 'THERAPIST',
          title: therapist.title,
          bio: therapist.bio,
          languages: therapist.languages,
          specializations: therapist.specializations,
          hourlyRate: therapist.hourlyRate,
          currency: therapist.currency,
          profileImageUrl: therapist.profileImageUrl,
          subscriptionPlan: therapist.subscriptionPlan,
          subscriptionStatus: therapist.subscriptionStatus
        }
      });
    } else {
      const client = await Client.findById(req.user.id).populate('therapistId', 'name title slug profileImageUrl');
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }
      return res.status(200).json({
        success: true,
        user: {
          id: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          therapist: client.therapistId,
          role: 'CLIENT',
          intakeSubmitted: client.intakeSubmitted,
          consentSignedAt: client.consentSignedAt
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await authService.verifyEmail(token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Client sets their own password using the invite token sent by therapist
const setupClientPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Valid token and password (min 8 chars) are required.' });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const client = await Client.findOne({
      inviteToken: hashedToken,
      inviteTokenExpires: { $gt: Date.now() }
    }).select('+inviteToken +inviteTokenExpires');

    if (!client) {
      return res.status(400).json({ success: false, message: 'Invite link is invalid or has expired. Ask your therapist to resend the invite.' });
    }

    client.password = password;
    client.inviteToken = undefined;
    client.inviteTokenExpires = undefined;
    await client.save();

    const notificationService = require('../services/NotificationService');
    await notificationService.create({
      recipientId: client.therapistId,
      recipientModel: 'Therapist',
      title: 'Client Joined Clinic',
      message: `${client.name} has completed portal setup and joined your clinic.`,
      type: 'SYSTEM',
      metadata: { clientId: client._id }
    });

    const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
    const { getRefreshCookieOptions } = require('../config/jwt');
    const ROLES = require('../constants/roles');

    const payload = { id: client._id.toString(), therapistId: client.therapistId.toString(), role: ROLES.CLIENT, email: client.email, name: client.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Password set successfully! You are now logged in.',
      accessToken,
      user: { id: client._id, name: client.name, email: client.email, therapistId: client.therapistId, role: 'CLIENT' }
    });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    const result = await authService.resendVerificationEmail(email);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  clientLogin,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  setupClientPassword,
  resendVerification
};
