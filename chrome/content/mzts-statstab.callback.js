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
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_sent_wait");
				if(!this.empty){
					$jQ("#today_sent").text(this.data[1]["Num"]);
				}else{
					$jQ("#today_sent").text("0");
				}
				miczLogger.log("Today sent messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};

miczThunderStatsTab.callback.homepage_stats_today_rcvd = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_rcvd_wait");
				if(!this.empty){
					dump(">>>>>>>>>>>>>> [miczThunderStatsTab today_rcvd] this.data "+JSON.stringify(this.data)+"\r\n");
					$jQ("#today_rcvd").text(this.data[1]["Num"]);
				}else{
					$jQ("#today_rcvd").text("0");
				}
				miczLogger.log("Today received messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};

miczThunderStatsTab.callback.homepage_stats_yesterday_sent = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_sent_wait");
				if(!this.empty){
					$jQ("#yesterday_sent").text(this.data[1]["Num"]);
				}else{
					$jQ("#yesterday_sent").text("0");
				}
				miczLogger.log("Yesterday sent messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};

miczThunderStatsTab.callback.homepage_stats_yesterday_rcvd = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_rcvd_wait");
				if(!this.empty){
					$jQ("#yesterday_rcvd").text(this.data[1]["Num"]);
				}else{
					$jQ("#yesterday_rcvd").text("0");
				}
				miczLogger.log("Yesterday received messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};

miczThunderStatsTab.callback.homepage_stats_today_recipients = {
	empty:true,
	data:{},
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data[key]=result[key];
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_recipients handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_recipients_wait");
				if(!this.empty){
					$jQ("#today_recipients").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#today_recipients").text("No mails sent!");
				}
				miczLogger.log("Today recipients loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};

miczThunderStatsTab.callback.homepage_stats_today_senders = {
	empty:true,
	data:{},
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data[key]=result[key];
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_senders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_senders_wait");
				if(!this.empty){
					$jQ("#today_senders").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#today_senders").text("No mails received!");
				}
				miczLogger.log("Today senders loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};

miczThunderStatsTab.callback.homepage_stats_yestarday_recipients = {
	empty:true,
	data:{},
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data[key]=result[key];
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_recipients handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_recipients_wait");
				if(!this.empty){
					$jQ("#yesterday_recipients").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#yesterday_recipients").text("No mails sent!");
				}
				miczLogger.log("Yesterday recipients loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};

miczThunderStatsTab.callback.homepage_stats_yesterday_senders = {
	empty:true,
	data:{},
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data[key]=result[key];
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_senders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_senders_wait");
				if(!this.empty){
					$jQ("#yesterday_senders").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#yesterday_senders").text("No mails received!");
				}
				miczLogger.log("Yesterday senders loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};

miczThunderStatsTab.callback.last_idx_msg = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["last_msg_date"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					$jQ("#mzts-last_msg").text("Last indexed message: "+miczThunderStatsUtils.getDateTimeString(this.data[1]["last_msg_date"]/1000));
				}else{
					$jQ("#mzts-last_msg").text("");
				}
				miczLogger.log("Last indexed message loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
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
