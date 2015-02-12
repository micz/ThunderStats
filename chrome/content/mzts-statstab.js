"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");

var miczThunderStatsTab = {

	onLoad: function(){
		
			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();

			miczThunderStatsCore.loadIdentities();
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities '+JSON.stringify(miczThunderStatsCore.identities)+'\r\n');
			
			let id_selector = document.getElementById('identities_selector');
			for(let key in miczThunderStatsCore.identities){
				let opt = document.createElement('option');
				opt.value = miczThunderStatsCore.identities[key]["id"];
				opt.innerHTML = miczThunderStatsTab.escapeHTML(miczThunderStatsCore.identities[key]["identityName"]+" ("+miczThunderStatsCore.identities[key]["identityName"]+")");
				id_selector.appendChild(opt);
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector "+miczThunderStatsCore.identities[key]["identityName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")\r\n");
			}
			
			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
		},
		
	doStats: function(){			
			let id_selector = document.getElementById("identities_selector");
			let identity_id=id_selector.options[id_selector.selectedIndex].value;
			let output=new Array();
			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();
			let rows=miczThunderStatsDB.querySentMessages(Date.parse('2014/12/01'),Date.now(),identity_id);
			//let rows=miczThunderStatsDB.queryGetForbiddenFolders();
			//document.getElementById("test_output").setAttribute("value",JSON.stringify(rows));
			output.push("<b>Sent messages from 01/12/2014 to today:</b> "+rows[0][0]+"<br/>");

			let rows2=miczThunderStatsDB.queryReceivedMessages(Date.parse('2014/12/01'),Date.now(),identity_id);
			output.push("<b>Received messages from 01/12/2014 to today:</b> "+rows2[0][0]+"<br/>");
			output.push("<br/>");

			let rows3=miczThunderStatsDB.queryGetNumRecipient(Date.parse('2014/12/01'),Date.now(),identity_id,10);
			output.push("<b>Top 10 Recipient from 01/12/2014 to today:</b> <br/>");
			for(let key in rows3){
				output.push(rows3[key][1]+" "+rows3[key][2]+" ("+rows3[key][3]+")<br/>");
			}
			output.push("<br/>");

			let rows4=miczThunderStatsDB.queryGetNumSender(Date.parse('2014/12/01'),Date.now(),identity_id,10);
			output.push("<br/><b>Top 10 Sender from 01/12/2014 to today:</b> <br/>");
			for(let key in rows4){
				output.push(rows4[key][1]+" "+rows4[key][2]+" ("+rows4[key][3]+")<br/>");
			}
			output.push("<br/>");

			document.getElementById("test_output").innerHTML=output.join('');

			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
	},
	
	escapeHTML: function(s){ 
		return s.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
