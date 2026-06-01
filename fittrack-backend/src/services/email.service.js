const EMAIL_PROVIDER = String(process.env.EMAIL_PROVIDER || '').trim().toLowerCase();

const parseFrom = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return { name: '', email: '' };
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) return { name: String(match[1] || '').trim(), email: String(match[2] || '').trim() };
  return { name: '', email: value };
};

const isBrevoSelected = () => EMAIL_PROVIDER === 'brevo' || (EMAIL_PROVIDER === '' && Boolean(process.env.BREVO_API_KEY));

export const isEmailConfigured = () => {
  // Allow "no-op email" in dev if email isn't configured.
  if (!process.env.SMTP_FROM) return false;
  if (isBrevoSelected()) return Boolean(process.env.BREVO_API_KEY);
  return Boolean(process.env.SMTP_HOST);
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const fromRaw = process.env.SMTP_FROM;
  const appName = process.env.APP_NAME || 'FitTrack';

  if (!isEmailConfigured()) {
    console.warn(
      `[email] SMTP no configurado. Enlace de recuperación para ${to}: ${resetUrl}`
    );
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
    if (!apiKey) throw new Error('BREVO_API_KEY no configurada.');
    const from = parseFrom(fromRaw);
    if (!from.email) throw new Error('SMTP_FROM inválido. Usa "Nombre <email@dominio>".');

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
      throw new Error(`Error enviando email por Brevo (status ${res.status}). ${body || ''}`.trim());
    }
    return;
  }

  // Fallback SMTP (local/self-hosted deployments).
  throw new Error(
    'EMAIL_PROVIDER=brevo recomendado en Vercel. Configura BREVO_API_KEY y SMTP_FROM, o define SMTP_HOST para usar SMTP.'
  );
};
