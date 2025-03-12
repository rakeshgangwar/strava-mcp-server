#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';

// Strava API credentials
const STRAVA_CLIENT_ID = '64451';
const STRAVA_CLIENT_SECRET = 'deb1ba5b0ad8e54bd43d28def7bf17e8b6edac23';
const STRAVA_REFRESH_TOKEN = 'c677dbae77035838f4f1832090972f28519592cb';

// Date range (December 21, 2019 to today)
const START_DATE = new Date('2019-12-21T00:00:00Z');
const START_TIMESTAMP = Math.floor(START_DATE.getTime() / 1000);

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

async function getAllActivities() {
  const accessToken = await getAccessToken();
  let page = 1;
  let allActivities = [];
  let hasMoreActivities = true;
  
  console.log('Fetching all activities since December 21, 2019...');
  
  while (hasMoreActivities) {
    try {
      const response = await axios.get(
        'https://www.strava.com/api/v3/athlete/activities',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            after: START_TIMESTAMP,
            page: page,
            per_page: 100, // Maximum allowed by Strava API
          },
        }
      );
      
      const activities = response.data;
      
      if (activities.length === 0) {
        hasMoreActivities = false;
      } else {
        allActivities = [...allActivities, ...activities];
        console.log(`Fetched page ${page} (${activities.length} activities)`);
        page++;
        
        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error fetching activities on page ${page}:`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      hasMoreActivities = false;
    }
  }
  
  // Filter to include runs and trail runs
  const runActivities = allActivities.filter(activity => 
    activity.type === 'Run' || activity.type === 'TrailRun'
  );
  
  console.log(`Total activities fetched: ${allActivities.length}`);
  console.log(`Total runs (including trail runs): ${runActivities.length}`);
  
  // Group by day to match number of days
  const runsByDay = {};
  runActivities.forEach(activity => {
    const date = activity.start_date_local.split('T')[0];
    if (!runsByDay[date]) {
      runsByDay[date] = [];
    }
    runsByDay[date].push(activity);
  });
  
  console.log(`Total days with runs: ${Object.keys(runsByDay).length}`);
  
  // Save to file
  fs.writeFileSync('run-activities.json', JSON.stringify(runActivities, null, 2));
  console.log('Run activities saved to run-activities.json');
  
  // Save days data to file
  fs.writeFileSync('run-days.json', JSON.stringify({
    totalDays: Object.keys(runsByDay).length,
    daysList: Object.keys(runsByDay).sort()
  }, null, 2));
  console.log('Run days data saved to run-days.json');
  
  return runActivities;
}

getAllActivities();
