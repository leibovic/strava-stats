document.addEventListener("DOMContentLoaded", function () {
  const accessToken = document.getElementById("accessToken").value;
  fetch(`/api/activities?access_token=${accessToken}`)
    .then((response) => response.json())
    .then((data) => {
      const runStats = getRunStats(data.activitiesPerYear);

      const years = Object.keys(runStats);
      const distances = years.map((year) => runStats[year].distance);
      const elevationGains = years.map((year) => runStats[year].elevationGain);
      const elapsedTimes = years.map((year) => runStats[year].elapsedTime);

      const ctx = document.getElementById("statsChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: years,
          datasets: [
            {
              label: "Distance (km)",
              data: distances,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              fill: false,
            },
            {
              label: "Elevation Gain (m)",
              data: elevationGains,
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
              fill: false,
            },
            {
              label: "Elapsed Time (hours)",
              data: elapsedTimes,
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      document.querySelector(".loading").style.display = "none";
      document.querySelector(".stats").style.display = "block";
    })
    .catch((error) => {
      console.error("Error fetching activities:", error);
      document.querySelector(".loading").innerText =
        "An error occurred while fetching activities.";
    });
});

function getRunStats(activitiesPerYear) {
  var runStats = {};

  const startYear = 2010;
  const currentYear = new Date().getFullYear();
  for (var year = startYear; year <= currentYear; year++) {
    if (!activitiesPerYear[year]) {
      continue;
    }
    var distance = 0;
    var elapsedTime = 0;
    var elevationGain = 0;

    for (var i in activitiesPerYear[year]) {
      var activity = activitiesPerYear[year][i];
      if (activity.type != "Run") {
        continue;
      }
      distance += activity["distance"]; // meters
      elapsedTime += activity["elapsed_time"]; // seconds
      elevationGain += activity["total_elevation_gain"]; // meters
    }

    runStats[year] = {
      distance: Math.round(distance / 1000), // km
      elapsedTime: Math.floor(elapsedTime / 60 / 60), // hours
      elevationGain: Math.floor(elevationGain), // meters
    };
  }

  return runStats;
}

// Takes time in seconds and returns a formatted string
function formatTime(elapsedTime) {
  var hours = Math.floor(elapsedTime / 60 / 60);
  var minutes = Math.floor(elapsedTime / 60) - hours * 60;
  var seconds = elapsedTime % 60;

  return (
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}
