"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");

var miczThunderStatsDebugger = {

	onLoad: function(){
		//Fixing window height
		this.fixWinHeight();

		moment.locale(miczThunderStatsUtils.getCurrentSystemLocale());
		miczThunderStatsDebugger.observer.last_idx_update(miczThunderStatsDebugger.observer.callback.last_idx_update);

		this.run();
	},

	fixWinHeight:function(){
		sizeToContent();
		var vbox = document.getElementById('ts_vbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

	run:function(){
		miczThunderStatsDebugger.started();
		this.clearLog();
		this.addLogLines('-====================================-');
		this.addLogLines('-==  ThunderStats Debugger Output  ==-');
		this.addLogLines('-====================================-');
		let today = new Date();
		this.addLogLines('['+today+']');
		this.addLogLines(' ');
		this.addLogLines('--------------------------------------');
		this.addLogLines('-==          System Info           ==-');
		this.addLogLines('--------------------------------------');
		this.addLogLines(this.getSystemInfo());
		this.addLogLines('-====================================-');
		this.addLogLines(' ');
		this.addLogLines('--------------------------------------');
		this.addLogLines('-==   Thunderbird Configuration    ==-');
		this.addLogLines('--------------------------------------');
		this.addLogLines(this.getThunderbirdConf());
		this.addLogLines('-====================================-');
		this.addLogLines(' ');
		this.addLogLines('--------------------------------------');
		this.addLogLines('-==     ThunderStats Debug Data    ==-');
		this.addLogLines('--------------------------------------');
		this.getThunderStatsData(0);
	},

	getSystemInfo:function(){
		let output='';
		output+="Operative System: "+miczThunderStatsUtils.HostSystem+"\r\n";
		output+="System Locale: "+miczThunderStatsUtils.getCurrentSystemLocale()+"\r\n";
		output+="Thunderbird Version: "+miczThunderStatsUtils.TBVersion+"\r\n";
		output+="ThunderStats Version: "+miczThunderStatsUtils.TSVersion+"\r\n";
		return output.trim();
	},

	getThunderbirdConf:function(){
		let output='';
		output+="Global Indexing: "+(miczThunderStatsUtils.checkGlobalIndexing?'enabled':'disabled')+"\r\n";
		return output.trim();
	},

	getThunderStatsData:function(step){
		switch(step){
			case 0:	//get last indexed message
				miczThunderStatsDB.init();
				miczThunderStatsDB.queryGetLastMessageDate(miczThunderStatsDebugger.callback.last_idx_msg);
			break;
			case 1:	//get last index update
				miczThunderStatsDB.getLastIndexUpdate();
			break;
			case 2:
				miczThunderStatsDebugger.getThunderStatsData(10);
			break;
			case 10:	//last step
				miczThunderStatsDB.close();
				miczThunderStatsDebugger.addLogLines('-====================================-');
				miczThunderStatsDebugger.addLogLines(' ');
				miczThunderStatsDebugger.addLogLines('-====================================-');
				miczThunderStatsDebugger.addLogLines('-====================================-');
				miczThunderStatsDebugger.completed();
			break;
		}
	},

	addLogLines:function(text){
		let debug_log = document.getElementById('mzts-debugger-log');
		debug_log.value+=text+"\r\n";
	},

	clearLog:function(){
		let debug_log = document.getElementById('mzts-debugger-log');
		debug_log.value="";
	},

	started:function(){
		document.getElementById('mzts_status_label').value="Started...";
	},

	completed:function(){
		document.getElementById('mzts_status_label').value="Completed!";
	},

};