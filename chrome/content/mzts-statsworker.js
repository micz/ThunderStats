"use strict";
importScripts("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
//importScripts("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");
//importScripts("chrome://thunderstats/content/mzts-statscore.jsm");
importScripts("resource://thunderstats/miczLogger.jsm");

onmessage=function(event){
	miczLogger.log("I'm a worker!!!",0);
};
