const ESP32_URL = location.origin;
let isUserEditing = false;
let editTimeout;
let lastServerTime = ""; // Itt tároljuk az utolsó kapott időpontot

/**
 * Kezeli a felület láthatóságát és aktiválja a szerkesztési zárolást.
 */
function toggleUI() {
    const mode = document.getElementById("mode").value;
    const timeBox = document.getElementById("timeBox");
    const labelTemp = document.getElementById("labelTemp");

    // Felhasználói beavatkozás jelzése (zárolás)
    startEditingLock();

    if (mode === "2") {
        timeBox.style.display = "block";
        labelTemp.innerText = "Alap hőfok (időn kívül)";
    } else {
        timeBox.style.display = "none";
        labelTemp.innerText = "Kívánt hőfok (°C)";
    }
}

/**
 * Aktiválja a zárolást, hogy a háttérben futó frissítés ne írja felül a mezőket.
 */
function startEditingLock() {
    isUserEditing = true;
    clearTimeout(editTimeout);
    // 10 másodpercig nem engedjük az automatikus felülírást
    editTimeout = setTimeout(() => { isUserEditing = false; }, 10000);
}

/**
 * Elküldi a beállításokat az ESP32-nek.
 */
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
        .then(res => { 
            if (res.ok) {
                alert("Beállítások mentve!");
                isUserEditing = false; // Mentés után azonnal feloldjuk a zárolást
                loadData(); 
            }
        })
        .catch(err => alert("Hiba a mentéskor: " + err));
}

/**
 * Adatok lekérése az ESP32-től.
 */
function loadData() {
    fetch(ESP32_URL + "/state")
        .then(res => res.json())
        .then(data => {
            // Szenzoradatok és célhőmérséklet frissítése
            document.getElementById("temp").innerText = data.temperature;
            document.getElementById("targetDisp").innerText = data.target;
            
            // Az idő szinkronizálása a szerverrel
            lastServerTime = data.time;
            document.getElementById("time").innerText = data.time;

            // Csak akkor frissítjük az inputokat, ha a felhasználó nem épp szerkeszt
            if (!isUserEditing) {
                document.getElementById("mode").value = data.mode;
                document.getElementById("targetInput").value = data.baseTarget;
                
                if (data.mode == 2) {
                    document.getElementById("targetInputTimed").value = data.timedTarget;
                    document.getElementById("sh").value = data.sh;
                    document.getElementById("sm").value = data.sm;
                    document.getElementById("eh").value = data.eh;
                    document.getElementById("em").value = data.em;
                    document.getElementById("timeBox").style.display = "block";
                } else {
                    document.getElementById("timeBox").style.display = "none";
                }
                // UI címke frissítése
                const labelTemp = document.getElementById("labelTemp");
                labelTemp.innerText = (data.mode == 2) ? "Alap hőfok (időn kívül)" : "Kívánt hőfok (°C)";
            }

            // GPIO állapot és stílus frissítése
            const stateText = document.getElementById("gpioState");
            stateText.innerText = (data.gpio === 1) ? "FŰTÉS AKTÍV" : "KIKAPCSOLVA";
            stateText.className = "state-text " + (data.gpio === 1 ? "BE" : "KI");
        })
        .catch(err => console.log("Lekérési hiba: ", err));
}

/**
 * Helyi óra pörgetése másodpercenként a folyamatos vizuális élményért.
 */
function localClockTick() {
    if (!lastServerTime) return;
    
    let parts = lastServerTime.split(':');
    let h = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let s = parseInt(parts[2]);

    s++;
    if (s >= 60) { s = 0; m++; }
    if (m >= 60) { m = 0; h++; }
    if (h >= 24) { h = 0; }

    lastServerTime = 
        (h < 10 ? "0" + h : h) + ":" + 
        (m < 10 ? "0" + m : m) + ":" + 
        (s < 10 ? "0" + s : s);
    
    document.getElementById("time").innerText = lastServerTime;
}

// Bármilyen gépelés vagy kattintás aktiválja a zárolást
document.addEventListener('input', startEditingLock);

// A vizuális órát másodpercenként frissítjük
setInterval(localClockTick, 1000);

// Az adatokat az ESP32-től 5 másodpercenként kérjük le (kíméli a hálózatot)
setInterval(loadData, 5000);

// Betöltéskor azonnali frissítés
window.onload = loadData;
