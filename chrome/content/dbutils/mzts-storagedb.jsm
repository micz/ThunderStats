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
	sDb_version:1,

	init: function(){
		this.sDb = new SQLiteHandler();

		let dirName = OS.Path.join(OS.Constants.Path.profileDir,"thuderstatsmiczit");
		OS.File.makeDir(dirName, {ignoreExisting: true});
		let fileName = OS.Path.join(dirName, "thunderstats_localdb.sqlite");
		let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(fileName);
		if(!file.exists()){
			file.create(Ci.nsIFile.NORMAL_FILE_TYPE, parseInt("0666", 8));
			this.createDB();
		}
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab StorageDB] fileName {'+fileName+'}\r\n');

		if(this.sDb.openDatabase(file)){
			//check db version and update it if necessary
			let currDBVersion=this.getDBVersion();
			if(currDBVersion!=this.sDb_version){
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

	createDB:function(){
		//To be implemented
	},

	updateDB:function(oldVersion){
		//To be implemented
	},

	querySelect:function(mWhat,mFrom,mWhere){
		return miczThunderStatsQuery.querySelect(this.sDb,mWhat,mFrom,mWhere);
	},
	
	queryExec:function(mQuery,mCallback){
		return miczThunderStatsQuery.querySelect(this.sDb,mQuery,mCallback);
	},
};
