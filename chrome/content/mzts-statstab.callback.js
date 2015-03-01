"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
//Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");	// To be enabled in vesion 2.0
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

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
    miczThunderStatsTab.ui.hideLoadingElement("today_sent_wait");
	miczLogger.log("Today sent messages loaded.",0);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
};

miczThunderStatsTab.callback.homepage_stats_today_rcvd = {
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
    $jQ("#today_rcvd").text(result[1]["Num"]);
    miczThunderStatsTab.ui.hideLoadingElement("today_rcvd_wait");
    miczLogger.log("Today received messages loaded.",0);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
};

miczThunderStatsTab.callback.homepage_stats_yesterday_sent = {
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
    $jQ("#yesterday_sent").text(result[1]["Num"]);
    miczThunderStatsTab.ui.hideLoadingElement("yesterday_sent_wait");
    miczLogger.log("Yesterday sent messages loaded.",0);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
};

miczThunderStatsTab.callback.homepage_stats_yesterday_rcvd = {
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
    $jQ("#yesterday_rcvd").text(result[1]["Num"]);
    miczThunderStatsTab.ui.hideLoadingElement("yesterday_rcvd_wait");
    miczLogger.log("Yesterday received messages loaded.",0);
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: miczThunderStatsTab.callback.base.handleCompletion,
};

miczThunderStatsTab.callback.homepage_stats_today_recipients = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_recipients handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
			    miczLogger.log("Today recipients loaded.",0);
				miczThunderStatsTab.ui.hideLoadingElement("today_recipients_wait");
				if(!this.empty){
					$jQ("#today_recipients").text(JSON.stringify(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#today_recipients").text("No mails sent!");
				}
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

miczThunderStatsTab.callback.homepage_stats_today_senders = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_senders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
			    miczLogger.log("Today senders loaded.",0);
				miczThunderStatsTab.ui.hideLoadingElement("today_senders_wait");
				if(!this.empty){
					$jQ("#today_senders").text(JSON.stringify(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#today_senders").text("No mails received!");
				}
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

miczThunderStatsTab.callback.homepage_stats_yestarday_recipients = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_recipients handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
			    miczLogger.log("Yesterday recipients loaded.",0);
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_recipients_wait");
				if(!this.empty){
					$jQ("#yesterday_recipients").text(JSON.stringify(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#yesterday_recipients").text("No mails sent!");
				}
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

miczThunderStatsTab.callback.homepage_stats_yesterday_senders = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_senders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
			    miczLogger.log("Yesterday senders loaded.",0);
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_senders_wait");
				if(!this.empty){
					$jQ("#yesterday_senders").text(JSON.stringify(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#yesterday_senders").text("No mails received!");
				}
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
    //miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
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

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
