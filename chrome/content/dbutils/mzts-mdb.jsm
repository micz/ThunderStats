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
	msgAttributes:null,

	init: function(){
		this.mDb = new SQLiteHandler();

		let dirName = OS.Constants.Path.profileDir;
		let fileName = OS.Path.join(dirName, "global-messages-db.sqlite");
		let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(fileName);

		if(this.mDb.openDatabase(file)){
			//load messages attributes!
			this.loadMsgAttributes();
			return true;
		}else{
			dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] Error on db open {'+fileName+'}!!!\r\n');
			return false;
		}
	},

	close:function(){
		this.mDb.closeConnection();
	},
	
	loadMsgAttributes:function(){
		this.msgAttributes={};
		let rows=miczThunderStatsQuery.querySelect(this.mDb,"name,id","attributeDefinitions",null);
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] loadMsgAttributes rows '+JSON.stringify(rows)+'\r\n');
		for(let key in rows){
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] loadMsgAttributes rows[key] '+JSON.stringify(rows[key])+'\r\n');
			this.msgAttributes[rows[key][0]]=rows[key][1];
		}
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] loadMsgAttributes this.msgAttributes  '+JSON.stringify(this.msgAttributes)+'\r\n');
	},

	querySelect:function(mWhat,mFrom,mWhere){
		return miczThunderStatsQuery.querySelect(this.mDb,mWhat,mFrom,mWhere);
	},

	querySentMessages:function(mFromDate,mToDate){	//mFromDate,mToDate are in milliseconds
		let fromMe_attribute=this.msgAttributes['fromMe'];
		let forbiddenFolders=this.queryGetForbiddenFolders();
		let forbiddenFoldersStr="("+forbiddenFolders.join()+")";
		let mWhat="count(distinct ma.messageID)";
		let mFrom="messageattributes ma left join messages m on ma.messageID=m.id";
		let mWhere="ma.attributeID="+fromMe_attribute+" and m.date>"+mFromDate+"000 and m.date<"+mToDate+"000 AND m.folderID not in "+forbiddenFoldersStr;
		return this.querySelect(mWhat,mFrom,mWhere);
	},

	//returns an array of ids of folder to be ignored in stats crunching
	queryGetForbiddenFolders:function(){
		let folderArray=new Array();
		//not in drafts folders and not if folder is not indexed
		let mWhere='indexingPriority=-1 OR name="Drafts"';
		let rows=this.querySelect("id","folderLocations",mWhere);
		for(let key in rows){
			folderArray.push(rows[key][0]);
		}
		return folderArray;
	},

	//returns an array of ids of folder to be ignored in stats crunching
	queryGetIdentityID:function(email){
		let mWhere='value="'+email+'" LIMIT 1';
		let rows=this.querySelect("id","identities",mWhere);
		return rows[0][0];
	},

};
