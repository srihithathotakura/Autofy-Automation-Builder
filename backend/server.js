require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const app = express();

// CORS - MUST be before routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session - MUST be before passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // MUST be false for http://localhost
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/autofy_db')
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB error:', err));

// Routes - Order matters!
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/oauth', require('./routes/oauthRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));
app.use('/api/workflows', require('./routes/workflowRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/request-demo', require('./routes/RequestDemoRoutes'));
app.use('/api/request-template', require('./routes/RequestTemplateRoutes'));
app.use('/api/assignment-submission', require('./routes/assignmentRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.listen(5000, () => console.log('✓ Server on http://localhost:5000'));
