"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
//Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");	// To be enabled in vesion 2.0
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

var $jQ = jQuery.noConflict();

var miczThunderStatsTab = {

	currentTab:"#tab_today",
	_global_update:false,
	_many_days:7,

	onLoad: function(){

			miczLogger.setLogger(true,miczThunderStatsPrefs.isDebug);

			miczLogger.log("ThunderStats starting...",0);

			miczThunderStatsTab._global_update=miczThunderStatsPrefs.getBoolPref_TS('global_update');
			miczThunderStatsTab._many_days=miczThunderStatsPrefs.manyDays;

			//sanitizing value
			if(miczThunderStatsTab._many_days==0) miczThunderStatsTab._many_days=7;

			$jQ("span._many_days").text(miczThunderStatsTab._many_days);

			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] window.name '+JSON.stringify(window.name)+'\r\n');

			miczThunderStatsCore.db.init(window);

			//Initialize observers
			miczThunderStatsTab.observer.last_idx_update(miczThunderStatsTab.observer.callback.last_idx_update);

			//check if global indexing is active. Without global indexing we have no data to use!
			if(!miczThunderStatsUtils.checkGlobalIndexing()){
				miczThunderStatsTab.ui.showGlobalIndexingWarning(false);
				miczLogger.log("Thunderbird Global Indexing is not active!",2);
			}

			miczLogger.log("CurrentGlobalLocale: "+miczThunderStatsUtils.getCurrentSystemLocale());
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] CurrentGlobalLocale: "+miczThunderStatsUtils.getCurrentSystemLocale()+"\r\n");

			//Setting the correct locale to display dates and times
			moment.locale(miczThunderStatsUtils.getCurrentSystemLocale());

			miczThunderStatsDB.init();
			//miczThunderStatsStorageDB.init();	// To be enabled in vesion 2.0
			miczLogger.log("Opening databases...",0);

			miczLogger.log("Loading accounts...",0);
			miczThunderStatsCore.loadIdentities();
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities '+JSON.stringify(miczThunderStatsCore.identities)+'\r\n');

			miczLogger.log("Accounts found: "+Object.keys(miczThunderStatsCore.accounts).length,0);
			miczLogger.log("Identities found: "+Object.keys(miczThunderStatsCore.identities).length,0);

			miczThunderStatsTab.ui.loadIdentitiesSelector('identities_selector',miczThunderStatsCore.custom_account_key);

			miczLogger.log("Identities loaded.",0);
			miczLogger.log("ThunderStats ready.",0);

			let current_id=miczThunderStatsTab.getCurrentIdentityId();

			miczThunderStatsTab.getTodayStats(current_id);
			if(miczThunderStatsTab._global_update){
				miczThunderStatsTab.getYesterdayStats(current_id);
				miczThunderStatsTab.getLast7DaysStats(current_id);
			}
			miczThunderStatsTab.getLastIndexedMessage();

			miczThunderStatsDB.close();
			//miczThunderStatsStorageDB.close();	 // To be enabled in vesion 2.0

		},

	getTodayStats:function(identity_id){
		miczLogger.log("Getting today statistics...",0);

		//Show loading indicators
		miczThunderStatsTab.ui.showLoadingElement("today_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("today_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("today_recipients_wait");
		miczThunderStatsTab.ui.showLoadingElement("today_senders_wait");
		miczThunderStatsTab.ui.showLoadingElement("yesterday_incremental_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("yesterday_incremental_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("today_inbox0_inboxmsg_wait");
		miczThunderStatsTab.ui.showLoadingElement("today_inbox0_inboxmsg_unread_wait");
		miczThunderStatsTab.ui.showLoadingElement("aggregate_max_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("aggregate_min_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("aggregate_avg_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("aggregate_max_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("aggregate_min_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("aggregate_avg_rcvd_wait");
		if(miczThunderStatsTab._global_update){
			miczThunderStatsTab.ui.showLoadingElement("yesterday_inbox0_inboxmsg_wait");
			miczThunderStatsTab.ui.showLoadingElement("yesterday_inbox0_inboxmsg_unread_wait");
		}

		//Print dates
		$jQ("#today_date").text(miczThunderStatsUtils.getTodayString(moment));

		//Today
		//Get today sent messages
		miczThunderStatsCore.db.getTodayMessages(1,identity_id,miczThunderStatsTab.callback.homepage_stats_today_sent);
		//Yesterday incremental
		miczThunderStatsCore.db.getYesterdayIncrementalMessages(1,identity_id,miczThunderStatsTab.callback.stats_yesterday_incremental_sent);

		//Get today received messages
		miczThunderStatsCore.db.getTodayMessages(0,identity_id,miczThunderStatsTab.callback.homepage_stats_today_rcvd);
		//Yesterday incremental
		miczThunderStatsCore.db.getYesterdayIncrementalMessages(0,identity_id,miczThunderStatsTab.callback.stats_yesterday_incremental_rcvd);

		//Get today first 10 recipients
		miczThunderStatsCore.db.getTodayInvolved(1,identity_id,miczThunderStatsTab.callback.homepage_stats_today_recipients);

		//Get today first 10 senders
		miczThunderStatsCore.db.getTodayInvolved(0,identity_id,miczThunderStatsTab.callback.homepage_stats_today_senders);

		//Get today hours graph
		miczThunderStatsCore.db.getTodayHours(identity_id,miczThunderStatsTab.callback.homepage_stats_today_hours);

		//Inbox 0 Today
		//Get today mails folder spreading
		miczThunderStatsCore.db.getTodayMessagesFolders(0,identity_id,miczThunderStatsTab.callback.stats_today_inbox0_folder_spread);
		//Get inbox num mails
		miczThunderStatsCore.db.getInboxMessagesTotal(identity_id,miczThunderStatsTab.folderworker.today_inboxmsg);
		//Get inbox mails date spreading -- disabled we are going to iterate inbox messages only once and get all the info we need
		//miczThunderStatsCore.db.getInboxMessagesDate(identity_id,miczThunderStatsTab.callback.stats_today_inbox0_datemsg);

		//Get aggregate period messages info
		miczThunderStatsTab.getAggregateData(identity_id);
	},

	getAggregateData:function(identity_id){
		//Get aggregate period messages info
		let mToDay_aggregate = new Date();
		mToDay_aggregate.setDate(mToDay_aggregate.getDate() - 1); //do not consider today
		let mFromDay_aggregate = new Date();
		mFromDay_aggregate.setDate(mFromDay_aggregate.getDate() - miczThunderStatsTab._many_days); //_many_days days back from yesterday
		miczThunderStatsCore.db.getAggregatePeriodMessages(1,mFromDay_aggregate,mToDay_aggregate,identity_id,miczThunderStatsTab.callback.stats_msg_aggregate_sent);
		miczThunderStatsCore.db.getAggregatePeriodMessages(0,mFromDay_aggregate,mToDay_aggregate,identity_id,miczThunderStatsTab.callback.stats_msg_aggregate_rcvd);
	},

	getYesterdayStats:function(identity_id){
		miczLogger.log("Getting yesterday statistics...",0);

		//Show loading indicators
		miczThunderStatsTab.ui.showLoadingElement("yesterday_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("yesterday_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("yesterday_recipients_wait");
		miczThunderStatsTab.ui.showLoadingElement("yesterday_senders_wait");
		if(!miczThunderStatsTab._global_update){
			miczThunderStatsTab.ui.showLoadingElement("yesterday_inbox0_inboxmsg_wait");
			miczThunderStatsTab.ui.showLoadingElement("yesterday_inbox0_inboxmsg_unread_wait");
		}

		//Print dates
		$jQ("#yesterday_date").text(miczThunderStatsUtils.getYesterdayString(moment));

		//Yesterday
		//Get yesterday sent messages
		miczThunderStatsCore.db.getYesterdayMessages(1,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_sent);

		//Get yesterday received messages
		miczThunderStatsCore.db.getYesterdayMessages(0,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_rcvd);

		//Get yesterday hours graph
		miczThunderStatsCore.db.getYesterdayHours(identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_hours);

		//Get yesterday first 10 recipients
		miczThunderStatsCore.db.getYesterdayInvolved(1,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_recipients);

		//Get yesterday first 10 senders
		miczThunderStatsCore.db.getYesterdayInvolved(0,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_senders);

		//Inbox 0 Yesterday
		//Get yesterday mails folder spreading
		miczThunderStatsCore.db.getYesterdayMessagesFolders(0,identity_id,miczThunderStatsTab.callback.stats_yesterday_inbox0_folder_spread);
		if(!miczThunderStatsTab._global_update){	//if global_update is true, we are counting the inbox mails only once
			//Get inbox num mails
			miczThunderStatsCore.db.getInboxMessagesTotal(identity_id,miczThunderStatsTab.folderworker.yesterday_inboxmsg);
			//Get inbox mails date spreading -- disabled we are going to iterate inbox messages only once and get all the info we need
			//miczThunderStatsCore.db.getInboxMessagesDate(identity_id,miczThunderStatsTab.callback.stats_yesterday_inbox0_datemsg);
		}
	},

	getLast7DaysStats:function(identity_id){
		miczLogger.log("Getting last "+miczThunderStatsTab._many_days+" days statistics...",0);

		//Show loading indicators
		miczThunderStatsTab.ui.showLoadingElement("7days_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_recipients_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_senders_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_aggregate_max_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_aggregate_min_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_aggregate_avg_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_aggregate_max_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_aggregate_min_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_aggregate_avg_rcvd_wait");

		this.data_7days_sent=new Array();
		this.data_7days_rcvd=new Array();

		let mToDay = new Date();
		let mFromDay = new Date();
		mFromDay.setDate(mFromDay.getDate() - miczThunderStatsTab._many_days);

		//Get sent messages
		miczThunderStatsCore.db.getManyDaysMessages(1,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_7days_sent);

		//Get received messages
		miczThunderStatsCore.db.getManyDaysMessages(0,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_7days_rcvd);

		//Get first 10 recipients
		miczThunderStatsCore.db.getManyDaysInvolved(1,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_7days_recipients);

		//Get first 10 senders
		miczThunderStatsCore.db.getManyDaysInvolved(0,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_7days_senders);

		if(!miczThunderStatsTab._global_update){	//udpate aggregate data if global update not enabled
			miczThunderStatsTab.getAggregateData(identity_id);
		}
	},

	getCustomQryStats:function(identity_id){
		miczLogger.log("Getting custom query statistics...",0);

		//Show loading indicators
		miczThunderStatsTab.ui.showLoadingElement("customqry_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("customqry_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("customqry_recipients_wait");
		miczThunderStatsTab.ui.showLoadingElement("customqry_senders_wait");
		miczThunderStatsTab.ui.hideLoadingElement("customqry_totaldays_text");

		this.data_customqry_sent=new Array();
		this.data_customqry_rcvd=new Array();

		let mFromDay = document.getElementById('datepicker_from').dateValue;
		let mToDay = document.getElementById('datepicker_to').dateValue;
		miczThunderStatsUtils._customqry_num_days=Math.round((mToDay-mFromDay)/86400000);

		$jQ("#customqry_totaldays_num").text(miczThunderStatsUtils._customqry_num_days);
		$jQ("#customqry_account").text(document.getElementById('identities_selector').options[document.getElementById('identities_selector').selectedIndex].innerHTML);
		miczThunderStatsTab.ui.showLoadingElement("customqry_totaldays_text");

		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] _customqry_num_days: "+miczThunderStatsUtils._customqry_num_days+"\r\n");

		//Get sent messages
		miczThunderStatsCore.db.getManyDaysMessages(1,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_customqry_sent);

		//Get received messages
		miczThunderStatsCore.db.getManyDaysMessages(0,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_customqry_rcvd);

		//Get first 10 recipients
		miczThunderStatsCore.db.getManyDaysInvolved(1,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_customqry_recipients);

		//Get first 10 senders
		miczThunderStatsCore.db.getManyDaysInvolved(0,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_customqry_senders);
	},

	getCurrentIdentityId:function(){	//returning an identities object or a 0 if none selected
										//identities object is {ids_merged: array of all ids; ids:array of normal identities ids; ids_custom: array of custom identities ids; base_account_key: identity account key}}
		let id_selector_value = $jQ("#identities_selector").val();
		let output=new Array();
		let output_obj={};
		if(id_selector_value==0){
			return 0;
		}
		if(id_selector_value.indexOf(miczThunderStatsCore._account_selector_prefix)>=0){	//the user selected an account!
			let curr_account=miczThunderStatsCore.accounts[id_selector_value.replace(miczThunderStatsCore._account_selector_prefix,'')];
			output=curr_account.identities;
			output_obj.base_account_key=curr_account.key;
		}else{	//the user selected an identity
			output.push(id_selector_value);
			output_obj.base_account_key=miczThunderStatsCore.identities[id_selector_value].account_key;
		}
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] getCurrentIdentityId '+JSON.stringify(output)+'\r\n');
		output_obj.ids_merged=output;
		output_obj.ids=new Array();
		output_obj.ids_custom=new Array();
		for (let ii in output){
			if(miczThunderStatsCore.getIdentityCustomStatus(output[ii])){ //is custom
				output_obj.ids_custom.push(output[ii]);
			}else{	//is normal
				output_obj.ids.push(output[ii]);
			}
		}
		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] output_obj: "+JSON.stringify(output_obj)+"\r\n");
		return output_obj;
	},

	updateStats: function(){
		miczThunderStatsTab._global_update=miczThunderStatsPrefs.getBoolPref_TS('global_update');
		miczThunderStatsTab._many_days=miczThunderStatsPrefs.manyDays;
		$jQ("span._many_days").text(miczThunderStatsTab._many_days);
		if(miczThunderStatsTab._global_update){
			miczThunderStatsDB.init();
			let current_id=miczThunderStatsTab.getCurrentIdentityId();
			miczThunderStatsTab.getTodayStats(current_id);
			miczThunderStatsTab.getYesterdayStats(current_id);
			miczThunderStatsTab.getLast7DaysStats(current_id);
			miczThunderStatsTab.getLastIndexedMessage();
			miczThunderStatsDB.close();
		}else{
			miczThunderStatsTab.ui.updateTab(miczThunderStatsTab.currentTab);
		}
	},

	updateCustomQry: function(){
		miczThunderStatsDB.init();
		miczThunderStatsTab.getCustomQryStats(miczThunderStatsTab.getCurrentIdentityId());
		miczThunderStatsDB.close();
	},

	getLastIndexedMessage: function(){
		miczThunderStatsDB.queryGetLastMessageDate(miczThunderStatsTab.callback.last_idx_msg);
		miczThunderStatsDB.getLastIndexUpdate();
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
