"use strict";
Components.utils.import("resource:///modules/StringBundle.js");

var EXPORTED_SYMBOLS = ["micz_thstatTabType"];

var micz_thstatTabType = {
  name: "ThStat",
  perTabPanel: "vbox",
  strings:
    new StringBundle("chrome://thunderstats/locale/mzts-tab.properties"),
  modes: {
    micz_thstat: {
      // this is what get exposed on the tab for icon purposes
      type: "micz_thstat"
    }
  },
  openTab: function thstatTabType_openTab(aTab, aArgs) {
    // we have no browser until our XUL document loads
    aTab.browser = null;

//TODO
/*    // First clone the page and set up the basics.
    let clone = document.getElementById("glodaTab")
                        .firstChild
                        .cloneNode(true);

    aTab.panel.appendChild(clone);
    aTab.iframe = aTab.panel.querySelector("iframe");

    // Wire up the search input icon click event
    let searchInput = aTab.panel.querySelector(".remote-gloda-search");
    let searchIcon = aTab.panel.querySelector(".gloda-search-icon");
    searchIcon.addEventListener("click", function(e) {
      searchInput.doSearch();
    });

    if ("query" in aArgs) {
      aTab.query = aArgs.query;
      aTab.collection = aTab.query.getCollection();

      aTab.title = this.strings.get("glodaFacetView.tab.query.label");
      aTab.searchString = null;
    }
    else if ("searcher" in aArgs) {
      aTab.searcher = aArgs.searcher;
      aTab.collection = aTab.searcher.getCollection();
      aTab.query = aTab.searcher.query;
      if ("IMSearcher" in aArgs) {
        aTab.IMSearcher = aArgs.IMSearcher;
        aTab.IMCollection = aArgs.IMSearcher.getCollection();
        aTab.IMQuery = aTab.IMSearcher.query;
      }

      let searchString = aTab.searcher.searchString;
      aTab.title = aTab.searchInputValue = aTab.searchString =
        searchString;
    }
    else if ("collection" in aArgs) {
      aTab.collection = aArgs.collection;

      aTab.title = this.strings.get("glodaFacetView.tab.query.label");
      aTab.searchString = null;
    }

    function xulLoadHandler() {
      aTab.iframe.contentWindow.removeEventListener("load", xulLoadHandler,
                                                    false);
      aTab.iframe.contentWindow.tab = aTab;
      aTab.browser = aTab.iframe.contentDocument.getElementById("browser");
      aTab.browser.setAttribute("src",
        "chrome://messenger/content/glodaFacetView.xhtml");
    }

    aTab.iframe.contentWindow.addEventListener("load", xulLoadHandler, false);
    aTab.iframe.setAttribute("src",
      "chrome://messenger/content/glodaFacetViewWrapper.xul");*/
  },
  closeTab: function thstatTabType_closeTab(aTab) {
  },
  saveTabState: function thstatTabType_saveTabState(aTab) {
    // nothing to do; we are not multiplexed
  },
  showTab: function thstatTabType_showTab(aTab) {
    // nothing to do; we are not multiplexed
  },
  getBrowser: function(aTab) {
    return aTab.browser;
  }
};
