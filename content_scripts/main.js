(function () {
  var data = new Map();
  console.info("Executing scraper_content.js");
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  browser.runtime.onMessage.addListener((message) => {
    console.info("Scraping...");

    try {
      const command = message.command;
      if (command != "scrape") {
        throw new Error("Invalid message: " + command);
      }
      const url = new URL(document.URL);
      if (url.hostname != "www.bet365.com") {
        throw new Error("Wrong page: " + url.hostname);
      }

      const NAV_BUTTON_CLASS = "sph-MarketGroupNavBarButton_Content"
      const navButtons = document.getElementsByClassName(NAV_BUTTON_CLASS);
      const MIN_NAV_BUTTON_COUNT = 3;
      if (navButtons.length <= MIN_NAV_BUTTON_COUNT) {
        throw new Error(`Navigation bar of length ${navButtons.length} while minimum length is ${MIN_NAV_BUTTON_COUNT}`);
      }

      const [leftTeam, rightTeam] = getTeamNames();

      scrapePopular(data, leftTeam, rightTeam, navButtons);
      scrapeBetBuilder(data, leftTeam, rightTeam, navButtons);
      scrapeAsian(data, leftTeam, rightTeam, navButtons);

      saveAndShowData(data);

    } catch (error) {
      console.error(error);
    }
  });
})();

/**
 * Get the team names from the current page returned as a array of len to that can
 * be used to deconstructor.
 * @returns [string, string]
 */
function getTeamNames() {
  const leftTeam = document.getElementsByClassName(
    "sph-FixturePodHeader_TeamName"
  )[0].innerHTML;
  const rightTeam = document.getElementsByClassName(
    "sph-FixturePodHeader_TeamName"
  )[0].innerHTML;
  return [leftTeam, rightTeam];
}

/**
 * Helper function to validate a button in collection is defined and named expectedly.
 * @param {HTMLCollection<Element>} navButtons The array containing all of the buttons
 * @param {number} index The index of the button to be verified.
 * @param {string} expectedLabel The expected label of the button to be verified.
 */
function checkButtonLabel(navButtons, index, expectedLabel) {
  const button = navButtons[index];
  if (typeof button === 'undefined') {
    throw new Error(`Button "${expectedLabel}" is not defined at index ${index}`);
  }
  const buttonLabel = navButtons[index].innerHTML.trim();
  if (buttonLabel != expectedLabel) {
    throw new Error(`First tab button "${buttonLabel}" is not "${expectedLabel}"`);
  }
}
/**
 * Function to busy wait that isn't meant for production but just to avoid everything 
 * becoming async.
 * @param {number} sleepDuration Number of ms to wait
 */
function sleep(sleepDuration) {
  var now = new Date().getTime();
  while (new Date().getTime() < now + sleepDuration) {
    /* Do nothing */
  }
}

/**
 * Scrape the "Populära" subsection of the betting area.
 * @param {Map<string, string>} data Map containing all of the csv data entries.
 * @param {string} leftTeam Name of the left team
 * @param {string} rightTeam Name of the right team
 * @param {HTMLCollection<Element>} navButtons The navigation buttons which can 
 * be pressed to change the current view.
 */
