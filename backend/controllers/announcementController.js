const Announcement = require("../models/Announcement");

// Get all announcements for a specific course
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ course: req.query.courseId }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { course, title, content, teacher } = req.body;
    const newAnnouncement = new Announcement({ course, title, content, teacher });
    const announcement = await newAnnouncement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
