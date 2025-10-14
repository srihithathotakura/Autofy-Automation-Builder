const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/assignments" }); // or use memory storage etc.
const controller = require("../controllers/assignmentSubmissionController");

router.post("/", upload.single("file"), controller.createAssignmentSubmission);
router.get("/", controller.getAllSubmissions);

module.exports = router;
