const mongoose = require("mongoose");

const RequestTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
  organization: { type: String, required: true },
  role: { type: String, enum: ["Student", "Teacher", "Admin", "Other"], required: true },
  templateType: { type: String, required: true },
  description: { type: String, required: true, minlength: 20 },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  contactPhone: { type: String },
  requiredBy: { type: Date },
  complexity: { type: String },
  expectedOutcome: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("RequestTemplate", RequestTemplateSchema);
