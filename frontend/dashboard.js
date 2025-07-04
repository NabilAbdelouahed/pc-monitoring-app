const token = localStorage.getItem("dashToken");

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

function updateDashboard(data) {
  document.querySelector("#cpu pre").textContent = JSON.stringify(data.cpu, null, 2);
  document.querySelector("#ram pre").textContent = JSON.stringify(data.ram, null, 2);
  document.querySelector("#disk pre").textContent = JSON.stringify(data.disk, null, 2);
  document.querySelector("#network pre").textContent = JSON.stringify(data.network, null, 2);
  document.querySelector("#apps pre").textContent = JSON.stringify(data.apps, null, 2);
}

setInterval(fetchData, 2000); // refresh every 2 seconds
