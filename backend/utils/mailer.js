const nodemailer = require('nodemailer');

function getFrontendOrigin() {
  const fallback = 'http://localhost:3000';
  const raw = process.env.FRONTEND_URL || process.env.EMAIL_VERIFY_BASE_URL || fallback;

  try {
    return new URL(raw).origin;
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendVerificationEmail({ to, code, verifyUrl }) {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'RPS <no-reply@localhost>';
  const appOrigin = getFrontendOrigin();
  const logoUrl = `${appOrigin}/assets/brand/logo.png`;
  const safeCode = escapeHtml(code);
  const safeVerifyUrl = escapeHtml(verifyUrl);
  const safeLogoUrl = escapeHtml(logoUrl);

  const text = [
    'Verify your RPS account',
    '',
    `Your verification code is: ${code}`,
    `Link: ${verifyUrl}`,
    '',
    'This code expires in 30 minutes.',
    '',
    'If you did not create this account, you can safely ignore this message.',
  ].join('\n');

  await transporter.sendMail({
    from,
    to,
    subject: 'Verify your RPS account',
    text,
    html: `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Verify your RPS account</title>
        </head>
        <body style="margin:0;padding:0;background:#05070d;color:#f8fafc;font-family:Inter,Segoe UI,Arial,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#05070d;padding:32px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;overflow:hidden;border-radius:28px;border:1px solid rgba(255,255,255,0.12);background:#0b1020;">
                  <tr>
                    <td style="padding:28px 28px 18px;text-align:center;background:linear-gradient(135deg,#101827 0%,#121826 48%,#172554 100%);">
                      <img src="${safeLogoUrl}" width="72" height="72" alt="RPS elephant logo" style="display:block;margin:0 auto 16px;border-radius:22px;border:1px solid rgba(255,255,255,0.18);">
                      <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#93c5fd;">Risk Paper Scammers</div>
                      <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Verify your email</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#cbd5e1;">
                        Use this six-digit code to finish creating your RPS account. The code expires in 30 minutes.
                      </p>
                      <div style="margin:24px 0;padding:18px;border-radius:18px;background:#111827;border:1px solid rgba(255,255,255,0.1);text-align:center;">
                        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#94a3b8;">Verification code</div>
                        <div style="margin-top:8px;font-size:36px;line-height:1;font-weight:800;letter-spacing:0.18em;color:#ffffff;">${safeCode}</div>
                      </div>
                      <a href="${safeVerifyUrl}" style="display:block;margin:0 auto 22px;padding:14px 18px;border-radius:14px;background:#2563eb;color:#ffffff;text-align:center;text-decoration:none;font-weight:700;">
                        Verify account
                      </a>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;">
                        If the button does not work, copy and paste this link into your browser:
                        <br>
                        <a href="${safeVerifyUrl}" style="color:#93c5fd;word-break:break-all;">${safeVerifyUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 28px 26px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;line-height:1.6;color:#64748b;">
                      If you did not create this account, you can safely ignore this email. No account access is granted until the email is verified.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
};
