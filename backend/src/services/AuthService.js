const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const Availability = require('../models/Availability');
const ROLES = require('../constants/roles');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../config/jwt');

class AuthService {
  /**
   * Helper to create a clean URL-friendly slug
   */
  async generateUniqueSlug(baseName) {
    let clean = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = clean;
    let counter = 1;
    while (await Therapist.findOne({ slug })) {
      slug = `${clean}-${counter}`;
      counter++;
    }
    return slug;
  }

  /**
   * Register a new therapist
   */
  async registerTherapist({ name, email, password, slug }) {
    const existingEmail = await Therapist.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      const err = new Error('An account with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    let finalSlug = slug;
    if (finalSlug) {
      finalSlug = finalSlug.toLowerCase();
      const existingSlug = await Therapist.findOne({ slug: finalSlug });
      if (existingSlug) {
        const err = new Error('This clinic slug/URL is already taken');
        err.statusCode = 409;
        throw err;
      }
    } else {
      finalSlug = await this.generateUniqueSlug(name);
    }

    const therapist = await Therapist.create({
      name,
      email: email.toLowerCase(),
      password,
      slug: finalSlug
    });

    // Create default availability schedule for therapist
    await Availability.create({
      therapistId: therapist._id
    });

    const payload = {
      id: therapist._id.toString(),
      role: ROLES.THERAPIST,
      email: therapist.email,
      name: therapist.name,
      slug: therapist.slug
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      therapist,
      accessToken,
      refreshToken
    };
  }

  /**
   * Therapist login
   */
  async loginTherapist({ email, password }) {
    const therapist = await Therapist.findOne({ email: email.toLowerCase() }).select('+password');
    if (!therapist) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await therapist.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const payload = {
      id: therapist._id.toString(),
      role: ROLES.THERAPIST,
      email: therapist.email,
      name: therapist.name,
      slug: therapist.slug
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      therapist: therapist.toJSON(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Client login
   */
  async loginClient({ email, password }) {
    const client = await Client.findOne({ email: email.toLowerCase() }).select('+password');
    if (!client || !client.password) {
      const err = new Error('Invalid email or client credentials');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const payload = {
      id: client._id.toString(),
      therapistId: client.therapistId.toString(),
      role: ROLES.CLIENT,
      email: client.email,
      name: client.name
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      client: client.toJSON(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh session tokens
   */
  async refreshSession(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Refresh token is required');
      err.statusCode = 401;
      throw err;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const payload = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
      slug: decoded.slug,
      therapistId: decoded.therapistId
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: payload
    };
  }

  /**
   * Request password reset token
   */
  async requestPasswordReset(email) {
    if (!email) {
      const err = new Error('Email address is required');
      err.statusCode = 400;
      throw err;
    }

    const therapist = await Therapist.findOne({ email: email.toLowerCase().trim() });
    if (!therapist) {
      // Return success message to prevent user enumeration
      return {
        message: 'If an account with that email exists, a password reset link has been dispatched.'
      };
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    therapist.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    therapist.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await therapist.save();

    return {
      message: 'If an account with that email exists, a password reset link has been dispatched.',
      // In development mode, provide token for testing convenience
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      const err = new Error('Token and new password are required');
      err.statusCode = 400;
      throw err;
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const therapist = await Therapist.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!therapist) {
      const err = new Error('Password reset token is invalid or has expired');
      err.statusCode = 400;
      throw err;
    }

    therapist.password = newPassword;
    therapist.resetPasswordToken = null;
    therapist.resetPasswordExpires = null;
    await therapist.save();

    return {
      success: true,
      message: 'Password has been successfully updated. You can now sign in.'
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token) {
    if (!token) {
      const err = new Error('Verification token is required');
      err.statusCode = 400;
      throw err;
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const therapist = await Therapist.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!therapist) {
      const err = new Error('Verification token is invalid or has expired');
      err.statusCode = 400;
      throw err;
    }

    therapist.isEmailVerified = true;
    therapist.emailVerificationToken = null;
    therapist.emailVerificationExpires = null;
    await therapist.save();

    return {
      success: true,
      message: 'Email verified successfully.'
    };
  }
}

module.exports = new AuthService();

