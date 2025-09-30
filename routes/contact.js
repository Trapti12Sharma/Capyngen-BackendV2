// routes/contact.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

// small helper to escape HTML so user input doesn't break the email layout
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("message").trim().notEmpty(),
    body("subject").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ ok: false, errors: errors.array() });

    const { name, email, subject = "Contact via website", message } = req.body;

    // build formal HTML and plain-text email
    const sentAt = new Date().toLocaleString();
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#222; line-height:1.5;">
        <h2 style="margin-bottom:6px;color:#0b66c3">📩 New Contact Form Submission</h2>
        <table style="border-collapse:collapse;">
          <tr>
            <td style="padding:4px 8px; vertical-align:top;"><strong>Name:</strong></td>
            <td style="padding:4px 8px;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px; vertical-align:top;"><strong>Email:</strong></td>
            <td style="padding:4px 8px;">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px; vertical-align:top;"><strong>Subject:</strong></td>
            <td style="padding:4px 8px;">${escapeHtml(subject)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px; vertical-align:top;"><strong>Message:</strong></td>
            <td style="padding:4px 8px;">${escapeHtml(message).replace(
              /\n/g,
              "<br/>"
            )}</td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
        <p style="font-size:12px;color:#666">Sent from capyngen.com contact form on ${escapeHtml(
          sentAt
        )}</p>
      </div>
    `;

    const text = [
      "New contact form submission",
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "Message:",
      message,
      "",
      `Sent: ${new Date().toISOString()}`,
    ].join("\n");

    try {
      await sendMail({
        to: process.env.COMPANY_EMAIL,
        subject: `[Contact] ${subject} — ${name}`,
        replyTo: email,
        text, // ✅ use the prepared plain text
        html, // ✅ use the prepared HTML
      });

      return res.json({ ok: true, message: "Sent" });
    } catch (err) {
      console.error("Contact email error:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Failed to send email" });
    }
  }
);

module.exports = router;
