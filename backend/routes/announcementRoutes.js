const express = require("express");
const router = express.Router();
const controller = require("../controllers/announcementController");

router.get("/", controller.getAnnouncements);
router.post("/", controller.createAnnouncement);

module.exports = router;
