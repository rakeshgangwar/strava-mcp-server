#!/usr/bin/env node
import express from 'express';
import axios from 'axios';
import open from 'open';
import { randomBytes } from 'crypto';

// Get command line arguments
const CLIENT_ID = process.argv[2];
const CLIENT_SECRET = process.argv[3];

// Check if required arguments are provided
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Usage: node get-strava-token.js CLIENT_ID CLIENT_SECRET');
  console.error('');
  console.error('You need to create a Strava API application first:');
  console.error('1. Go to https://www.strava.com/settings/api');
  console.error('2. Create an application to get your Client ID and Client Secret');
  console.error('3. Set the Authorization Callback Domain to: localhost');
  process.exit(1);
}

// Create Express app
const app = express();
const PORT = 3000;
const STATE = randomBytes(16).toString('hex');

// Authorization URL
const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost:${PORT}/callback&approval_prompt=force&scope=activity:read_all,activity:write&state=${STATE}`;

// Setup routes
app.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      res.send(`<h1>Error</h1><p>${error}</p>`);
      console.error(`Error: ${error}`);
      return;
    }
    
    if (state !== STATE) {
      res.send('<h1>Error</h1><p>Invalid state parameter</p>');
      console.error('Error: Invalid state parameter');
      return;
    }
    
    // Exchange code for token
    const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });
    
    const { access_token, refresh_token, expires_at, expires_in } = tokenResponse.data;
    
    // Display success message
    res.send('<h1>Success!</h1><p>You can close this window and check the terminal for your tokens.</p>');
    
    // Log tokens
    console.log('\n=== Strava API Tokens ===');
    console.log(`Access Token: ${access_token}`);
    console.log(`Refresh Token: ${refresh_token}`);
    console.log(`Expires At: ${new Date(expires_at * 1000).toLocaleString()}`);
    console.log(`Expires In: ${expires_in} seconds`);
    console.log('\nAdd these values to your MCP settings file:');
    console.log(`STRAVA_CLIENT_ID: ${CLIENT_ID}`);
    console.log(`STRAVA_CLIENT_SECRET: ${CLIENT_SECRET}`);
    console.log(`STRAVA_REFRESH_TOKEN: ${refresh_token}`);
    
    // Close server after a delay
    setTimeout(() => {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    }, 3000);
  } catch (error) {
    console.error('Error:', error.message);
    res.send('<h1>Error</h1><p>Failed to exchange authorization code for tokens</p>');
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Strava Authorization</h1><p>Authorization in progress...</p>');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Opening Strava authorization page...');
  console.log('Please log in to your Strava account and authorize the application.');
  
  // Open browser
  open(authUrl);
});

console.log('Waiting for Strava authorization...');
