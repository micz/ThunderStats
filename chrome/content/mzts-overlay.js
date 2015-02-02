"use strict";
var miczThunderStats = {

	init: function(){
		let tabmail = document.getElementById('tabmail');
		if (tabmail){
			tabmail.registerTabType(micz_thstatsTabType);
		}
	},
};

window.addEventListener("load", miczThunderStats.init, false);
