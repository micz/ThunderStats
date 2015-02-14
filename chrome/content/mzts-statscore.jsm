"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczThunderStatsCore"];

var miczThunderStatsCore = {
	
	db_version:'1.0',
	identities:new Array(),
	
	loadIdentities:function(){
			let acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
			let accounts = acctMgr.accounts;
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] accounts '+JSON.stringify(accounts)+'\r\n');
			for (let i = 0; i < accounts.length; i++) {
				let account = accounts.queryElementAt(i, Components.interfaces.nsIMsgAccount);
				if(account==null) continue;
				// Enumerate identities
				let identities=account.identities;
				for (let j = 0; j < identities.length; j++) {
					let identity = identities.queryElementAt(j, Components.interfaces.nsIMsgIdentity);
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] identity '+JSON.stringify(identity)+'\r\n');
					let identity_item={};
					identity_item["email"]=identity.email;
					identity_item["identityName"]=identity.identityName;
					identity_item["id"]=miczThunderStatsDB.queryGetIdentityID(identity.email);
					this.identities.push(identity_item);
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] identity_item '+JSON.stringify(identity_item)+'\r\n');
				}
			}
	},

};

miczThunderStatsCore.db = {
	
	getTodaySentMessages:function(mIdentity){
		let mFromDate=new Date();
		mFromDate.setHours(0,0,0,0);
		let mToDate=new Date();
		mToDate.setHours(24,0,0,0);
		return miczThunderStatsDB.querySentMessages(mFromDate.getTime(),mToDate.getTime(),mIdentity);
	},
	
	getTodayReceivedMessages:function(mIdentity){
		let mFromDate=new Date();
		mFromDate.setHours(0,0,0,0);
		let mToDate=new Date();
		mToDate.setHours(24,0,0,0);
		return queryReceivedMessages(mFromDate.getTime(),mToDate.getTime(),mIdentity);
	},
};
