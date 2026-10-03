const { BrevoClient } = require('@getbrevo/brevo');
const { getClientInviteEmail } = require('../emails/inviteClient');
const { getResetPasswordEmail } = require('../emails/resetPassword');
const { getWelcomeTherapistEmail } = require('../emails/welcomeTherapist');
const { getSessionReminderEmail } = require('../emails/sessionReminder');

class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@unfazed.in';
    this.senderName = process.env.FROM_NAME || 'Unfazed';
    this.client = this.apiKey ? new BrevoClient({ apiKey: this.apiKey }) : null;
  }

  isConfigured() {
    return Boolean(this.apiKey && (this.apiKey.trim().startsWith('xkeysib-') || this.apiKey.trim().length > 20));
  }

  normalizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async sendMail({ to, toName, subject, html }) {
    const normalizedTo = this.normalizeEmail(to);
    if (!normalizedTo || !this.isValidEmail(normalizedTo)) {
      console.warn(`[EmailService] Invalid recipient email: "${to}"`);
      return { success: false, error: 'Invalid recipient email' };
    }

    if (!this.isConfigured() || !this.client) {
      console.log(`[Email Dev Fallback] To: ${normalizedTo} | Subject: "${subject}"`);
      return { success: true, simulated: true, id: `dev_email_${Date.now()}` };
    }

    try {
      const response = await this.client.transactionalEmails.sendTransacEmail({
        sender: {
          name: this.senderName,
          email: this.fromEmail
        },
        to: [{
          email: normalizedTo,
          name: toName || normalizedTo
        }],
        subject,
        htmlContent: html
      });

      const messageId = response?.data?.messageId || response?.messageId || `brevo_${Date.now()}`;
      return { success: true, id: messageId };
    } catch (err) {
      console.error('[EmailService] Failed to send email via Brevo:', err.message);
      return { success: false, error: err.message };
    }
  }

  async sendClientInvite({ toEmail, toName, therapistName, inviteLink }) {
    try {
      const html = getClientInviteEmail({ toName, therapistName, inviteLink });
      return await this.sendMail({
        to: toEmail,
        toName,
        subject: `${therapistName || 'Your therapist'} has invited you to Unfazed`,
        html
      });
    } catch (err) {
      console.error('[EmailService] sendClientInvite error:', err);
      return { success: false, error: err.message };
    }
  }

  async sendPasswordReset({ toEmail, resetLink }) {
    try {
      const html = getResetPasswordEmail({ resetLink });
      return await this.sendMail({
        to: toEmail,
        subject: 'Reset your Unfazed password',
        html
      });
    } catch (err) {
      console.error('[EmailService] sendPasswordReset error:', err);
      return { success: false, error: err.message };
    }
  }

  async sendWelcome({ toEmail, toName, verifyLink }) {
    try {
      const html = getWelcomeTherapistEmail({ toName, verifyLink });
      return await this.sendMail({
        to: toEmail,
        toName,
        subject: 'Welcome to Unfazed — Please verify your email',
        html
      });
    } catch (err) {
      console.error('[EmailService] sendWelcome error:', err);
      return { success: false, error: err.message };
    }
  }

  async sendSessionReminder({ toEmail, toName, sessionDate, sessionTime, therapistName, joinLink }) {
    try {
      const html = getSessionReminderEmail({ toName, sessionDate, sessionTime, therapistName, joinLink });
      return await this.sendMail({
        to: toEmail,
        toName,
        subject: `Reminder: Therapy Session on ${sessionDate} at ${sessionTime}`,
        html
      });
    } catch (err) {
      console.error('[EmailService] sendSessionReminder error:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EmailService();
