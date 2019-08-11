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

        let aURL = "chrome://thunderstats/content/pagetest.xhtml";
        // let aURL = "chrome://thunderstats/content/mzts-statstab.xhtml";
        let tabmail = this.getMail3Pane().document.getElementById("tabmail");
        // tabmail.openTab("miczThStatsTab", { title: "ThunderStats" });
        // tabmail.openTab("chromeTab", { chromePage: aURL });

        // let tabmail = document.getElementById('tabmail');
        if (tabmail) {
            //tabmail.openTab("micz_thstat",{title:"ThunderStats Test"});
            //let aURL = "chrome://thunderstats/content/mzts-statstab.xul";
            //tabmail.openTab("chromeTab", { chromePage: aURL });
            tabmail.openTab("miczThStatsTab", { title: "ThunderStats" });
        }
        //alert("Just testing");
    },
};