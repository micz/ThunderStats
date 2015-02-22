"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

var miczThunderStatsTab = {

	onLoad: function(){
			miczLogger.setLogger(document.getElementById('log_wrapper'),document);
			miczLogger.log("ThunderStats starting...",0);

			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();
			miczLogger.log("Opening databases...",0);
			
			miczLogger.log("Loading identities...",0);
			miczThunderStatsCore.loadIdentities();
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities '+JSON.stringify(miczThunderStatsCore.identities)+'\r\n');

			miczLogger.log("Identities found: "+miczThunderStatsCore.identities.length,0);
			
			let id_selector = document.getElementById('identities_selector');
			for(let key in miczThunderStatsCore.identities){
				let opt = document.createElement('option');
				opt.value = miczThunderStatsCore.identities[key]["id"];
				opt.innerHTML = miczThunderStatsUtils.escapeHTML(miczThunderStatsCore.identities[key]["identityName"]+" ("+miczThunderStatsCore.identities[key]["identityName"]+")");
				id_selector.appendChild(opt);
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector "+miczThunderStatsCore.identities[key]["identityName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")\r\n");
			}
			miczLogger.log("Identities loaded.",0);

			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();

			miczLogger.log("ThunderStats ready.",0);
			//miczLogger.log("1 ThunderStats ready.",0);miczLogger.log("2 ThunderStats ready.",0);miczLogger.log("3 ThunderStats ready.",0);miczLogger.log("4 ThunderStats ready.",0);
		},

	doStats: function(){
			let id_selector = document.getElementById("identities_selector");
			let identity_id=id_selector.options[id_selector.selectedIndex].value;

			let output=new Array();
			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();

			/*let rows=miczThunderStatsDB.queryMessages(1,Date.parse('2014/12/01'),Date.now(),identity_id);
			output.push("<b>Sent messages from 01/12/2014 to today:</b> "+rows[0][0]+"<br/>");

			let rows2=miczThunderStatsDB.queryMessages(0,Date.parse('2014/12/01'),Date.now(),identity_id);
			output.push("<b>Received messages from 01/12/2014 to today:</b> "+rows2[0][0]+"<br/>");
			output.push("<br/>");

			let rows3=miczThunderStatsDB.queryGetNumInvolved(1,Date.parse('2014/12/01'),Date.now(),identity_id,10);
			output.push("<b>Top 10 Recipient from 01/12/2014 to today:</b> <br/>");
			for(let key in rows3){
				output.push(rows3[key][1]+" "+rows3[key][2]+" ("+rows3[key][3]+")<br/>");
			}
			output.push("<br/>");

			let rows4=miczThunderStatsDB.queryGetNumInvolved(0,Date.parse('2014/12/01'),Date.now(),identity_id,10);
			output.push("<br/><b>Top 10 Sender from 01/12/2014 to today:</b> <br/>");
			for(let key in rows4){
				output.push(rows4[key][1]+" "+rows4[key][2]+" ("+rows4[key][3]+")<br/>");
			}
			output.push("<br/>");

			let rows4=miczThunderStatsDB.queryGetAttachments(1,Date.parse('2014/12/01'),Date.now(),identity_id);
			output.push("<b>Sent attachments from 01/12/2014 to today:</b> "+rows4[0][0]+"<br/>");
			let rows5=miczThunderStatsDB.queryGetAttachments(0,Date.parse('2014/12/01'),Date.now(),identity_id);
			output.push("<b>Received attachments from 01/12/2014 to today:</b> "+rows5[0][0]+"<br/>");
			output.push("<br/>");*/

			/*let rows6=miczThunderStatsCore.db.getTodayMessages(1,identity_id);
			output.push("<b>Today sent messages:</b> "+rows6[0][0]+"<br/>");
			output.push("<br/>");

			document.getElementById("test_output").innerHTML=output.join('');*/

			//miczThunderStatsCore.db.getTodayMessages(1,identity_id,miczThunderStatsTab.callback.test);
			//miczThunderStatsCore.db.getYesterdayMessages(1,identity_id,miczThunderStatsTab.callback.test);

			miczThunderStatsDB.queryGetNumInvolved(1,Date.parse('2014/12/01'),Date.now(),identity_id,10,miczThunderStatsTab.callback.test);
			
			miczThunderStatsStorageDB.insertNewDay(identity_id,new Date(),miczThunderStatsTab.callback.day_cache_test);

			dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.test '+(typeof miczThunderStatsTab.callback.test)+'\r\n');

			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);

miczThunderStatsTab.callback={};

miczThunderStatsTab.callback.base={

	handleError: function(aError) {
		miczLogger.log("Error in executeAsync: " + aError.message,2);
	},
	
	handleCompletion: function(aReason) {
		miczLogger.log("Query completed with exit code: " + aReason);
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				return false;
		}
	},
};

miczThunderStatsTab.callback.test = {
  handleResult: function(aResultSet) {
    miczLogger.log("Query executed, parsing the result set...");
    /*for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
		miczLogger.log("Test CALLBACK: row "+JSON.stringify(row));
		miczLogger.log("Test CALLBACK: row "+JSON.stringify(row.numEntries));
		for (let colidx=0; colidx<row.numEntries; colidx++){
			miczLogger.log("Test CALLBACK: col "+colidx+" "+JSON.stringify(row.getResultByIndex(colidx)));
		}
    }*/
    //miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
    miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
};

miczThunderStatsTab.callback.day_cache_test = {
  handleResult: function(aResultSet) {
    miczLogger.log("Day cache rows inserted.");
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		miczLogger.log("Day cache rows inserted. Exit code: " + aReason);
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				return false;
		}
	},
};
