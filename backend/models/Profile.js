const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  major: { type: String, trim: true },
  university: { type: String, trim: true },
  year: { type: Number, min: 1 },
  bio: { type: String }
});

module.exports = mongoose.model("Profile", ProfileSchema);
