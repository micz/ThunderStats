"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");

var miczThunderStatsTab = {

	onLoad: function(){
			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();
			let rows=miczThunderStatsDB.querySentMessages(Date.parse('2014/12/01'),Date.now());
			document.getElementById("test_output").setAttribute("value",JSON.stringify(rows));
			//document.getElementById("test_output").setAttribute("value","Sent messages from 01/12/2014 to today: "+);
			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
