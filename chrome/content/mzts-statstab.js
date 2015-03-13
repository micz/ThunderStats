"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
//Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");	// To be enabled in vesion 2.0
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

var $jQ = jQuery.noConflict();

var miczThunderStatsTab = {

	currentTab:"#tab_today",

	onLoad: function(){
			miczLogger.setLogger(document.getElementById('log_wrapper'),document,false);
			miczLogger.log("ThunderStats starting...",0);

			$jQ("#log_close_btn")
			  .mouseover(miczThunderStatsTab.ui.logCloseBtnShow)
			  .mouseout(miczThunderStatsTab.ui.logCloseBtnHide);

			//check if global indexing is active. Without global indexing we have no data to use!
			if(!miczThunderStatsUtils.checkGlobalIndexing()){
				$jQ('#mzts-main-error').show();
				$jQ('#mzts-idnt_sel').hide();
				$jQ('#mzts-last_msg').hide();
				miczLogger.log("Thunderbird Global Indexing is not active!",2);
			}

			//Setting the correct locale to display dates and times
			moment.locale(miczThunderStatsUtils.getCurrentSystemLocale());

			miczThunderStatsDB.init();
			//miczThunderStatsStorageDB.init();	// To be enabled in vesion 2.0
			miczLogger.log("Opening databases...",0);

			miczLogger.log("Loading identities...",0);
			miczThunderStatsCore.loadIdentities();
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities '+JSON.stringify(miczThunderStatsCore.identities)+'\r\n');

			miczLogger.log("Identities found: "+miczThunderStatsCore.identities.length,0);

			miczThunderStatsTab.ui.loadIdentitiesSelector('identities_selector');

			miczLogger.log("Identities loaded.",0);
			miczLogger.log("ThunderStats ready.",0);

			miczThunderStatsTab.getTodayStats(miczThunderStatsTab.getCurrentIdentityId());
			miczThunderStatsTab.getLastIndexedMessage();

			miczThunderStatsCore.db.getInboxMessages(miczThunderStatsTab.getCurrentIdentityId());

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

		//Inbox 0 Today
		//Get today mails folder spreading
		miczThunderStatsCore.db.getTodayMessagesFolders(0,identity_id,miczThunderStatsTab.callback.stats_today_inbox0_folders);

		//Get inbox mails date spreading
		//TODO
	},

	getYesterdayStats:function(identity_id){
		miczLogger.log("Getting yesterday statistics...",0);

		//Show loading indicators
		miczThunderStatsTab.ui.showLoadingElement("yesterday_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("yesterday_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("yesterday_recipients_wait");
		miczThunderStatsTab.ui.showLoadingElement("yesterday_senders_wait");

		//Print dates
		$jQ("#yesterday_date").text(miczThunderStatsUtils.getYesterdayString(moment));

		//Yesterday
		//Get yesterday sent messages
		miczThunderStatsCore.db.getYesterdayMessages(1,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_sent);

		//Get yesterday received messages
		miczThunderStatsCore.db.getYesterdayMessages(0,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_rcvd);

		//Get yesterday first 10 recipients
		miczThunderStatsCore.db.getYesterdayInvolved(1,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_recipients);

		//Get yesterday first 10 senders
		miczThunderStatsCore.db.getYesterdayInvolved(0,identity_id,miczThunderStatsTab.callback.homepage_stats_yesterday_senders);
	},

	getLast7DaysStats:function(identity_id){
		miczLogger.log("Getting last 7 days statistics...",0);

		//Show loading indicators
		miczThunderStatsTab.ui.showLoadingElement("7days_sent_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_rcvd_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_recipients_wait");
		miczThunderStatsTab.ui.showLoadingElement("7days_senders_wait");

		this.data_7days_sent=new Array();
		this.data_7days_rcvd=new Array();

		let mToDay = new Date();
		let mFromDay = new Date();
		mFromDay.setDate(mFromDay.getDate() - 6);

		//Get sent messages
		miczThunderStatsCore.db.getManyDaysMessages(1,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_7days_sent);

		//Get received messages
		miczThunderStatsCore.db.getManyDaysMessages(0,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_7days_rcvd);

		//Get first 10 recipients
		miczThunderStatsCore.db.getManyDaysInvolved(1,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_7days_recipients);

		//Get first 10 senders
		miczThunderStatsCore.db.getManyDaysInvolved(0,mFromDay,mToDay,identity_id,miczThunderStatsTab.callback.stats_7days_senders);
	},

	getCurrentIdentityId:function(){
		let id_selector = document.getElementById("identities_selector");
		return id_selector.options[id_selector.selectedIndex].value;
	},

	updateStats: function(){
		miczThunderStatsTab.ui.updateTab(miczThunderStatsTab.currentTab);
	},

	getLastIndexedMessage: function(){
		miczThunderStatsDB.queryGetLastMessageDate(miczThunderStatsTab.callback.last_idx_msg);
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
