"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");

var miczThunderStatsTab = {

	onLoad: function(){
			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();
			let rows=miczThunderStatsDB.querySelect("*","messages","id=32");
			document.getElementById("test_output").setAttribute("value",JSON.stringify(rows));
			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
