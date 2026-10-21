function getResetPasswordEmail({ resetLink }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F4; margin: 0; padding: 40px 20px; color: #1C1C1A;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #E8E4DC; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #4A5240; padding: 28px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Unfazed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-size: 18px; font-weight: 600; color: #1C1C1A; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #6B6860; margin: 0 0 16px;">
                We received a request to reset the password for your Unfazed account.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #6B6860; margin: 0 0 28px;">
                Click the button below to choose a new password. For security purposes, this link will expire in <strong>1 hour</strong>.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetLink}" style="display: inline-block; background-color: #C4622D; color: #ffffff; text-decoration: none; padding: 13px 30px; border-radius: 10px; font-size: 14px; font-weight: 600;">
                  Reset My Password
                </a>
              </div>
              <p style="font-size: 12px; color: #9C9890; line-height: 1.5; margin: 28px 0 0;">
                If you did not request a password reset, you can safely ignore this email. Your current password remains secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #FAF8F4; border-top: 1px solid #E8E4DC; font-size: 11px; color: #9C9890; text-align: center;">
              <p style="margin: 0 0 4px;">Unfazed &bull; Practice Management for Mental Health Professionals</p>
              <p style="margin: 0;">Automated security notification. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

module.exports = { getResetPasswordEmail };
