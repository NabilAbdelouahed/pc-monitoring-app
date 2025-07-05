document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const loginStatusDiv = document.getElementById("loginStatus");
    loginStatusDiv.textContent = "Connecting...";

    const username = document.getElementById("DASH_USER").value;
    const password = document.getElementById("DASH_PWD").value;

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "username": username, "password": password }),
        });

        if (response.ok) {
            const data = await response.json();
            loginStatusDiv.textContent = "Login successful!";
            localStorage.setItem("dashToken", data.token);
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            loginStatusDiv.textContent = "Login failed. Please try again.";
        }
    } catch (error) {
        loginStatusDiv.textContent = "Error connecting to server.";
        console.error(error);
    }
});
