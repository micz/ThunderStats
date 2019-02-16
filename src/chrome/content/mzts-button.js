"use strict";
var miczThunderStatsButton = {

	onCommand: function(){
		let tabmail = document.getElementById('tabmail');
		if (tabmail){
			//tabmail.openTab("micz_thstat",{title:"ThunderStats Test"});
			//let aURL = "chrome://thunderstats/content/mzts-statstab.xul";
			//tabmail.openTab("chromeTab", { chromePage: aURL });
			tabmail.openTab("miczThStatsTab",{title:"ThunderStats"});
		}
		 //alert("Just testing");
	},
};
