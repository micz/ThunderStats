"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

// ChromeUtils.import("resource:///modules/StringBundle.js");

var micz_thstatsTabType = {
  name: "miczThStatsTab",
  perTabPanel: "vbox",
  /*strings:
    new StringBundle("chrome://thunderstats/locale/mzts-tabtype.properties"),*/
  modes: {
    miczThStatsTab: {
      // this is what get exposed on the tab for icon purposes
      type: "miczThStatsTab"
    }
   },

    shouldSwitchTo: function(){
     let tabmail = document.getElementById("tabmail");
     let tabInfo = tabmail.tabInfo;
     for (let selectedIndex = 0; selectedIndex < tabInfo.length;++selectedIndex) {
		//dump('>>>>>>>>> [micz_thstatsTabType]: tabInfo[selectedIndex].mode.name '+tabInfo[selectedIndex].mode.name+'\r\n');
		//dump('>>>>>>>>> [micz_thstatsTabType]: this.name '+this.name+'\r\n');
       if (tabInfo[selectedIndex].mode.name == this.name){
         return selectedIndex;
       }
     }
     return -1;
	},
    /**
     * This is the internal function used by chrome tabs to open a new tab. To
     * open a chromeTab, use specialTabs.openTab("chromeTab", aArgs)
     *
     * @param aArgs The options that chrome tabs accept.
     * @param aArgs.chromePage A string that holds the URL that is to be opened
     * @param aArgs.clickHandler The click handler for that chrome tab. See the
     *  "Content Tabs" article on MDC.
     * @param aArgs.onLoad A function that takes an Event and a DOMNode. It is
     *  called when the chrome page is done loading. The first argument is the
     *  load event, and the second argument is the xul:browser that holds the
     *  chromePage. You can access the inner tab's window object by accessing
     *  the second parameter's chromeWindow property.
     */
    openTab: function chromeTab_onTabOpened(aTab, aArgs) {

      // First clone the page and set up the basics.
      let clone = document.getElementById("chromeTab").firstChild.cloneNode(true);

      clone.setAttribute("id", "miczThStatsTabLive");
      clone.setAttribute("collapsed", false);

      let toolbox = clone.firstChild;
      toolbox.setAttribute("id", "miczThStatsTabToolbox");
      toolbox.firstChild.setAttribute("id", "miczThStatsTabchromeTabToolbar");

      aTab.panel.appendChild(clone);

      // Start setting up the browser.
      aTab.browser = aTab.panel.querySelector("browser");

      aTab.browser.setAttribute("id", "miczThStatsTabBrowser");
      aTab.tabNode.setAttribute("image","chrome://thunderstats/skin/mzts-button.png");

      this._setUpCloseWindowListener(aTab);

      // Now start loading the content.
      aTab.title = "ThunderStats";
      
      aTab.browser.loadURI("chrome://thunderstats/content/mzts-statstab.xhtml");
      // aTab.browser.loadURI("chrome://thunderstats/content/pagetest2.xhtml");
      // aTab.browser.loadURI("chrome://thunderstats/content/fp2.xul");

    },
    tryCloseTab: function onTryCloseTab(aTab) {
      let docShell = aTab.browser.docShell;
      // If we have a docshell, a contentViewer, and it forbids us from closing
      // the tab, then we return false, which means, we can't close the tab. All
      // other cases return true.
      return !(docShell && docShell.contentViewer
        && !docShell.contentViewer.permitUnload());
    },
    closeTab: function onTabClosed(aTab) {
      aTab.browser.removeEventListener("DOMWindowClose",aTab.closeListener, true);
      aTab.browser.destroy();
    },
    saveTabState: function onSaveTabState(aTab) {
    },
    showTab: function onShowTab(aTab) {
    },
    persistTab: function onPersistTab(aTab) {
      if (aTab.browser.currentURI.spec == "about:blank")
        return null;

      //let onClick = aTab.browser.getAttribute("onclick");

      return {
        tabURI: aTab.browser.currentURI.spec,
        //clickHandler: onClick ? onClick : null
      };
    },
    restoreTab: function onRestoreTab(aTab, aPersistedState) {
      aTab.openTab("miczThStatsTab", { background: false } );
    },
    onTitleChanged: function onTitleChanged(aTab) {
      aTab.title = aTab.browser.contentDocument.title;
    },

    getBrowser: function getBrowser(aTab) {
      return aTab.browser;
    },

    /**
     * Internal function used to set up the close window listener on a content
     * tab.
     */
    _setUpCloseWindowListener: function setUpCloseWindowListener(aTab) {
      function onDOMWindowClose(aEvent) {
		  try {
			if (!aEvent.isTrusted)
			  return;

			// Redirect any window.close events to closing the tab. As a 3-pane tab
			// must be open, we don't need to worry about being the last tab open.
			document.getElementById("miczThStatsTabBrowser").closeTab(aTab);
			aEvent.preventDefault();
		  } catch (e) {
			logException(e);
		  }
      }
      // Save the function we'll use as listener so we can remove it later.
      aTab.closeListener = onDOMWindowClose;
      // Add the listener.
      aTab.browser.addEventListener("DOMWindowClose",aTab.closeListener, true);
    },
};
