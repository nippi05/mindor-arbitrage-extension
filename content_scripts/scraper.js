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

    if (message != "scrape") {
      console.error("Invalid message");
      return;
    }
    const url = new URL(document.URL);
    if (url.hostname != "www.bet365.com") {
      console.error("Invalid page");
      throw new Error("Wrong page");
    }

    try {
      const navButtons = document.getElementsByClassName(
        "sph-MarketGroupNavBarButton_Content"
      );
      console.assert(navButtons.length == 2) // The least number of categories needed.

      const [leftTeam, rightTeam] = getTeamNames();

      navButtons[0].click();
      fetchPopular(data, leftTeam, rightTeam);

      navButtons[1].click(); // Bet builder
      fetchBetBuilder(data, leftTeam, rightTeam);

      navButtons[2].click(); // Asian
      fetchAsian(data, leftTeam, rightTeam);

      saveAndShowData(data);
    } catch (error) {
      console.error("Possibly invalid page: " + error);
    }
  });
})();

function getTeamNames() {
  const leftTeam = document.getElementsByClassName(
    "sph-FixturePodHeader_TeamName"
  )[0].innerHTML;
  const rightTeam = document.getElementsByClassName(
    "sph-FixturePodHeader_TeamName"
  )[0].innerHTML;
  return [leftTeam, rightTeam];
}

function fetchPopular(data, leftTeam, rightTeam) {
  let fulltimeDoubleChance = document.getElementsByClassName(
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

function fetchBetBuilder(data, leftTeam, rightTeam) {

}

function fetchAsian(data, leftTeam, rightTeam) {

}

function saveAndShowData(data) {
  document.body.innerHTML = "Erbjudande\tBet365\n";
  let sorted = new Map([...data.entries()].sort());

  for (let [key, value] of sorted) {
    document.body.innerHTML += key + "\t" + value + "\n";
  }

  console.debug(data);
}

function selectMarketGroup(name) {
  // Select all divs with class bbw-BetBuilderEmbeddedMarketGroup
  const divs = document.querySelectorAll('div.bbw-BetBuilderEmbeddedMarketGroup');

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