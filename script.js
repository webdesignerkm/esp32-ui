const ESP32_URL = location.origin;

function saveSettings() {
    const temp = document.getElementById("targetInput").value;
    const mode = document.getElementById("mode").value;
    // Itt bővíthető az időpontokkal is: &sh=8&sm=0...
    fetch(`${ESP32_URL}/set?temp=${temp}&mode=${mode}`)
        .then(() => console.log("Beállítások mentve"));
}

function loadSensor() {
    fetch(ESP32_URL + "/state")
        .then(res => res.json())
        .then(data => {
            document.getElementById("temp").innerText = data.temperature;
            document.getElementById("hum").innerText = data.humidity;
            document.getElementById("time").innerText = data.time;
            document.getElementById("targetDisp").innerText = data.target;
            
            // Üzemmód szinkronizálása a felülettel (ha máshonnan lett átállítva)
            if(!document.getElementById("targetInput").matches(':focus')) {
                document.getElementById("mode").value = data.mode;
            }

            const stateElement = document.getElementById("gpioState");
            if (stateElement) {
                if (data.gpio === 1) {
                    stateElement.innerText = "FŰTÉS BE";
                    stateElement.className = "state-text BE";
                } else {
                    stateElement.innerText = "KIKAPCSOLVA";
                    stateElement.className = "state-text KI";
                }
            }
        })
        .catch(err => console.error("Hiba:", err));
}

setInterval(loadSensor, 1000);
window.onload = loadSensor;
