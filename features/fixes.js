(async () => {
  /**
   * Helper function to load multiple CSS files from a specific folder.
   * @param {string} folder - The base folder path (e.g., "css")
   * @param {string[]} files - Array of filenames (e.g., ["style.css"])
   */
  function smartschool_loadFolderStyles(folder, files) {
    const basePath = folder.endsWith("/") ? folder : `${folder}/`;

    files.forEach((file) => {
      const fullPath = `${basePath}${file}`;
      try {
        smartschool_loadStyles(fullPath);
        console.log(`[Smartschool] Successfully loaded: ${fullPath}`);
      } catch (error) {
        console.error(`[Smartschool] Failed to load style: ${fullPath}`, error);
      }
    });
  }

  const cssFilesToLoad = [
    "login.css",
    "messages.css",
    "navigation.css",
    "notifications.css",
    "planner.css",
    "results.css",
    "root.css",
    "startpage.css",
    "widgets.css",
  ];

  smartschool_loadFolderStyles("css/fixes", cssFilesToLoad);
})();
