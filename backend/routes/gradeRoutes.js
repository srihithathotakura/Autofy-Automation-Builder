const express = require("express");
const router = express.Router();
const controller = require("../controllers/gradeController");

router.get("/", controller.getGrades);
router.post("/", controller.createGrade);
router.put("/:id", controller.updateGrade);
router.delete("/:id", controller.deleteGrade);

module.exports = router;
