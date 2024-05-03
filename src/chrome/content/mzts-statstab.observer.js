"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

var { miczThunderStatsI18n } = ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
var { miczThunderStatsUtils } = ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
var { miczLogger } = ChromeUtils.import("resource://thunderstats/miczLogger.jsm");


miczThunderStatsTab.observer={};
miczThunderStatsTab.observer.callback={};

miczThunderStatsTab.observer.last_idx_update = function(mCallback){
	let ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	ObserverService.addObserver(mCallback,"mzts-last-index-update",false);
};

miczThunderStatsTab.observer.callback.last_idx_update = {
	observe: function(aSubject,aTopic,aData){
			//dump(">>>>>>>>>>>>> miczThunderStats: [aSubject] "+aData+"\r\n");
			let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.observer");
			$jQ("#mzts-idx_update").text(_bundleCW.GetStringFromName("ThunderStats.LastIndexUpdate")+": "+miczThunderStatsUtils.getDateTimeString(moment(JSON.parse(aData))));
			miczLogger.log("Last index update loaded.",0);
	}
};



