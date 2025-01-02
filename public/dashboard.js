document.addEventListener("DOMContentLoaded", function () {
  const accessToken = document.getElementById("accessToken").value;
  fetch(`/api/activities?access_token=${accessToken}`)
    .then((response) => response.json())
    .then((data) => {
      const runStats = getStats(data.activitiesPerYear, "Run");
      renderStats(runStats);

      var title = document.getElementById("title");
      var button = document.getElementById("toggleButton");
      button.addEventListener("click", () => {
        if (button.textContent === "Show Ride Stats") {
          const rideStats = getStats(data.activitiesPerYear, "Ride");
          renderStats(rideStats);
          title.textContent = "Your Ride Stats";
          button.textContent = "Show Run Stats";
        } else {
          const runStats = getStats(data.activitiesPerYear, "Run");
          renderStats(runStats);
          title.textContent = "Your Run Stats";
          button.textContent = "Show Ride Stats";
        }
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

let distanceChart;
let elevationChart;
let timeChart;

function renderStats(stats) {
  const years = Object.keys(stats);
  const distances = years.map((year) => stats[year].distance);
  const elevationGains = years.map((year) => stats[year].elevationGain);
  const elapsedTimes = years.map((year) => stats[year].elapsedTime);

  if (distanceChart) {
    distanceChart.destroy();
  }
  if (elevationChart) {
    elevationChart.destroy();
  }
  if (timeChart) {
    timeChart.destroy();
  }

  distanceChart = new Chart(
    document.getElementById("distanceChart").getContext("2d"),
    {
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
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    }
  );

  elevationChart = new Chart(
    document.getElementById("elevationChart").getContext("2d"),
    {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Elevation Gain (m)",
            data: elevationGains,
            borderColor: "rgba(153, 102, 255, 1)",
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
    }
  );

  timeChart = new Chart(document.getElementById("timeChart").getContext("2d"), {
    type: "line",
    data: {
      labels: years,
      datasets: [
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
}

function getStats(activitiesPerYear, activityType) {
  var stats = {};

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
      if (activity.type != activityType) {
        continue;
      }
      distance += activity["distance"]; // meters
      elapsedTime += activity["elapsed_time"]; // seconds
      elevationGain += activity["total_elevation_gain"]; // meters
    }

    stats[year] = {
      distance: Math.round(distance / 1000), // km
      elapsedTime: Math.floor(elapsedTime / 60 / 60), // hours
      elevationGain: Math.floor(elevationGain), // meters
    };
  }

  return stats;
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
