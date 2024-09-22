const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/api/auth/google/callback'
);

// Add a new endpoint to initiate the OAuth flow
app.get('/api/auth/google', (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    redirect_uri: 'http://localhost:5000/api/auth/google/callback'
  });
  res.redirect(authUrl);
});

// Add a callback endpoint for Google to redirect to after authentication
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    // Here, you'd typically save the tokens to your database
    // associated with the user's session

    res.redirect('http://localhost:3001/auth-success');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.redirect('http://localhost:3001/auth-error');
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));