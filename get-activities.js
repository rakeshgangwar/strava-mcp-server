#!/usr/bin/env node
import axios from 'axios';

// Strava API credentials
const STRAVA_CLIENT_ID = '64451';
const STRAVA_CLIENT_SECRET = 'deb1ba5b0ad8e54bd43d28def7bf17e8b6edac23';
const STRAVA_REFRESH_TOKEN = 'c677dbae77035838f4f1832090972f28519592cb';

async function getAccessToken() {
  try {
    const response = await axios.post(
      'https://www.strava.com/oauth/token',
      {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing Strava access token:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

async function getAthleteActivities() {
  try {
    const accessToken = await getAccessToken();
    
    const response = await axios.get(
      'https://www.strava.com/api/v3/athlete/activities',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: 1,
          per_page: 10,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

async function main() {
  try {
    const activities = await getAthleteActivities();
    
    console.log('Recent Strava Activities:');
    console.log('========================');
    
    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.name}`);
      console.log(`   Type: ${activity.type}`);
      console.log(`   Date: ${new Date(activity.start_date_local).toLocaleString()}`);
      console.log(`   Distance: ${(activity.distance / 1000).toFixed(2)} km`);
      console.log(`   Duration: ${Math.floor(activity.moving_time / 60)} minutes`);
      console.log(`   Elevation Gain: ${activity.total_elevation_gain} m`);
      console.log('------------------------');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
