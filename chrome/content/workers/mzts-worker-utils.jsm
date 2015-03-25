"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsUtils"];

var miczThunderStatsWorkerUtils = {
	
	inboxFolders:null,
	
	//returns an array of nsIMsgFolders of inbox folders for the given identity
	queryGetInboxFolders:function(){
		if(this.inboxFolders!==null){
			return this.inboxFolders;
		}
		//get accounts
		let acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
		let accounts = acctMgr.accounts;
		let arr_inbox=new Array();
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] accounts '+JSON.stringify(accounts)+'\r\n');
		for (let i = 0; i < accounts.length; i++) {
			let account = accounts.queryElementAt(i, Components.interfaces.nsIMsgAccount);
			if(account==null) continue;
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab queryGetInboxFolders] mIdentity|identities '+mIdentity+"|"+JSON.stringify(identities)+'\r\n');
			//if((mIdentity!=0)&&(identities[mIdentity]["account_key"]!=account.key)) continue;
			// check folders
			let server = account.incomingServer;
			let folder = server.rootFolder;
			//dump('>>>>>>>>>>>>>> [miczThunderStatsTab getInboxMessages] folder.URI '+JSON.stringify(folder.URI)+'\r\n');
			arr_inbox=miczThunderStatsWorkerUtils.arrayMerge(arr_inbox,miczThunderStatsUtils.getInboxFoldersObjects(folder));
		}
		this.inboxFolders=arr_inbox;
		return arr_inbox;
	},
	
	arrayMerge:function(dest,src){
	  for(let n = 0; n < src.length; ++n){
		dest.push(src[n]);
	  }
	  return dest;
	},
};
