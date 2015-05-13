"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsI18n"];

var miczThunderStatsI18n = {

	createBundle:function(bundle){
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
    	return strBundleCW.createBundle("chrome://thunderstats/locale/"+bundle+".properties");
	},

}