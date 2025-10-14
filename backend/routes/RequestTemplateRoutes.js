const express = require("express");
const router = express.Router();
const controller = require("../controllers/requestTemplateController");

router.post("/", controller.createTemplateRequest);
router.get("/", controller.getAllTemplateRequests);
router.put("/:id", controller.updateTemplateRequest);
router.delete("/:id", controller.deleteTemplateRequest);

module.exports = router;