const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true }, // Full-time / Remote / Internship
    description: { type: String, required: true },
    requirements: { type: String }, // optional field
    applyLink: { type: String }, // external link or application form link
  },
  { timestamps: true }
);

module.exports = mongoose.model("Career", CareerSchema);
