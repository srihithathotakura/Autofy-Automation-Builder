
const Grade = require("../models/Grade");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Get grades by teacher
exports.getGrades = async (req, res) => {
  try {
    const { courseId, teacherId } = req.query;
    
    // Get teacher ID from query or token
    let authTeacherId = teacherId;
    
    if (!authTeacherId) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        authTeacherId = decoded.user.id;
      }
    }
    
    if (!authTeacherId) {
      return res.status(400).json({ error: "Teacher ID required" });
    }

    const filter = { teacher: authTeacherId };
    if (courseId) filter.course = courseId;

    const grades = await Grade.find(filter).sort({ createdAt: -1 });
    console.log(`✓ Found ${grades.length} grades for teacher ${authTeacherId}`);
    res.json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new grade
exports.createGrade = async (req, res) => {
  try {
    // Get teacher ID from token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let teacherId;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        teacherId = decoded.user.id;
      } catch (err) {
        console.error('Token error:', err);
      }
    }
    
    if (!teacherId) {
      return res.status(401).json({ error: "Authentication required. Please login again." });
    }
    
    const { course, studentIdentifier, assignmentName, score, totalPoints } = req.body;
    
    // Validate required fields
    if (!course || !studentIdentifier || !assignmentName || !score || !totalPoints) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    const newGrade = new Grade({
      course: course.toString(), // Ensure it's a string
      studentIdentifier: studentIdentifier.toString(),
      assignmentName: assignmentName.toString(),
      score: Number(score),
      totalPoints: Number(totalPoints),
      teacher: teacherId
    });
    
    const grade = await newGrade.save();
    console.log('✓ Grade created:', {
      id: grade._id,
      student: grade.studentIdentifier,
      course: grade.course,
      score: `${grade.score}/${grade.totalPoints}`
    });
    
    res.status(201).json(grade);
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update grade
exports.updateGrade = async (req, res) => {
  try {
    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedGrade) {
      return res.status(404).json({ error: "Grade not found" });
    }
    
    console.log('✓ Grade updated:', updatedGrade._id);
    res.json(updatedGrade);
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete grade
exports.deleteGrade = async (req, res) => {
  try {
    const deletedGrade = await Grade.findByIdAndDelete(req.params.id);
    
    if (!deletedGrade) {
      return res.status(404).json({ error: "Grade not found" });
    }
    
    console.log('✓ Grade deleted:', deletedGrade._id);
    res.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: error.message });
  }
};