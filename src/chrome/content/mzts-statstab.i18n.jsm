"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

let EXPORTED_SYMBOLS = ["miczThunderStatsI18n"];

var miczThunderStatsI18n = {

	createBundle:function(bundle){

		// let strBundleCW = Services.strings;
		// Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		return Services.strings.createBundle("chrome://thunderstats/locale/"+bundle+".properties");
	},

	getBundleString:function(_bundleCW,i18n_string,value){	//with only one string substitution, using {0} in string
		// Services.console.logStringMessage("i18 : "+i18n_string);
		let s = _bundleCW.GetStringFromName(i18n_string).replace('{0}',value);
		// Services.console.logStringMessage("i18 string: "+ s);
		return s;
	},

}