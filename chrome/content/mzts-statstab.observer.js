"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

miczThunderStatsTab.observer={};
miczThunderStatsTab.observer.callback={};

miczThunderStatsTab.observer.last_idx_update = function(mCallback){
	let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	ObserverService.addObserver(mCallback,"mzts-last-index-update",false);
};

miczThunderStatsTab.observer.callback.last_idx_update = {
	observe: function(aSubject,aTopic,aData){
			//dump(">>>>>>>>>>>>> miczThunderStats: [aSubject] "+aData+"\r\n");
			$jQ("#mzts-idx_update").text("Last index update: "+miczThunderStatsUtils.getDateTimeString(moment(JSON.parse(aData))));
	}
};



