const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/resources" });
const controller = require("../controllers/resourceController");

router.get("/", controller.getResources);
router.post("/", upload.single("file"), controller.createResource);

module.exports = router;
