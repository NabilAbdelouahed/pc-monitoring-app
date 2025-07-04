
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("DASH_USER").value;
    const password = document.getElementById("DASH_PWD").value;

    const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "username": username, "password": password }),
  });

if (response.ok) {
  const data = await response.json();
  localStorage.setItem("dashToken", data.token); 
  window.location.href = "dashboard.html";
} else {
  alert("Login failed!");
}
});
