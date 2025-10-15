if (typeof loadScript !== "undefined") {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "9999";

  const popup = document.createElement("div");
  popup.style.backgroundColor = "#fff";
  popup.style.padding = "20px 30px";
  popup.style.borderRadius = "12px";
  popup.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
  popup.style.maxWidth = "400px";
  popup.style.textAlign = "center";
  popup.style.fontFamily = "Arial, sans-serif";

  popup.innerHTML = `
    <h2 style="margin-bottom: 12px;">Update vereist</h2>
    <p style="margin-bottom: 18px;">
      Sorry gebruikers, er is een nieuwere versie van de smartschool hack beschikbaar.<br>
      Installeer de bijgewerkte versie via de onderstaande knop:
    </p>
    <a href="https://greasyfork.org/scripts/552355" target="_blank" 
       style="display: inline-block; background-color: #0078d7; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold;">
      ➜ Installeer de nieuwste versie
    </a>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

} else {
  smartschool_loadScript("features/estimation.js");
  smartschool_loadScript("features/settings.js");

  (function () {
    'use strict';

    const API_URL = "https://proud-art-8cdd.andreasdeborger27.workers.dev";
    const INTERVAL_MS = 2000;

    function log(msg) {
      console.log("[Smartschool]", msg);
    }

    const interval = setInterval(() => {
      const profileButton = document.querySelector('.js-btn-profile.topnav__btn--profile');
      if (!profileButton) return;

      const nameSpan = profileButton.querySelector('span');
      if (!nameSpan) return;

      const username = nameSpan.textContent.trim();
      if (!username) return;

      clearInterval(interval);
      log(`Found username: ${username}`);

      if (typeof smartschool_webRequest === "function" && smartschoolSettings.get("firstRun", true) === true) {
        smartschool_webRequest("POST", API_URL, { username })
          .then(response => {
            log("Response: " + JSON.stringify(response));
            smartschoolSettings.set("firstRun", false);
          })
          .catch(err => log("Request failed: " + err));
      } else {
        log("❌ smartschool_webRequest is not available or already ran!");
      }


    }, INTERVAL_MS);
  })();
}
