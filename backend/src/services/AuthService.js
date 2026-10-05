const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const Availability = require('../models/Availability');
const crypto = require('crypto');
const ROLES = require('../constants/roles');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const emailService = require('./EmailService');

class AuthService {
  // Generate a unique URL-safe slug from a base name
  async generateUniqueSlug(baseName) {
    let clean = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = clean;
    let counter = 1;
    while (await Therapist.findOne({ slug })) {
      slug = `${clean}-${counter}`;
      counter++;
    }
    return slug;
  }

  // Register a new therapist account with default availability and email verification
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

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const therapist = await Therapist.create({
      name,
      email: email.toLowerCase(),
      password,
      slug: finalSlug,
      isEmailVerified: false,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    await Availability.create({ therapistId: therapist._id });

    // Send welcome email with verification link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/login?verifyToken=${verificationToken}`;
    const emailResult = await emailService.sendWelcome({
      toEmail: therapist.email,
      toName: therapist.name,
      verifyLink
    });
    console.log(`[Auth] Welcome email result for ${therapist.email}:`, JSON.stringify(emailResult));
    console.log(`[Auth] Verify link: ${verifyLink}`);

    const payload = { id: therapist._id.toString(), role: ROLES.THERAPIST, email: therapist.email, name: therapist.name, slug: therapist.slug };
    return { therapist, accessToken: generateAccessToken(payload), refreshToken: generateRefreshToken(payload) };
  }

  // Therapist login — validates password, enforces email verification, and returns tokens
  async loginTherapist({ email, password }) {
    const therapist = await Therapist.findOne({ email: email.toLowerCase() }).select('+password');
    if (!therapist) {
      const err = new Error('Invalid email or password'); err.statusCode = 401; throw err;
    }
    const isMatch = await therapist.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password'); err.statusCode = 401; throw err;
    }
    if (!therapist.isEmailVerified) {
      const err = new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
      err.statusCode = 403;
      err.code = 'EMAIL_NOT_VERIFIED';
      throw err;
    }
    const payload = { id: therapist._id.toString(), role: ROLES.THERAPIST, email: therapist.email, name: therapist.name, slug: therapist.slug };
    return { therapist: therapist.toJSON(), accessToken: generateAccessToken(payload), refreshToken: generateRefreshToken(payload) };
  }

  // Client login — validates password and returns tokens
  async loginClient({ email, password }) {
    const client = await Client.findOne({ email: email.toLowerCase() }).select('+password');
    if (!client || !client.password) {
      const err = new Error('Invalid email or client credentials'); err.statusCode = 401; throw err;
    }
    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password'); err.statusCode = 401; throw err;
    }
    const payload = { id: client._id.toString(), therapistId: client.therapistId.toString(), role: ROLES.CLIENT, email: client.email, name: client.name };
    return { client: client.toJSON(), accessToken: generateAccessToken(payload), refreshToken: generateRefreshToken(payload) };
  }

  // Rotate access + refresh tokens from a valid refresh token
  async refreshSession(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Refresh token is required'); err.statusCode = 401; throw err;
    }
    const decoded = verifyRefreshToken(refreshToken);
    const payload = { id: decoded.id, role: decoded.role, email: decoded.email, name: decoded.name, slug: decoded.slug, therapistId: decoded.therapistId };
    return { accessToken: generateAccessToken(payload), refreshToken: generateRefreshToken(payload), user: payload };
  }

  // Send password reset link (safe — never reveals if email exists)
  async requestPasswordReset(email) {
    if (!email) {
      const err = new Error('Email address is required'); err.statusCode = 400; throw err;
    }
    const safeMsg = { message: 'If an account with that email exists, a password reset link has been dispatched.' };
    const therapist = await Therapist.findOne({ email: email.toLowerCase().trim() });
    if (!therapist) return safeMsg;

    const resetToken = crypto.randomBytes(32).toString('hex');
    therapist.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    therapist.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await therapist.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    await emailService.sendPasswordReset({
      toEmail: therapist.email,
      resetLink
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Reset Token Dev] ${therapist.email}: ${resetToken}`);
    }

    return safeMsg;
  }

  // Resend email verification link
  async resendVerificationEmail(email) {
    if (!email) {
      const err = new Error('Email address is required'); err.statusCode = 400; throw err;
    }
    const safeMsg = { message: 'If an account with that email exists and requires verification, a new link has been dispatched.' };
    const therapist = await Therapist.findOne({ email: email.toLowerCase().trim() });
    if (!therapist) return safeMsg;

    if (therapist.isEmailVerified) {
      return { message: 'This account email is already verified. You can sign in.' };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    therapist.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    therapist.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await therapist.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/login?verifyToken=${verificationToken}`;

    const emailResult = await emailService.sendWelcome({
      toEmail: therapist.email,
      toName: therapist.name,
      verifyLink
    });
    console.log(`[Auth] Resend verification email result for ${therapist.email}:`, JSON.stringify(emailResult));
    console.log(`[Auth] Verify link: ${verifyLink}`);

    return safeMsg;
  }

  // Reset password using hashed token — token expires in 1 hour
  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      const err = new Error('Token and new password are required'); err.statusCode = 400; throw err;
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const therapist = await Therapist.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!therapist) {
      const err = new Error('Password reset token is invalid or has expired'); err.statusCode = 400; throw err;
    }
    therapist.password = newPassword;
    therapist.resetPasswordToken = null;
    therapist.resetPasswordExpires = null;
    await therapist.save();
    return { success: true, message: 'Password has been successfully updated. You can now sign in.' };
  }

  // Verify email address via one-time token
  async verifyEmail(token) {
    if (!token) {
      const err = new Error('Verification token is required'); err.statusCode = 400; throw err;
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const therapist = await Therapist.findOne({ emailVerificationToken: hashedToken, emailVerificationExpires: { $gt: Date.now() } });
    if (!therapist) {
      const err = new Error('Verification token is invalid or has expired'); err.statusCode = 400; throw err;
    }
    therapist.isEmailVerified = true;
    therapist.emailVerificationToken = null;
    therapist.emailVerificationExpires = null;
    await therapist.save();
    return { success: true, message: 'Email verified successfully.' };
  }
}

module.exports = new AuthService();
