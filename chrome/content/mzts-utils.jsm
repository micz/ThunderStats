"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsUtils"];

Components.utils.import("resource:///modules/iteratorUtils.jsm");

var miczThunderStatsUtils = {

	escapeHTML: function(s){
		return s.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
	},

	getDateString:function(mDate){	//mDate is a moment(Date) object
		return mDate.format('L');	//four digit year
	},

	getDateStringYY:function(mDate,mWeekDay){	//mDate is a moment(Date) object, mWeekDay is a boolean
		let strDate=mDate.format('L').replace(mDate.format('YYYY'),mDate.format('YY'));
		if(mWeekDay){	//antepone the weekday
			strDate=mDate.format('dddd')+"|"+strDate;
		}
		return strDate;	//two digit year
	},

	getDateTimeString:function(mDate){	//mDate is a moment(Date) object
		return mDate.format('L')+" "+mDate.format('LTS');
	},

	getTimeString:function(mDate){	//mDate is a moment(Date) object
		return mDate.format('LTS');
	},

	getCurrentTimeString:function(moment){
		return this.getTimeString(moment());
	},

	getTodayString:function(moment){
		return this.getDateString(moment());
	},

	getYesterdayString:function(moment){
		return this.getDateString(moment().subtract(1,'d'));
	},

	getDaysFromRange: function(mFromDate,mToDate){
		let dOutput=new Array();
		// Calculate days between dates
		let millisecondsPerDay = 86400 * 1000;	// Day in milliseconds
		mFromDate.setHours(0,0,0,0);			// Start just after midnight
		mToDate.setHours(23,59,59,59);			// End just before midnight
		let diffDate = mToDate - mFromDate;		// Milliseconds between datetime objects
		let diffDays = Math.ceil(diffDate / millisecondsPerDay);
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] mFromDate '+mFromDate.toLocaleString()+'\r\n');
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] mToDate '+mToDate.toLocaleString()+'\r\n');
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] diffDays '+diffDays+'\r\n');

		for(let ii = 0; ii < diffDays; ii++){
			let dTmp = new Date(mFromDate);
			dTmp.setDate(mFromDate.getDate()+ii);
			//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp '+JSON.stringify(dTmp)+'\r\n');
			//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp.getDate() '+JSON.stringify(dTmp.getDate())+'\r\n');
			dOutput.push(dTmp);
		}
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp '+JSON.stringify(dOutput)+'\r\n');
		return dOutput;		//returns a Date() array
	},

	array_7days_compare:function(a,b){
		if(a.day < b.day){
			return -1;
		}
		if(a.day > b.day){
			return 1;
		}
		return 0;
	},

	array_inbox0_date_compare:function(a,b){
		if(a.Date < b.Date){
			return -1;
		}
		if(a.Date > b.Date){
			return 1;
		}
		return 0;
	},

	arrayMerge:function(dest,src){
	  for(let n = 0; n < src.length; ++n){
		dest.push(src[n]);
	  }
	  return dest;
	},

	 getCurrentSystemLocale:function(){
		return Components.classes["@mozilla.org/intl/nslocaleservice;1"]
          .getService(Components.interfaces.nsILocaleService)
		  .getSystemLocale()
		  .getCategory('NSILOCALE_TIME');
	},

	checkGlobalIndexing:function(){
		//mailnews.database.global.indexer.enabled
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("mailnews.database.global.indexer.");
		return prefs.getBoolPref("enabled");
	},

	getAccountsOrder:function(){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("mail.accountmanager.");
		let default_account=prefs.getCharPref("defaultaccount");
		dump('>>>>>>>>>>>>>> [miczThunderStatsTab getAccountsOrder] default_account '+JSON.stringify(default_account)+'\r\n');
		let accounts_order_array=prefs.getCharPref("accounts").split(",");
		dump('>>>>>>>>>>>>>> [miczThunderStatsTab getAccountsOrder] accounts_order_array '+JSON.stringify(accounts_order_array)+'\r\n');
		let def_acc_idx=accounts_order_array.indexOf(default_account);
		if (def_acc_idx > -1) {
			accounts_order_array.splice(def_acc_idx, 1);
		}
		accounts_order_array.unshift(default_account);
		return accounts_order_array;
	},

	getInboxFoldersObjects:function(mFolder){ //first input is a root account folder - then the function is recursive
		let arr_inbox=new Array();
		let isInbox = mFolder.flags & Components.interfaces.nsMsgFolderFlags.Inbox;
		if (isInbox){
			arr_inbox.push(mFolder);
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab getInboxMessages] mFolder.URI '+JSON.stringify(mFolder.URI)+'\r\n');
		}
		if (mFolder.hasSubFolders){
			for each (let folder in fixIterator(mFolder.subFolders, Components.interfaces.nsIMsgFolder)){
				let tmp_inbox=miczThunderStatsUtils.getInboxFoldersObjects(folder);
				if(tmp_inbox.length > 0){
					arr_inbox=miczThunderStatsUtils.arrayMerge(arr_inbox,tmp_inbox);
				}
			}
		}
		return arr_inbox; //returns and array of inbox nsIMsgFolder
	},

	openLink:function(link){
		// first construct an nsIURI object using the ioservice
		let ioservice = Components.classes["@mozilla.org/network/io-service;1"]
								  .getService(Components.interfaces.nsIIOService);
		let uriToOpen = ioservice.newURI(link, null, null);
		let extps = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
							  .getService(Components.interfaces.nsIExternalProtocolService);
		// now, open it!
		extps.loadURI(uriToOpen, null);
	},

	getHostSystem:function(){
		if (null==this.mHost) {
				let osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
				this.mHost = osString.toLowerCase();
		}
		return this.mHost; // linux - winnt - darwin
	},

	getFolderTotalMessages:function(mFolder){
		 return mFolder.getTotalMessages(false);	//do not consider mails in subfolder
	},

	getIdentitiesArray:function(mIdentity,identities){
		let mIdentityAddresses=new Array();
		if(mIdentity==0){
			for (let key in identities){
				mIdentityAddresses.push(identities[key]["email"]);
			}
		}else{
			for (let key in mIdentity){
				mIdentityAddresses.push(identities[mIdentity[key]]["email"]);
			}
		}
		return mIdentityAddresses;
	},

};
