const Resource = require("../models/Resource");

// Get all resources by course
exports.getResources = async (req, res) => {
  try {
    const { courseId } = req.query;
    const teacherId = req.user?.id;
    const filter = { teacher: teacherId };
    if (courseId) filter.course = courseId;

    const resources = await Resource.find(filter);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create/upload a new resource
exports.createResource = async (req, res) => {
  try {
    const { course, title, description } = req.body;
    if (!req.file) return res.status(400).json({ error: "File is required" });
    const teacherId = req.user?.id;

    const newResource = new Resource({
      course,
      title,
      description,
      filePath: req.file.path,
      teacher: teacherId,
    });

    const resource = await newResource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
