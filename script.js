const ESP32_URL = location.origin;

function toggleUI() {
    const mode = document.getElementById("mode").value;
    const timeBox = document.getElementById("timeBox");
    if (mode === "2") {
        timeBox.classList.remove("hidden");
    } else {
        timeBox.classList.add("hidden");
    }
}

function saveSettings() {
    const temp = document.getElementById("targetInput").value;
    const mode = document.getElementById("mode").value;
    
    let query = `/set?temp=${temp}&mode=${mode}`;
    
    if (mode === "2") {
        const sh = document.getElementById("sh").value || 0;
        const sm = document.getElementById("sm").value || 0;
        const eh = document.getElementById("eh").value || 0;
        const em = document.getElementById("em").value || 0;
        query += `&sh=${sh}&sm=${sm}&eh=${eh}&em=${em}`;
    }

    fetch(ESP32_URL + query)
        .then(res => { if (res.ok) alert("Beállítások elmentve!"); })
        .catch(err => alert("Hiba történt: " + err));
}

function loadData() {
    fetch(ESP32_URL + "/state")
        .then(res => res.json())
        .then(data => {
            document.getElementById("temp").innerText = data.temperature;
            document.getElementById("time").innerText = data.time;
            document.getElementById("targetDisp").innerText = data.target;

            if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "SELECT") {
                document.getElementById("targetInput").value = data.target;
                document.getElementById("mode").value = data.mode;
                toggleUI();
            }

            const stateText = document.getElementById("gpioState");
            if (data.gpio === 1) {
                stateText.innerText = "FŰTÉS AKTÍV";
                stateText.className = "state-text BE";
            } else {
                stateText.innerText = "KIKAPCSOLVA";
                stateText.className = "state-text KI";
            }
        });
}

setInterval(loadData, 1000);
window.onload = loadData;
