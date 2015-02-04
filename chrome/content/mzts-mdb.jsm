"use strict";
Components.utils.import("resource://thunderstats/sqlite.js");
Components.utils.import("resource://thunderstats/tokenize.js");
Components.utils.import("resource://thunderstats/fileIO.js");
Components.utils.import("resource://gre/modules/osfile.jsm");

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
		if((mWhere=="")||(mWhere==null))mWhere="1=1";
		let mQuery="SELECT "+mWhat+" FROM "+mFrom+" WHERE "+mWhere;
		this.mDb.selectQuery(mQuery);
		let rows = this.mDb.getRecords();
		if(rows.length == 0){
			dump(">>>>>>>>>>>>>> [miczThunderStatsTab] ERROR:\r\nNo matching record found.\r\nSQL: " + sql);
			return -1;
		}
		return rows;
	},
};
