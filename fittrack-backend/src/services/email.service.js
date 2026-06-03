import { createHttpError } from '../utils/httpError.js';

const parseFrom = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return { name: '', email: '' };
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) return { name: String(match[1] || '').trim(), email: String(match[2] || '').trim() };
  return { name: '', email: value };
};

const getEmailProvider = () => String(process.env.EMAIL_PROVIDER || '').trim().toLowerCase();

const getFromRaw = () =>
  String(
    process.env.EMAIL_FROM ||
      process.env.SMTP_FROM ||
      process.env.BREVO_FROM_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      ''
  ).trim();

const isBrevoSelected = () =>
  getEmailProvider() === 'brevo' ||
  (getEmailProvider() === '' && Boolean(process.env.BREVO_API_KEY));

const isResendSelected = () =>
  getEmailProvider() === 'resend' ||
  (getEmailProvider() === '' && !process.env.BREVO_API_KEY && Boolean(process.env.RESEND_API_KEY));

const isProduction = () => String(process.env.NODE_ENV || '').toLowerCase() === 'production';

export const isEmailConfigured = () => {
  // Allow "no-op email" in dev if email isn't configured.
  if (!getFromRaw()) return false;
  if (isBrevoSelected()) return Boolean(process.env.BREVO_API_KEY);
  if (isResendSelected()) return Boolean(process.env.RESEND_API_KEY);
  return Boolean(process.env.SMTP_HOST);
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const fromRaw = getFromRaw();
  const appName = process.env.APP_NAME || 'FitTrack';

  if (!isEmailConfigured()) {
    console.warn(
      `[email] Email no configurado. Enlace de recuperación para ${to}: ${resetUrl}`
    );
    if (isProduction()) {
      throw createHttpError(503, 'Servicio de email no configurado', { expose: false });
    }
    return;
  }

  const subject = `${appName} - Recuperación de contraseña`;
  const text = `Has solicitado restablecer tu contraseña.\n\nAbre este enlace para continuar:\n${resetUrl}\n\nSi no has sido tú, ignora este mensaje.`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.4;">
      <h2 style="margin:0 0 12px;">Recuperación de contraseña</h2>
      <p style="margin:0 0 12px;">Has solicitado restablecer tu contraseña.</p>
      <p style="margin:0 0 16px;">
        <a href="${resetUrl}" style="display:inline-block; padding:10px 14px; background:#ff7849; color:#fff; border-radius:8px; text-decoration:none;">
          Restablecer contraseña
        </a>
      </p>
      <p style="margin:0 0 10px; color:#555;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p style="margin:0; word-break:break-all; color:#555;">${resetUrl}</p>
      <hr style="border:none; border-top:1px solid #eee; margin:18px 0;" />
      <p style="margin:0; color:#777; font-size:12px;">Si no has sido tú, puedes ignorar este correo.</p>
    </div>
  `;

  if (isBrevoSelected()) {
    const apiKey = String(process.env.BREVO_API_KEY || '').trim();
    if (!apiKey) throw createHttpError(503, 'Servicio de email no configurado', { expose: false });
    const from = parseFrom(fromRaw);
    if (!from.email) throw createHttpError(500, 'Remitente inválido', { expose: false });

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: from.name || appName, email: from.email },
        to: [{ email: String(to).trim() }],
        subject,
        textContent: text,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        `[email] Brevo error status=${res.status} body=${String(body || '').slice(0, 800)}`
      );
      if (String(body || '').toLowerCase().includes('unrecognised ip address')) {
        console.error(
          '[email] Brevo ha bloqueado la IP del servidor. Autoriza la IP en Brevo o usa EMAIL_PROVIDER=resend.'
        );
      }
      // Map provider failures to 503 (dependency), keep details hidden from clients.
      throw createHttpError(503, 'Servicio de email no disponible', { expose: false });
    }
    return;
  }

  if (isResendSelected()) {
    const apiKey = String(process.env.RESEND_API_KEY || '').trim();
    if (!apiKey) throw createHttpError(503, 'Servicio de email no configurado', { expose: false });
    if (!fromRaw) throw createHttpError(500, 'Remitente inválido', { expose: false });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromRaw,
        to: [String(to).trim()],
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        `[email] Resend error status=${res.status} body=${String(body || '').slice(0, 800)}`
      );
      throw createHttpError(503, 'Servicio de email no disponible', { expose: false });
    }
    return;
  }

  // Fallback SMTP (local/self-hosted deployments).
  throw createHttpError(503, 'Servicio de email no configurado', { expose: false });
};
