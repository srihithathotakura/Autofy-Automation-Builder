const express = require("express");
const router = express.Router();
const controller = require("../controllers/profileController");

// Secure with auth middleware as appropriate

router.get("/me", controller.getProfile);
router.post("/", controller.createOrUpdateProfile);

module.exports = router;
