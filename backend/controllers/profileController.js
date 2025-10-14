const Profile = require("../models/Profile");

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const profile = await Profile.findOne({ user: userId }).populate("user", "name email");
    if (!profile) return res.status(400).json({ msg: "No profile found for this user" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { major, university, year, bio } = req.body;
    const profileFields = { user: userId, major, university, year, bio };
    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
