const ESP32_URL = location.origin;

function toggle() {
  fetch(ESP32_URL + '/toggle');
}
