const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ['Student', 'Teacher', 'Administrator'],
    default: 'Student',
  },
  googleId: {
    type: String,
  },
  connectedApps: [{
    appName: String,
    accessToken: String,
    refreshToken: String,
    expiryDate: Date,
    accountEmail: String,
    scope: [String],
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);