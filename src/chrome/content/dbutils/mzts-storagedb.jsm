"use strict";
ChromeUtils.import("resource://thunderstats/sqlite.js");
ChromeUtils.import("resource://thunderstats/tokenize.js");
ChromeUtils.import("resource://thunderstats/fileIO.js");
ChromeUtils.import("resource://gre/modules/osfile.jsm");
ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-sqlquery.jsm");
ChromeUtils.import("resource://thunderstats/miczLogger.jsm");

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
			miczLogger.log('ThunderStats local database not present... creating a new one...');
			file.create(Ci.nsIFile.NORMAL_FILE_TYPE, parseInt("0666", 8));
			this.createDB(file);
			miczLogger.log('ThunderStats local database created.');
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
			miczLogger.log('[miczThunderStatsStorageDB] Error on db open {'+fileName+'}!!!',2);
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

	insertNewDay:function(mIdentity,mGivenDay,mCallback){ //mIdentity is the identity id, mGivenDay is a Date object
		mGivenDay.setHours(0,0,0,0);
		let mQueries=new Array();
		for (let i=0; i<=23; i++){
			let mDate=new Date(mGivenDay);
			mDate.setHours(mGivenDay.getHours() + i);
			let mY_UTC=mDate.getUTCFullYear();
			let mM_UTC=mDate.getUTCMonth();
			let mD_UTC=mDate.getUTCDate();
			let mH_UTC=mDate.getUTCHours();
			let mUTC_Date_To=new Date(mDate);
			mUTC_Date_To.setUTCHours(mDate.getUTCHours() + 1);
			mQueries.push("INSERT OR IGNORE INTO statscache ('identity', 'year_utc', 'month_utc', 'day_utc', 'hour_utc', 'msg_sent', 'msg_received', 'attachment_sent', 'attachment_received', 'msg_w_attach_sent', 'msg_w_attach_received', 'utc_date_from', 'utc_date_to', 'status') VALUES ('"+mIdentity+"', '"+mY_UTC+"', '"+mM_UTC+"', '"+mD_UTC+"', '"+mH_UTC+"', '0', '0', '0', '0', '0', '0', '"+mDate.getTime()+"', '"+mUTC_Date_To.getTime()+"', '0')");
		}
		return this.queryExecMulti(mQueries,mCallback);
	},

	querySelect:function(mWhat,mFrom,mWhere){
		return miczThunderStatsQuery.querySelect(this.sDb,mWhat,mFrom,mWhere);
	},

	queryExec:function(mQuery,mCallback){ //mQuery is a query string
		return miczThunderStatsQuery.queryExec(this.sDb,[mQuery],mCallback);
	},

	queryExecMulti:function(mQueries,mCallback){ //mQueries is an array of query strings
		return miczThunderStatsQuery.queryExec(this.sDb,mQueries,mCallback);
	},
};


miczThunderStatsStorageDB.structure={

	sDb_version:'1',

	tableStatsCache:"CREATE TABLE 'statsCache' (\
    'identity' INTEGER NOT NULL,\
    'year_utc' INTEGER NOT NULL,\
    'month_utc' INTEGER NOT NULL,\
    'day_utc' INTEGER NOT NULL,\
    'hour_utc' INTEGER NOT NULL,\
    'msg_sent' INTEGER NOT NULL,\
    'msg_received' INTEGER NOT NULL,\
    'attachment_sent' INTEGER NOT NULL,\
    'attachment_received' INTEGER NOT NULL,\
    'msg_w_attach_sent' INTEGER NOT NULL,\
    'msg_w_attach_received' INTEGER NOT NULL,\
	'utc_date_from' INTEGER NOT NULL,\
	'utc_date_to' INTEGER NOT NULL,\
    'status' INTEGER  NOT NULL  DEFAULT (0));\
	 \
	CREATE INDEX 'day_utcIdx' on statscache (day_utc DESC);\
	CREATE INDEX 'month_utcIdx' on statscache (month_utc DESC);\
	CREATE INDEX 'year_utcIdx' on statscache (year_utc DESC);\
	CREATE INDEX 'identityIdx' on statscache (identity ASC);\
	CREATE UNIQUE INDEX 'uIndex' on statscache (identity ASC, year_utc ASC, month_utc ASC, day_utc ASC, hour_utc DESC);",

	tableSettings:"CREATE TABLE 'Settings' (\
    'name' TEXT NOT NULL,\
    'value' TEXT NOT NULL DEFAULT (0)\
	);\
	\
	CREATE UNIQUE INDEX 'nameIdx' on settings (name ASC);",

	addDBVersionInfo:"INSERT INTO settings ('name', 'value') VALUES('db_version', '%DBVER%');",

};
