const RequestDemo = require("../models/RequestDemo");

// Create new demo request
exports.createDemoRequest = async (req, res) => {
  try {
    const newRequest = new RequestDemo(req.body);
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all demo requests
exports.getAllDemoRequests = async (req, res) => {
  try {
    const requests = await RequestDemo.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update demo request by ID
exports.updateDemoRequest = async (req, res) => {
  try {
    const updated = await RequestDemo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Request Demo not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete demo request by ID
exports.deleteDemoRequest = async (req, res) => {
  try {
    const deleted = await RequestDemo.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Request Demo not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
