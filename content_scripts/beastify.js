(function () {
  console.log("Executing scraper_content.js");
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function bet365() {
    console.log("Fetching bet365");
    try {
      const test = document.getElementsByClassName(
        "seh-ExclusionWrapper_ExclusionText"
      )[0].innerHTML;
      console.log(test);
    } catch (error) {
      console.error("Invalid page");
    }
  }

  function unibet() {
    console.log("Fetching unibet");
    try {
      const test = document.getElementsByClassName(
        "seh-ExclusionWrapper_ExclusionText"
      )[0].innerHTML;
      console.log(test);
    } catch (error) {
      console.error("Invalid page");
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "bet365()" or "unibet()".
   */
  browser.runtime.onMessage.addListener((message) => {
    switch (message.command) {
      case "Bet365":
        bet365();
        break;
      case "Unibet":
        unibet();
        break;
      default:
        console.error("Invalid message from background script");
        break;
    }
  });
})();
