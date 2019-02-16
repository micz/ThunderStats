"use strict";
ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
//ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");	 // To be enabled in vesion 2.0
ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-folderquery.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
ChromeUtils.import("resource://thunderstats/miczLogger.jsm");

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczThunderStatsCore"];

var miczThunderStatsCore = {

	accounts:{},
	identities:{},
	identities_email_name:{},
	_account_selector_prefix:'_account:',
	custom_account_key:'cstm_accnt',

	loadIdentities:function(){
			this.identities={};
			let acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
			let accounts = acctMgr.accounts;
			let cid_prog=0;	//custom identities id prog
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] accounts '+JSON.stringify(accounts)+'\r\n');
			for (let i = 0; i < accounts.length; i++) {
				let account = accounts.queryElementAt(i, Components.interfaces.nsIMsgAccount);
				if(account==null) continue;
				if((account.incomingServer.type!='pop3')&&(account.incomingServer.type!='imap')) continue;
				this.accounts[account.key]={};
				this.accounts[account.key].name=account.incomingServer.rootFolder.prettyName;
				this.accounts[account.key].key=account.key;
				this.accounts[account.key].identities=new Array();
				//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] account.incomingServer '+JSON.stringify(account.incomingServer.type)+'\r\n');
				//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] account.incomingServer.rootFolder.prettiestName '+JSON.stringify(account.incomingServer.rootFolder.prettiestName)+'\r\n');
				//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab] account.incomingServer.rootFolder.prettyName '+JSON.stringify(account.incomingServer.rootFolder.prettyName)+'\r\n');
				// Enumerate identities
				let identities=account.identities;
				for (let j = 0; j < identities.length; j++) {
					let identity = identities.queryElementAt(j, Components.interfaces.nsIMsgIdentity);
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] identity '+JSON.stringify(identity)+'\r\n');
					if(!identity.email)continue;
					let identity_item={};
					identity_item["email"]=identity.email;
					identity_item["fullName"]=identity.fullName;
					identity_item["id"]=miczThunderStatsDB.queryGetIdentityID(identity.email);
					identity_item["key"]=identity.key;
					identity_item["custom"]=false;
					identity_item["account_key"]=account.key;
					//identity_item["account_name"]=account.incomingServer.rootFolder.prettyName;
					this.identities[miczThunderStatsDB.queryGetIdentityID(identity.email)]=identity_item;
					this.accounts[account.key].identities.push(miczThunderStatsDB.queryGetIdentityID(identity.email));
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] identity_item '+JSON.stringify(identity_item)+'\r\n');
					this.identities_email_name[identity.email]=identity.fullName;
				}
				//enumerate custom identities for this account
				let account_custom_identities=miczThunderStatsPrefs.accountCustomIdentities(account.key);
				if(account_custom_identities!=''){
					let account_custom_identities_arr=account_custom_identities.split(',');
					for (let j = 0; j < account_custom_identities_arr.length; j++) {
						let identity = account_custom_identities_arr[j];
						//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] identity '+JSON.stringify(identity)+'\r\n');
						let identity_item={};
						identity_item["email"]=identity;
						identity_item["fullName"]="CustomID"+cid_prog;
						identity_item["id"]=miczThunderStatsDB.queryGetIdentityID(identity);
						identity_item["key"]="__custom"+cid_prog;
						identity_item["custom"]=true;
						identity_item["account_key"]=account.key;
						if(identity_item["id"]){
							cid_prog++;
							this.identities[miczThunderStatsDB.queryGetIdentityID(identity)]=identity_item;
							miczThunderStatsDB.identities_custom_ids.push(miczThunderStatsDB.queryGetIdentityID(identity));
							miczThunderStatsDB.identities_custom_ids_mail.push(identity);
							this.accounts[account.key].identities.push(miczThunderStatsDB.queryGetIdentityID(identity));
							//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] identity_item '+JSON.stringify(identity_item)+'\r\n');
						}
					}
				}
			}
			//If there are custom identities for the custom account, add it and its identities
			let account_custom_identities=miczThunderStatsPrefs.accountCustomIdentities(this.custom_account_key);
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] account_custom_identities '+JSON.stringify(account_custom_identities)+'\r\n');
			if(account_custom_identities!=''){
				let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statscore");
				this.accounts[this.custom_account_key]={};
				this.accounts[this.custom_account_key].name=_bundleCW.GetStringFromName("ThunderStats.OtherIdentities");
				this.accounts[this.custom_account_key].key=this.custom_account_key;
				this.accounts[this.custom_account_key].identities=new Array();
				let account_custom_identities_arr=account_custom_identities.split(',');
				for (let j = 0; j < account_custom_identities_arr.length; j++) {
					let identity = account_custom_identities_arr[j];
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] identity '+JSON.stringify(identity)+'\r\n');
					let identity_item={};
					identity_item["email"]=identity;
					identity_item["fullName"]="CustomID"+cid_prog;
					identity_item["id"]=miczThunderStatsDB.queryGetIdentityID(identity);
					identity_item["key"]="__custom"+cid_prog;
					identity_item["custom"]=true;
					identity_item["account_key"]=this.custom_account_key;
					if(identity_item["id"]){
						cid_prog++;
						this.identities[miczThunderStatsDB.queryGetIdentityID(identity)]=identity_item;
						miczThunderStatsDB.identities_custom_ids.push(miczThunderStatsDB.queryGetIdentityID(identity));
						miczThunderStatsDB.identities_custom_ids_mail.push(identity);
						this.accounts[this.custom_account_key].identities.push(miczThunderStatsDB.queryGetIdentityID(identity));
						//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] identity_item '+JSON.stringify(identity_item)+'\r\n');
					}
				}
			}

			this.sortAccounts();
	},

	sortAccounts:function(){
		let accounts_order=miczThunderStatsUtils.getAccountsOrder(this.custom_account_key);
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab sortAccounts] accounts_order '+JSON.stringify(accounts_order)+'\r\n');
		let tmp_accounts={};
		for(let key in accounts_order){
			if(accounts_order[key] in this.accounts){
				tmp_accounts[accounts_order[key]]=this.accounts[accounts_order[key]];
			}
		}
		this.accounts=tmp_accounts;
	},

	getIdentityCustomStatus:function(identity_id){
		return this.identities[identity_id]["custom"];
	},

};

