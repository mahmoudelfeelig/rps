const nodemailer = require('nodemailer');

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

  const text = [
    'Verify your RPS account',
    '',
    `Code: ${code}`,
    `Link: ${verifyUrl}`,
    '',
    'If you did not create this account, you can ignore this message.',
  ].join('\n');

  await transporter.sendMail({
    from,
    to,
    subject: 'Verify your RPS account',
    text,
    html: `
      <p>Verify your RPS account</p>
      <p><strong>Code:</strong> ${code}</p>
      <p><a href="${verifyUrl}">Verify account</a></p>
      <p>If you did not create this account, you can ignore this message.</p>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
};
