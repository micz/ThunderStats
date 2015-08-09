"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");

let EXPORTED_SYMBOLS = ["miczThunderStatsNBD"];

var miczThunderStatsNBD = {

	loadFromPref:function(pref_name){  //return nbd_objs
		let nbds_str=miczThunderStatsPrefs.getCharPref_TS(pref_name);
		return JSON.parse(nbds_str);
	},

	saveToPref:function(pref_name,nbd_objs){
		return miczThunderStatsPrefs.setCharPref_TS(pref_name,JSON.stringify(nbd_objs));
	},

}
