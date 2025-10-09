const express = require("express");
const { body, validationResult } = require("express-validator");
const Career = require("../models/Career");

const router = express.Router();

// ✅ Create Career Opening
router.post(
  "/",
  [
    body("title").trim().notEmpty(),
    body("department").trim().notEmpty(),
    body("location").trim().notEmpty(),
    body("jobType").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("requirements").optional(),
    body("applyLink").optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ ok: false, errors: errors.array() });

    try {
      const career = new Career(req.body);
      await career.save();
      res.json({ ok: true, message: "Career created successfully", career });
    } catch (err) {
      console.error("Career create error:", err);
      res.status(500).json({ ok: false, message: "Failed to create career" });
    }
  }
);

// ✅ Get all Careers
router.get("/", async (req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    res.json({ ok: true, careers });
  } catch (err) {
    console.error("Fetch careers error:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch careers" });
  }
});

// ✅ Update Career
router.put("/:id", async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!career)
      return res.status(404).json({ ok: false, message: "Career not found" });

    res.json({ ok: true, message: "Career updated successfully", career });
  } catch (err) {
    console.error("Career update error:", err);
    res.status(500).json({ ok: false, message: "Failed to update career" });
  }
});

// ✅ Delete Career
router.delete("/:id", async (req, res) => {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);
    if (!career)
      return res.status(404).json({ ok: false, message: "Career not found" });

    res.json({ ok: true, message: "Career deleted successfully" });
  } catch (err) {
    console.error("Career delete error:", err);
    res.status(500).json({ ok: false, message: "Failed to delete career" });
  }
});

module.exports = router;
