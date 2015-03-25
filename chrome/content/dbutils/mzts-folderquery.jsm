"use strict";

Components.utils.import("resource://thunderstats/miczLogger.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");

let EXPORTED_SYMBOLS = ["miczThunderStatsFolderQ"];

var miczThunderStatsFolderQ = {

	queryInboxMessages:function(mIdentity,mCallback){
		//let inboxFolders=this.queryGetInboxFolders();
		let worker = new ChromeWorker("chrome://thunderstats/content/workers/mzts-worker_inboxnum.js");
		worker.onmessage = function(event){
			if(event.data.log!==undefined){
				miczLogger.log(event.data.log);
			}
			mCallback(event.data.num);
		};
		let worker_data="";//inboxFolders;
		worker.postMessage(worker_data);
		return;
	},

	//returns the number of messages in the inbox for each day
	queryInboxMessagesDate:function(mIdentity,mCallback){
		/*let toMe_attribute=this.msgAttributes['toMe'];
		let involves_attribute=this.msgAttributes['involves'];
		let inboxFolders=this.queryGetInboxFolders();
		let inboxFoldersStr="("+inboxFolders.join()+")";
		let mWhat="strftime('%Y-%m-%d',m.date/1000000,'unixepoch') as Date, count(distinct m.headerMessageID) as Num";
		let mFrom="messageattributes ma left join messages m on ma.messageID=m.id";
		let mWhere="ma.attributeID="+toMe_attribute+" AND m.folderID in "+inboxFoldersStr;
		if(mIdentity>0){
			mFrom+=" left join messageattributes ma2 on ma2.messageID=m.id";
			mWhere+=" AND ma2.attributeID="+involves_attribute+" AND ma2.value="+mIdentity;
		}
		mWhere+= " GROUP BY strftime('%Y-%m-%d',m.date/1000000,'unixepoch') ORDER BY m.date ASC";
		return this.querySelect(mWhat,mFrom,mWhere,mCallback);*/
	},

};
