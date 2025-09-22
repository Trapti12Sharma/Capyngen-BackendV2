// routes/blog.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const adminAuth = require("../middleware/admin");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

// Protect route with adminAuth
router.post(
  "/",
  adminAuth,
  [
    body("title").trim().notEmpty(),
    body("author").trim().notEmpty(),
    body("content").trim().notEmpty(),
    body("tags").optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ ok: false, errors: errors.array() });

    const { title, author, content, tags, url } = req.body;

    try {
      const html = `<h3>New blog posted</h3>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Author:</strong> ${author}</p>
        <p><strong>Tags:</strong> ${
          Array.isArray(tags) ? tags.join(", ") : tags || ""
        }</p>
        ${url ? `<p><strong>URL:</strong> <a href="${url}">${url}</a></p>` : ""}
        <hr/>
        <div>${content}</div>
      `;

      await sendMail({
        to: process.env.COMPANY_EMAIL,
        subject: `[Blog] New post: ${title}`,
        html,
      });

      // NOTE: this route only sends email. If you need to save the blog to DB, add DB code here.
      return res.json({ ok: true, message: "Blog notification sent" });
    } catch (err) {
      console.error("Blog email error:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Failed to send blog email" });
    }
  }
);

module.exports = router;
