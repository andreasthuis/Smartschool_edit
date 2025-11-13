(async () => {
  const $ = window.jQuery;

  const response = await smartschool_webRequest(
    "GET",
    "https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/refs/heads/main/html/settingsElement.html"
  );
  const html = await response.text();

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
})();
