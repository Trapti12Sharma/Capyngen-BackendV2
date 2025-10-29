// routes/upload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Helper: sanitize filename (remove problematic chars, replace spaces with '-')
function sanitizeFilename(name) {
  // remove path separators, replace spaces with '-', remove other bad chars
  return name
    .replace(/[/\\?%*:|"<>]/g, "") // remove invalid filename chars
    .replace(/\s+/g, "-") // spaces -> dash
    .replace(/-+/g, "-") // collapse repeated dashes
    .trim();
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Keep the original extension
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = sanitizeFilename(base);
    const uniqueName = `${Date.now()}-${safeBase}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/upload - Upload single image
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  // No percent-encoding needed since filename is sanitized
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({ url: imageUrl });
});

module.exports = router;
