const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  courseCode: { type: String, required: true, trim: true, unique: true },
  description: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Course", CourseSchema);
