"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

var $jQ = jQuery.noConflict();

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
			miczLogger.log("ThunderStats ready.",0);

			miczLogger.log("Getting home page statistics...",0);
			miczThunderStatsTab.getHomepageStats(0);
			
			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
		},
		
	getHomepageStats:function(identity_id){
		//Show loading indicators
		miczThunderStatsTab.ui.showLoadingToday("today_sent_wait");
		miczThunderStatsTab.ui.showLoadingToday("today_rcvd_wait");
		
		//Print dates
		$jQ("#today_date").text(miczThunderStatsUtils.getTodayString());
		$jQ("#yesterday_date").text(miczThunderStatsUtils.getYesterdayString());
		
		//Today
		//Get today sent messages
		miczThunderStatsCore.db.getTodayMessages(1,identity_id,miczThunderStatsTab.callback.homepage_stats_today_sent);
		
		//Get today received messages
		miczThunderStatsCore.db.getTodayMessages(0,identity_id,miczThunderStatsTab.callback.homepage_stats_today_rcvd);
		
		//Get today first 10 senders
		
		//Get today first 10 recipients
		
		//Yesterday
		//Get yesterday sent messages
		miczThunderStatsCore.db.getYesterdayMessages(1,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_sent);
		
		//Get yesterday received messages
		miczThunderStatsCore.db.getYesterdayMessages(0,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_rcvd);
		
		//Get yesterday first 10 senders
		
		//Get yesterday first 10 recipients
		
	},

	doStats: function(){
			let id_selector = document.getElementById("identities_selector");
			let identity_id=id_selector.options[id_selector.selectedIndex].value;

			let output=new Array();
			miczThunderStatsDB.init();
			miczThunderStatsStorageDB.init();
			
			this.getHomepageStats(identity_id);

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
			output.push("<br/>");*/
			
			/*let rows7=miczThunderStatsDB.queryGetLastMessageDate();
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] '+JSON.stringify(rows7)+'\r\n');
			let rows7_date=new Date(rows7[0][0]/1000);
			output.push("<b>Last message date:</b> "+rows7_date.toString()+"<br/>");
			output.push("<br/>");

			document.getElementById("test_output").innerHTML=output.join('');*/

			//miczThunderStatsCore.db.getTodayMessages(1,identity_id,miczThunderStatsTab.callback.test);
			//miczThunderStatsCore.db.getYesterdayMessages(1,identity_id,miczThunderStatsTab.callback.test);

			//miczThunderStatsDB.queryGetNumInvolved(1,Date.parse('2014/12/01'),Date.now(),identity_id,10,miczThunderStatsTab.callback.test);
			
			//miczThunderStatsStorageDB.insertNewDay(identity_id,new Date(),miczThunderStatsTab.callback.day_cache_test);

			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.test '+(typeof miczThunderStatsTab.callback.test)+'\r\n');
			
			
			/*let fd=new Date('2014/12/01');
			let td=new Date('2014/12/10');
			miczThunderStatsUtils.getDaysFromRange(fd,td);*/

			miczThunderStatsDB.close();
			miczThunderStatsStorageDB.close();
	},

};


miczThunderStatsTab.callback={};

miczThunderStatsTab.callback.base={

	handleError: function(aError) {
		miczLogger.log("Error in executeAsync: " + aError.message,2);
	},
	
	handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				//miczLogger.log("Query completed successfully.");
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

miczThunderStatsTab.callback.homepage_stats_today_sent = {
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
    $jQ("#today_sent").text(result[1]["Num"]);
    miczThunderStatsTab.ui.hideLoadingToday("today_sent_wait");
	miczLogger.log("Home page today sent messages loaded.",0);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
};

miczThunderStatsTab.callback.homepage_stats_today_rcvd = {
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
    $jQ("#today_rcvd").text(result[1]["Num"]);
    miczThunderStatsTab.ui.hideLoadingToday("today_rcvd_wait");
    miczLogger.log("Home page today received messages loaded.",0);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
};

miczThunderStatsTab.callback.homepage_stats_yesterday_sent = {
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
    $jQ("#yesterday_sent").text(result[1]["Num"]);
    miczThunderStatsTab.ui.hideLoadingToday("yesterday_sent_wait");
    miczLogger.log("Home page yesterday sent messages loaded.",0);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
};

miczThunderStatsTab.callback.homepage_stats_yesterday_rcvd = {
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
    $jQ("#yesterday_rcvd").text(result[1]["Num"]);
    miczThunderStatsTab.ui.hideLoadingToday("yesterday_rcvd_wait");
    miczLogger.log("Home page yesterday received messages loaded.",0);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
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
    miczLogger.log("Day cache row inserted.");
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		miczLogger.log("Day cache row inserted. Exit code: " + aReason);
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

miczThunderStatsTab.ui={

	showLoadingToday:function(element){
		$jQ("#"+element).show();
	},

	hideLoadingToday:function(element){
		$jQ("#"+element).hide();
	},
};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
