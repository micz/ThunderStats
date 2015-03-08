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

miczThunderStatsTab.callback.homepage_stats_yesterday_recipients = {
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
					$jQ("#mzts-last_msg").text("Last indexed message: "+miczThunderStatsUtils.getDateTimeString(moment(this.data[1]["last_msg_date"]/1000)));
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

miczThunderStatsTab.callback.stats_7days_sent = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num","Info"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				let m = moment(this.data[1]["Info"]);
				if(!this.empty){
					miczThunderStatsTab.data_7days_sent.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m),num:this.data[1]["Num"]});
					//$jQ("#7days_sent").append(this.data[1]["Info"]+": "+this.data[1]["Num"]);
				}else{
					miczThunderStatsTab.data_7days_sent.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m),num:0});
					//$jQ("#7days_sent").append(this.data[1]["Info"]+": 0");
				}
				miczLogger.log("7 days sent messages loaded day: "+this.data[1]["Info"]+".",0);
				//if we've collected our 7 days, let's print it!
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_7days_sent miczThunderStatsTab.data_7days_sent.length '+miczThunderStatsTab.data_7days_sent.length+'\r\n');
				if(miczThunderStatsTab.data_7days_sent.length==7){
					//$jQ("#7days_sent").text(JSON.stringify(miczThunderStatsTab.data_7days_sent));
					//ordering results array
					miczThunderStatsTab.data_7days_sent.sort(miczThunderStatsUtils.array_7days_compare);
					miczThunderStatsTab.ui.draw7DaysGraph('chart_7days_sent',miczThunderStatsTab.data_7days_sent);
					miczThunderStatsTab.ui.hideLoadingElement("7days_sent_wait");
				  	miczLogger.log("7 days sent messages chart rendered.",0);
				}
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

miczThunderStatsTab.callback.stats_7days_rcvd = {
	empty:true,
	data:{},
	total_mail:0,
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num","Info"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED:
				let m = moment(this.data[1]["Info"]);
				if(!this.empty){
					this.total_mail+=this.data[1]["Num"];
					miczThunderStatsTab.data_7days_rcvd.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m),num:this.data[1]["Num"]});
					//$jQ("#7days_rcvd").append(this.data[1]["Info"]+": "+this.data[1]["Num"]);
				}else{
					miczThunderStatsTab.data_7days_rcvd.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m),num:0});
					//$jQ("#7days_rcvd").append(this.data[1]["Info"]+": 0");
				}
				miczLogger.log("7 days sent messages loaded day: "+this.data[1]["Info"]+".",0);
				//if we've collected our 7 days, let's print it!
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_7days_sent miczThunderStatsTab.data_7days_sent.length '+miczThunderStatsTab.data_7days_sent.length+'\r\n');
				if(miczThunderStatsTab.data_7days_rcvd.length==7){
					//$jQ("#7days_rcvd").text(JSON.stringify(miczThunderStatsTab.data_7days_rcvd));
					//ordering results array
					miczThunderStatsTab.data_7days_sent.sort(miczThunderStatsUtils.array_7days_compare);
					miczThunderStatsTab.ui.draw7DaysGraph('chart_7days_rcvd',miczThunderStatsTab.data_7days_rcvd);
					$jQ("#7days_rcvd_total").text(this.total_mail);
				  	miczThunderStatsTab.ui.hideLoadingElement("7days_rcvd_wait");
				  	miczLogger.log("7 days received messages chart rendered.",0);
				  	this.total_mail=0;
				}
				this.data={};
				this.empty=true;
				return true;
			case Components.interfaces.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				return false;
			case Components.interfaces.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				return false;
		}
	},
};

miczThunderStatsTab.callback.stats_7days_recipients = {
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
				miczThunderStatsTab.ui.hideLoadingElement("7days_recipients_wait");
				if(!this.empty){
					$jQ("#7days_recipients").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_7days_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#7days_recipients").text("No mails sent!");
				}
				miczLogger.log("7 days recipients loaded.",0);
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

miczThunderStatsTab.callback.stats_7days_senders = {
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
				miczThunderStatsTab.ui.hideLoadingElement("7days_senders_wait");
				if(!this.empty){
					$jQ("#7days_senders").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_7days_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#7days_senders").text("No mails received!");
				}
				miczLogger.log("7 days senders loaded.",0);
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
