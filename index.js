import axios from "axios";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static("public")); // Serve static files from the 'public' directory

// Set EJS as the view engine
app.set("view engine", "ejs");

// Home Route
app.get("/", (req, res) => {
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=activity:read`;
  res.render("index", { authUrl: authUrl });
});

// Redirect to Strava for Authentication
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://www.strava.com/oauth/token",
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Redirect to the dashboard with the access token as a query parameter
    res.redirect(`/dashboard?access_token=${accessToken}`);
  } catch (error) {
    console.error(error);
    res.send("An error occurred during authentication.");
  }
});

// Dashboard route
app.get("/dashboard", async (req, res) => {
  // Extract the access token from the query parameters
  const accessToken = req.query.access_token;

  // Render the dashboard with the access token
  res.render("dashboard", { accessToken });
});

// API endpoint to fetch activities
app.get("/api/activities", async (req, res) => {
  const accessToken = req.query.access_token;

  try {
    const activitiesPerYear = await getActivitiesPerYear(accessToken);
    res.json({ activitiesPerYear });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching activities." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const getActivitiesUrl = (before, after, page, perPage) => {
  const activitiesUrl = new URL(
    "https://www.strava.com/api/v3/athlete/activities"
  );
  activitiesUrl.searchParams.append("before", before);
  activitiesUrl.searchParams.append("after", after);
  activitiesUrl.searchParams.append("page", page);
  activitiesUrl.searchParams.append("per_page", perPage);
  return activitiesUrl;
};

const getActivities = async (
  accessToken,
  before,
  after,
  page = 1,
  activities = []
) => {
  const perPage = 100;
  const url = getActivitiesUrl(before, after, page, perPage);
  try {
    console.log(`Making API rquest: ${url.toString()}`);
    const response = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = response.data;
    activities = activities.concat(data);

    if (data.length < perPage) {
      return activities;
    }
    return getActivities(accessToken, before, after, page + 1, activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return activities;
  }
};

const getActivitiesPerYear = async (accessToken) => {
  const data = {};
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  for (let year = currentYear; year >= startYear; year--) {
    console.log(`Fetching data for ${year}...`);
    // This will query based on UTC so there is a time zone edge case if you did an activity
    // in a different year local time vs. UTC time
    const before = Math.floor(
      new Date(`${year}-12-31T23:59:59`).getTime() / 1000
    );
    const after = Math.floor(
      new Date(`${year}-01-01T00:00:00`).getTime() / 1000
    );

    const activities = await getActivities(accessToken, before, after);
    data[year] = activities;

    console.log(`Fetched data for ${year}: ${activities.length} activities`);
  }
  return data;
};
