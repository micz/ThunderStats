"use strict";
ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statscore.jsm");
ChromeUtils.import("resource://thunderstats/miczLogger.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");

var miczThunderStatsDebugger = {

	_bundleCW:null,
	_source:'',

	onLoad: function(){
		//Fixing window height
		this.fixWinHeight();

		this._bundleCW = miczThunderStatsI18n.createBundle("mzts-debugger");

		moment.locale(miczThunderStatsUtils.getCurrentSystemLocale());
		miczThunderStatsDebugger.observer.last_idx_update(miczThunderStatsDebugger.observer.callback.last_idx_update);

		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];
			this._source=args.source;
		}

		this.run();
	},

	onClose: function(){
		miczThunderStatsDebugger.observer.last_idx_update_remove(miczThunderStatsDebugger.observer.callback.last_idx_update);
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
		if(document.getElementById('mzts-debugger-user-msg').value==''){
			document.getElementById('mzts-debugger-user-msg').style.border='2 px solid red';
			document.getElementById('mzts_user_msg_label').style.color='red';
			document.getElementById('mzts_user_msg_label').style.fontWeight='bold';
			return;
		}
		let message_body=" ";
		message_body+="\r\n";
		message_body+='-====================================-';
		message_body+="\r\n";
		message_body+='-== ThunderStats Debugger User Message ==-';
		message_body+="\r\n";
		message_body+='-====================================-';
		message_body+="\r\n";
		message_body+=document.getElementById('mzts-debugger-user-msg').value;
		message_body+="\r\n";
		message_body+='-====================================-';
		message_body+="\r\n\r\n";
		message_body+=document.getElementById('mzts-debugger-log').value;
		let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	    let sURL="mailto:" + miczThunderStatsUtils.mailto + "?subject=[ThunderStats] Debugger Report v"+miczThunderStatsUtils.ThunderStatsVersion+"&body=" + encodeURI(message_body); // urlencode
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
		//TODO: check if globalinbox is active. Search for an option like this: user_pref("mail.server.server1.deferred_to_account", "account2");
		return output.trim();
	},

	getThunderStatsConf:function(){
		let output='';
		let pref_branch_count={};
		let pref_branch_array={};
		let pref_branch_key=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(miczThunderStatsPrefs.pref_base).getChildList("",pref_branch_count,pref_branch_array);
		output+="Count "+JSON.stringify(pref_branch_count)+"\r\n";
		let prefs_item_array=[];
		for (let ii in pref_branch_key){
			let item_output=pref_branch_key[ii]+": ";
			try{
				try{
					item_output+=miczThunderStatsPrefs.getCharPref_TS(pref_branch_key[ii]);
				}finally{
					try{
						item_output+=miczThunderStatsPrefs.getIntPref_TS(pref_branch_key[ii]);
					}finally{
						try{
							item_output+=miczThunderStatsPrefs.getBoolPref_TS(pref_branch_key[ii]);
						}finally{
							//output+="error";
						}
					}
				}
			}catch(e){ }
			item_output+="\r\n";
			prefs_item_array.push(item_output);
		}
		prefs_item_array.sort();
		output+=prefs_item_array.join('');
		return output.trim();
	},

	getThunderStatsData:function(step){
		switch(step){
			case 0:	//get last indexed message
				miczThunderStatsDebugger.addLogLines('Debugger _source: '+this._source);
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
				let mInfoSent_9={type:1,info:1};
				//let mInfoReceived={type:0,info:1};
				let mToDay_9 = new Date();
				let mFromDay_9 = new Date();
				mFromDay_9.setDate(mFromDay_9.getDate() - 7);
				let mDays_9 = miczThunderStatsUtils.getDaysFromRange(mFromDay_9,mToDay_9,1);
				miczThunderStatsUtils._customqry_num_days=mDays_9.length;
				miczThunderStatsCore.db.getManyDaysMessages(mInfoSent_9,mFromDay_9,mToDay_9,0,miczThunderStatsDebugger.callback.stats_customqry_sent);
			break;
			case 10: //get last 7 days sent (no business days, to force per folder stats)
				let mInfoReceived_10={type:0,info:1};
				let mToDay_10 = new Date();
				let mFromDay_10 = new Date();
				mFromDay_10.setDate(mFromDay_10.getDate() - 7);
				let mDays_10 = miczThunderStatsUtils.getDaysFromRange(mFromDay_10,mToDay_10,1);
				miczThunderStatsUtils._customqry_num_days=mDays_10.length;
				miczThunderStatsCore.db.getManyDaysMessages(mInfoReceived_10,mFromDay_10,mToDay_10,0,miczThunderStatsDebugger.callback.stats_customqry_rcvd);
			break;
			case 11:
				miczThunderStatsDebugger.addLogLines('msgAttributes: '+JSON.stringify(miczThunderStatsDB.msgAttributes));
				miczThunderStatsDebugger.addLogLines('identities_custom_ids: '+JSON.stringify(miczThunderStatsDB.identities_custom_ids));
				miczThunderStatsDebugger.addLogLines('identities_custom_ids_mail: '+JSON.stringify(miczThunderStatsDB.identities_custom_ids_mail));
				miczThunderStatsDebugger.addLogLines('Forbidden Folders: '+JSON.stringify(miczThunderStatsDB.queryDebuggerGetForbiddenFoldersInfo()));
				miczThunderStatsDebugger.getThunderStatsData(12);
			break;
			case 12:
				let mFromDate_12=new Date();
				mFromDate_12.setDate(mFromDate_12.getDate() - 2);	//two days back
				mFromDate_12.setHours(0,0,0,0);
				let mToDate_12=new Date();
				mToDate_12.setHours(24,0,0,0);
				miczThunderStatsDebugger.addLogLines('queryDebuggerTimeRangeMessages QRY: '+miczThunderStatsDB.queryDebuggerTimeRangeMessages(mFromDate_12.getTime(),mToDate_12.getTime(),miczThunderStatsDebugger.callback.debugger_time_range));
			break;
			case 13:
				/*let fromMe_attribute=this.msgAttributes['fromMe'];
				let toMe_attribute=this.msgAttributes['toMe'];*/
				let mType_attribute_13=miczThunderStatsDB.msgAttributes['fromMe'];
				let involves_attribute_13=miczThunderStatsDB.msgAttributes['involves'];
				let identitiesStr_13="("+miczThunderStatsDB.identities_custom_ids.join()+")";
				miczThunderStatsDebugger.addLogLines('queryDebuggerMessageAttributes QRY SENT: '+miczThunderStatsDB.queryDebuggerMessageAttributes(mType_attribute_13,involves_attribute_13,identitiesStr_13,miczThunderStatsDebugger.callback.debugger_attributes_sent));
			break;
			case 14:
				/*let fromMe_attribute=this.msgAttributes['fromMe'];
				let toMe_attribute=this.msgAttributes['toMe'];*/
				let mType_attribute_14=miczThunderStatsDB.msgAttributes['toMe'];
				let involves_attribute_14=miczThunderStatsDB.msgAttributes['involves'];
				let identitiesStr_14="("+miczThunderStatsDB.identities_custom_ids.join()+")";
				miczThunderStatsDebugger.addLogLines('queryDebuggerMessageAttributes QRY RCVD: '+miczThunderStatsDB.queryDebuggerMessageAttributes(mType_attribute_14,involves_attribute_14,identitiesStr_14,miczThunderStatsDebugger.callback.debugger_attributes_rcvd));
			break;
			case 15:
				miczThunderStatsDB.queryDebuggerUsedMessageAttributes(miczThunderStatsDebugger.callback.debugger_used_attributes);
			break
			case 16:
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
		let end_pos=debug_log.value.length;
		debug_log.setSelectionRange(end_pos,end_pos);
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
