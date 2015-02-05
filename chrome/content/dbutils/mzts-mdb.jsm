"use strict";
Components.utils.import("resource://thunderstats/sqlite.js");
Components.utils.import("resource://thunderstats/tokenize.js");
Components.utils.import("resource://thunderstats/fileIO.js");
Components.utils.import("resource://gre/modules/osfile.jsm");
Components.utils.import("chrome://thunderstats/content/dbutils/mzts-sqlquery.jsm");

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczThunderStatsDB"];

var miczThunderStatsDB = {

	mDb:null,

	init: function(){
		this.mDb = new SQLiteHandler();

		let dirName = OS.Constants.Path.profileDir;
		let fileName = OS.Path.join(dirName, "global-messages-db.sqlite");
		let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(fileName);

		if(this.mDb.openDatabase(file)){
			return true;
		}else{
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] Error on db open {'+fileName+'}!!!\r\n');
			return false;
		}

	},

	close:function(){
		this.mDb.closeConnection();
	},

	querySelect:function(mWhat,mFrom,mWhere){
		return miczThunderStatsQuery.querySelect(this.mDb,mWhat,mFrom,mWhere);
	},

	querySentMessages:function(mFromDate,mToDate){	//mFromDate,mToDate are in milliseconds
		let forbiddenFolders=this.queryGetForbiddenFolders();
		let forbiddenFoldersStr="("+forbiddenFolders.join()+")";
		let mWhere="jsonAttributes like '%\"53\":%' and date>"+mFromDate+"000 and date<"+mToDate+"000 AND folderID not in "+forbiddenFoldersStr;
		return this.querySelect("count(*)","messages",mWhere);
	},

	//returns an array of ids of folder to be ignored in stats crunching
	queryGetForbiddenFolders:function(){
		let folderArray=new Array();
		let mWhere='indexingPriority=-1 OR name="Drafts"';
		let rows=this.querySelect("id","folderLocations",mWhere);
		for(let key in rows){
			folderArray.push(rows[key][0]);
		}
		return folderArray;
	},
};
