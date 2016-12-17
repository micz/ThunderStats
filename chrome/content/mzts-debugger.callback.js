"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");


miczThunderStatsDebugger.callback={};

miczThunderStatsDebugger.callback.base={

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
	return false;
	},
};

miczThunderStatsDebugger.callback.last_idx_msg = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["last_msg_date"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

  handleError: miczThunderStatsDebugger.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					miczThunderStatsDebugger.addLogLines(_bundleCW.GetStringFromName("ThunderStats.LastIndexedMessage")+": "+miczThunderStatsUtils.getDateTimeString(moment(this.data[1]["last_msg_date"]/1000)));
				}else{
					miczThunderStatsDebugger.addLogLines(_bundleCW.GetStringFromName("ThunderStats.LastIndexedMessage")+": not found.");
				}
				miczLogger.log("Last indexed message loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsDebugger.getThunderStatsData(1);
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
	return false;
	},
};


miczThunderStatsDebugger.callback.tot_msg = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["tot_msg"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

  handleError: miczThunderStatsDebugger.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					miczThunderStatsDebugger.addLogLines("Total messages from gloda: "+this.data[1]["tot_msg"]);
				}else{
					miczThunderStatsDebugger.addLogLines("Total messages from gloda: not found.");
				}
				miczLogger.log("Total messages loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsDebugger.getThunderStatsData(4);
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
	return false;
	},
};

miczThunderStatsDebugger.callback.tot_msg_att = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["tot_msg_att"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

  handleError: miczThunderStatsDebugger.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					miczThunderStatsDebugger.addLogLines("Total message attributes from gloda: "+this.data[1]["tot_msg_att"]);
				}else{
					miczThunderStatsDebugger.addLogLines("Total message attributes from gloda: not found.");
				}
				miczLogger.log("Total message attributes loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsDebugger.getThunderStatsData(5);
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
	return false;
	},
};

miczThunderStatsDebugger.callback.stats_today_sent = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					miczThunderStatsDebugger.addLogLines("Today: total messages sent: "+this.data[1]["Num"]);
				}else{
					miczThunderStatsDebugger.addLogLines("Today: total messages sent: not found");
				}
				miczLogger.log("Today sent messages loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsDebugger.getThunderStatsData(6);
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
	return false;
	},
};

miczThunderStatsDebugger.callback.stats_today_rcvd = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					miczThunderStatsDebugger.addLogLines("Today: total messages received: "+this.data[1]["Num"]);
				}else{
					miczThunderStatsDebugger.addLogLines("Today: total messages received: not found");
				}
				miczLogger.log("Today sent messages loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsDebugger.getThunderStatsData(7);
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
	return false;
	},
};

miczThunderStatsDebugger.callback.stats_yesterday_sent = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					miczThunderStatsDebugger.addLogLines("Yesterday: total messages sent: "+this.data[1]["Num"]);
				}else{
					miczThunderStatsDebugger.addLogLines("Yesterday: total messages sent: not found");
				}
				miczLogger.log("Today sent messages loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsDebugger.getThunderStatsData(8);
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
	return false;
	},
};

miczThunderStatsDebugger.callback.stats_yesterday_rcvd = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					miczThunderStatsDebugger.addLogLines("Yesterday: total messages received: "+this.data[1]["Num"]);
				}else{
					miczThunderStatsDebugger.addLogLines("Yesterday: total messages received: not found");
				}
				miczLogger.log("Today sent messages loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsDebugger.getThunderStatsData(9);
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
	return false;
	},
};