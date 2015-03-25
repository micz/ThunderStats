"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

miczThunderStatsTab.worker={};

miczThunderStatsTab.worker.today_inboxnum = function(mInboxNum){
	miczThunderStatsTab.ui.hideLoadingElement("today_inbox0_inboxmsg_wait");
	$jQ("#today_inbox0_inboxmsg").text(mInboxNum);
	miczLogger.log("Inbox messages loaded.",0);
};

miczThunderStatsTab.worker.yesterday_inboxnum = function(mInboxNum){
	miczThunderStatsTab.ui.hideLoadingElement("yesterday_inbox0_inboxmsg_wait");
	$jQ("#yesterday_inbox0_inboxmsg").text(mInboxNum);
	miczLogger.log("Inbox messages loaded.",0);
};
