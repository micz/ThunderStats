"use strict";
ChromeUtils.import("chrome://thunderstats/content/mzts-statscore.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-nobusinessday.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
ChromeUtils.import("resource://thunderstats/miczLogger.jsm");
ChromeUtils.import("resource://gre/modules/osfile.jsm");
Components.utils.importGlobalProperties(["XMLHttpRequest"]);

var miczThunderStatsPrefPanel = {

	nbd_objs:{},
	nbd_objs_length:0,

	onLoad: function(){

		//Setting the correct locale to display dates and times
		moment.locale(miczThunderStatsUtils.getCurrentSystemLocale());

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

		this.loadInfoFile('release_notes');

		this.loadNBDList('ThunderStats.NoBusinessDaysList');

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

	loadInfoFile:function(filetype){
		let url = '';
		switch(filetype){
			case 'release_notes':
				url ="chrome://tsrl/content/CHANGELOG.md";
				break;
			case 'license':
				url ="chrome://tsrl/content/LICENSE";
				break;
		 }
		let request = new XMLHttpRequest();
		request.responseType="text";
		request.addEventListener("load", function() {
			let relnotes = document.getElementById('mzts-release-notes');
			relnotes.value= this.responseText;
		});
		request.open("GET", url);
		request.send();
	},

// ======= BUSINESS DAYS FUNCTIONS =======
	updateNBDButtons: function(win){
		let doc = win.document;
		let currlist=doc.getElementById('ThunderStats.NoBusinessDaysList');
		let numSelected = currlist.selectedItems.length;
		let oneSelected = (numSelected == 1);
		if(oneSelected){
			doc.getElementById("editButtonNBD").disabled=false;
			doc.getElementById("deleteButtonNBD").disabled=false;
		}else{
			doc.getElementById("editButtonNBD").disabled=true;
			doc.getElementById("deleteButtonNBD").disabled=true;
		}
	},

	onNewNBDDate: function(){
		let doc = document;
		let container = doc.getElementById('ThunderStats.NoBusinessDaysList');
		let args = {"action":"new"};

		let features = (miczThunderStatsUtils.HostSystem == 'linux') ?
          'chrome,modal,titlebar,centerscreen,resizable,dependent,instantApply' :
          'chrome,modal,titlebar,centerscreen,resizable,alwaysRaised,instantApply';

		window.openDialog("chrome://thunderstats/content/mzts-settings-nobusinessdayeditor.xul", "NBDEditor", features, args);

		if (("save" in args && args.save)&& ("newnbd" in args && args.newnbd)){
			miczThunderStatsPrefPanel.createOneNBDRow(doc,container,args.newnbd,true);
			miczThunderStatsPrefPanel.saveNBDList();
			// Select the new nbd, it is at the end of the list.
			container.selectedIndex=container.itemCount-1;
			container.ensureIndexIsVisible(container.selectedIndex);
		}

	},

	onEditNBDDate: function(){
		let container = document.getElementById('ThunderStats.NoBusinessDaysList');

		if(container.selectedIndex==-1) return;
		if(document.getElementById("editButtonNBD").disabled) return;

		let args = {"action":"edit","newnbd":JSON.stringify(container.selectedItem._nbd)};

		window.openDialog("chrome://thunderstats/content/mzts-settings-nobusinessdayeditor.xul", "NBDEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		if (("save" in args && args.save)&& ("newnbd" in args && args.newnbd)){
			//update the cust col in the listbox
			miczThunderStatsPrefPanel.editOneNBDRow(document,container,args.newnbd,container.selectedIndex);
			miczThunderStatsPrefPanel.saveNBDList();
			// Select the edited nbd
			container.ensureIndexIsVisible(container.selectedIndex);
		}

	},

	onDeleteNBDDate: function(){
		let doc = document;
		let container = doc.getElementById('ThunderStats.NoBusinessDaysList');

		if(container.selectedIndex==-1) return;
		if(doc.getElementById("deleteButtonNBD").disabled) return;

		//Are you sure?
		let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		let _bundleCW = miczThunderStatsI18n.createBundle("settings");

		if(!prompts.confirm(null,_bundleCW.GetStringFromName("ThunderStats.deletePromptNBD.title"),_bundleCW.GetStringFromName("ThunderStats.deletePromptNBD.text"))) return;

		//get the col id
		let nbd_idx=container.selectedItem._nbd.tmp_id;
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [onDeleteCustomCol] col_idx ["+col_idx+"]\r\n");

		//remove the nbd from the listbox and save the list to the prefs
		miczThunderStatsPrefPanel.deleteOneNBDRow(container,container.selectedIndex);
		delete this.nbd_objs[nbd_idx];
		miczThunderStatsPrefPanel.saveNBDList();
	},

	createNBDRows:function(doc,container){
		for(let nbdr in this.nbd_objs){
			this.createOneNBDRow(doc,container,this.nbd_objs[nbdr],false);
		}
	},

	createOneNBDRow:function(doc,container,currcol,force_save_obj){
		if (!container) return;
		let listitem = doc.createElement("listitem");

		//dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] currcol {"+JSON.stringify(currcol)+"}\r\n");

		let nbd_date_string = miczThunderStatsNBD.formatNBDDateString(currcol,moment);
		currcol.date_string=nbd_date_string;
		let dateCell = doc.createElement("listcell");
		dateCell.setAttribute("label",nbd_date_string);
		listitem.appendChild(dateCell);

		let descCell = doc.createElement("listcell");
		descCell.setAttribute("label",currcol.desc);
		listitem.appendChild(descCell);

		if(force_save_obj){
			this.nbd_objs_length++;
			let nbd_tmp_id=this.nbd_objs_length;
			currcol.tmp_id=nbd_tmp_id;
			this.nbd_objs[nbd_tmp_id]=currcol;
			//dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] nbd_tmp_id {"+JSON.stringify(nbd_tmp_id)+"}\r\n");
			//dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] currcol.desc {"+JSON.stringify(currcol.desc)+"}\r\n");
		}

		listitem._nbd=currcol;

		container.appendChild(listitem);
		// We have to attach this listener to the listitem, even though we only care
		// about clicks on the enabledCell. However, attaching to that item doesn't
		// result in any events actually getting received.
		listitem.addEventListener("click", this.onNBDItemClick, true);
		listitem.addEventListener("dblclick", this.onNBDItemDoubleClick, true);
		return listitem;
	},

	editOneNBDRow:function(doc,container,currcol,idx_col){
		if (!container) return;
		let listitem = container.getItemAtIndex(idx_col);
		if(!listitem) return;

		//dump(">>>>>>>>>>>>> miczThunderStats: [editOneNBDRow] listitem "+JSON.stringify(listitem)+"\r\n");

		let nbd_date_string = miczThunderStatsNBD.formatNBDDateString(currcol,moment);
		currcol.date_string=nbd_date_string;
		let dateCell = listitem.childNodes[0];
		dateCell.setAttribute("label",nbd_date_string);

		let descCell = listitem.childNodes[1];
		descCell.setAttribute("label",currcol.desc);

		listitem._nbd=currcol;
		this.nbd_objs[currcol.tmp_id]=currcol;

		return listitem;
	},

	deleteOneNBDRow: function(container,col_idx){
		this.nbd_objs_length--;
		container.removeItemAt(col_idx);
	},

	onNBDItemClick: function(event)
	{
		//do nothing special
		return;
	},

	onNBDItemDoubleClick:function(event){
		// we only care about button 0 (left click) events
		if (event.button != 0)
		  return;

		miczThunderStatsPrefPanel.onEditNBDDate();
	},

	saveNBDList:function(){
		miczThunderStatsNBD.saveToPref(miczThunderStatsNBD.nbd_pref_name,this.nbd_objs);
	},

	loadNBDList:function(list_el){
		let container = document.getElementById(list_el);
		this.nbd_objs=miczThunderStatsNBD.readFromPref(miczThunderStatsNBD.nbd_pref_name);
		//reorder array
		this.reindexNBDArray();
		//dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] this.nbd_objs {"+JSON.stringify(this.nbd_objs)+"}\r\n");
		this.createNBDRows(document,container);
	},

	reindexNBDArray:function(){
		//dump(">>>>>>>>>>>>> miczThunderStats: [reindexNBDArray] this.nbd_objs BEFORE "+JSON.stringify(this.nbd_objs)+"\r\n");
		let tmp_array=new Array();
		for(let nn in this.nbd_objs){
			tmp_array.push(this.nbd_objs[nn]);
		}
		//sort data
		tmp_array.sort(miczThunderStatsUtils.array_nbd_date_compare);
		this.nbd_objs={};
		this.nbd_objs_length=0;
		let ri=1;
		for(let nbdr in tmp_array){
			tmp_array[nbdr].tmp_id=ri;
			this.nbd_objs[ri]=tmp_array[nbdr];
			this.nbd_objs_length++;
			ri++;
		}
		//dump(">>>>>>>>>>>>> miczThunderStats: [reindexNBDArray] this.nbd_objs AFTER "+JSON.stringify(this.nbd_objs)+"\r\n");
	},

	// ======= BUSINESS DAYS FUNCTIONS ======= END

};
