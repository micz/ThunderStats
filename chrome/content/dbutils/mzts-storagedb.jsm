"use strict";
Components.utils.import("resource://thunderstats/sqlite.js");
Components.utils.import("resource://thunderstats/tokenize.js");
Components.utils.import("resource://thunderstats/fileIO.js");
Components.utils.import("resource://gre/modules/osfile.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-sqlquery.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczThunderStatsStorageDB"];

var miczThunderStatsStorageDB = {

	sDb:null,

	init: function(){
		this.sDb = new SQLiteHandler();

		let dirName = OS.Path.join(OS.Constants.Path.profileDir,"thuderstatsmiczit");
		OS.File.makeDir(dirName, {ignoreExisting: true});
		let fileName = OS.Path.join(dirName, "thunderstats_localdb.sqlite");
		let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(fileName);
		if(!file.exists()){
			file.create(Ci.nsIFile.NORMAL_FILE_TYPE, parseInt("0666", 8));
			this.createDB(file);
		}
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab StorageDB] fileName {'+fileName+'}\r\n');

		if(this.sDb.openDatabase(file)){
			//check db version and update it if necessary
			let currDBVersion=this.getDBVersion();
			if(currDBVersion!=miczThunderStatsStorageDB.structure.sDb_version){
					this.updateDB(currDBVersion);
			}			
			return true;
		}else{
			miczLogger.log('[miczThunderStatsStorageDB] Error on db open {'+fileName+'}!!!\r\n',2);
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab StorageDB] Error on db open {'+fileName+'}!!!\r\n');
			return false;
		}

	},

	close:function(){
		this.sDb.closeConnection();
	},
	
	getDBVersion:function(){
		//To be implemented
	},

	createDB:function(file){
		this.sDb.openDatabase(file);
		this.queryExec(miczThunderStatsStorageDB.structure.tableStatsCache);
		this.queryExec(miczThunderStatsStorageDB.structure.tableSettings);
		let repl={"%DBVER%":miczThunderStatsStorageDB.structure.sDb_version};
		let db_ver_qry=miczThunderStatsStorageDB.structure.addDBVersionInfo.replace(/%\w+%/g,function(all){return repl[all] || all;});
		this.queryExec(db_ver_qry);
		this.close();
	},

	updateDB:function(oldVersion){
		//To be implemented
	},

	querySelect:function(mWhat,mFrom,mWhere){
		return miczThunderStatsQuery.querySelect(this.sDb,mWhat,mFrom,mWhere);
	},
	
	queryExec:function(mQuery,mCallback){
		return miczThunderStatsQuery.queryExec(this.sDb,mQuery,mCallback);
	},
};


miczThunderStatsStorageDB.structure={
	
	sDb_version:'1',

	tableStatsCache:"CREATE TABLE 'statsCache' ( \
	'identity'	INTEGER NOT NULL, \
	'year'	INTEGER NOT NULL, \
	'month'	INTEGER NOT NULL, \
	'day'	INTEGER NOT NULL, \
	'hour'	INTEGER NOT NULL, \
	'msg_sent'	INTEGER NOT NULL, \
	'msg_received'	INTEGER NOT NULL, \
	'attachment_sent'	INTEGER NOT NULL, \
	'attachment_received'	INTEGER NOT NULL, \
	'msg_w_attach_sent'	INTEGER NOT NULL, \
	'msg_w_attach_received'	INTEGER NOT NULL \
	); \
	\
	CREATE INDEX 'dayIdx' on statscache (day DESC); \
	CREATE INDEX 'monthIdx' on statscache (month DESC); \
	CREATE INDEX 'yearIdx' on statscache (year DESC); \
	CREATE INDEX 'identityIdx' on statscache (identity ASC); \
	CREATE UNIQUE INDEX 'uIndex' on statscache (identity ASC, year ASC, month ASC, day ASC, hour DESC);",
	
	tableSettings:"CREATE TABLE 'Settings' (\
    'name' TEXT NOT NULL,\
    'value' TEXT NOT NULL DEFAULT (0)\
	);\
	\
	CREATE UNIQUE INDEX 'nameIdx' on settings (name ASC);",
	
	addDBVersionInfo:"INSERT INTO settings ('name', 'value') VALUES('db_version', '%DBVER%');",
	
};
