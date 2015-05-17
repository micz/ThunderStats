"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");

var miczThunderStatsPrefPanel = {

	onLoad: function(){

		//Loading accounts
		let chosen_strt_acc=miczThunderStatsPrefs.getCharPref_TS('strt_acc');
		let acc_list = document.getElementById('ts_accnt_lst');
		let strt_acc = document.getElementById('ts_strt_accnt');
		let strt_acc_sel_idx=0;
		let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
		strt_acc.appendItem(_bundleCW.GetStringFromName("ThunderStats.AllAccounts"),0);
		for(let key in miczThunderStatsCore.accounts){
			acc_list.appendItem(miczThunderStatsCore.accounts[key].name,key);
			let curr_item=strt_acc.appendItem(miczThunderStatsCore.accounts[key].name,key);
			if(key==chosen_strt_acc){
				strt_acc_sel_idx=strt_acc.getIndexOfItem(curr_item);
			}
		}

		strt_acc.selectedIndex=strt_acc_sel_idx;

		//Fixing window height
		sizeToContent();
		var vbox = document.getElementById('ts_tabbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

	onCIAccountChange: function(){
		let acc_list = document.getElementById('ts_accnt_lst');
		let cstid_txtbox = document.getElementById('ts_cstmids');
/*		let sel_account_identities=miczThunderStatsCore.accounts[acc_list.selectedItem.value].identities;
		dump(">>>>>>>>>>>>> miczThunderStatsPrefPanel: [onAccountChange] acc_list.selectedItem.value "+acc_list.selectedItem.value+"\r\n");
		dump(">>>>>>>>>>>>> miczThunderStatsPrefPanel: [onAccountChange] sel_account_identities "+JSON.stringify(sel_account_identities)+"\r\n");
		cstid_txtbox.value="";
		for(let ii in sel_account_identities){
			let curr_identity=miczThunderStatsCore.identities[sel_account_identities[ii]];
			if(curr_identity.custom){
				cstid_txtbox.value+=curr_identity.email+"\r\n";
			}
		}*/
		let sel_account_identities=miczThunderStatsPrefs.accountCustomIdentities(acc_list.selectedItem.value);
		cstid_txtbox.value=sel_account_identities.replace(',',"\r\n");
	},

	onCIAccountTextbox: function(){
		let acc_list = document.getElementById('ts_accnt_lst');
		let cstid_txtbox = document.getElementById('ts_cstmids');
		let ci_pref_string=cstid_txtbox.value.replace(/(?:\r\n|\r|\n)/g, ',');
		miczThunderStatsPrefs.saveAccountCustomIdentities(acc_list.selectedItem.value,ci_pref_string);
	},

	onDefaultAccountChange: function(){
		let strt_acc = document.getElementById('ts_strt_accnt');
		miczThunderStatsPrefs.setCharPref_TS('strt_acc',strt_acc.selectedItem.value);
	}
};
