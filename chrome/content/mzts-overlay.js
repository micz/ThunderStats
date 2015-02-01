"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-thstatTabType.js");

var miczThunderStats = {

	init: function(){
		let tabmail = document.getElementById('tabmail');
		if (tabmail){
			tabmail.registerTabType(micz_thstatTabType);
		}
	},
};

window.addEventListener("load", miczThunderStats.init, false);
