const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // heading
    description: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String }, // image URL
    author: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
