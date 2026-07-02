const nodemailer = require('nodemailer');

const isEmailConfigured = () => {
  return Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  );
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE || 'false') === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendLoginCodeEmail = async ({ to, username, code }) => {
  const appName = process.env.APP_NAME || 'Meridian.ai';
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  // Development fallback: keeps local testing possible even before SMTP is configured.
  if (!isEmailConfigured()) {
    console.warn('[Email] SMTP is not configured. Login code was not emailed.');
    console.warn(`[Email] Development login code for ${to}: ${code}`);
    return { sent: false, devFallback: true };
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from,
      to,
      subject: `${appName} login authentication code`,
      text: `Hello ${username || 'there'},\n\nYour ${appName} login authentication code is ${code}.\n\nThis code will expire in 10 minutes. If you did not try to login, you can safely ignore this email.\n\n- ${appName}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:14px;">
          <h2 style="margin:0 0 12px;color:#4f46e5;">${appName} Login Code</h2>
          <p>Hello ${username || 'there'},</p>
          <p>Use this authentication code to complete your login:</p>
          <div style="font-size:30px;font-weight:800;letter-spacing:8px;background:#f3f4f6;border-radius:12px;padding:16px;text-align:center;margin:18px 0;color:#111827;">
            ${code}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p style="font-size:13px;color:#6b7280;">If you did not try to login, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { sent: true, devFallback: false };
  } catch (error) {
    console.error('[Email] Failed to send login code:', error.message);
    throw new Error('Unable to send authentication code. Please check email configuration.');
  }
};

module.exports = {
  sendLoginCodeEmail,
};
