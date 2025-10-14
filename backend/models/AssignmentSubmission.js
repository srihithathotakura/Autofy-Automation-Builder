const mongoose = require("mongoose");

const AssignmentSubmissionSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  courseName: { type: String, required: true },
  filePath: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
