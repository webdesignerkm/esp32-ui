const ESP32_URL = location.origin;

// GPIO5 toggle gomb
function toggle() {
  fetch(ESP32_URL + '/toggle')
    .then(() => console.log("GPIO5 állapot megváltoztatva"));
}

// DHT11 + RTC élő frissítés
function loadSensor() {
  fetch(ESP32_URL + "/state")
    .then(res => res.json())
    .then(data => {
      document.getElementById("temp").innerText = data.temperature + " °C";
      document.getElementById("hum").innerText = data.humidity + " %";
      document.getElementById("time").innerText = data.time;
    })
    .catch(err => {
      console.error("Hiba a sensor fetch-nél:", err);
      document.getElementById("temp").innerText = "--";
      document.getElementById("hum").innerText = "--";
      document.getElementById("time").innerText = "--:--:--";
    });
}

// 1 másodpercenként frissítés
setInterval(loadSensor, 1000);
window.onload = loadSensor;
