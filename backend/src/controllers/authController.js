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

module.exports = {
  register,
  login,
  clientLogin,
  refreshToken,
  logout,
  getMe
};
