// utils/mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// optional: verify at startup
transporter
  .verify()
  .then(() => {
    console.log("SMTP transporter verified");
  })
  .catch((err) => {
    console.error("SMTP verification error:", err.message || err);
  });

/**
 * sendMail - sends an email.
 * Accepts: { to, subject, html, text, attachments, replyTo }
 * replyTo will be set as the "Reply-To" so replies go to the user who submitted the form.
 */
async function sendMail({ to, subject, html, text, attachments, replyTo }) {
  // Display name (optional) — you can change MAIL_FROM_NAME in .env
  const displayName = process.env.MAIL_FROM_NAME || "Capyngen";
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
  const from = `"${displayName}" <${fromAddress}>`;

  const mailOptions = {
    from,
    to,
    subject,
    text, // plain text fallback
    html, // html content
    attachments,
  };

  if (replyTo) mailOptions.replyTo = replyTo;

  // Debug logs (useful for local testing)
  console.log("Sending mail with options:", {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    replyTo: mailOptions.replyTo,
  });

  const info = await transporter.sendMail(mailOptions);

  // nodemailer/sendgrid returns messageId and response — useful to debug
  console.log("Mail sent:", {
    messageId: info.messageId,
    response: info.response,
  });

  return info;
}

module.exports = { transporter, sendMail };
