"use strict";
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczThunderStatsCore"];

var miczThunderStatsCore = {

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

	getOneDayMessages:function(mType,mGivenDay,mIdentity,mCallback){
		let mFromDate=new Date(mGivenDay);
		mFromDate.setHours(0,0,0,0);
		let mToDate=new Date(mGivenDay);
		mToDate.setHours(24,0,0,0);
		return miczThunderStatsDB.queryMessages(mType,mFromDate.getTime(),mToDate.getTime(),mIdentity,mCallback);
	},

	getTodayMessages:function(mType,mIdentity,mCallback){
		return this.getOneDayMessages(mType,new Date(),mIdentity,mCallback);
	},

	getYesterdayMessages:function(mType,mIdentity,mCallback){
		let ydate = new Date();
		ydate.setDate(ydate.getDate() - 1);
		return this.getOneDayMessages(mType,ydate,mIdentity,mCallback);
	},
	
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
		dump(">>>>>>>>>>>>>> [miczThunderStatsTab] getResultObject: " +JSON.stringify(oOutput)+"\r\n");
		return oOutput;
	},
};
