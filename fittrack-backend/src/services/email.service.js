import nodemailer from 'nodemailer';

const parseBoolean = (value, fallback = false) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === '') return fallback;
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

export const isEmailConfigured = () => {
  // Allow "no-op email" in dev if SMTP isn't configured.
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const from = process.env.SMTP_FROM;
  const appName = process.env.APP_NAME || 'FitTrack';

  if (!isEmailConfigured()) {
    console.warn(
      `[email] SMTP no configurado. Enlace de recuperación para ${to}: ${resetUrl}`
    );
    return;
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      'SMTP incompleto: faltan SMTP_USER/SMTP_PASS. En Brevo, usa "Login" como SMTP_USER y una "SMTP key" como SMTP_PASS.'
    );
  }

  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
      : undefined
  });

  try {
    // Fast-fail with a readable error if credentials/connection are wrong.
    await transporter.verify();
  } catch (error) {
    const message = error?.message ? String(error.message) : String(error);
    throw new Error(`No se pudo conectar/autenticar con SMTP (${host}:${port}). ${message}`);
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

  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (error) {
    const message = error?.message ? String(error.message) : String(error);
    throw new Error(`Error enviando email SMTP a ${to}. ${message}`);
  }
};
