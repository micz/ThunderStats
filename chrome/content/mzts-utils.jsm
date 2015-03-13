"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsUtils"];

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
		mToDate.setHours(24,0,0,0);			// End just before midnight
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

};
