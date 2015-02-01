"use strict";
var miczThunderStatsButton = {

	onCommand: function(){
		let tabmail = document.getElementById('tabmail');
		if (tabmail){
			tabmail.openTab("micz_thstat");
		}
		 alert("Just testing");
	},
};
