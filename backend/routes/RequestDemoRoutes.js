const express = require("express");
const router = express.Router();
const controller = require("../controllers/requestDemoController");

router.post("/", controller.createDemoRequest);
router.get("/", controller.getAllDemoRequests);
router.put("/:id", controller.updateDemoRequest);
router.delete("/:id", controller.deleteDemoRequest);

module.exports = router;
