import { env } from '../config/env.js';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;
  const { default: nodemailer } = await import('nodemailer');

  if (!env.SMTP_HOST) {
    // Dev mode — log to console instead of sending
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT ?? 587),
    secure: Number(env.SMTP_PORT) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

export async function sendResetEmail(to, token) {
  const frontendUrl = env.FRONTEND_URL ?? 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  const from = env.SMTP_FROM ?? 'EduFlow <noreply@eduflow.local>';

  const t = await getTransporter();

  if (!t) {
    // Dev fallback — print link to console
    console.log('\n[MAILER DEV] Forgot password link for', to);
    console.log('[MAILER DEV]', resetLink, '\n');
    return;
  }

  await t.sendMail({
    from,
    to,
    subject: 'EduFlow — Đặt lại mật khẩu',
    html: `
      <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản EduFlow.</p>
      <p><a href="${resetLink}">Nhấn vào đây để đặt lại mật khẩu</a></p>
      <p>Link có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    `,
  });
}
