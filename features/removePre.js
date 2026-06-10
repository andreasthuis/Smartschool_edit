// 1. Create an observer instance
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    // Check if new nodes were added
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        // Check if the added node is a <pre> element
        if (node.nodeName === "PRE") {
          console.log("Detected a <pre> element. Removing it...");
          node.remove(); // Delete it instantly
        }
      });
    }
  }
});

// 2. Start observing the entire document for changes
observer.observe(document.body, {
  childList: true, // Watch for direct children being added/removed
  subtree: true, // Watch all deeper nested elements as well
});