miczThunderStatsCore.db = {

	win:null,

	init:function(mWindow){
		this.win=mWindow;
	},

	getOneDayMessages:function(mType,mGivenDay,mIdentity,mCallback){	//mGivenDay is a Date object
		let mFromDate=new Date(mGivenDay);
		mFromDate.setHours(0,0,0,0);
		let mToDate=new Date(mGivenDay);
		mToDate.setHours(24,0,0,0);
		//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab getOneDayMessages] mToDate '+JSON.stringify(mToDate)+'\r\n');
		//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab getOneDayMessages] mFromDate '+JSON.stringify(mFromDate)+'\r\n');
		return miczThunderStatsDB.queryMessages(mType,mFromDate.getTime(),mToDate.getTime(),mIdentity,mCallback);
	},

	getManyDaysMessages:function(mType,mFromDay,mToDay,mIdentity,mCallback){	//mFromDay and mToDay are a Date objects
		let mInfo=null;
		if(typeof mType === 'object'){
			mInfo = mType.info;
			mType = mType.type;
		}
		let mOnlyBD=(mInfo!=null);	//if mInfo is set we want only business days
		let mDays = miczThunderStatsUtils.getDaysFromRange(mFromDay,mToDay,mOnlyBD);
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab getManyDaysMessages] mDays.length '+JSON.stringify(mDays.length)+'\r\n');
		miczThunderStatsUtils._customqry_num_days=mDays.length;		//update the total number of days, we may have used only the business days
		for(let mKey in mDays){
			this.getOneDayMessages({type:mType,info:mDays[mKey],hours:null},mDays[mKey],mIdentity,mCallback);
		}
		return true;
	},

	getTodayMessages:function(mType,mIdentity,mCallback){
		return this.getOneDayMessages(mType,new Date(),mIdentity,mCallback);
	},

	getTodayMessagesHours:function(mType,mIdentity,mCallback){
		return this.getOneDayMessages({type:mType,info:null,hours:1},new Date(),mIdentity,mCallback);
	},

	getTodayHours:function(mIdentity,mCallback){
		let ydate = miczThunderStatsUtils.getYesterdayDate();
		this.getOneDayMessages({type:1,info:'today_sent',hours:1},new Date(),mIdentity,mCallback,'today_sent');	//today sent
		this.getOneDayMessages({type:0,info:'today_rcvd',hours:1},new Date(),mIdentity,mCallback,'today_rcvd');	//today rcvd
		this.getOneDayMessages({type:1,info:'yesterday_sent',hours:1},ydate,mIdentity,mCallback,'yesterday_sent');	//yesterday sent
		this.getOneDayMessages({type:0,info:'yesterday_rcvd',hours:1},ydate,mIdentity,mCallback,'yesterday_rcvd');	//yestarday rcvd
		return true;
	},

	getYesterdayHours:function(mIdentity,mCallback){
		let ydate = miczThunderStatsUtils.getYesterdayDate();
		this.getOneDayMessages({type:1,info:'yesterday_sent',hours:1},ydate,mIdentity,mCallback,'yesterday_sent');	//yesterday sent
		this.getOneDayMessages({type:0,info:'yesterday_rcvd',hours:1},ydate,mIdentity,mCallback,'yesterday_rcvd');	//yestarday rcvd
		return true;
	},

	getOneDayHours:function(mDay,mIdentity,mCallback){
		this.getOneDayMessages({type:1,info:'yesterday_sent',hours:1},mDay,mIdentity,mCallback,'yesterday_sent');	//one day sent
		this.getOneDayMessages({type:0,info:'yesterday_rcvd',hours:1},mDay,mIdentity,mCallback,'yesterday_rcvd');	//one day rcvd
		return true;
	},

	getYesterdayMessages:function(mType,mIdentity,mCallback){
		return this.getOneDayMessages(mType,miczThunderStatsUtils.getYesterdayDate(),mIdentity,mCallback);
	},

	getYesterdayIncrementalMessages:function(mType,mIdentity,mCallback){	//get the messages received yesterday until the actual hour
		let ydate = miczThunderStatsUtils.getYesterdayDate();
		let mFromDate=new Date(ydate);
		mFromDate.setHours(0,0,0,0);
		return miczThunderStatsDB.queryMessages(mType,mFromDate.getTime(),ydate.getTime(),mIdentity,mCallback);
	},

	getOneDayInvolved:function(mType,mGivenDay,mIdentity,mMax,mCallback){	//mGivenDay is a Date object
		let mFromDate=new Date(mGivenDay);
		mFromDate.setHours(0,0,0,0);
		let mToDate=new Date(mGivenDay);
		mToDate.setHours(24,0,0,0);
		return miczThunderStatsDB.queryGetNumInvolved(mType,mFromDate.getTime(),mToDate.getTime(),mIdentity,mMax,mCallback);
	},

	getTodayInvolved:function(mType,mIdentity,mCallback){
		let mMax=miczThunderStatsPrefs.involvedNum;
		return this.getOneDayInvolved(mType,new Date(),mIdentity,mMax,mCallback);
	},

	getYesterdayInvolved:function(mType,mIdentity,mCallback){
		let mMax=miczThunderStatsPrefs.involvedNum;
		return this.getOneDayInvolved(mType,miczThunderStatsUtils.getYesterdayDate(),mIdentity,mMax,mCallback);
	},

	getManyDaysInvolved:function(mType,mFromDate,mToDate,mIdentity,mCallback){
		let mFromDateInternal=new Date(mFromDate);
		let mToDateInternal=new Date(mToDate);
		mFromDateInternal.setHours(0,0,0,0);
		mToDateInternal.setHours(24,0,0,0);
		let mMax=miczThunderStatsPrefs.involvedNum;
		return miczThunderStatsDB.queryGetNumInvolved(mType,mFromDateInternal.getTime(),mToDateInternal.getTime(),mIdentity,mMax,mCallback);
	},

	getManyDaysInvolved_OnlyBD:function(mType,mFromDay,mToDay,mIdentity,mCallback){	//mFromDay and mToDay are a Date objects
		let mOnlyBD=true;
		let mDays = miczThunderStatsUtils.getDaysFromRange(mFromDay,mToDay,mOnlyBD);
		for(let mKey in mDays){
			this.getOneDayInvolved(mType,mDays[mKey],mIdentity,0,mCallback);
		}
		return true;
	},

	getOneDayMessagesFolders:function(mType,mGivenDay,mIdentity,mCallback){
		let mFromDate=new Date(mGivenDay);
		mFromDate.setHours(0,0,0,0);
		let mToDate=new Date(mGivenDay);
		mToDate.setHours(24,0,0,0);
		return miczThunderStatsDB.queryMessagesFolders(mType,mFromDate.getTime(),mToDate.getTime(),mIdentity,mCallback);
	},

	getTodayMessagesFolders:function(mType,mIdentity,mCallback){
		return this.getOneDayMessagesFolders(mType,new Date(),mIdentity,mCallback);
	},

	getYesterdayMessagesFolders:function(mType,mIdentity,mCallback){
		return this.getOneDayMessagesFolders(mType,miczThunderStatsUtils.getYesterdayDate(),mIdentity,mCallback);
	},

	getInboxMessagesTotal:function(mIdentity,mCallback){
		let mIdentityAddresses=miczThunderStatsUtils.getIdentitiesArray(mIdentity,miczThunderStatsCore.identities);
		let mCurrentAccountKey=mIdentity.base_account_key;
		//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab getInboxMessagesTotal] mCurrentAccountKey '+JSON.stringify(mCurrentAccountKey)+'\r\n');
		//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab getInboxMessagesTotal] miczThunderStatsCore.custom_account_key '+JSON.stringify(miczThunderStatsCore.custom_account_key)+'\r\n');
		let mSplitted=(mIdentity!=0)&&(mCurrentAccountKey!=miczThunderStatsCore.custom_account_key)&&miczThunderStatsPrefs.getBoolPref_TS('inbox_search_only_curr_account');
		//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab getInboxMessagesTotal] mIdentity: " +JSON.stringify(mIdentity)+"\r\n");
		//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab getInboxMessagesTotal] mIdentityAddress: " +JSON.stringify(mIdentityAddresses)+"\r\n");
		miczThunderStatsFolderQ.unregisterAnalyzer(mCallback);
		miczThunderStatsFolderQ.init(miczThunderStatsDB.queryGetInboxFolders(mSplitted),mIdentityAddresses,this.win,mSplitted,mCurrentAccountKey);
		miczThunderStatsFolderQ.registerAnalyzer(mCallback);
		miczThunderStatsFolderQ.run();
		//miczThunderStatsFolderQ.unregisterAnalyzer(mCallback);
	},

	getAggregatePeriodMessages:function(mType,mFromDate,mToDate,mIdentity,mCallback){
		mFromDate.setHours(0,0,0,0);
		mToDate.setHours(23,59,59,59);
		return miczThunderStatsDB.queryMessages({type:mType,info:'aggregate',hours:null},mFromDate.getTime(),mToDate.getTime(),mIdentity,mCallback);
	},

	/*getInboxMessagesDate:function(mIdentity,mCallback){
		//miczThunderStatsDB.queryInboxMessagesDate(mIdentity,mCallback);
	},*/

	getResultObject:function(aFields,aResultSet){
		let oOutput={};
		let r_idx=1;
		for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
			oOutput[r_idx]={};
			for (let colidx in aFields){
				//miczLogger.log("Test CALLBACK: col "+colidx+" "+JSON.stringify(row.getResultByIndex(colidx)));
				oOutput[r_idx][aFields[colidx]]=row.getResultByName(aFields[colidx]);
			}
			r_idx++;
		}
		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] getResultObject: " +JSON.stringify(oOutput)+"\r\n");
		return oOutput;
	},
};
