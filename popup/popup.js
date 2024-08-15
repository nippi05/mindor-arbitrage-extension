/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function message(tabs) {
      browser.tabs.insertCSS({ code: "" }).then(() => {
        const message = e.target.textContent;
        browser.tabs.sendMessage(tabs[0].id, {
          command: message,
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not scrape: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "message()".
     */
    if (e.target.tagName !== "BUTTON") {
      // Ignore when click is not on a button.
      return;
    }

    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(message)
      .catch(reportError);
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute scraper content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "/content_scripts/main.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
