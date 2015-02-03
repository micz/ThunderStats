"use strict";
Components.utils.import("resource://thunderstats/sqlite.js");
Components.utils.import("resource://thunderstats/tokenize.js");
Components.utils.import("resource://thunderstats/fileIO.js");

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

var miczThunderStatsTab = {
	
	mDb:null,

	onLoad: function(){
		this.mDb = new SQLiteHandler();

		// Get profile directory.
		let file = Components.classes["@mozilla.org/file/directory_service;1"].
				   getService(Components.interfaces.nsIProperties).
				   get("ProfD", Components.interfaces.nsIFile);

		// Append the file name.
		file.append("global-messages-db.sqlite");

		//let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		//file.initWithPath(sPath);

		//proceed only if the file exists
		//we are in the profile folder via the listbox, so open if the file exists
		//do not attempt to create new file
		if(!file.exists()){
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab] db file not found {'+file.nativePath+'}!!!\r\n');
			return false;
		}else{
			this.mDb.openDatabase(file);
			let sql = "SELECT * FROM messages WHERE id=32";
			this.mDb.selectQuery(sql);
			let row = this.mDb.getRecords();
			if(row.length == 0){
				dump(">>>>>>>>>>>>>> [miczThunderStatsTab] ERROR:\r\nNo matching record found.\r\nSQL: " + sql);
				return false;
			}
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] row: " + JSON.stringify(row)+"\r\n");
			document.getElementById("test_output").setAttribute("value",JSON.stringify(row));
		}
		this.mDb.closeConnection();
	},

};

window.addEventListener("load", miczThunderStatsTab.onLoad, false);
