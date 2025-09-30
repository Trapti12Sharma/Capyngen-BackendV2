// utils/mailer.js
require("dotenv").config();
const sgMail = require("@sendgrid/mail");

// set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * sendMail - sends an email via SendGrid API.
 * Accepts: { to, subject, html, text, replyTo }
 */
async function sendMail({ to, subject, html, text, replyTo }) {
  const displayName = process.env.MAIL_FROM_NAME || "Capyngen";
  const fromAddress = process.env.SMTP_FROM || process.env.COMPANY_EMAIL;

  const msg = {
    to,
    from: {
      email: fromAddress,
      name: displayName,
    },
    subject,
    text,
    html,
    replyTo,
  };

  // Debug logs
  console.log("📧 Sending mail with SendGrid:", {
    from: msg.from,
    to: msg.to,
    subject: msg.subject,
    replyTo: msg.replyTo,
  });

  try {
    const [response] = await sgMail.send(msg);
    console.log("✅ Mail sent:", response.statusCode, response.headers);
    return { ok: true, status: response.statusCode };
  } catch (err) {
    console.error("❌ SendGrid error:", err.response?.body || err.message);
    throw err;
  }
}

module.exports = { sendMail };
