// script.js - GitHub-ra feltöltendő

const ESP32_URL = location.origin;

// --- GPIO5 toggle gomb ---
function toggle() {
  fetch(ESP32_URL + '/toggle')
    .then(() => {
      // Ha akarod, ide írhatunk logikát a gomb szín vagy szöveg frissítéséhez
      console.log("GPIO5 állapot megváltoztatva");
    })
    .catch(err => console.error("Hiba a toggle-nál:", err));
}

// --- DHT11 élő frissítés ---
function loadSensor() {
  fetch(ESP32_URL + "/state")
    .then(res => res.json())
    .then(data => {
      document.getElementById("temp").innerText = data.temperature + " °C";
      document.getElementById("hum").innerText = data.humidity + " %";
    })
    .catch(err => {
      console.error("Hiba a sensor fetch-nél:", err);
      document.getElementById("temp").innerText = "--";
      document.getElementById("hum").innerText = "--";
    });
}

// 2 másodpercenként frissítjük az értékeket
setInterval(loadSensor, 10);

// Oldal betöltéskor azonnal frissít
window.onload = loadSensor;
