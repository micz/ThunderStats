"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");

var miczThunderStatsTab = {

	onLoad: function(){
			let identity_id=11;
			let output=new Array();
			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();
			let rows=miczThunderStatsDB.querySentMessages(Date.parse('2014/12/01'),Date.now(),identity_id);
			//let rows=miczThunderStatsDB.queryGetForbiddenFolders();
			//document.getElementById("test_output").setAttribute("value",JSON.stringify(rows));
			output.push("<b>Sent messages from 01/12/2014 to today:</b> "+rows[0][0]+"<br/>");

			let rows2=miczThunderStatsDB.queryReceivedMessages(Date.parse('2014/12/01'),Date.now(),identity_id);
			output.push("<b>Received messages from 01/12/2014 to today:</b> "+rows2[0][0]+"<br/>");

			let rows3=miczThunderStatsDB.queryGetNumRecipient(Date.parse('2014/12/01'),Date.now(),identity_id,10);
			output.push("<br/><b>Top 10 recipient from 01/12/2014 to today:</b> <br/>");
			for(let key in rows3){
				output.push(rows3[key][1]+" "+rows3[key][2]+" ("+rows3[key][3]+")<br/>");
			}
			output.push("<br/>");

			document.getElementById("test_output").innerHTML=output.join('');

			miczThunderStatsCore.loadIdentities();
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities '+JSON.stringify(miczThunderStatsCore.identities)+'\r\n');

			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
