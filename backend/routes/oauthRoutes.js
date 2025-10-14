// ===== backend/routes/oauthRoutes.js - FIXED VERSION =====
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const User = require('../models/User');

const SCOPES = {
  'Gmail': [
    'https://www.googleapis.com/auth/gmail.send', 
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  'Google Drive': [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  'Google Calendar': [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  'Google Sheets': [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]
};

router.get('/connect/:app', (req, res) => {
  const { app } = req.params;
  const { userId } = req.query;
  
  console.log('Connect request:', { app, userId });
  
  if (!userId || !SCOPES[app]) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5000/api/oauth/callback'
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES[app],
    state: JSON.stringify({ userId, app }),
    prompt: 'consent'
  });

  console.log('Auth URL generated');
  res.json({ authUrl });
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  console.log('Callback received:', { hasCode: !!code, state, error });

  if (error || !code) {
    return res.redirect(`http://localhost:3000/integrations/error?reason=${error || 'no_code'}`);
  }

  try {
    const { userId, app } = JSON.parse(state);
    
    // Create OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:5000/api/oauth/callback'
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', { 
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token 
    });

    // CRITICAL FIX: Set credentials BEFORE making API call
    oauth2Client.setCredentials(tokens);

    // Get user email - NOW with proper credentials
    const oauth2 = google.oauth2({ 
      version: 'v2', 
      auth: oauth2Client  // Use the client with credentials set
    });
    
    const { data } = await oauth2.userinfo.get();
    console.log('User info retrieved:', data.email);

    // Save to database
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.redirect('http://localhost:3000/integrations/error?reason=user_not_found');
    }

    // Remove existing connection for this app+email
    user.connectedApps = user.connectedApps.filter(
      ca => !(ca.appName === app && ca.accountEmail === data.email)
    );

    // Add new connection
    user.connectedApps.push({
      appName: app,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      accountEmail: data.email,
      scope: SCOPES[app],
      connectedAt: new Date()
    });

    await user.save();
    console.log('✓ Connection saved:', app, data.email);

    res.redirect(`http://localhost:3000/integrations/success?app=${encodeURIComponent(app)}&email=${encodeURIComponent(data.email)}`);
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.redirect(`http://localhost:3000/integrations/error?reason=${encodeURIComponent(err.message)}`);
  }
});

router.get('/connected-apps/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('connectedApps');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const apps = user.connectedApps.map(app => ({
      appName: app.appName,
      accountEmail: app.accountEmail,
      connectedAt: app.connectedAt,
      scope: app.scope
    }));
    
    res.json(apps);
  } catch (err) {
    console.error('Error fetching apps:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/disconnect/:userId/:app/:email', async (req, res) => {
  try {
    const { userId, app, email } = req.params;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.connectedApps = user.connectedApps.filter(
      ca => !(ca.appName === app && ca.accountEmail === decodeURIComponent(email))
    );

    await user.save();
    console.log('✓ App disconnected:', app, email);
    
    res.json({ message: 'App disconnected successfully' });
  } catch (err) {
    console.error('Error disconnecting:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;