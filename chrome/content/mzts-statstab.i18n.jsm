"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsI18n"];

var miczThunderStatsI18n = {

	createBundle:function(bundle){
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		return strBundleCW.createBundle("chrome://thunderstats/locale/"+bundle+".properties");
	},

	getBundleString:function(_bundleCW,i18n_string,value){	//with only one string substitution, using {0} in string
		return _bundleCW.GetStringFromName(i18n_string).replace('{0}',value);
	},

}