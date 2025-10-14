const Course = require("../models/Course");
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Helper function to get user from token
const getUserFromToken = (req) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.user;
    }
    return null;
  } catch (err) {
    return null;
  }
};

// Get all courses for the logged-in teacher
exports.getCourses = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const teacherId = user?.id || req.query.teacherId;
    
    if (!teacherId) {
      return res.status(400).json({ error: "Teacher ID is required" });
    }
    
    const courses = await Course.find({ teacher: teacherId });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const teacherId = user?.id;
    
    if (!teacherId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { name, courseCode, description } = req.body;
    
    // Check if course code already exists for this teacher
    const existingCourse = await Course.findOne({ courseCode, teacher: teacherId });
    if (existingCourse) {
      return res.status(400).json({ error: "Course code already exists" });
    }
    
    const newCourse = new Course({
      name,
      courseCode,
      description,
      teacher: teacherId,
    });
    
    const course = await newCourse.save();
    console.log('Course created:', course.name, 'by teacher:', teacherId);
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update an existing course
exports.updateCourse = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const teacherId = user?.id;
    
    if (!teacherId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify the course belongs to this teacher
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    if (course.teacher.toString() !== teacherId) {
      return res.status(403).json({ error: "Not authorized to update this course" });
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    console.log('Course updated:', updatedCourse.name);
    res.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const teacherId = user?.id;
    
    if (!teacherId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify the course belongs to this teacher
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    if (course.teacher.toString() !== teacherId) {
      return res.status(403).json({ error: "Not authorized to delete this course" });
    }
    
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    console.log('Course deleted:', deletedCourse.name);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: error.message });
  }
};