const ESP32_URL = location.origin;

// GPIO5 toggle gomb
function toggle() {
  fetch(ESP32_URL + '/toggle')
    .then(() => {
        console.log("GPIO5 állapot megváltoztatva");
        loadSensor(); // Azonnali frissítés gombnyomás után
    });
}

// DHT11 + RTC + GPIO élő frissítés
function loadSensor() {
  fetch(ESP32_URL + "/state")
    .then(res => res.json())
    .then(data => {
      // Szenzor adatok frissítése
      document.getElementById("temp").innerText = data.temperature; 
      document.getElementById("hum").innerText = data.humidity;    
      document.getElementById("time").innerText = data.time;

      // --- EZ A HIÁNYZÓ RÉSZ: GPIO Állapot frissítése ---
      const stateElement = document.getElementById("gpioState");
      if (stateElement) {
        if (data.gpio === 1) {
          stateElement.innerText = "BEKAPCSOLVA";
          stateElement.className = "state-text BE";
        } else {
          stateElement.innerText = "KIKAPCSOLVA";
          stateElement.className = "state-text KI";
        }
      }
    })
    .catch(err => {
      console.error("Hiba a sensor fetch-nél:", err);
      document.getElementById("temp").innerText = "--";
      document.getElementById("hum").innerText = "--";
      document.getElementById("time").innerText = "--:--:--";
      document.getElementById("gpioState").innerText = "HIBA";
    });
}

// 1 másodpercenként frissítés
setInterval(loadSensor, 1000);
window.onload = loadSensor;
