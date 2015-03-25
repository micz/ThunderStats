"use strict";
importScripts("chrome://thunderstats/content/workers/mzts-worker-utils.jsm");

onmessage=function(event){
	postMessage(JSON.stringify({log:"I'm the Inbox Num Worker!!!"}));
	miczThunderStatsWorkerUtils.queryGetInboxFolders();
	postMessage(JSON.stringify({log:"Inbox Num Worker finished!!!"}));
};
