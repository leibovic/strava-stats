import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Home Route
app.get('/', (req, res) => {
    res.render('index', { authUrl: getStravaAuthUrl() });
  });

// Redirect to Strava for Authentication
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;

    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      });

      // TODO: render a loading icon with explanation this takes time

      const accessToken = tokenResponse.data.access_token;
      const data = await getActivitiesPerYear(accessToken);
      const runStats = getRunStats(data);

      // Render the stats
      res.render('stats', { runStats });
    } catch (error) {
      console.error(error);
      res.send('An error occurred during authentication.');
    }
  });

  // Generate Strava OAuth URL
  function getStravaAuthUrl() {
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=activity:read`;
    return authUrl;
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

const currentYear = new Date().getFullYear();
const startYear = 2010;

const getActivitiesUrl = (before, after, page, perPage) => {
    const activitiesUrl = new URL('https://www.strava.com/api/v3/athlete/activities');
    activitiesUrl.searchParams.append('before', before);
    activitiesUrl.searchParams.append('after', after);
    activitiesUrl.searchParams.append('page', page);
    activitiesUrl.searchParams.append('per_page', perPage);
    return activitiesUrl;
}

const getActivities = async (accessToken, before, after, page = 1, activities = []) => {
    const perPage = 100;
    const url = getActivitiesUrl(before, after, page, perPage);
    try {
        console.log(`Making API rquest: ${url.toString()}`);
        const response = await axios.get(url.toString(), {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data = response.data;
        activities = activities.concat(data);

        if (data.length < perPage) {
            return activities;
        }
        return getActivities(accessToken, before, after, page + 1, activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return activities;
    }
}

const getActivitiesPerYear = async (accessToken) => {
    const data = {};
    for (let year = currentYear; year >= startYear; year--) {
        console.log(`Fetching data for ${year}...`);
        // This will query based on UTC so there is a time zone edge case if you did an activity
        // in a different year local time vs. UTC time
        const before = Math.floor(new Date(`${year}-12-31T23:59:59`).getTime() / 1000);
        const after = Math.floor(new Date(`${year}-01-01T00:00:00`).getTime() / 1000);

        const activities = await getActivities(accessToken, before, after);
        data[year] = activities;

        console.log(`Fetched data for ${year}: ${activities.length} activities`);
    }
    return data;
}

function getRunStats(data) {
    var runStats = {};
    var csv = '';

    for (var year = startYear; year <= currentYear; year++) {
        if (!data[year]) {
            continue;
        }
        var distance = 0;
        var elapsedTime = 0;
        var elevationGain = 0;
        
        for (var i in data[year]) {
            var activity = data[year][i];
            if (activity.type != 'Run') {
                continue;
            }
            distance += activity['distance']; // meters
            elapsedTime += activity['elapsed_time']; // seconds
            elevationGain += activity['total_elevation_gain']; // meters
        }

        var hours = Math.floor(elapsedTime / 60 / 60);
        var minutes = Math.floor(elapsedTime / 60) - (hours * 60);
        var seconds = elapsedTime % 60;

        runStats[year] = {
            'distance': `${ Math.round(distance / 1000) } km`,
            'elapsedTime': hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'),
            'elevationGain': `${Math.floor(elevationGain)} m`
        };

        csv = csv + [year, distance, elapsedTime, elevationGain].join(',') + '\n';
    }
    
    console.log(csv);
    return runStats;
}
