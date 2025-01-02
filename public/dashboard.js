document.addEventListener("DOMContentLoaded", function () {
  const accessToken = document.getElementById("accessToken").value;
  fetch(`/api/activities?access_token=${accessToken}`)
    .then((response) => response.json())
    .then((data) => {
      const activitesPerYear = data.activitiesPerYear;
      const runStats = getRunStats(activitesPerYear);
      const tableBody = document.querySelector("#statsTable tbody");
      tableBody.innerHTML = "";

      Object.keys(runStats).forEach((year) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${year}</td>
            <td>${runStats[year].distance}</td>
            <td>${runStats[year].elevationGain}</td>
            <td>${runStats[year].elapsedTime}</td>
          `;
        tableBody.appendChild(row);
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
  var csv = "";

  const currentYear = new Date().getFullYear();
  const startYear = 2024;
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

    var hours = Math.floor(elapsedTime / 60 / 60);
    var minutes = Math.floor(elapsedTime / 60) - hours * 60;
    var seconds = elapsedTime % 60;

    runStats[year] = {
      distance: `${Math.round(distance / 1000)} km`,
      elapsedTime:
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0"),
      elevationGain: `${Math.floor(elevationGain)} m`,
    };

    csv = csv + [year, distance, elapsedTime, elevationGain].join(",") + "\n";
  }

  return runStats;
}
