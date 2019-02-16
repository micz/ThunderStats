"use strict";
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");

var miczThunderStats = {

	init: function(){
		let tabmail = document.getElementById('tabmail');
		if (tabmail){
			tabmail.registerTabType(micz_thstatsTabType);
		}
		if(miczThunderStatsPrefs.firstRun){		//adding toolbar button at first run
			miczThunderStatsPrefs.firstRunDone();
			miczThunderStats.addToolbarButton();
		}
	},

	addToolbarButton:function(){
		let toolbar = document.getElementById("mail-bar3");
		let buttonId = "mzts-button";
		let before_el = document.getElementById("gloda-search").previousSibling;
		if(before_el==null){
			before_el = document.getElementById("button-appmenu").previousSibling;
		}

		if(!document.getElementById(buttonId)){
			if(toolbar!=null){
				toolbar.insertItem(buttonId,before_el);
				toolbar.setAttribute("currentset", toolbar.currentSet);
				document.persist(toolbar.id, "currentset");
			}
		}
	},
};

window.addEventListener("load", miczThunderStats.init, false);
