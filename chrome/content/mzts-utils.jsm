"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsUtils"];

var miczThunderStatsUtils = {

	escapeHTML: function(s){
		return s.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
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
};
