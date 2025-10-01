const express = require("express");
const { body, validationResult } = require("express-validator");
const Blog = require("../models/Blog");

const router = express.Router();

// Create Blog Post
router.post(
  "/",
  [
    body("title").trim().notEmpty(),
    body("author").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("content").trim().notEmpty(),
    body("tags").optional(),
    body("image").optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ ok: false, errors: errors.array() });

    try {
      const { title, author, description, content, tags, image } = req.body;

      const blog = new Blog({
        title,
        author,
        description,
        content,
        image,
        tags: Array.isArray(tags) ? tags : [tags],
      });

      console.log("📩 Incoming body:", req.body);

      await blog.save();

      res.json({ ok: true, message: "Blog saved successfully", blog });
    } catch (err) {
      console.error("Blog save error:", err);
      res.status(500).json({ ok: false, message: "Failed to save blog" });
    }
  }
);

// Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ ok: true, blogs });
  } catch (err) {
    console.error("Fetch blogs error:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch blogs" });
  }
});

module.exports = router;
