const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentController");

// @route   POST /api/students
// @desc    Create a new student
router.post("/", controller.createStudent);

// @route   GET /api/students
// @desc    Get all students for a teacher (with optional course filter)
router.get("/", controller.getStudents);

// @route   GET /api/students/:id
// @desc    Get student by ID
router.get("/:id", controller.getStudentById);

// @route   PUT /api/students/:id
// @desc    Update student
router.put("/:id", controller.updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete student
router.delete("/:id", controller.deleteStudent);

module.exports = router;