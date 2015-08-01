"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-statscore.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");
Components.utils.import("resource://gre/modules/osfile.jsm");

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

		//Load release notes
		/*let decoder = new TextDecoder();        // This decoder can be reused for several reads
		let promise = OS.File.read("chrome://thunderstats/release_notes.txt"); // Read the complete file as an array
		promise = promise.then(
		  function onSuccess(array) {
			  let relnotes = document.getElementById('mzts-release-notes');
			  relnotes.value=decoder.decode(array);	// Convert this array to a text
			  return;
		  }
		);*/

		let url = "chrome://tsrl/content/release_notes.txt";// "chrome://thunderstats/release_notes.txt";
		let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
					  .createInstance(Components.interfaces.nsIXMLHttpRequest);
		request.onload = function(aEvent) {
			let relnotes = document.getElementById('mzts-release-notes');
			relnotes.value= aEvent.target.responseText;
		};
		request.onerror = function(aEvent) {
		   miczLogger.log("Error reading release notes file status: " + aEvent.target.status,2);
		};
		request.open("GET", url, true);
		request.responseType = "text";
		request.send(null);

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
	},

	// ======= BUSINESS DAYS FUNCTIONS =======
	updateButtons: function(win){
		let doc = win.document;
		let currlist=doc.getElementById('ThunderStats.NoBusinessDaysList');
		let numSelected = currlist.selectedItems.length;
		let oneSelected = (numSelected == 1);
		if(oneSelected){
			doc.getElementById("editButton").disabled=true;
			doc.getElementById("deleteButton").disabled=true;
		}else{
			doc.getElementById("editButton").disabled=false;
			doc.getElementById("deleteButton").disabled=false;
		}
	},

	onNewNBDDate: function(win){
		let doc = win.document;
		let container = doc.getElementById('ThunderStats.NoBusinessDaysList');
		let args = {"action":"new"};

		window.openDialog("chrome://thunderstats/content/mzts-settings-nobusinessdayeditor.xul", "NBDEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		if (("save" in args && args.save)&& ("newcol" in args && args.newcol)){
			/*miczColumnsWizard_CustCols.addNewCustCol(args.newcol);
			miczColumnsWizardPref_CustomColsGrid.createOneCustomColRow(doc,container,args.newcol);
			// Select the new custcols, it is at the end of the list.
			container.selectedIndex=container.itemCount-1;
			container.ensureIndexIsVisible(container.selectedIndex);*/
		}

	},

	onEditNBDDate: function(win){
		let doc = win.document;
		let container = doc.getElementById('ThunderStats.NoBusinessDaysList');

		if(container.selectedIndex==-1) return;
		if(doc.getElementById("editButtonBD").disabled) return;

		let args = {"action":"edit","currcol":JSON.stringify(container.selectedItem._customcol)};

		window.openDialog("chrome://columnswizard/content/mzcw-settings-customcolseditor.xul", "CustColsEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		if (("save" in args && args.save)&& ("newcol" in args && args.newcol)){
			/*//save the cust col in the pref
			miczColumnsWizard_CustCols.updateCustCol(args.newcol);
			//update the cust col in the listbox
			miczColumnsWizardPref_CustomColsGrid.editOneCustomColRow(doc,container,args.newcol,container.selectedIndex);
			// Select the editedcustcols
			container.ensureIndexIsVisible(container.selectedIndex);*/
		}

	},

	onDeleteNBDDate: function(win){
		let doc = win.document;
		let container = doc.getElementById('ThunderStats.NoBusinessDaysList');

		if(container.selectedIndex==-1) return;
		if(doc.getElementById("deleteButtonBD").disabled) return;

		//Are you sure?
		let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://thunderstats/locale/settings.properties");

		if(!prompts.confirm(null,_bundleCW.GetStringFromName("ThunderStats.deletePromptBD.title"),_bundleCW.GetStringFromName("ThunderStats.deletePromptBD.text"))) return;

		//get the col id
		/*let col_idx=container.selectedItem._customcol.index;
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [onDeleteCustomCol] col_idx ["+col_idx+"]\r\n");

		//delete the custom col
		let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		//miczColumnsWizard_CustCols.removeCustomColumn(col_idx,ObserverService)
		//miczColumnsWizard_CustCols.deleteCustCol(col_idx);
		ObserverService.notifyObservers(null,"CW-deleteCustomColumn",col_idx);

		//remove the custom col from the listbox
		miczColumnsWizardPref_CustomColsGrid.deleteOneCustomColRow(container,container.selectedIndex);*/
	},

	// ======= BUSINESS DAYS FUNCTIONS ======= END

};
