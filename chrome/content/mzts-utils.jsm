"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsUtils"];

ChromeUtils.import("resource:///modules/iteratorUtils.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-nobusinessday.jsm");
//ChromeUtils.import("resource://thunderstats/miczLogger.jsm");

var miczThunderStatsUtils = {

	ThunderStatsVersion:'1.5alpha',
	mailto:'m@micz.it',
	mHost:null,
	_y_is_last_business_day:false,
	_y_ui_strings_update_needed:true,
	_customqry_num_days:0,
	_customqry_num_days_small_labels:15,
	_customqry_analyzer_data:{},
	_customqry_only_bd:false,
	_customqry_days_range:null,

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
	
	getDate7DaysString:function(jDate){  //jDate is a javascript Date() object - returns YYYY-MM-DD
	   let yyyy = jDate.getFullYear();
	   let mm = jDate.getMonth() < 9 ? "0" + (jDate.getMonth() + 1) : (jDate.getMonth() + 1); // getMonth() is zero-based
	   let dd  = jDate.getDate() < 10 ? "0" + jDate.getDate() : jDate.getDate();
	   return "".concat(yyyy).concat(mm).concat(dd);
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
		return this.getDateString(moment(miczThunderStatsUtils.getYesterdayDate()));
	},

	getDaysFromRange: function(mFromDate,mToDate,mOnlyBD){
		if(!mOnlyBD) mOnlyBD=false;
		//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] begin',0);
		if(mOnlyBD&&miczThunderStatsUtils._customqry_days_range!=null){	//do not get bd days range many time for one data extract
			return miczThunderStatsUtils._customqry_days_range;
		}
		let dOutput=new Array();
		// Calculate days between dates
		let millisecondsPerDay = 86400000;	// Day in milliseconds
		let mFromDateInternal=new Date(mFromDate);
		let mToDateInternal=new Date(mToDate);
		mFromDateInternal.setHours(0,0,0,0);			// Start just after midnight
		mToDateInternal.setHours(23,59,59,59);			// End just before midnight
		//DST fix
		/*if((!miczThunderStatsUtils.isDST(mFromDateInternal))&&(miczThunderStatsUtils.isDST(mToDateInternal))){	//Not needed we're doing ceil() to found the number of days
			//dump(">>>>>>>>>>>>>> [getDaysFromRange] mFromDateInternal isDST fix.\r\n");
			mFromDateInternal.setHours(mFromDateInternal.getHours()-1);
		}*/
		if((miczThunderStatsUtils.isDST(mFromDateInternal))&&(!miczThunderStatsUtils.isDST(mToDateInternal))){
			//dump(">>>>>>>>>>>>>> [getDaysFromRange] mToDateInternal isDST fix.\r\n");
			mToDateInternal.setHours(mToDateInternal.getHours()-1);
		}
		let diffDate = mToDateInternal - mFromDateInternal;		// Milliseconds between datetime objects
		let diffDays = Math.ceil(diffDate / millisecondsPerDay);
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] mFromDate '+mFromDate.toLocaleString()+'\r\n');
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] mToDate '+mToDate.toLocaleString()+'\r\n');
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] diffDays '+diffDays+'\r\n');

		for(let ii = 0; ii < diffDays; ii++){
			let dTmp = new Date(mFromDateInternal);
			dTmp.setDate(mFromDateInternal.getDate()+ii);
			//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp '+JSON.stringify(dTmp)+'\r\n');
			//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp.getDate() '+JSON.stringify(dTmp.getDate())+'\r\n');
			if(mOnlyBD){	//we want only business days
				if(miczThunderStatsUtils.isBusinessDay(dTmp)){	//add this day only if it's a business day
					dOutput.push(dTmp);
					//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp ADDED '+JSON.stringify(dTmp)+"weekday: "+dTmp.getUTCDay()+'\r\n');
				}else{
					//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp NOT ADDED '+JSON.stringify(dTmp)+"weekday: "+dTmp.getUTCDay()+'\r\n');
				}
			}else{	//we want all days
				dOutput.push(dTmp);
			}
		}
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp '+JSON.stringify(dOutput)+'\r\n');
		//miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsUtils getDaysFromRange] dTmp '+JSON.stringify(dOutput),0);
		if(mOnlyBD){
			miczThunderStatsUtils._customqry_days_range=dOutput;
		}
		return dOutput;		//returns a Date() array
	},

	getJulianDate: function(mDate) {
    	return Math.floor((mDate.getTime() / 86400000) - (mDate.getTimezoneOffset()/1440) + 2440587.5);
	},

	isDST: function(t) { //t is the date object to check, returns true if daylight saving time is in effect.
		let jan = new Date(t.getFullYear(),0,1);
		let jul = new Date(t.getFullYear(),6,1);
		return Math.min(jan.getTimezoneOffset(),jul.getTimezoneOffset()) == t.getTimezoneOffset();
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

	array_nbd_date_compare:function(a,b){
		if(a.date < b.date){
			return 1;
		}
		if(a.date > b.date){
			return -1;
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
		let th_locale = null;
		if(!miczThunderStatsUtils.checkTBVersion_pre57()){
			th_locale = Components.classes["@mozilla.org/intl/localeservice;1"]
							.getService(Components.interfaces.mozILocaleService)
							.getAppLocaleAsLangTag();
		}else{
			th_locale = Components.classes["@mozilla.org/intl/nslocaleservice;1"]
			           		.getService(Components.interfaces.nsILocaleService)
			 		  		.getSystemLocale()
			 		  		.getCategory('NSILOCALE_TIME');
		}

		  th_locale=th_locale.toLowerCase();

		  if((th_locale=='en-ie')||(th_locale=='en-uk')){
			th_locale='en-gb';
		  }

		return th_locale;
	},

	checkGlobalIndexing:function(){
		//mailnews.database.global.indexer.enabled
		return miczThunderStatsPrefs.getBoolPref("mailnews.database.global.indexer.enabled");
	},

	activateGlobalIndexing:function(){
    	let _bundleCW = miczThunderStatsI18n.createBundle("mzts-searchwarn");
		let promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		if(!promptService.confirm(null,_bundleCW.GetStringFromName("ThunderStats.Attention"),_bundleCW.GetStringFromName("ThunderStats.SearchWarnQuestion")))return;
		miczThunderStatsPrefs.setBoolPref("mailnews.database.global.indexer.enabled",true);
		miczThunderStatsTab.ui.showGlobalIndexingWarning(true);
		alert(_bundleCW.GetStringFromName("ThunderStats.SearchWarnMsg1")+"\r\n"+_bundleCW.GetStringFromName("ThunderStats.SearchWarnMsg2"));
	},

	getAccountsOrder:function(custom_account_key){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("mail.accountmanager.");
		let default_account=prefs.getCharPref("defaultaccount");
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtil getAccountsOrder] default_account '+JSON.stringify(default_account)+'\r\n');
		let accounts_order_array=prefs.getCharPref("accounts").split(",");
		if(custom_account_key!=''){
			accounts_order_array.push(custom_account_key);
		}
		//dump('>>>>>>>>>>>>>> [miczThunderStatsUtil getAccountsOrder] accounts_order_array '+JSON.stringify(accounts_order_array)+'\r\n');
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
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab getInboxMessages] mFolder.URI '+JSON.stringify(mFolder.URI)+'\r\n');
		}
		if (mFolder.hasSubFolders){
			for (let folder of fixIterator(mFolder.subFolders, Components.interfaces.nsIMsgFolder)){
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
			for (let key in mIdentity.ids_merged){
				mIdentityAddresses.push(identities[mIdentity.ids_merged[key]]["email"]);
			}
		}
		//dump(">>>>>>>>>>>>>> [miczThunderStatsUtils] mIdentity: "+JSON.stringify(mIdentity)+"\r\n");
		//dump(">>>>>>>>>>>>>> [miczThunderStatsUtils] mIdentityAddresses: "+JSON.stringify(mIdentityAddresses)+"\r\n");
		return mIdentityAddresses;
	},

	isBusinessDay:function(mDate){
		//check easter
		if(miczThunderStatsPrefs.noBusinessEaster){
			let easter_day=miczThunderStatsUtils.getEasterDay(mDate.getFullYear());
			let easter_monday=new Date(easter_day);
			easter_monday.setDate(easter_monday.getDate() + 1);
			//dump(">>>>>>>>>>>>>> [miczThunderStatsUtils] easter_day: "+JSON.stringify(easter_day)+"\r\n");
			//dump(">>>>>>>>>>>>>> [miczThunderStatsUtils] easter_monday: "+JSON.stringify(easter_monday)+"\r\n");
			//dump(">>>>>>>>>>>>>> [miczThunderStatsUtils] mDate: "+JSON.stringify(mDate)+"\r\n");
			if((easter_day.toDateString()==mDate.toDateString())||(easter_monday.toDateString()==mDate.toDateString())){
				return false;	//if today is easter day or easter monday, return false (today is not a business day!)
			}
		}

		//check no business day list
		if(miczThunderStatsNBD.checkNoBusinessDay(mDate)){
			return false;
		}

		//if we are not on a special day, return the business weekday
		//dump('>>>>>>>> TS: weekday: '+mDate.getUTCDay()+' is_business: '+miczThunderStatsPrefs.checkWeekdayBusiness(mDate.getUTCDay())+"\r\n");
		return miczThunderStatsPrefs.checkWeekdayBusiness(mDate.getDay());
	},

	getYesterdayDate:function(){
		let ydate = new Date();
		ydate.setDate(ydate.getDate() - 1);
		if(miczThunderStatsPrefs.useLastBusinessDay){
			//dump('>>>>>>>> TS: day: '+ydate+' is_business: '+miczThunderStatsUtils.isBusinessDay(ydate)+"\r\n");
			if(!miczThunderStatsUtils.isBusinessDay(ydate)){		//Last Business Day Calc
				//loop for 5 days. if we found no business day, go on with yesterday
				let tmp_date=new Date(ydate);
				for(let idd=0;idd<5;idd++){
					tmp_date.setDate(tmp_date.getDate() - 1);
					//dump('>>>>>>>> TS: idd: '+idd+' tmp_date: '+tmp_date.toDateString()+"\r\n");
					if(miczThunderStatsUtils.isBusinessDay(tmp_date)){
						ydate=new Date(tmp_date);
						break;
					}
				}
			}
		}
		return ydate;
	},

	getEasterDay:function(Y) {		//thanks to http://www.irt.org/articles/js052/index.htm
		let C = Math.floor(Y/100);
		let N = Y - 19*Math.floor(Y/19);
		let K = Math.floor((C - 17)/25);
		let I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
		I = I - 30*Math.floor((I/30));
		I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
		let J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
		J = J - 7*Math.floor(J/7);
		let L = I - J;
		let M = (3 + Math.floor((L + 40)/44))-1;
		let D = L + 28 - 31*Math.floor(M/4);
		return new Date(Y,M,D);
	},

	customQueryInvolved_compare:function(a,b){
		if(a.Num > b.Num){
			return -1;
		}
		if(a.Num < b.Num){
			return 1;
		}
		return 0;
	},

	aggregateCustomQueryInvolved:function(data){
		//input data columns [key]["ID","Name","Mail","Num"]
		//output data columns ["ID","Name","Mail","Num"]
		let output={};
		let output_array=new Array();
		//dump('>>>>>>>> TS: [aggregateCustomQueryInvolved] data: '+JSON.stringify(data)+"\r\n");

		for(let ii in data){
			for(let jj in data[ii]){
				if(data[ii][jj]["ID"] in output){
					//dump(">>>>>>>> TS: [aggregateCustomQueryInvolved] adding.\r\n");
					//dump('>>>>>>>> TS: [aggregateCustomQueryInvolved] data[ii]: '+JSON.stringify(data[ii][jj])+"\r\n");
					output[data[ii][jj]["ID"]]["Num"]+=data[ii][jj]["Num"];
				}else{
					//dump(">>>>>>>> TS: [aggregateCustomQueryInvolved] new.\r\n");
					//dump('>>>>>>>> TS: [aggregateCustomQueryInvolved] data[ii][jj]: '+JSON.stringify(data[ii][jj])+"\r\n");
					//dump('>>>>>>>> TS: [aggregateCustomQueryInvolved] data[ii][jj]["ID"]: '+JSON.stringify(data[ii][jj]["ID"])+"\r\n");
					output[data[ii][jj]["ID"]]=data[ii][jj];
				}
			}
		}
		//dump('>>>>>>>> TS: [aggregateCustomQueryInvolved] output: '+JSON.stringify(output)+"\r\n");
		//dump('>>>>>>>> TS: [aggregateCustomQueryInvolved] output.length: '+JSON.stringify(output.length)+"\r\n");

		for(let ff in output){
			output_array.push(output[ff]);
		}
		//dump('>>>>>>>> TS: [aggregateCustomQueryInvolved] output_array: '+JSON.stringify(output_array)+"\r\n");
		//dump('>>>>>>>> TS: [aggregateCustomQueryInvolved] output_array.length: '+JSON.stringify(output_array.length)+"\r\n");
		output_array.sort(miczThunderStatsUtils.customQueryInvolved_compare);
		output_array=output_array.slice(0,miczThunderStatsPrefs.involvedNum);	//keep only the first elements defined in the involved_num pref
		return output_array;
	},

	get HostSystem(){
		if (null==miczThunderStatsUtils.mHost){
			let osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
			miczThunderStatsUtils.mHost = osString.toLowerCase();
		}
		return miczThunderStatsUtils.mHost; // linux - winnt - darwin
	},

	get TBVersion() {
		let appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		return appInfo.version;
	},
	
	checkTBVersion_pre57:function(){	//true if TB version is PRE 57, false otherwise
		let versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
		return versionComparator.compare(miczThunderStatsUtils.TBVersion,'57.0')<0;
	},

	get TSVersion() {
		return miczThunderStatsUtils.ThunderStatsVersion;
	},

	getMail3PaneWindow:function getMail3PaneWindow(){
		let windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator),
		    win3pane = windowManager.getMostRecentWindow("mail:3pane");
		return win3pane;
	},

	runDebugger:function(win,source){
		let features = (miczThunderStatsUtils.HostSystem == 'linux') ?
          'chrome,modal,titlebar,centerscreen,resizable,dependent,instantApply' :
          'chrome,modal,titlebar,centerscreen,resizable,alwaysRaised,instantApply';
        let args = {"source":source};

		win.openDialog("chrome://thunderstats/content/mzts-debugger.xul", "TSDebugger", features, args);
	}

};
