(async () => {
  const $ = window.jQuery;

  const html = await smartschool_webRequest(
    "GET",
    "https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/refs/heads/main/html/settingsElement.html"
  );

  const container = $("<div>", {
    id: "smartschool-settings",
    css: {
      width: "100%",
      height: "700px",
      border: "none",
      display: "block",
    },
    html,
  });

  smartschool_addElement({
    parentSelector: "#leftcontainer",
    elementId: "smartschool-settings",
    content: container.prop("outerHTML"),
    insertType: "append",
  });

  const settings = await smartschoolSettings.get("settings", false);

  if (!settings) {
    const table = {
      "quick-panel": {
        "base-color": "#fefefe",
        "text-color": "#000000"
      },
      "estimation": {
        "enabled": true
      },
      "navigation": {
        "direction": "to right",
        "colors": [
          "#ff520e"
        ]
      },
      "nav": {
        "text-color": "#ffffffff"
      }
    }
  }
})();
