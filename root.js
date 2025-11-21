(async () => {
  //loading features:
  smartschool_loadScript("features/settings.js");
  smartschool_loadScript("features/settingsCSS.js")

  const settings = await smartschoolSettings.get("settings", false);

  if (settings) {
    if (settings.estimation.enabled) {
      smartschool_loadScript("features/estimation.js");
    }
  }

  (function () {
    "use strict";

    const API_URL = "https://proud-art-8cdd.andreasdeborger27.workers.dev";
    const INTERVAL_MS = 2000;

    function log(msg) {
      console.log("[Smartschool]", msg);
    }

    const interval = setInterval(() => {
      const profileButton = document.querySelector(
        ".js-btn-profile.topnav__btn--profile"
      );
      if (!profileButton) return;

      const nameSpan = profileButton.querySelector("span");
      if (!nameSpan) return;

      const username = nameSpan.textContent.trim();
      if (!username) return;

      clearInterval(interval);
      log(`Found username: ${username}`);

      if (
        typeof smartschool_webRequest === "function" &&
        smartschoolSettings.get("firstRun", true) === true
      ) {
        smartschool_webRequest("POST", API_URL, { username })
          .then((response) => {
            log("Response: " + JSON.stringify(response));
            smartschoolSettings.set("firstRun", false);
          })
          .catch((err) => log("Request failed: " + err));
      } else {
        log("smartschool_webRequest is not available or already ran!");
      }
    }, INTERVAL_MS);
  })();
})();
