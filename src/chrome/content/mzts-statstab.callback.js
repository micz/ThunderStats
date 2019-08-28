"use strict";
//ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");	// To be enabled in vesion 2.0

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

var { miczThunderStatsDB } = ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
var { miczThunderStatsCore } = ChromeUtils.import("chrome://thunderstats/content/mzts-statscore.jsm");
var { miczThunderStatsPrefs } = ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
var { miczThunderStatsI18n } = ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
var { miczLogger } = ChromeUtils.import("resource://thunderstats/miczLogger.jsm");

miczThunderStatsTab.callback={};

miczThunderStatsTab.callback.base={

	handleError: function(aError) {
		miczLogger.log("Error in executeAsync: " + aError.message,2);
	},

	handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				//miczLogger.log("Query completed successfully.");
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				return false;
		}
	return false;
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_sent_wait");
				if(!this.empty){
					$jQ("#today_sent").text(this.data[1]["Num"]);
					miczThunderStatsTab._check_today_sent_empty=(this.data[1]["Num"]==0);
				}else{
					$jQ("#today_sent").text("0");
					miczThunderStatsTab._check_today_sent_empty=true;
				}
				miczLogger.log("Today sent messages loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsTab._check_today_sent_running=false;
				miczThunderStatsTab.showDebuggerWarning();
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_rcvd_wait");
				if(!this.empty){
					//dump(">>>>>>>>>>>>>> [miczThunderStatsTab today_rcvd] this.data "+JSON.stringify(this.data)+"\r\n");
					$jQ("#today_rcvd").text(this.data[1]["Num"]);
					miczThunderStatsTab._check_today_rcvd_empty=(this.data[1]["Num"]==0);
				}else{
					$jQ("#today_rcvd").text("0");
					miczThunderStatsTab._check_today_rcvd_empty=true;
				}
				miczLogger.log("Today received messages loaded.",0);
				this.data={};
				this.empty=true;
				miczThunderStatsTab._check_today_rcvd_running=false;
				miczThunderStatsTab.showDebuggerWarning();
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
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
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
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
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_recipients_wait");
				if(!this.empty){
					$jQ("#today_recipients").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#today_recipients").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsSent"));
				}
				miczLogger.log("Today recipients loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_senders_wait");
				if(!this.empty){
					$jQ("#today_senders").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#today_senders").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsReceived"));
				}
				miczLogger.log("Today senders loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.homepage_stats_yesterday_recipients = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_recipients_wait");
				if(!this.empty){
					$jQ("#yesterday_recipients").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#yesterday_recipients").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsSent"));
				}
				miczLogger.log("Yesterday recipients loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_senders_wait");
				if(!this.empty){
					$jQ("#yesterday_senders").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#yesterday_senders").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsReceived"));
				}
				miczLogger.log("Yesterday senders loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#mzts-last_msg").text(_bundleCW.GetStringFromName("ThunderStats.LastIndexedMessage")+": "+miczThunderStatsUtils.getDateTimeString(moment(this.data[1]["last_msg_date"]/1000)));
				}else{
					$jQ("#mzts-last_msg").text("");
				}
				miczLogger.log("Last indexed message loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_7days_sent = {
	empty:true,
	data:{},
	data_7days_sent:new Array(),
	total_mail:0,
	today_mail:0,
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				let m = moment(miczThunderStatsUtils.getDate7DaysString(new Date(this.data[1]["Info"])),"YYYYMMDD");
				//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_7days_sent m.format("L") '+m.format("L")+'\r\n',0);
				if(!this.empty){
					if(m.format("L")!=moment().format("L")){	//not today
						this.total_mail+=this.data[1]["Num"];
					}else{	//today
						this.today_mail+=this.data[1]["Num"];
					}
					this.data_7days_sent.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:this.data[1]["Num"]});
					//$jQ("#7days_sent").append(this.data[1]["Info"]+": "+this.data[1]["Num"]);
				}else{
					this.data_7days_sent.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:0});
					//$jQ("#7days_sent").append(this.data[1]["Info"]+": 0");
				}
				miczLogger.log("7 days sent messages loaded day: "+this.data[1]["Info"]+".",0);
				//if we've collected our 7 days, let's print it!
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_7days_sent miczThunderStatsTab.data_7days_sent.length '+miczThunderStatsTab.data_7days_sent.length+'\r\n');
				if(this.data_7days_sent.length==miczThunderStatsPrefs.manyDays+1){	//+1 because we are showing the given number of past days AND also today
					//$jQ("#7days_sent").text(JSON.stringify(miczThunderStatsTab.data_7days_sent));
					//ordering results array
					this.data_7days_sent.sort(miczThunderStatsUtils.array_7days_compare);
					miczThunderStatsTab.ui.draw7DaysGraph('chart_7days_sent',this.data_7days_sent,miczThunderStatsPrefs.manyDays+1,true,miczThunderStatsPrefs.manyDaysSmallLabels);
					$jQ("#7days_sent_total").text(this.total_mail);
					if(this.today_mail>0){
						$jQ("#_7days_sent_today_num").text(this.today_mail);
						$jQ("#_7days_sent_today").show();
					}else{
						$jQ("#_7days_sent_today").hide();
						$jQ("#_7days_sent_today_num").text(" ");
					}
					miczThunderStatsTab.ui.hideLoadingElement("7days_sent_wait");
				  	miczLogger.log("7 days sent messages chart rendered.",0);
				  	this.total_mail=0;
				  	this.today_mail=0
				  	this.data_7days_sent=new Array();
				}
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				this.today_mail=0
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				this.today_mail=0
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_7days_rcvd = {
	empty:true,
	data:{},
	data_7days_rcvd:new Array(),
	total_mail:0,
	today_mail:0,
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num","Info"],aResultSet);
		//miczLogger.log("RCVD "+JSON.stringify(result),1);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				let m = moment(miczThunderStatsUtils.getDate7DaysString(new Date(this.data[1]["Info"])),"YYYYMMDD");
				if(!this.empty){
					if(m.format("L")!=moment().format("L")){	//not today
						this.total_mail+=this.data[1]["Num"];
					}else{	//today
						this.today_mail+=this.data[1]["Num"];
					}
					this.data_7days_rcvd.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:this.data[1]["Num"]});
					//$jQ("#7days_rcvd").append(this.data[1]["Info"]+": "+this.data[1]["Num"]);
				}else{
					this.data_7days_rcvd.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:0});
					//$jQ("#7days_rcvd").append(this.data[1]["Info"]+": 0");
				}
				miczLogger.log("7 days sent messages loaded day: "+this.data[1]["Info"]+".",0);
				//if we've collected our 7 days, let's print it!
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_7days_sent miczThunderStatsTab.data_7days_sent.length '+miczThunderStatsTab.data_7days_sent.length+'\r\n');
				if(this.data_7days_rcvd.length==miczThunderStatsPrefs.manyDays+1){	//+1 because we are showing the given number of past days AND also today
					//$jQ("#7days_rcvd").text(JSON.stringify(miczThunderStatsTab.data_7days_rcvd));
					//ordering results array
					this.data_7days_rcvd.sort(miczThunderStatsUtils.array_7days_compare);
					miczThunderStatsTab.ui.draw7DaysGraph('chart_7days_rcvd',this.data_7days_rcvd,miczThunderStatsPrefs.manyDays+1,true,miczThunderStatsPrefs.manyDaysSmallLabels);
					$jQ("#7days_rcvd_total").text(this.total_mail);
					if(this.today_mail>0){
						$jQ("#_7days_rcvd_today_num").text(this.today_mail);
						$jQ("#_7days_rcvd_today").show();
					}else{
						$jQ("#_7days_rcvd_today").hide();
						$jQ("#_7days_rcvd_today_num").text(" ");
					}
				  	miczThunderStatsTab.ui.hideLoadingElement("7days_rcvd_wait");
				  	miczLogger.log("7 days received messages chart rendered.",0);
				  	this.total_mail=0;
				  	this.today_mail=0
				  	this.data_7days_rcvd=new Array();
				}
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				this.today_mail=0
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				this.today_mail=0
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_7days_recipients = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("7days_recipients_wait");
				if(!this.empty){
					$jQ("#7days_recipients").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_7days_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#7days_recipients").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsSent"));
				}
				miczLogger.log("7 days recipients loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_7days_senders = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("7days_senders_wait");
				if(!this.empty){
					$jQ("#7days_senders").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_7days_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#7days_senders").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsReceived"));
				}
				miczLogger.log("7 days senders loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_today_inbox0_folder_spread = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Folder","FolderURI","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_today_inbox0_folders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_inbox0_wait");
				if(!this.empty){
					//$jQ("#today_inbox0_folder_spread").text(JSON.stringify(this.data));
					$jQ("#today_inbox0_folder_spread_nomails").hide();
					miczThunderStatsTab.ui.drawInbox0FolderSpreadGraph('today_inbox0_folder_spread',this.data);
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_today_inbox0_folders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#today_inbox0_folder_spread_nomails").show();
					miczThunderStatsTab.ui.drawInbox0FolderSpreadGraph('today_inbox0_folder_spread',{});
					$jQ("#today_inbox0_folder_spread_svg_graph").hide();
				}
				miczLogger.log("Today Inbox 0 data loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

/*miczThunderStatsTab.callback.stats_today_inbox0_inboxmsg = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_inbox0_inboxmsg_wait");
				if(!this.empty){
					$jQ("#today_inbox0_inboxmsg").text(this.data[1]["Num"]);
				}else{
					$jQ("#today_inbox0_inboxmsg").text("0");
				}
				miczLogger.log("Inbox messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	},
};
*/
miczThunderStatsTab.callback.stats_today_inbox0_datemsg = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Date","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_today_inbox0_folders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				//miczThunderStatsTab.ui.hideLoadingElement("today_inbox0_wait");
				if(!this.empty){
					//$jQ("#today_inbox0_datemsg").text(JSON.stringify(this.data));
					$jQ("#today_inbox0_datemsg_nomails").hide();
					miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('today_inbox0_datemsg',this.data,true);	//the last parameter is to activate aggregation
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_today_inbox0_datemsg handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('today_inbox0_datemsg',{},true);	//the last parameter is to activate aggregation
					$jQ("#today_inbox0_datemsg_nomails").show();
				}
				miczLogger.log("Date Inbox Mails data loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_yesterday_incremental_sent = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_incremental_sent_wait");
				if(!this.empty){
					$jQ("#yesterday_incremental_sent").text(this.data[1]["Num"]);
				}else{
					$jQ("#yesterday_incremental_sent").text("0");
				}
				miczLogger.log("Yesterday incremental sent messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_yesterday_incremental_rcvd = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_incremental_rcvd_wait");
				if(!this.empty){
					$jQ("#yesterday_incremental_rcvd").text(this.data[1]["Num"]);
				}else{
					$jQ("#yesterday_incremental_rcvd").text("0");
				}
				miczLogger.log("Yesterday incremental received messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_yesterday_inbox0_folder_spread = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Folder","FolderURI","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_today_inbox0_folders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_inbox0_wait");
				if(!this.empty){
					$jQ("#yesterday_inbox0_folder_spread_nomails").hide();
					miczThunderStatsTab.ui.drawInbox0FolderSpreadGraph('yesterday_inbox0_folder_spread',this.data);
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_yesterday_inbox0_folders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#yesterday_inbox0_folder_spread_nomails").show();
				}
				miczLogger.log("Today Inbox 0 data loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_yesterday_inbox0_inboxmsg = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_inbox0_inboxmsg_wait");
				if(!this.empty){
					$jQ("#yesterday_inbox0_inboxmsg").text(this.data[1]["Num"]);
				}else{
					$jQ("#yesterday_inbox0_inboxmsg").text("0");
				}
				miczLogger.log("Inbox messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_yesterday_inbox0_datemsg = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Date","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_today_inbox0_folders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				//miczThunderStatsTab.ui.hideLoadingElement("today_inbox0_wait");
				if(!this.empty){
					$jQ("#yesterday_inbox0_datemsg_nomails").hide();
					miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('yesterday_inbox0_datemsg',this.data,true);	//the last parameter is to activete aggregation
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_yesterday_inbox0_datemsg handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#yesterday_inbox0_datemsg_nomails").show();
				}
				miczLogger.log("Date Inbox Mails data loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.homepage_stats_today_hours = {
	empty:true,
	data:{},
	_graph_handle:{today_sent:0,today_rcvd:0,yesterday_sent:0,yesterday_rcvd:0},
	_graph_data:{today_sent:{},today_rcvd:{},yesterday_sent:{},yesterday_rcvd:{}},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num","Info","mHour"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("today_hours_graph_wait");
				if(!this.empty){
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_hours handleResult '+JSON.stringify(this.data)+'\r\n');
					let data_type=this.data[1]["Info"];
					this._graph_data[data_type]=this.data;
					this._graph_handle[data_type]=1;
				}else{
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_hours handleResult EMPTY '+JSON.stringify(this.data)+'\r\n');
					miczLogger.log("Today hours graph empty result!",2);
				}
				if(this._data_collected()){
					miczThunderStatsTab.ui.drawTimeGraph("today_hours_graph",this._graph_data,true);
				}
				miczLogger.log("Today hours graph loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},

	_data_collected:function(){
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_today_hours _data_collected '+JSON.stringify(this._graph_handle)+'\r\n');
		return (this._graph_handle.today_sent==1)&&(this._graph_handle.today_rcvd==1)&&(this._graph_handle.yesterday_sent==1)&&(this._graph_handle.yesterday_rcvd==1);
	},
};


miczThunderStatsTab.callback.homepage_stats_yesterday_hours = {
	empty:true,
	data:{},
	_graph_handle:{yesterday_sent:0,yesterday_rcvd:0},
	_graph_data:{yesterday_sent:{},yesterday_rcvd:{}},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num","Info","mHour"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("yesterday_hours_graph_wait");
				if(!this.empty){
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_hours handleResult '+JSON.stringify(this.data)+'\r\n');
					let data_type=this.data[1]["Info"];
					this._graph_data[data_type]=this.data;
					this._graph_handle[data_type]=1;
				}else{
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_hours handleResult EMPTY '+JSON.stringify(this.data)+'\r\n');
					miczLogger.log("Yesterday hours graph empty result!",2);
				}
				if(this._data_collected()){
					miczThunderStatsTab.ui.drawTimeGraph("yesterday_hours_graph",this._graph_data,false);
				}
				miczLogger.log("Yesterday hours graph loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},

	_data_collected:function(){
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_hours _data_collected '+JSON.stringify(this._graph_handle)+'\r\n');
		return (this._graph_handle.yesterday_sent==1)&&(this._graph_handle.yesterday_rcvd==1);
	},
};

miczThunderStatsTab.callback.stats_msg_aggregate_sent = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["maxNum","minNum","avgNum"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_msg_aggregate_sent handleResult '+JSON.stringify(this.data)+'\r\n');
				miczThunderStatsTab.ui.hideLoadingElement("aggregate_max_sent_wait");
				miczThunderStatsTab.ui.hideLoadingElement("aggregate_min_sent_wait");
				miczThunderStatsTab.ui.hideLoadingElement("aggregate_avg_sent_wait");
				miczThunderStatsTab.ui.hideLoadingElement("7days_aggregate_max_sent_wait");
				miczThunderStatsTab.ui.hideLoadingElement("7days_aggregate_min_sent_wait");
				miczThunderStatsTab.ui.hideLoadingElement("7days_aggregate_avg_sent_wait");
				if(!this.empty){
					let maxNum=this.data[1]["maxNum"]==null?0:this.data[1]["maxNum"];
					let minNum=this.data[1]["minNum"]==null?0:this.data[1]["minNum"];
					let avgNum=this.data[1]["avgNum"]==null?0:this.data[1]["avgNum"];
					if(!miczThunderStatsPrefs.getBoolPref_TS('aggregate_average_not_rounded')) avgNum=Math.round(avgNum);
					$jQ("#aggregate_max_sent").text(maxNum);
					$jQ("#aggregate_min_sent").text(minNum);
					$jQ("#aggregate_avg_sent").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
					$jQ("#7days_aggregate_max_sent").text(maxNum);
					$jQ("#7days_aggregate_min_sent").text(minNum);
					$jQ("#7days_aggregate_avg_sent").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
				}else{
					$jQ("#aggregate_max_sent").text("0");
					$jQ("#aggregate_min_sent").text("0");
					$jQ("#aggregate_avg_sent").text("0");
					$jQ("#7days_aggregate_max_sent").text("0");
					$jQ("#7days_aggregate_min_sent").text("0");
					$jQ("#7days_aggregate_avg_sent").text("0");
				}
				miczLogger.log("Aggreate period messages data loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_msg_aggregate_rcvd = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["maxNum","minNum","avgNum"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_msg_aggregate_rcvd handleResult '+JSON.stringify(this.data)+'\r\n');
				miczThunderStatsTab.ui.hideLoadingElement("aggregate_max_rcvd_wait");
				miczThunderStatsTab.ui.hideLoadingElement("aggregate_min_rcvd_wait");
				miczThunderStatsTab.ui.hideLoadingElement("aggregate_avg_rcvd_wait");
				miczThunderStatsTab.ui.hideLoadingElement("7days_aggregate_max_rcvd_wait");
				miczThunderStatsTab.ui.hideLoadingElement("7days_aggregate_min_rcvd_wait");
				miczThunderStatsTab.ui.hideLoadingElement("7days_aggregate_avg_rcvd_wait");
				if(!this.empty){
					let maxNum=this.data[1]["maxNum"]==null?0:this.data[1]["maxNum"];
					let minNum=this.data[1]["minNum"]==null?0:this.data[1]["minNum"];
					let avgNum=this.data[1]["avgNum"]==null?0:this.data[1]["avgNum"];
					if(!miczThunderStatsPrefs.getBoolPref_TS('aggregate_average_not_rounded')) avgNum=Math.round(avgNum);
					$jQ("#aggregate_max_rcvd").text(maxNum);
					$jQ("#aggregate_min_rcvd").text(minNum);
					$jQ("#aggregate_avg_rcvd").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
					$jQ("#7days_aggregate_max_rcvd").text(maxNum);
					$jQ("#7days_aggregate_min_rcvd").text(minNum);
					$jQ("#7days_aggregate_avg_rcvd").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
				}else{
					$jQ("#aggregate_max_rcvd").text("0");
					$jQ("#aggregate_min_rcvd").text("0");
					$jQ("#aggregate_avg_rcvd").text("0");
					$jQ("#7days_aggregate_max_rcvd").text("0");
					$jQ("#7days_aggregate_min_rcvd").text("0");
					$jQ("#7days_aggregate_avg_rcvd").text("0");
				}
				miczLogger.log("Aggreate period messages data loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};



miczThunderStatsTab.callback.stats_customqry_sent = {
	empty:true,
	data:{},
	data_customqry_sent:new Array(),
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
		// Services.console.logStringMessage("CallBack Completion sent: " );
		// Services.console.logStringMessage("number days: " + miczThunderStatsUtils._customqry_num_days);

		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				let dsISO = new Date(this.data[1]["Info"]).toISOString();
				let m = moment(dsISO);
				
				if(!this.empty){
					this.total_mail+=this.data[1]["Num"];
					this.data_customqry_sent.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:this.data[1]["Num"]});
					//$jQ("#customqry_sent").append(this.data[1]["Info"]+": "+this.data[1]["Num"]);
				}else{
					this.data_customqry_sent.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:0});
					//$jQ("#customqry_sent").append(this.data[1]["Info"]+": 0");
				}
				miczLogger.log("Custom query sent messages loaded day: "+this.data[1]["Info"]+".",0);
				//if we've collected our days, let's print it!
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_sent miczThunderStatsTab.data_customqry_sent.length '+miczThunderStatsTab.data_customqry_sent.length+'\r\n');
				if(this.data_customqry_sent.length==miczThunderStatsUtils._customqry_num_days){
					//$jQ("#customqry_sent").text(JSON.stringify(miczThunderStatsTab.data_customqry_sent));
					//ordering results array
					this.data_customqry_sent.sort(miczThunderStatsUtils.array_7days_compare);
					miczThunderStatsTab.ui.draw7DaysGraph('chart_customqry_sent',this.data_customqry_sent,miczThunderStatsUtils._customqry_num_days,false,miczThunderStatsUtils._customqry_num_days>miczThunderStatsUtils._customqry_num_days_small_labels);
					$jQ("#customqry_sent_total").text(this.total_mail);
					miczThunderStatsTab.ui.hideLoadingElement("customqry_sent_wait");
				  	miczLogger.log("Custom query sent messages chart rendered.",0);
					  if(miczThunderStatsUtils._customqry_only_bd){	//getting only business day
						
						miczThunderStatsTab.promises.customqry.setAnalyzer(1,this.data_customqry_sent);
						Services.console.logStringMessage("CallBack Completion sent: after analyzer" );
					}
				  	this.total_mail=0;
				  	this.data_customqry_sent=new Array();
				}
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_customqry_rcvd = {
	empty:true,
	data:{},
	data_customqry_rcvd:new Array(),
	total_mail:0,
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num","Info"],aResultSet);
		//miczLogger.log("RCVD "+JSON.stringify(result),1);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				let dsISO = new Date(this.data[1]["Info"]).toISOString();
				let m = moment(dsISO);
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_sent m: '+m.format()+'\r\n');
				if(!this.empty){
					this.total_mail+=this.data[1]["Num"];
					this.data_customqry_rcvd.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:this.data[1]["Num"]});
					//$jQ("#customqry_rcvd").append(this.data[1]["Info"]+": "+this.data[1]["Num"]);
				}else{
					this.data_customqry_rcvd.push({day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:0});
					//$jQ("#customqry_rcvd").append(this.data[1]["Info"]+": 0");
				}
				miczLogger.log("Custom query received messages loaded day: "+this.data[1]["Info"]+".",0);
				//if we've collected our 7 days, let's print it!
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_rcvd miczThunderStatsTab.data_customqry_rcvd.length '+this.data_customqry_rcvd.length+'\r\n');
				if(this.data_customqry_rcvd.length==miczThunderStatsUtils._customqry_num_days){
					//$jQ("#customqry_rcvd").text(JSON.stringify(miczThunderStatsTab.data_customqry_rcvd));
					//ordering results array
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_rcvd this.total_mail '+this.total_mail+'\r\n');
					this.data_customqry_rcvd.sort(miczThunderStatsUtils.array_7days_compare);
					miczThunderStatsTab.ui.draw7DaysGraph('chart_customqry_rcvd',this.data_customqry_rcvd,miczThunderStatsUtils._customqry_num_days,false,miczThunderStatsUtils._customqry_num_days>miczThunderStatsUtils._customqry_num_days_small_labels);
					$jQ("#customqry_rcvd_total").text(this.total_mail);
				  	miczThunderStatsTab.ui.hideLoadingElement("customqry_rcvd_wait");
				  	miczLogger.log("Custom query received messages chart rendered.",0);
				  	if(miczThunderStatsUtils._customqry_only_bd){	//getting only business day
						miczThunderStatsTab.promises.customqry.setAnalyzer(0,this.data_customqry_rcvd);
					}
				  	this.total_mail=0;
				  	this.data_customqry_rcvd=new Array();
				}
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				this.total_mail=0;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_customqry_recipients = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("customqry_recipients_wait");
				if(!this.empty){
					//miczLogger.log("Custom query recipients loaded: "+JSON.stringify(this.data),0);
					$jQ("#customqry_recipients").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_customqry_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					//miczLogger.log("Custom query recipients loaded empty!",0);
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#customqry_recipients").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsSent"));
				}
				miczLogger.log("Custom query recipients loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_customqry_senders = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("customqry_senders_wait");
				if(!this.empty){
					$jQ("#customqry_senders").html(miczThunderStatsTab.ui.formatInvolvedTable(this.data));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_customqry_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
					$jQ("#customqry_senders").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsReceived"));
				}
				miczLogger.log("Custom query senders loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_customqry_recipients_only_bd = {
	empty:true,
	data:new Array(),
	data_customqry_recipients:new Array(),
	data_customqry_recipients_count:0,
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_recipients_only_bd handleCompletion result: '+JSON.stringify(result),0);
    this.empty=false;
   for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_customqry_recipients handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_recipients_only_bd handleCompletion this.data: '+JSON.stringify(this.data),0);
				if(!this.empty){
					let tmp_array=new Array();
					for(let kk in this.data){
						tmp_array.push(this.data[kk]);
						dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_customqry_recipients_only_bd handleCompletion '+JSON.stringify(this.data[kk])+'\r\n');
						miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_recipients_only_bd handleCompletion this.data[kk]: '+JSON.stringify(this.data[kk]),0);
					}
					this.data_customqry_recipients_count++;
					this.data_customqry_recipients.push(tmp_array);
				}else{
					this.data_customqry_recipients_count++;
				}
				miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_recipients_only_bd handleCompletion check ready to go!',0);
				miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_recipients_only_bd handleCompletion this.data_customqry_recipients_count - miczThunderStatsUtils._customqry_num_days: '+this.data_customqry_recipients_count+' - '+miczThunderStatsUtils._customqry_num_days,0);
				if(this.data_customqry_recipients_count==miczThunderStatsUtils._customqry_num_days){
					miczThunderStatsTab.ui.hideLoadingElement("customqry_recipients_wait");
					//do data aggregation
					let final_data=miczThunderStatsUtils.aggregateCustomQueryInvolved(this.data_customqry_recipients);
					//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_recipients_only_bd handleCompletion final_data: '+JSON.stringify(final_data),0);
					if(final_data.length>0){
						$jQ("#customqry_recipients").html(miczThunderStatsTab.ui.formatInvolvedTable(final_data));
						//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_customqry_recipients_only_bd handleCompletion '+JSON.stringify(this.data)+'\r\n');
					}else{
						$jQ("#customqry_recipients").html('');
						let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
						$jQ("#customqry_recipients").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsSent"));
					}
					//miczLogger.log("Custom query recipients loaded.",0);
					//this.data_customqry_recipients=new Array();
					//this.data_customqry_recipients_count=0;
				}
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				this.data_customqry_recipients=new Array();
				this.data_customqry_recipients_count=0;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				this.data_customqry_recipients=new Array();
				this.data_customqry_recipients_count=0;
				return false;
		}
		return false;
	},
};

miczThunderStatsTab.callback.stats_customqry_senders_only_bd = {
	empty:true,
	data:new Array(),
	data_customqry_senders:new Array(),
	data_customqry_senders_count:0,
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["ID","Name","Mail","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_customqry_senders handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				if(!this.empty){
					let tmp_array=new Array();
					for(let kk in this.data){
						tmp_array.push(this.data[kk]);
						//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_customqry_senders_only_bd handleCompletion '+JSON.stringify(this.data[kk])+'\r\n');
					}
					this.data_customqry_senders_count++;
					this.data_customqry_senders.push(tmp_array);
				}else{
					this.data_customqry_senders_count++;
				}
				if(this.data_customqry_senders_count==miczThunderStatsUtils._customqry_num_days){
					miczThunderStatsTab.ui.hideLoadingElement("customqry_senders_wait");
					//do data aggregation
					let final_data=miczThunderStatsUtils.aggregateCustomQueryInvolved(this.data_customqry_senders);
					if(final_data.length>0){
						$jQ("#customqry_senders").html(miczThunderStatsTab.ui.formatInvolvedTable(final_data));
						//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_customqry_senders handleCompletion '+JSON.stringify(this.data)+'\r\n');
					}else{
						$jQ("#customqry_senders").html('');
						let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
						$jQ("#customqry_senders").text(_bundleCW.GetStringFromName("ThunderStats.NoMailsSent"));
					}
					miczLogger.log("Custom query senders loaded.",0);
					//this.data_customqry_senders=new Array();
					//this.data_customqry_senders_count=0;
				}
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				this.data_customqry_senders=new Array();
				this.data_customqry_senders_count=0;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				this.data_customqry_senders=new Array();
				this.data_customqry_senders_count=0;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_customqry_aggregate_sent = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["maxNum","minNum","avgNum"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_msg_aggregate_sent handleResult '+JSON.stringify(this.data)+'\r\n');
				miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_max_sent_wait");
				miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_min_sent_wait");
				miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_avg_sent_wait");
				if(!this.empty){
					let maxNum=this.data[1]["maxNum"]==null?0:this.data[1]["maxNum"];
					let minNum=this.data[1]["minNum"]==null?0:this.data[1]["minNum"];
					let avgNum=this.data[1]["avgNum"]==null?0:this.data[1]["avgNum"];
					if(!miczThunderStatsPrefs.getBoolPref_TS('aggregate_average_not_rounded')) avgNum=Math.round(avgNum);
					$jQ("#customqry_aggregate_max_sent").text(maxNum);
					$jQ("#customqry_aggregate_min_sent").text(minNum);
					$jQ("#customqry_aggregate_avg_sent").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
				}else{
					$jQ("#customqry_aggregate_max_sent").text("0");
					$jQ("#customqry_aggregate_min_sent").text("0");
					$jQ("#customqry_aggregate_avg_sent").text("0");
				}
				miczLogger.log("Custom query aggreate period messages data loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.stats_customqry_aggregate_rcvd = {
	empty:true,
	data:{},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["maxNum","minNum","avgNum"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_msg_aggregate_rcvd handleResult '+JSON.stringify(this.data)+'\r\n');
				miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_max_rcvd_wait");
				miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_min_rcvd_wait");
				miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_avg_rcvd_wait");
				if(!this.empty){
					let maxNum=this.data[1]["maxNum"]==null?0:this.data[1]["maxNum"];
					let minNum=this.data[1]["minNum"]==null?0:this.data[1]["minNum"];
					let avgNum=this.data[1]["avgNum"]==null?0:this.data[1]["avgNum"];
					if(!miczThunderStatsPrefs.getBoolPref_TS('aggregate_average_not_rounded')) avgNum=Math.round(avgNum);
					$jQ("#customqry_aggregate_max_rcvd").text(maxNum);
					$jQ("#customqry_aggregate_min_rcvd").text(minNum);
					$jQ("#customqry_aggregate_avg_rcvd").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
				}else{
					$jQ("#customqry_aggregate_max_rcvd").text("0");
					$jQ("#customqry_aggregate_min_rcvd").text("0");
					$jQ("#customqry_aggregate_avg_rcvd").text("0");
				}
				miczLogger.log("Custom query aggreate period messages data loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.customqry_stats_oneday_sent = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("customqry_oneday_sent_wait");
				if(!this.empty){
					$jQ("#customqry_oneday_sent").text(this.data[1]["Num"]);
				}else{
					$jQ("#customqry_oneday_sent").text("0");
				}
				miczLogger.log("Custom Qry one day sent messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.customqry_stats_oneday_rcvd = {
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
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("customqry_oneday_rcvd_wait");
				if(!this.empty){
					//dump(">>>>>>>>>>>>>> [miczThunderStatsTab customqry_one_day_rcvd] this.data "+JSON.stringify(this.data)+"\r\n");
					$jQ("#customqry_oneday_rcvd").text(this.data[1]["Num"]);
				}else{
					$jQ("#customqry_oneday_rcvd").text("0");
				}
				miczLogger.log("Custom qry one day received messages loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},
};

miczThunderStatsTab.callback.customqry_stats_oneday_hours = {
	empty:true,
	data:{},
	_graph_handle:{yesterday_sent:0,yesterday_rcvd:0},
	_graph_data:{yesterday_sent:{},yesterday_rcvd:{}},
	handleResult: function(aResultSet) {
		this.empty=false;
		let result = miczThunderStatsCore.db.getResultObject(["Num","Info","mHour"],aResultSet);
		for (let key in result) {
			this.data[key]=result[key];
		}
	},

	handleError: miczThunderStatsTab.callback.base.handleError,

    handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("customqry_oneday_hours_graph_wait");
				if(!this.empty){
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.customqry_stats_oneday_hours handleResult '+JSON.stringify(this.data)+'\r\n');
					let data_type=this.data[1]["Info"];
					this._graph_data[data_type]=this.data;
					this._graph_handle[data_type]=1;
				}else{
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.customqry_stats_oneday_hours handleResult EMPTY '+JSON.stringify(this.data)+'\r\n');
					miczLogger.log("One day hours graph empty result!",2);
				}
				if(this._data_collected()){
					miczThunderStatsTab.ui.drawTimeGraph("customqry_oneday_hours_graph",this._graph_data,false,true);
				}
				miczLogger.log("Custom Qry one day hours graph loaded.",0);
				this.data={};
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data={};
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data={};
				this.empty=true;
				return false;
		}
	return false;
	},

	_data_collected:function(){
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.customqry_stats_oneday_hours _data_collected '+JSON.stringify(this._graph_handle)+'\r\n');
		return (this._graph_handle.yesterday_sent==1)&&(this._graph_handle.yesterday_rcvd==1);
	},
};

miczThunderStatsTab.callback.customqry_stats_oneday_inbox0_folder_spread = {
	empty:true,
	data:new Array(),
  handleResult: function(aResultSet) {
    let result = miczThunderStatsCore.db.getResultObject(["Folder","FolderURI","Num"],aResultSet);
    this.empty=false;
    for (let key in result) {
		this.data.push(result[key]);
	}
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.customqry_stats_oneday_inbox0_folder_spread handleResult '+JSON.stringify(this.data)+'\r\n');
  },

  handleError: miczThunderStatsTab.callback.base.handleError,

  handleCompletion: function(aReason) {
		switch (aReason) {
			case Ci.mozIStorageStatementCallback.REASON_FINISHED:
				miczThunderStatsTab.ui.hideLoadingElement("customqry_oneday_inbox0_wait");
				if(!this.empty){
					//$jQ("#customqry_onedayinbox0_folder_spread").text(JSON.stringify(this.data));
					$jQ("#customqry_oneday_inbox0_folder_spread_nomails").hide();
					miczThunderStatsTab.ui.drawInbox0FolderSpreadGraph('customqry_oneday_inbox0_folder_spread',this.data);
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.customqry_stats_oneday_inbox0_folder_spread handleCompletion '+JSON.stringify(this.data)+'\r\n');
				}else{
					$jQ("#customqry_oneday_inbox0_folder_spread_nomails").show();
					miczThunderStatsTab.ui.drawInbox0FolderSpreadGraph('customqry_oneday_inbox0_folder_spread',{});
					$jQ("#customqry_oneday_inbox0_folder_spread_svg_graph").hide();
				}
				miczLogger.log("Custom Qry one day Inbox 0 data loaded.",0);
				this.data=new Array();
				this.empty=true;
				return true;
			case Ci.mozIStorageStatementCallback.REASON_CANCELED:
				miczLogger.log("Query canceled by the user!",1);
				this.data=new Array();
				this.empty=true;
				return false;
			case Ci.mozIStorageStatementCallback.REASON_ERROR:
				miczLogger.log("Query aborted!",2);
				this.data=new Array();
				this.empty=true;
				return false;
		}
	return false;
	},
};
