(async () => {
  smartschool_loadScript("features/settings.js");
  smartschool_loadScript("features/settingsCSS.js");

  const settings = await smartschoolSettings.get("settings", false);

  if (settings) {
    if (settings.estimation?.enabled) {
      smartschool_loadScript("features/estimation.js");
    }
    if (settings["better-nav"]?.buttons) {
      smartschool_loadScript("features/betterNav.js");
    }
    if (settings.qol?.["auto-log"]) {
      smartschool_loadScript("features/autoLogin.js");
    }
  }

  (function () {
    "use strict";

    const API_URL = "https://sm-edit.andreasdeborger27.workers.dev/register";  
    const INTERVAL_MS = 2000;

    function log(msg) {
      console.log("[Smartschool]", msg);
    }

    const interval = setInterval(async () => {
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

      const firstRun = await smartschoolSettings.get("firstRun", true);

      if (typeof smartschool_webRequest === "function" && firstRun === true) {

        smartschool_webRequest("POST", API_URL, { username })
          .then((response) => {
            log("Worker response: " + JSON.stringify(response));
            smartschoolSettings.set("firstRun", false);
          })
          .catch((err) => log("Request failed: " + err));

      } else {
        log("smartschool_webRequest missing OR already ran!");
      }

    }, INTERVAL_MS);
  })();
})();
