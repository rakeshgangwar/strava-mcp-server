# Strava Running Dashboard

A modern dashboard to visualize running statistics from Strava, featuring a perfect streak tracker and top runs display.

## Features

- **Real-time Strava Data**: Fetches all running activities (including trail runs) from Strava API
- **Comprehensive Statistics**: Shows total runs, distance, elevation gain, and days tracked
- **Perfect Streak Tracking**: Tracks consecutive days of running without missing a day
- **Top Runs Display**: Showcases your 5 longest runs by distance and duration
- **Responsive Design**: Modern, mobile-friendly interface with a blue theme
- **One-Click Refresh**: Update your dashboard with fresh Strava data with a single click

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Strava API credentials (Client ID, Client Secret, and Refresh Token)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/strava-running-dashboard.git
   cd strava-running-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your Strava API credentials:
   - Edit `fetch-all-activities.js` and `get-activities.js` to include your Strava API credentials:
     ```javascript
     const STRAVA_CLIENT_ID = 'your-client-id';
     const STRAVA_CLIENT_SECRET = 'your-client-secret';
     const STRAVA_REFRESH_TOKEN = 'your-refresh-token';
     ```

4. Start the server:
   ```
   node server.js
   ```

5. Access the dashboard:
   Open your browser and navigate to `http://localhost:8000/dashboard.html`

### Obtaining Strava API Credentials

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create an application to get your Client ID and Client Secret
3. Set the Authorization Callback Domain to: `localhost`
4. Run the token generator script:
   ```
   node get-strava-token.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET
   ```
5. Follow the prompts to authorize the application and get your refresh token

## Usage

- **View Statistics**: Open the dashboard to see your running statistics since December 21, 2019
- **Refresh Data**: Click the refresh button in the top-right corner to fetch the latest data from Strava
- **Check Streak**: The dashboard shows your current running streak and days with runs

## Files

- `server.js` - Express server with API endpoints for refreshing Strava data
- `fetch-all-activities.js` - Script to fetch all running activities from Strava
- `dashboard.html` - The main dashboard interface
- `get-activities.js` - Script to fetch recent Strava activities
- `check-streak.js` - Script to analyze running streak data
- `get-strava-token.js` - Helper script to obtain Strava API tokens

## Security Note

For production deployment, it's recommended to:
1. Use environment variables for API credentials instead of hardcoding them
2. Implement proper authentication for the dashboard
3. Set up HTTPS for secure communication

## License

MIT

## Author

Created by Rudi de Bruyn
