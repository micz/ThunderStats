"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

var miczThunderStatsButton = {

    getMail3Pane: function() {
        var w = Cc["@mozilla.org/appshell/window-mediator;1"]
            .getService(Ci.nsIWindowMediator)
            .getMostRecentWindow("mail:3pane");
        return w;
    },

    onCommand: function() {

        // let aURL = "chrome://thunderstats/content/fp2.xul";
        let aURL = "chrome://thunderstats/content/fp2.xul";
        let tabmail = this.getMail3Pane().document.getElementById("tabmail");
        // tabmail.openTab("miczThStatsTab", { title: "ThunderStats" });
        // tabmail.openTab("chromeTab", { chromePage: aURL });

        // let tabmail = document.getElementById('tabmail');
        if (tabmail) {
            //tabmail.openTab("micz_thstat",{title:"ThunderStats Test"});
            // let aURL = "chrome://thunderstats/content/mzts-statstab.xhtml";
            // tabmail.openTab("chromeTab", { chromePage: aURL });
            // tabmail.openTab("contentTab", { contentPage: aURL });
            // openContentTab( aURL, "tab");
            tabmail.openTab("miczThStatsTab", { id: "miczThStatsTabLive", title: "ThunderStats" });
            // openContentTab('<a class="moz-txt-link-rfc2396E" href="http://www.jorgk.com">http://www.jorgk2.com</a>',"tab");
        }
        //alert("Just testing");
    },
};