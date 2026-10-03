const emailService = require('../../src/services/EmailService');

describe('EmailService (Brevo)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('normalizeEmail and isValidEmail', () => {
    it('should normalize emails by trimming and converting to lower case', () => {
      expect(emailService.normalizeEmail('  Test.User@Example.COM  ')).toBe('test.user@example.com');
      expect(emailService.normalizeEmail('')).toBe('');
      expect(emailService.normalizeEmail(null)).toBe('');
    });

    it('should correctly validate email formats', () => {
      expect(emailService.isValidEmail('user@unfazed.in')).toBe(true);
      expect(emailService.isValidEmail('invalid-email')).toBe(false);
      expect(emailService.isValidEmail('user@')).toBe(false);
      expect(emailService.isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('sendMail dev fallback when unconfigured', () => {
    it('should safely log and return simulated response without crashing', async () => {
      delete process.env.BREVO_API_KEY;
      const res = await emailService.sendMail({
        to: 'therapist@example.com',
        subject: 'Test Subject',
        html: '<p>Test email</p>'
      });

      expect(res.success).toBe(true);
      expect(res.simulated).toBe(true);
      expect(res.id).toBeDefined();
    });

    it('should reject invalid recipient email addresses', async () => {
      const res = await emailService.sendMail({
        to: 'not-an-email',
        subject: 'Test',
        html: '<p>Hi</p>'
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid recipient email');
    });
  });

  describe('Template helpers', () => {
    it('sendClientInvite should format HTML and return success', async () => {
      const res = await emailService.sendClientInvite({
        toEmail: 'client@example.com',
        toName: 'John Doe',
        therapistName: 'Dr. Jane Smith',
        inviteLink: 'https://unfazed.in/invite/abc123xyz'
      });
      expect(res.success).toBe(true);
    });

    it('sendPasswordReset should format HTML and return success', async () => {
      const res = await emailService.sendPasswordReset({
        toEmail: 'therapist@example.com',
        resetLink: 'https://unfazed.in/reset-password/abc123xyz'
      });
      expect(res.success).toBe(true);
    });

    it('sendWelcome should format HTML and return success', async () => {
      const res = await emailService.sendWelcome({
        toEmail: 'therapist@example.com',
        toName: 'Dr. Jane Smith',
        verifyLink: 'https://unfazed.in/login?verifyToken=abc123xyz'
      });
      expect(res.success).toBe(true);
    });

    it('sendSessionReminder should format HTML and return success', async () => {
      const res = await emailService.sendSessionReminder({
        toEmail: 'client@example.com',
        toName: 'John Doe',
        sessionDate: '2026-10-10',
        sessionTime: '14:00',
        therapistName: 'Dr. Jane Smith',
        joinLink: 'https://meet.jit.si/unfazed-abc'
      });
      expect(res.success).toBe(true);
    });
  });

  describe('Brevo API execution when configured', () => {
    it('should call Brevo transactionalEmails sendTransacEmail when configured', async () => {
      const mockSend = jest.fn().mockResolvedValue({
        data: { messageId: '<brevo-message-id-123@smtp-relay.mailin.fr>' }
      });

      const instance = Object.create(Object.getPrototypeOf(emailService));
      instance.apiKey = 'xkeysib-test-key-1234567890abcdef123456';
      instance.fromEmail = 'noreply@unfazed.in';
      instance.senderName = 'Unfazed';
      instance.client = {
        transactionalEmails: { sendTransacEmail: mockSend }
      };

      const res = await instance.sendMail({
        to: 'client@example.com',
        toName: 'John Doe',
        subject: 'Welcome to Unfazed',
        html: '<p>Hello John</p>'
      });

      expect(mockSend).toHaveBeenCalledWith({
        sender: {
          name: 'Unfazed',
          email: 'noreply@unfazed.in'
        },
        to: [{
          email: 'client@example.com',
          name: 'John Doe'
        }],
        subject: 'Welcome to Unfazed',
        htmlContent: '<p>Hello John</p>'
      });
      expect(res.success).toBe(true);
      expect(res.id).toBe('<brevo-message-id-123@smtp-relay.mailin.fr>');
    });

    it('should handle Brevo error responses gracefully', async () => {
      const mockSend = jest.fn().mockRejectedValue(new Error('Brevo unauthorized invalid key'));

      const instance = Object.create(Object.getPrototypeOf(emailService));
      instance.apiKey = 'xkeysib-test-key-1234567890abcdef123456';
      instance.fromEmail = 'noreply@unfazed.in';
      instance.senderName = 'Unfazed';
      instance.client = {
        transactionalEmails: { sendTransacEmail: mockSend }
      };

      const res = await instance.sendMail({
        to: 'client@example.com',
        subject: 'Welcome',
        html: '<p>Hello</p>'
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Brevo unauthorized invalid key');
    });
  });
});
