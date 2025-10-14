const AssignmentSubmission = require("../models/AssignmentSubmission");

// Create a new assignment submission
exports.createAssignmentSubmission = async (req, res) => {
  try {
    const { studentName, studentId, courseName } = req.body;
    if (!req.file) return res.status(400).json({ error: "File is required" });

    const newSubmission = new AssignmentSubmission({
      studentName,
      studentId,
      courseName,
      filePath: req.file.path, // Assuming file storage path
    });

    const savedSubmission = await newSubmission.save();
    res.status(201).json(savedSubmission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all submissions (optional: add filters by course, student etc.)
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
