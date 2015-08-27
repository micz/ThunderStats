"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsI18n"];

var miczThunderStatsI18n = {

	_bundleCW:null,

	createBundle:function(bundle){
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		this._bundleCW=strBundleCW.createBundle("chrome://thunderstats/locale/"+bundle+".properties");
    	return this._bundleCW;
	},

	getBundleString:function(i18n_string,value){	//with only one string substitution, using {0} in string
		return this._bundleCW.GetStringFromName(i18n_string).replace('{0}',value);
	},

}