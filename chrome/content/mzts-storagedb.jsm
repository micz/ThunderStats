"use strict";
Components.utils.import("resource://thunderstats/sqlite.js");
Components.utils.import("resource://thunderstats/tokenize.js");
Components.utils.import("resource://thunderstats/fileIO.js");
Components.utils.import("resource://gre/modules/osfile.jsm");

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczThunderStatsStorageDB"];

var miczThunderStatsStorageDB = {
	
	sDb:null,

	init: function(){
		this.sDb = new SQLiteHandler();

		// Get profile directory
		/*let file = Components.classes["@mozilla.org/file/directory_service;1"].
				   getService(Components.interfaces.nsIProperties).
				   get("ProfD", Components.interfaces.nsIFile);

		// Append the folder name
		file.append('thuderstatsmiczit');
		
		// Append the file name
		file.append("thunderstats_localdb.sqlite");
*/
		let dirName = OS.Path.join(OS.Constants.Path.profileDir,"thuderstatsmiczit");
		let fileName = OS.Path.join(dirName, "thunderstats_localdb.sqlite");
		OS.File.makeDir(dirName, {ignoreExisting: true});
		let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(fileName);

		//if the file does not exists we have to create it
		/*if(!file.exists()){
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab] db file not found {'+fileName+'}!!!\r\n');
			return false;
		}else{*/
			if(this.sDb.openDatabase(file)){
				return true;
			}else{
				dump('>>>>>>>>>>>>>> [miczThunderStatsTab] Error on db open {'+fileName+'}!!!\r\n');
				return false;
			}
		//}
	},
	
	close:function(){
		this.sDb.closeConnection();
	},
	
	querySelect:function(mWhat,mFrom,mWhere){
		if((mWhere=="")||(mWhere==null))mWhere="1=1";
		let mQuery="SELECT "+mWhat+" FROM "+mFrom+" WHERE "+mWhere;
		this.sDb.selectQuery(mQuery);
		let rows = this.sDb.getRecords();
		if(rows.length == 0){
			dump(">>>>>>>>>>>>>> [miczThunderStatsTab] ERROR:\r\nNo matching record found.\r\nSQL: " + sql);
			return -1;
		}
		return rows;
	},
};
