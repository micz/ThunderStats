"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-mdb.jsm");

var miczThunderStatsTab = {

	onLoad: function(){
			miczThunderStatsDB.init();
			let rows=miczThunderStatsDB.querySelect("*","messages","id=32");
			document.getElementById("test_output").setAttribute("value",JSON.stringify(rows));
			miczThunderStatsDB.close();
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
