const Student = require("../models/Student");

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { name, email, studentId, course } = req.body;
    const teacherId = req.user?.id || req.body.teacherId;

    const newStudent = new Student({
      name,
      email,
      studentId,
      course,
      teacher: teacherId,
    });

    const student = await newStudent.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all students for a teacher
exports.getStudents = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.query.teacherId;
    const { course } = req.query;

    const filter = { teacher: teacherId };
    if (course) filter.course = course;

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};