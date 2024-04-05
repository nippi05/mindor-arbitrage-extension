(function () {
  var data = new Map();
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
      const navButtons = document.getElementsByClassName(
        "sph-MarketGroupNavBarButton_Content"
      );
      const lag1 = document.getElementsByClassName(
        "sph-FixturePodHeader_TeamName"
      )[0].innerHTML;
      const lag2 = document.getElementsByClassName(
        "sph-FixturePodHeader_TeamName"
      )[0].innerHTML;

      // Main page
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
        lag1 + " vinner och båda lagen gör mål > Ja",
        overUnder[2].innerHTML
      );
      data.set(
        lag2 + " vinner och båda lagen gör mål > Ja",
        overUnder[3].innerHTML
      );
      data.set("Oavgjort och båda lagen gör mål > Ja", overUnder[4].innerHTML);
      data.set(
        lag1 + " vinner och båda lagen gör mål > Nej",
        overUnder[5].innerHTML
      );
      data.set(
        lag2 + " vinner och båda lagen gör mål > Nej",
        overUnder[6].innerHTML
      );
      data.set("Oavgjort och båda lagen gör mål > Nej", overUnder[8].innerHTML);

      // Asian
      navButtons[2].click();

      // Save and show data
      document.body.innerHTML = "Erbjudande\tBet365\n";
      let sorted = new Map([...data.entries()].sort());

      for (let [key, value] of sorted) {
        document.body.innerHTML += key + "\t" + value + "\n";
      }

      console.log(data);
    } catch (error) {
      console.error("Possibly invalid page: " + error);
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
