"use strict";
Components.utils.import("resource://thunderstats/sqlite.js");
Components.utils.import("resource://thunderstats/tokenize.js");
Components.utils.import("resource://thunderstats/fileIO.js");

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczThunderStatsDB"];

var miczThunderStatsDB = {
	
	mDb:null,

	init: function(){
		this.mDb = new SQLiteHandler();

		// Get profile directory.
		let file = Components.classes["@mozilla.org/file/directory_service;1"].
				   getService(Components.interfaces.nsIProperties).
				   get("ProfD", Components.interfaces.nsIFile);

		// Append the file name.
		file.append("global-messages-db.sqlite");

		//proceed only if the file exists
		//we are in the profile folder via the listbox, so open if the file exists
		//do not attempt to create new file
		if(!file.exists()){
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab] db file not found {'+file.path+'}!!!\r\n');
			return false;
		}else{
			if(this.mDb.openDatabase(file)){
				return true;
			}else{
				dump('>>>>>>>>>>>>>> [miczThunderStatsTab] Error on db open {'+file.path+'}!!!\r\n');
				return false;
			}
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
