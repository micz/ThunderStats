"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");

var miczThunderStatsDebugger = {

	_bundleCW:null,

	onLoad: function(){
		//Fixing window height
		this.fixWinHeight();

		this._bundleCW = miczThunderStatsI18n.createBundle("mzts-debugger");

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
		this.addLogLines('-==  ThunderStats Debugger Report  ==-');
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
		this.addLogLines('-==  ThunderStats Configuration    ==-');
		this.addLogLines('--------------------------------------');
		this.addLogLines(this.getThunderStatsConf());
		this.addLogLines('-====================================-');
		this.addLogLines(' ');
		this.addLogLines('--------------------------------------');
		this.addLogLines('-==     ThunderStats Debug Data    ==-');
		this.addLogLines('--------------------------------------');
		this.getThunderStatsData(0);
	},

	sendReport:function(){
		let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	    let sURL="mailto:" + miczThunderStatsUtils.mailto + "?subject=[ThunderStats] Debugger Report&body=" + encodeURI(" " + document.getElementById('mzts-debugger-log').value); // urlencode
		let MessageComposer=Components.classes["@mozilla.org/messengercompose;1"].getService(Components.interfaces.nsIMsgComposeService);
		let ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		let aURI = ioService.newURI(sURL, null, null);
		window.close();
		MessageComposer.OpenComposeWindowWithURI (null, aURI);
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

	getThunderStatsConf:function(){
		let output='';
		let pref_branch_count={};
		let pref_branch_array={};
		let pref_branch_key=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(miczThunderStatsPrefs.pref_base).getChildList("",pref_branch_count,pref_branch_array);
		output+="Count "+JSON.stringify(pref_branch_count)+"\r\n";
		for (let ii in pref_branch_key){
			output+=pref_branch_key[ii]+": ";
			try{
				try{
					output+=miczThunderStatsPrefs.getCharPref_TS(pref_branch_key[ii]);
				}finally{
					try{
						output+=miczThunderStatsPrefs.getIntPref_TS(pref_branch_key[ii]);
					}finally{
						try{
							output+=miczThunderStatsPrefs.getBoolPref_TS(pref_branch_key[ii]);
						}finally{
							//output+="error";
						}
					}
				}
			}catch(e){ }
			output+="\r\n";
		}
		return output.trim();
	},

	getThunderStatsData:function(step){
		let mToDay = new Date();
		let mFromDay = new Date();
		let mDays = 0;

		switch(step){
			case 0:	//get last indexed message
				miczThunderStatsDB.init();
				miczThunderStatsDB.queryGetLastMessageDate(miczThunderStatsDebugger.callback.last_idx_msg);
			break;
			case 1:	//get last index update
				miczThunderStatsDB.getLastIndexUpdate();
			break;
			case 2:	//get total accounts and identities
				miczThunderStatsCore.loadIdentities();
				miczThunderStatsDebugger.addLogLines('Total accounts: '+Object.keys(miczThunderStatsCore.accounts).length);
				miczThunderStatsDebugger.addLogLines('Total identities: '+Object.keys(miczThunderStatsCore.identities).length);
				miczThunderStatsDebugger.getThunderStatsData(3);
			break;
			case 3: //get total messages from gloda
				miczThunderStatsDB.getTotalMessages(miczThunderStatsDebugger.callback.tot_msg);
			break;
			case 4:	//get total messageAttributes
				miczThunderStatsDB.getTotalMessageAttributes(miczThunderStatsDebugger.callback.tot_msg_att);
			break;
			case 5: //get today sent messages
				miczThunderStatsCore.db.getTodayMessages(1,0,miczThunderStatsDebugger.callback.stats_today_sent);
			break;
			case 6: //get today rcvd messages
				miczThunderStatsCore.db.getTodayMessages(0,0,miczThunderStatsDebugger.callback.stats_today_rcvd);
			break;
			case 7: //get yesterday sent messages
				miczThunderStatsCore.db.getYesterdayMessages(1,0,miczThunderStatsDebugger.callback.stats_yesterday_sent);
			break;
			case 8: //get yesterday rcvd messages
				miczThunderStatsCore.db.getYesterdayMessages(0,0,miczThunderStatsDebugger.callback.stats_yesterday_rcvd);
			break;
			case 9: //get last 7 days sent (no business days, to force per folder stats)
				let mInfoSent={type:1,info:1};
				//let mInfoReceived={type:0,info:1};
				mToDay = new Date();
				mFromDay = new Date();
				mFromDay.setDate(mFromDay.getDate() - 7);
				mDays = miczThunderStatsUtils.getDaysFromRange(mFromDay,mToDay,1);
				miczThunderStatsUtils._customqry_num_days=mDays.length;
				miczThunderStatsCore.db.getManyDaysMessages(mInfoSent,mFromDay,mToDay,0,miczThunderStatsDebugger.callback.stats_customqry_sent);
			break;
			case 10: //get last 7 days sent (no business days, to force per folder stats)
				let mInfoReceived={type:0,info:1};
				//let mInfoReceived={type:0,info:1};
				mToDay = new Date();
				mFromDay = new Date();
				mFromDay.setDate(mFromDay.getDate() - 7);
				mDays = miczThunderStatsUtils.getDaysFromRange(mFromDay,mToDay,1);
				miczThunderStatsUtils._customqry_num_days=mDays.length;
				miczThunderStatsCore.db.getManyDaysMessages(mInfoReceived,mFromDay,mToDay,0,miczThunderStatsDebugger.callback.stats_customqry_rcvd);
			break;
			case 11:
				miczThunderStatsDebugger.getThunderStatsData(99);
			break;

			default:	//last step
				miczThunderStatsDB.close();
				miczThunderStatsDebugger.addLogLines('-====================================-');
				miczThunderStatsDebugger.addLogLines('-==           Completed!           ==-');
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
		document.getElementById('mzts_status_label').value=miczThunderStatsI18n.getBundleString(this._bundleCW,"ThunderStats.Debugger.Started");
	},

	completed:function(){
		document.getElementById('mzts_status_label').value=miczThunderStatsI18n.getBundleString(this._bundleCW,"ThunderStats.Debugger.Completed");
		document.getElementById('SendReportBtn').disabled=false;
	},

};
