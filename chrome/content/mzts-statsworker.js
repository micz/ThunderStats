"use strict";
//importScripts("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
importScripts("resource://thunderstats/sql.js");
//importScripts("chrome://thunderstats/content/dbutils/mzts-storagedb.jsm");
//importScripts("chrome://thunderstats/content/mzts-statscore.jsm");
importScripts("resource://gre/modules/osfile.jsm");

onmessage=function(event){
	postMessage("I'm a worker!!!");

	let dirName = OS.Constants.Path.profileDir;
	let f = OS.Path.join(dirName, "global-messages-db.sqlite");
	//let f = dbFileElm.files[0];
    let Uints = new Uint8Array(OS.File.read(f));
    let db = new SQL.Database(Uints);
    postMessage("db: "+JSON.stringify(db));
	//let contents = db.exec("SELECT `name`, `sql` FROM `sqlite_master` WHERE type='table';");
	let contents = db.exec("SELECT name,id FROM attributeDefinitions WHERE 1=1;");

	postMessage("Query executed: "+JSON.stringify(contents));
};
