const RequestTemplate = require("../models/RequestTemplate");

// Create new template request
exports.createTemplateRequest = async (req, res) => {
  try {
    const newRequest = new RequestTemplate(req.body);
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all template requests
exports.getAllTemplateRequests = async (req, res) => {
  try {
    const requests = await RequestTemplate.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update template request by ID
exports.updateTemplateRequest = async (req, res) => {
  try {
    const updated = await RequestTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Request Template not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete template request by ID
exports.deleteTemplateRequest = async (req, res) => {
  try {
    const deleted = await RequestTemplate.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Request Template not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
