const { BrevoClient } = require('@getbrevo/brevo');
const { getClientInviteEmail } = require('../emails/inviteClient');
const { getResetPasswordEmail } = require('../emails/resetPassword');
const { getWelcomeTherapistEmail } = require('../emails/welcomeTherapist');
const { getSessionReminderEmail } = require('../emails/sessionReminder');

class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'abdulwajid845433@gmail.com';
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
      console.warn('[EmailService] Invalid recipient email.');
      return { success: false, error: 'Invalid recipient email' };
    }

    if (!this.isConfigured() || !this.client) {
      console.warn('[EmailService] Brevo is not configured; transactional email was not sent.');
      return { success: false, simulated: true, error: 'Email service not configured (missing or invalid BREVO_API_KEY)' };
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
      console.error('[EmailService] Brevo delivery failed:', err.code || err.name || 'Unknown error');
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
      console.error('[EmailService] Client invitation failed:', err.code || err.name || 'Unknown error');
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
      console.error('[EmailService] Password reset email failed:', err.code || err.name || 'Unknown error');
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
      console.error('[EmailService] Welcome email failed:', err.code || err.name || 'Unknown error');
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
      console.error('[EmailService] Session reminder failed:', err.code || err.name || 'Unknown error');
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EmailService();
