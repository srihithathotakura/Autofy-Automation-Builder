const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim();

// Passport config - only register Google strategy if credentials are actually
// set. Without this guard, passport-google-oauth20 throws at startup and
// crashes the ENTIRE server (not just Google login) when these are missing.
const googleAuthEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (googleAuthEnabled) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'Student'
          });
          await user.save();
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
} else {
  console.warn('⚠ GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set - Google Sign-In is disabled, everything else still works.');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Student'
    });
    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Regular login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    if (role && user.role !== role) {
      return res.status(400).json({ msg: 'Wrong role' });
    }
    const token = jwt.sign({ user: { id: user.id, role: user.role } }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google login routes
router.get('/google', (req, res, next) => {
  if (!googleAuthEnabled) {
    return res.status(503).json({ msg: 'Google Sign-In is not configured on this server yet.' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    if (!googleAuthEnabled) {
      return res.redirect(`${FRONTEND_URL}/login`);
    }
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` })(req, res, next);
  },
  (req, res) => {
    const token = jwt.sign({ user: { id: req.user.id, role: req.user.role } }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND_URL}/auth-success?token=${token}&role=${req.user.role}&userId=${req.user.id}&name=${req.user.name}`);
  }
);

module.exports = router;

