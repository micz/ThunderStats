"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");

let EXPORTED_SYMBOLS = ["miczThunderStatsNBD"];

var miczThunderStatsNBD = {
	
	nbd_pref_name:'bday.nbd_list',

	loadFromPref:function(pref_name){  //return nbd_objs
		let nbds_str=miczThunderStatsPrefs.getCharPref_TS(pref_name);
		return JSON.parse(nbds_str);
	},

	saveToPref:function(pref_name,nbd_objs){
		return miczThunderStatsPrefs.setCharPref_TS(pref_name,JSON.stringify(nbd_objs));
	},

	formatNBDDateString:function(nbd,moment){	//nbd is an NBD object
		let nbd_moment=moment(nbd.date);
		let output=nbd_moment.format("L");

		if(nbd.every_year){	//this NBD is valid every year
			let year=nbd_moment.format("YYYY");
			//let characters="-\//";
			let _bundleCW = miczThunderStatsI18n.createBundle("settings");
			output=output.replace(year,_bundleCW.GetStringFromName("ThunderStats.NBD.year"));
			//output=output.replace(new RegExp("^[" + characters + "]+|[" + characters + "]+$", "gi"), '');
		}

		return output;
	},
	
	checkNoBusinessDay:function(mDate){ //mDate is a Date object
		let nbd_objs=miczThunderStatsNBD.loadFromPref(miczThunderStatsNBD.nbd_pref_name);
		let date_array=new Array();
		//dump(">>>>>>>>>>>>> miczThunderStatsNBD: [checkNoBusinessDay] nbd_objs "+JSON.stringify(nbd_objs)+"\r\n");
		
		//Prepare Date array
		for(let nn in nbd_objs){
			let tmpDate=new Date(nbd_objs[nn].date);
			if(nbd_objs[nn].every_year){
				let tmp_today=new Date();
				tmpDate.setFullYear(tmp_today.getFullYear());
			}
			date_array.push(tmpDate);
		}
		//dump(">>>>>>>>>>>>> miczThunderStatsNBD: [checkNoBusinessDay] date_array "+JSON.stringify(date_array)+"\r\n");
		
		for(let dd of date_array){
			if(dd.toDateString()==mDate.toDateString()){
				return true;
			}
		}
		
		return false;		
	},

};
