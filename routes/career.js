// routes/career.js
const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const path = require("path");
const { sendMail } = require("../utils/mailer");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const uploadDir = process.env.UPLOAD_DIR || "./uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept pdf, doc, docx (you can expand)
  const allowed = /pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only .pdf .doc .docx allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6 MB
  fileFilter,
});

const router = express.Router();

router.post(
  "/",
  upload.single("resume"),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("phone").optional().trim(),
    body("position").trim().notEmpty(),
    body("coverLetter").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // if multer created a file but validation failed, you may want to delete file (left as exercise)
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    const { name, email, phone, position, coverLetter } = req.body;
    const resumeFile = req.file;

    try {
      const html = `<h3>Job application: ${position}</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "—"}</p>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Cover letter:</strong><br/>${(coverLetter || "").replace(
          /\n/g,
          "<br/>"
        )}</p>`;

      const attachments = resumeFile
        ? [
            {
              filename: resumeFile.originalname,
              path: resumeFile.path,
            },
          ]
        : [];

      await sendMail({
        to: process.env.COMPANY_EMAIL,
        subject: `[Career] Application for ${position} — ${name}`,
        html,
        attachments,
      });

      return res.json({ ok: true, message: "Application sent" });
    } catch (err) {
      console.error("Career email error:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Failed to send application" });
    }
  }
);

module.exports = router;
