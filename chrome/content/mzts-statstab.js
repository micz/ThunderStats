"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");

var miczThunderStatsTab = {

	onLoad: function(){
			let identity_id=11;
			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();
			let rows=miczThunderStatsDB.querySentMessages(Date.parse('2014/12/01'),Date.now(),identity_id);
			//let rows=miczThunderStatsDB.queryGetForbiddenFolders();
			//document.getElementById("test_output").setAttribute("value",JSON.stringify(rows));
			let str_sentMsg="Sent messages from 01/12/2014 to today: "+rows[0][0]+"<br/>";

			let rows2=miczThunderStatsDB.queryReceivedMessages(Date.parse('2014/12/01'),Date.now(),identity_id);
			let str_rcvedMsg="Received messages from 01/12/2014 to today: "+rows2[0][0]+"<br/>";
			document.getElementById("test_output").innerHTML=str_sentMsg+str_rcvedMsg;

			miczThunderStatsCore.loadIdentities();
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities '+JSON.stringify(miczThunderStatsCore.identities)+'\r\n');

			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
