#!/usr/bin/env node
import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = 8000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Endpoint to refresh Strava data
app.get('/api/refresh-strava', (req, res) => {
  console.log('Refreshing Strava data...');
  
  // Execute the fetch-all-activities.js script
  exec('node fetch-all-activities.js', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ success: false, error: stderr });
    }
    
    console.log(`stdout: ${stdout}`);
    return res.json({ 
      success: true, 
      message: 'Strava data refreshed successfully',
      details: stdout
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}/dashboard.html`);
});
