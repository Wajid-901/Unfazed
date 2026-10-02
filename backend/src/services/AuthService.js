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
}

module.exports = new AuthService();
