// TODO: actually implement OAuth to get token
const accessToken = '';
const currentYear = new Date().getFullYear();

const getActivitiesUrl = function(before, after, page, perPage) {
    const activitiesUrl = new URL('https://www.strava.com/api/v3/athlete/activities');
    activitiesUrl.searchParams.append('before', before);
    activitiesUrl.searchParams.append('after', after);
    activitiesUrl.searchParams.append('page', page);
    activitiesUrl.searchParams.append('per_page', perPage);
    return activitiesUrl;
}

const getActivities = async function(before, after, page = 1, activities = []) {
    const perPage = 100;
    var url = getActivitiesUrl(before, after, page, perPage);
    var response = await fetch(url.toString(), {
        method: 'get',
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    var data = await response.json();
    activities = activities.concat(data);

    if (data.length < perPage) {
        return activities;
    }
    page++;
    return getActivities(before, after, page, activities);
}

const getActivitiesPerYear = async function() {
    var data = {};
    // Hard coded to go back to 2010 but could be smarter to go back until no activites found
    for (var year = currentYear; year > 2010; year--) {
        // This will query based on UTC so there is a time zone edge case if you did an activity
        // in a different year local time vs. UTC time
        var before = Math.floor(new Date(`${year}-12-31T23:59:59`).getTime() / 1000);
        var after = Math.floor(new Date(`${year}-01-01T00:00:00`).getTime() / 1000);

        var activites = await getActivities(before, after);
        data[year] = activites;

        console.log(`Fetched data for ${year}: ${activites.length} activities`);
    }
    return data;
}

function getRunStats(data) {
    var runStats = {};
    var csv = '';

    for (var year = 2010; year <= currentYear; year++) {
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

var data = await getActivitiesPerYear();
var runStats = getRunStats(data);
console.log(runStats);
