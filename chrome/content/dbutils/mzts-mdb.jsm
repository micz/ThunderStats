"use strict";
if(typeof Components != "undefined"){
	Components.utils.import("resource://thunderstats/sqlite.js");
	Components.utils.import("resource://thunderstats/tokenize.js");
	Components.utils.import("resource://thunderstats/fileIO.js");
	Components.utils.import("resource://gre/modules/osfile.jsm");
	Components.utils.import("chrome://thunderstats/content/dbutils/mzts-sqlquery.jsm");
	Components.utils.import("resource://thunderstats/miczLogger.jsm");
}else{
	importScripts("resource://thunderstats/sqlite.js",
	"resource://thunderstats/tokenize.js",
	"resource://thunderstats/fileIO.js",
	"resource://gre/modules/osfile.jsm",
	"chrome://thunderstats/content/dbutils/mzts-sqlquery.jsm",
	"resource://thunderstats/miczLogger.jsm");

}
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
			miczLogger.log('[miczThunderStatsDB] Error on db open {'+fileName+'}!!!\r\n',2);
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] Error on db open {'+fileName+'}!!!\r\n');
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

	queryMessages:function(mType,mFromDate,mToDate,mIdentity){	//mFromDate,mToDate are in milliseconds
		let fromMe_attribute=this.msgAttributes['fromMe'];
		let toMe_attribute=this.msgAttributes['toMe'];
		//mType 0: toMe, 1: fromMe
		let mType_attribute=(mType==1?fromMe_attribute:toMe_attribute);
		let involves_attribute=this.msgAttributes['involves'];
		let forbiddenFolders=this.queryGetForbiddenFolders();
		let forbiddenFoldersStr="("+forbiddenFolders.join()+")";
		let mWhat="count(distinct ma.messageID)";
		let mFrom="messageattributes ma left join messages m on ma.messageID=m.id";
		let mWhere="ma.attributeID="+mType_attribute+" and m.date>"+mFromDate+"000 and m.date<"+mToDate+"000 AND m.folderID not in "+forbiddenFoldersStr;
		if(mIdentity>0){
			mFrom+=" left join messageattributes ma2 on ma2.messageID=m.id";
			mWhere+=" AND ma2.attributeID="+involves_attribute+" AND ma2.value="+mIdentity;
		}
		return this.querySelect(mWhat,mFrom,mWhere);
	},

	queryGetNumInvolved:function(mType,mFromDate,mToDate,mIdentity,mMax){	//mFromDate,mToDate are in milliseconds
		let fromMe_attribute=this.msgAttributes['fromMe'];
		let toMe_attribute=this.msgAttributes['toMe'];
		//mType 0: toMe, 1: fromMe
		let mType_attribute=(mType==1?fromMe_attribute:toMe_attribute);
		let involves_attribute=this.msgAttributes['involves'];
		let forbiddenFolders=this.queryGetForbiddenFolders();
		let forbiddenFoldersStr="("+forbiddenFolders.join()+")";
		let mWhat="ma.value AS ID,c.name AS Name,i.value AS Mail,count(m.id) AS Num";
		let mFrom="messageattributes ma left join messages m on ma.messageID=m.id left join identities i on i.id=ma.value left join contacts c on c.id=i.contactID";
		let mWhere="ma.attributeID="+mType_attribute+" and m.date>"+mFromDate+"000 and m.date<"+mToDate+"000 AND m.folderID not in "+forbiddenFoldersStr;
		if(mIdentity>0){
			mFrom+=" left join messageattributes ma2 on ma2.messageID=m.id";
			mWhere+=" AND ma2.attributeID="+involves_attribute+" AND ma2.value="+mIdentity;
		}
		mWhere+=" group by ma.value order by Num DESC";
		if(mMax>0){
			mWhere+=" LIMIT "+mMax;
		}
		return this.querySelect(mWhat,mFrom,mWhere);
	},

	queryGetAttachments:function(mType,mFromDate,mToDate,mIdentity,mMax){	//mFromDate,mToDate are in milliseconds
		let fromMe_attribute=this.msgAttributes['fromMe'];
		let toMe_attribute=this.msgAttributes['toMe'];
		let fromMe_attribute=this.msgAttributes['fromMe'];
		let toMe_attribute=this.msgAttributes['toMe'];
		//mType 0: toMe, 1: fromMe
		let mType_attribute=(mType==1?fromMe_attribute:toMe_attribute);
		let attachmentTypes_attribute=this.msgAttributes['attachmentTypes'];
		let involves_attribute=this.msgAttributes['involves'];
		let forbiddenFolders=this.queryGetForbiddenFolders();
		let forbiddenFoldersStr="("+forbiddenFolders.join()+")";
		let mWhat="count(m.id) AS TotAttachments,count(distinct m.id) AS NumMails";
		let mFrom="messageattributes ma left join messages m on ma.messageID=m.id left join messageattributes ma2 on ma2.messageID=m.id";
		let mWhere="ma2.attributeID="+attachmentTypes_attribute+" and ma.attributeID="+mType_attribute+" and m.date>"+mFromDate+"000 and m.date<"+mToDate+"000 AND m.folderID not in "+forbiddenFoldersStr;
		if(mIdentity>0){
			mFrom+=" left join messageattributes ma3 on ma3.messageID=m.id";
			mWhere+=" AND ma3.attributeID="+involves_attribute+" AND ma3.value="+mIdentity;
		}
		mWhere+=" group by m.id";
		if(mMax>0){
			mWhere+=" LIMIT "+mMax;
		}
		return this.querySelect(mWhat,mFrom,mWhere);	//returns tot_attachments,tot_mails
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
