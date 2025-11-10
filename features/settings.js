(async () => {
  try {
    const fileContents = await global.smartschool_webRequest(
      "GET",
      "https://raw.githubusercontent.com/andreasthuis/smartschool_edit/main/html/settingsElement.html"
    );
    console.log(fileContents);
  } catch (err) {
    console.error(err);
  }

  smartschool_addElement({
    parentSelector: '#leftcontainer',
    elementId: 'smartschool-settings',
    content: fileContents,
    insertType: 'append'
  });
})();
