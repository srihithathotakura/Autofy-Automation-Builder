const mongoose = require("mongoose");

const RequestDemoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
  organization: { type: String, required: true },
  role: { type: String, enum: ["Student", "Teacher", "Admin", "Other"], required: true },
  phone: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  questions: { type: String, default: "" },
  demoType: { type: String },
  status: { type: String },
  attendees: { type: Number, min: 0 },
  durationMinutes: { type: Number, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model("RequestDemo", RequestDemoSchema);