function scrapePopular(data, leftTeam, rightTeam, navButtons) {
  const POPULAR_INDEX = 0;
  checkButtonLabel(navButtons, POPULAR_INDEX, "Populära")
  navButtons[POPULAR_INDEX].click();
  sleep(100) // NOTE: This sucks LOL


  const fulltimeDoubleChance = document.getElementsByClassName(
    "srb-ParticipantResponsiveText_Odds"
  );
  data.set("Fulltid > 1", fulltimeDoubleChance[0].innerHTML);
  data.set("Fulltid > X", fulltimeDoubleChance[1].innerHTML);
  data.set("Fulltid > 2", fulltimeDoubleChance[2].innerHTML);
  data.set("Dubbelchans > 1X", fulltimeDoubleChance[3].innerHTML);
  data.set("Dubbelchans > X2", fulltimeDoubleChance[4].innerHTML);
  data.set("Dubbelchans > 12", fulltimeDoubleChance[5].innerHTML);
  let overUnder = document.getElementsByClassName(
    "gl-ParticipantOddsOnly_Odds"
  );
  data.set("Totalt antal mål > Över", overUnder[0].innerHTML);
  data.set("Totalt antal mål > Under", overUnder[1].innerHTML);
  data.set(
    leftTeam + " vinner och båda lagen gör mål > Ja",
    overUnder[2].innerHTML
  );
  data.set(
    rightTeam + " vinner och båda lagen gör mål > Ja",
    overUnder[3].innerHTML
  );
  data.set("Oavgjort och båda lagen gör mål > Ja", overUnder[4].innerHTML);
  data.set(
    leftTeam + " vinner och båda lagen gör mål > Nej",
    overUnder[5].innerHTML
  );
  data.set(
    rightTeam + " vinner och båda lagen gör mål > Nej",
    overUnder[6].innerHTML
  );
  data.set("Oavgjort och båda lagen gör mål > Nej", overUnder[8].innerHTML);
}

/**
 * Scrape the "Bet Builder" subsection of the betting area.
 * @param {Map<string, string>} data Map containing all of the csv data entries.
 * @param {string} leftTeam Name of the left team
 * @param {string} rightTeam Name of the right team
 * @param {HTMLCollection<Element>} navButtons The navigation buttons which can 
 * be pressed to change the current view.
 */
function scrapeBetBuilder(data, leftTeam, rightTeam, navButtons) {
  const BET_BUILDER_INDEX = 1;
  checkButtonLabel(navButtons, BET_BUILDER_INDEX, "Bet Builder")
  navButtons[BET_BUILDER_INDEX].click();
  sleep(100); // NOTE: This sucks LOL


}

/**
 * Scrape the "Asian" subsection of the betting area.
 * @param {Map<string, string>} data Map containing all of the csv data entries.
 * @param {string} leftTeam Name of the left team
 * @param {string} rightTeam Name of the right team
 * @param {HTMLCollection<Element>} navButtons The navigation buttons which can 
 * be pressed to change the current view.
 */
function scrapeAsian(data, leftTeam, rightTeam, navButtons) {
  const ASIAN_INDEX = 2;
  checkButtonLabel(navButtons, ASIAN_INDEX, "Asian")
  navButtons[ASIAN_INDEX].click();
  sleep(100); // NOTE: This sucks LOL

  selectMarketGroup("Totalt antal skott");
}

/**
 * Saves and displays the data in the HTML body.
 * @param {Map<string, string>} data Data to be saved
 */
function saveAndShowData(data) {
  document.body.innerHTML = "Erbjudande\tBet365\n";
  let sorted = new Map([...data.entries()].sort());

  for (let [key, value] of sorted) {
    document.body.innerHTML += key + "\t" + value + "\n";
  }

  console.debug(data);
}

// TODO: This function could be written so as not to be of time complexity O(n^2) 
// which it currently is.
/**
 * Fetches a market group from the currently open subsection.
 * @param {string} name Name of the market group of interest
 * @returns HTMLElement
 */
function selectMarketGroup(name) {
  // Select all divs with class bbw-BetBuilderEmbeddedMarketGroup
  const divs = document.querySelectorAll('div.bbw-BetBuilderEmbeddedMarketGroup.gl-MarketGroup');
  // Loop through each div and check the condition
  let targetDiv = null;
  divs.forEach(div => {
    const firstChild = div.firstElementChild;
    if (firstChild) {
      const firstChildOfFirstChild = firstChild.firstElementChild;
      if (firstChildOfFirstChild && firstChildOfFirstChild.innerHTML.trim() === name) {
        targetDiv = div;
      }
    }
  });
  return targetDiv;
}