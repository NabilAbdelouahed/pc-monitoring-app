const token = localStorage.getItem("dashToken");

const toggleDarkModeBtn = document.getElementById("toggleDarkMode");

toggleDarkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    toggleDarkModeBtn.textContent = "Switch to Light Mode";
  } else {
    toggleDarkModeBtn.textContent = "Switch to Dark Mode";
  }
});

const cpuInfoDiv = document.createElement("div");
const ramInfoDiv = document.createElement("div");
const diskInfoDiv = document.getElementById("diskInfo");
const diskBarsDiv = document.getElementById("diskBars");
const networkDiv = document.getElementById("networkInfo");

const cpuCanvas = document.getElementById("cpuChart");
cpuCanvas.before(cpuInfoDiv);

const ramCanvas = document.getElementById("ramChart");
ramCanvas.before(ramInfoDiv);

let perCoreChart;
let ramChart;

const networkCanvas = document.getElementById("networkChart");
let networkChart;

let lastNet = {
  time: null,
  received: 0,
  sent: 0
};
function initCharts() {
  const coreCount = 12;
  const datasets = Array.from({ length: coreCount }, (_, i) => ({
    label: `Core ${i}`,
    data: [],
    fill: false,
    borderColor: `hsl(${(i * 360) / coreCount}, 70%, 50%)`,
    tension: 0.1

  }));

  perCoreChart = new Chart(cpuCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: datasets
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: "% Usage" } }
      }
    }
  });

  ramChart = new Chart(ramCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "RAM Used (GB)",
        data: [],
        borderColor: "#007bff",
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        y: { title: { display: true, text: "GB" } }
      }
    }
  });

   networkChart = new Chart(networkCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Received (KB/s)",
          data: [],
          borderColor: "green",
          fill: false,
          tension: 0.1
        },
        {
          label: "Sent (KB/s)",
          data: [],
          borderColor: "orange",
          fill: false,
          tension: 0.1
        }
      ]
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "KB/s" }
        }
      }
    }
  });
}

function pushPoint(chart, label, dataArray) {
  if (!chart || !chart.data || !chart.data.datasets) return;
  chart.data.labels.push(label);
  chart.data.datasets.forEach((ds, i) => {
    ds.data.push(dataArray[i]);
    if (ds.data.length > 20) ds.data.shift();
  });
  if (chart.data.labels.length > 20) chart.data.labels.shift();
  chart.update();
}

function updateDashboard(data) {
  const cpuData = data.cpu;
  const ramData = data.ram;
  const diskData = data.disk;
  const appsData = data.apps;
  const networkData = data.network;

  // CPU
  cpuInfoDiv.innerHTML = `
    <strong>Total CPU Usage:</strong> ${cpuData.totalCpuUsage}%<br>
    <strong>Physical Cores:</strong> ${cpuData.physicalCores}<br>
    <strong>Total Cores:</strong> ${cpuData.totalCores}
  `;
  const usagePerCore = Object.values(cpuData.cpuUsagePerCore);
  pushPoint(perCoreChart, "", usagePerCore);

  // RAM
  const usedGB = (ramData.used / 1e9).toFixed(1);
  const totalGB = (ramData.total / 1e9).toFixed(1);
  ramInfoDiv.innerHTML = `<strong>Total RAM:</strong> ${totalGB} GB`;
  pushPoint(ramChart, "", [parseFloat(usedGB)]);

  // Disk
  diskInfoDiv.innerHTML = "";
  diskBarsDiv.innerHTML = "";
  for (const [path, disk] of Object.entries(diskData)) {
    const info = document.createElement("div");
    info.innerHTML = `<strong>${path}</strong>: Used ${(disk.used / 1e9).toFixed(1)} GB / ${(disk.total_size / 1e9).toFixed(1)} GB, Free ${(disk.free / 1e9).toFixed(1)} GB`;
    diskInfoDiv.appendChild(info);

    const bar = document.createElement("div");
    bar.className = "bar-bg";
    bar.innerHTML = `<div class="bar-fill" style="width: ${disk.use_percentage}%;"></div>`;
    diskBarsDiv.appendChild(bar);
  }

  // Network
  const now = Date.now();
  const dtSec = lastNet.time ? (now - lastNet.time) / 1000 : 1;

  const deltaRx = lastNet.received ? (networkData.received - lastNet.received) / 1024 / dtSec : 0;
  const deltaTx = lastNet.sent ? (networkData.sent - lastNet.sent) / 1024 / dtSec : 0;

  lastNet = {
    time: now,
    received: networkData.received,
    sent: networkData.sent
  };

  networkDiv.innerHTML = `
    <strong>Received:</strong> ${(networkData.received / 1e6).toFixed(1)} MB<br>
    <strong>Sent:</strong> ${(networkData.sent / 1e6).toFixed(1)} MB<br>
    <strong>Speed:</strong> ↓ ${deltaRx.toFixed(1)} KB/s | ↑ ${deltaTx.toFixed(1)} KB/s
  `;

  // Push to network chart
  if (networkChart) {
    const timeLabel = new Date().toLocaleTimeString();
    networkChart.data.labels.push(timeLabel);
    networkChart.data.datasets[0].data.push(deltaRx);
    networkChart.data.datasets[1].data.push(deltaTx);

    if (networkChart.data.labels.length > 20) {
      networkChart.data.labels.shift();
      networkChart.data.datasets.forEach(ds => ds.data.shift());
    }

    networkChart.update();
  }


  // Apps
  const appsTableBody = document.querySelector("#appsTable tbody");
  appsTableBody.innerHTML = "";
  const sortedApps = Object.values(appsData).sort((a, b) => b.cpuPercent - a.cpuPercent);
  for (const app of sortedApps) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${app.name}</td>
      <td>${app.username || "-"}</td>
      <td>${app.cpuPercent.toFixed(1)}</td>
      <td>${(app.memUsage / 1e6).toFixed(1)} MB</td>
    `;
    appsTableBody.appendChild(row);
  }
}

async function fetchData() {
  const response = await fetch(`${BASE_URL}/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.ok) {
    const res = await response.json();
    updateDashboard(res.data);
  } else {
    alert("Unauthorized. Please login again.");
    window.location.href = "login.html";
  }
}

initCharts();
fetchData();
setInterval(fetchData, DASH_REFRESH_RATE);
