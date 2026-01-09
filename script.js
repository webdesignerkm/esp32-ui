const ESP32_URL = location.origin;

/**
 * Kezeli a felület láthatóságát a kiválasztott üzemmód alapján.
 * Automata mód esetén elrejti az időzítőhöz kapcsolódó mezőket.
 */
function toggleUI() {
    const mode = document.getElementById("mode").value;
    const timeBox = document.getElementById("timeBox");
    const labelTemp = document.getElementById("labelTemp");

    if (mode === "2") {
        // Időzített mód: megjelenítjük a dobozt és módosítjuk a feliratot
        timeBox.classList.remove("hidden");
        labelTemp.innerText = "Alap hőfok (időn kívül)";
    } else {
        // Automata mód: elrejtjük a dobozt
        timeBox.classList.add("hidden");
        labelTemp.innerText = "Kívánt hőfok (°C)";
    }
}

/**
 * Elküldi a beállításokat az ESP32-nek.
 */
function saveSettings() {
    const temp = document.getElementById("targetInput").value;
    const mode = document.getElementById("mode").value;
    
    // Alap lekérdezés összeállítása
    let query = `/set?temp=${temp}&mode=${mode}`;
    
    // Ha időzített mód van, hozzáadjuk az extra paramétereket is
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
            if (res.ok) alert("Beállítások sikeresen mentve!"); 
        })
        .catch(err => alert("Hiba a mentés során: " + err));
}

/**
 * Lekéri az aktuális állapotot az ESP32-től és frissíti a kijelzőt.
 */
function loadData() {
    fetch(ESP32_URL + "/state")
        .then(res => res.json())
        .then(data => {
            // Ezeket mindig frissítjük (csak olvasható mezők)
            document.getElementById("temp").innerText = data.temperature;
            document.getElementById("time").innerText = data.time;
            document.getElementById("targetDisp").innerText = data.target;

            // --- JAVÍTÁS: Csak akkor írjuk felül az inputokat, ha a felhasználó NEM épp szerkeszti őket ---
            // Ez megakadályozza, hogy a dropdown vagy a számmező visszaugorjon mentés előtt.
            const activeEl = document.activeElement;
            const isEditing = activeEl.tagName === "INPUT" || activeEl.tagName === "SELECT";

            if (!isEditing) {
                document.getElementById("mode").value = data.mode;
                document.getElementById("targetInput").value = data.baseTarget;
                
                if (data.mode == 2) {
                    document.getElementById("targetInputTimed").value = data.timedTarget;
                    document.getElementById("sh").value = data.sh;
                    document.getElementById("sm").value = data.sm;
                    document.getElementById("eh").value = data.eh;
                    document.getElementById("em").value = data.em;
                }
                // Frissítjük a láthatóságot a betöltött mód alapján
                toggleUI();
            }

            // Fűtés állapotának megjelenítése (színnel együtt)
            const stateText = document.getElementById("gpioState");
            if (data.gpio === 1) {
                stateText.innerText = "FŰTÉS AKTÍV";
                stateText.className = "state-text BE";
            } else {
                stateText.innerText = "KIKAPCSOLVA";
                stateText.className = "state-text KI";
            }
        })
        .catch(err => console.error("Adatlekérési hiba:", err));
}

// Adatok frissítése másodpercenként
setInterval(loadData, 1000);

// Oldal betöltésekor azonnali lekérés
window.onload = loadData;
