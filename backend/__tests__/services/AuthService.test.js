const authService = require('../../src/services/AuthService');
const Therapist = require('../../src/models/Therapist');
const Availability = require('../../src/models/Availability');
const emailService = require('../../src/services/EmailService');
const crypto = require('crypto');

jest.mock('../../src/models/Therapist');
jest.mock('../../src/models/Client');
jest.mock('../../src/models/Availability');
jest.mock('../../src/services/EmailService', () => ({
  sendWelcome: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordReset: jest.fn().mockResolvedValue({ success: true })
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerTherapist', () => {
    it('should throw 409 if therapist email is already registered', async () => {
      Therapist.findOne.mockResolvedValue({ _id: 't1', email: 'existing@unfazed.in' });

      await expect(
        authService.registerTherapist({
          name: 'Existing Doc',
          email: 'existing@unfazed.in',
          password: 'Password123!',
          slug: 'existing-doc'
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'An account with this email address already exists'
      });
    });

    it('should create therapist with isEmailVerified false and send verification email', async () => {
      Therapist.findOne.mockResolvedValue(null);
      const mockTherapist = {
        _id: 't_new_123',
        name: 'Dr. Jane Smith',
        email: 'drjane@unfazed.in',
        slug: 'dr-jane-smith',
        isEmailVerified: false,
        toJSON: () => ({ _id: 't_new_123', email: 'drjane@unfazed.in' })
      };
      Therapist.create.mockResolvedValue(mockTherapist);
      Availability.create.mockResolvedValue({});

      const result = await authService.registerTherapist({
        name: 'Dr. Jane Smith',
        email: 'drjane@unfazed.in',
        password: 'Password123!',
        slug: 'dr-jane-smith'
      });

      expect(Therapist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'drjane@unfazed.in',
          isEmailVerified: false,
          emailVerificationToken: expect.any(String),
          emailVerificationExpires: expect.any(Number)
        })
      );
      expect(Availability.create).toHaveBeenCalledWith({ therapistId: 't_new_123' });
      expect(emailService.sendWelcome).toHaveBeenCalledWith(
        expect.objectContaining({
          toEmail: 'drjane@unfazed.in',
          toName: 'Dr. Jane Smith',
          verifyLink: expect.stringContaining('/login?verifyToken=')
        })
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('loginTherapist', () => {
    it('should reject with 403 EMAIL_NOT_VERIFIED if email is not verified', async () => {
      const mockTherapist = {
        _id: 't_123',
        email: 'unverified@unfazed.in',
        comparePassword: jest.fn().mockResolvedValue(true),
        isEmailVerified: false
      };

      const selectMock = jest.fn().mockResolvedValue(mockTherapist);
      Therapist.findOne.mockReturnValue({ select: selectMock });

      await expect(
        authService.loginTherapist({
          email: 'unverified@unfazed.in',
          password: 'Password123!'
        })
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'EMAIL_NOT_VERIFIED'
      });
    });

    it('should succeed with tokens if email is verified and password is valid', async () => {
      const mockTherapist = {
        _id: 't_123',
        name: 'Dr. Verified',
        email: 'verified@unfazed.in',
        slug: 'dr-verified',
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ _id: 't_123', email: 'verified@unfazed.in', name: 'Dr. Verified' })
      };

      const selectMock = jest.fn().mockResolvedValue(mockTherapist);
      Therapist.findOne.mockReturnValue({ select: selectMock });

      const result = await authService.loginTherapist({
        email: 'verified@unfazed.in',
        password: 'Password123!'
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.therapist.email).toBe('verified@unfazed.in');
    });
  });

  describe('verifyEmail', () => {
    it('should mark email as verified and clear verification tokens', async () => {
      const rawToken = 'test_token_raw_32bytes_sample123';
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      const mockTherapist = {
        _id: 't_123',
        isEmailVerified: false,
        emailVerificationToken: hashedToken,
        save: jest.fn().mockResolvedValue(true)
      };

      Therapist.findOne.mockResolvedValue(mockTherapist);

      const res = await authService.verifyEmail(rawToken);

      expect(res.success).toBe(true);
      expect(mockTherapist.isEmailVerified).toBe(true);
      expect(mockTherapist.emailVerificationToken).toBeNull();
      expect(mockTherapist.save).toHaveBeenCalled();
    });

    it('should throw 400 if token is invalid or expired', async () => {
      Therapist.findOne.mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid_token')).rejects.toMatchObject({
        statusCode: 400,
        message: 'Verification token is invalid or has expired'
      });
    });
  });

  describe('requestPasswordReset & resetPassword', () => {
    it('should return safe message and send reset email when user exists', async () => {
      const mockTherapist = {
        _id: 't_123',
        email: 'doc@unfazed.in',
        save: jest.fn().mockResolvedValue(true)
      };

      Therapist.findOne.mockResolvedValue(mockTherapist);

      const res = await authService.requestPasswordReset('doc@unfazed.in');

      expect(res.message).toContain('password reset link has been dispatched');
      expect(mockTherapist.resetPasswordToken).toBeDefined();
      expect(mockTherapist.resetPasswordExpires).toBeGreaterThan(Date.now());
      expect(emailService.sendPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({
          toEmail: 'doc@unfazed.in',
          resetLink: expect.stringContaining('/reset-password/')
        })
      );
    });

    it('should reset password when valid token is supplied', async () => {
      const rawToken = 'valid_raw_reset_token_here_123';
      const mockTherapist = {
        _id: 't_123',
        password: 'old_hashed_password',
        resetPasswordToken: 'hash',
        resetPasswordExpires: Date.now() + 10000,
        save: jest.fn().mockResolvedValue(true)
      };

      Therapist.findOne.mockResolvedValue(mockTherapist);

      const res = await authService.resetPassword(rawToken, 'BrandNewPass123!');

      expect(res.success).toBe(true);
      expect(mockTherapist.password).toBe('BrandNewPass123!');
      expect(mockTherapist.resetPasswordToken).toBeNull();
      expect(mockTherapist.save).toHaveBeenCalled();
    });
  });
});
