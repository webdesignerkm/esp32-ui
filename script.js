const ESP32_URL = location.origin;

// Ez a függvény rejti el vagy mutatja meg az időzített mezőket
function toggleUI() {
    const mode = document.getElementById("mode").value;
    const timeBox = document.getElementById("timeBox");
    const labelTemp = document.getElementById("labelTemp");

    if (mode === "2") {
        timeBox.classList.remove("hidden"); // Megjelenítés
        labelTemp.innerText = "Alap hőfok (időn kívül)";
    } else {
        timeBox.classList.add("hidden");    // Elrejtés
        labelTemp.innerText = "Kívánt hőfok (°C)";
    }
}

function saveSettings() {
    const temp = document.getElementById("targetInput").value;
    const mode = document.getElementById("mode").value;
    let query = `/set?temp=${temp}&mode=${mode}`;
    
    if (mode === "2") {
        const tempTimed = document.getElementById("targetInputTimed").value;
        const sh = document.getElementById("sh").value || 0;
        const sm = document.getElementById("sm").value || 0;
        const eh = document.getElementById("eh").value || 0;
        const em = document.getElementById("em").value || 0;
        query += `&tempTimed=${tempTimed}&sh=${sh}&sm=${sm}&eh=${eh}&em=${em}`;
    }

    fetch(ESP32_URL + query)
        .then(res => { if (res.ok) alert("Sikeresen mentve!"); })
        .catch(err => alert("Hiba a mentéskor: " + err));
}

function loadData() {
    fetch(ESP32_URL + "/state")
        .then(res => res.json())
        .then(data => {
            document.getElementById("temp").innerText = data.temperature;
            document.getElementById("time").innerText = data.time;
            document.getElementById("targetDisp").innerText = data.target;

            if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "SELECT") {
                document.getElementById("targetInput").value = data.baseTarget;
                document.getElementById("mode").value = data.mode;
                
                if (data.mode == 2) {
                    document.getElementById("targetInputTimed").value = data.timedTarget;
                    document.getElementById("sh").value = data.sh;
                    document.getElementById("sm").value = data.sm;
                    document.getElementById("eh").value = data.eh;
                    document.getElementById("em").value = data.em;
                }
                toggleUI();
            }

            const stateText = document.getElementById("gpioState");
            stateText.innerText = (data.gpio === 1) ? "FŰTÉS AKTÍV" : "KIKAPCSOLVA";
            stateText.className = "state-text " + (data.gpio === 1 ? "BE" : "KI");
        });
}

setInterval(loadData, 1000);
window.onload = loadData;
