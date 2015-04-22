"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");

var miczThunderStatsPrefPanel = {

	onLoad: function(){

		//Loading accounts
		let acc_list = document.getElementById('ts_accnt_lst');
		for(let key in miczThunderStatsCore.accounts){
			acc_list.appendItem(miczThunderStatsCore.accounts[key].name,key);
		}

		//Fixing window height
		sizeToContent();
		var vbox = document.getElementById('ts_tabbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

	onAccountChange: function(){
		let acc_list = document.getElementById('ts_accnt_lst');
		let cstid_txtbox = document.getElementById('ts_cstmids');
		let sel_account_identities=miczThunderStatsCore.accounts[acc_list.selectedItem.value].identities;
		dump(">>>>>>>>>>>>> miczThunderStatsPrefPanel: [onAccountChange] acc_list.selectedItem.value "+acc_list.selectedItem.value+"\r\n");
		dump(">>>>>>>>>>>>> miczThunderStatsPrefPanel: [onAccountChange] sel_account_identities "+JSON.stringify(sel_account_identities)+"\r\n");
		cstid_txtbox.value="";
		for(let ii in sel_account_identities){
			let curr_identity=miczThunderStatsCore.identities[sel_account_identities[ii]];
			if(curr_identity.custom){
				cstid_txtbox.value+=curr_identity.email+"\r\n";
			}
		}
	},
};
