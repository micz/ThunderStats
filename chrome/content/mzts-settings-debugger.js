"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");

var miczThunderStatsDebugger = {

	onLoad: function(){
		//Fixing window height
		this.fixWinHeight();

		this.run();
	},

	fixWinHeight:function(){
		sizeToContent();
		var vbox = document.getElementById('ts_vbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

	run:function(){
		this.clearLog();
		this.addLogLines('-====================================-');
		this.addLogLines('-==  ThunderStats Debugger Output  ==-');
		this.addLogLines('-====================================-');
		let today = new Date();
		this.addLogLines('['+today+']');
		this.addLogLines(' ');
		this.addLogLines('-==          System Info           ==-');
		this.addLogLines(this.getSystemInfo());
		this.addLogLines('-====================================-');
		this.addLogLines(' ');
		this.addLogLines('-==   Thunderbird Configuration    ==-');
		this.addLogLines(this.getTBConf());
		this.addLogLines('-====================================-');
		this.addLogLines(' ');
		this.addLogLines('-====================================-');
		this.addLogLines('-====================================-');
	},

	getSystemInfo:function(){
		let output='';
		output+="Operative System: "+miczThunderStatsUtils.HostSystem+"\r\n";
		output+="System Locale: "+miczThunderStatsUtils.getCurrentSystemLocale()+"\r\n";
		output+="Thunderbird Version: "+miczThunderStatsUtils.TBVersion+"\r\n";
		output+="ThunderStats Version: "+miczThunderStatsUtils.TSVersion+"\r\n";
		return output;
	},

	getTBConf:function(){
		let output='';
		output+="Global Indexing: "+(miczThunderStatsUtils.checkGlobalIndexing?'enabled':'disabled')+"\r\n";
		return output;
	},

	addLogLines:function(text){
		let debug_log = document.getElementById('mzts-debugger-log');
		debug_log.value+=text+"\r\n";
	},

	clearLog:function(){
		let debug_log = document.getElementById('mzts-debugger-log');
		debug_log.value="";
	},

};

