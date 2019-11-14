"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

var { miczThunderStatsCore } = ChromeUtils.import("chrome://thunderstats/content/mzts-statscore.jsm");
var { miczThunderStatsPrefs } = ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
var { miczThunderStatsI18n } = ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
var { miczThunderStatsDB } = ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
var { miczThunderStatsNBD } = ChromeUtils.import("chrome://thunderstats/content/mzts-nobusinessday.jsm");
var { miczThunderStatsUtils } = ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
var { miczLogger } = ChromeUtils.import("resource://thunderstats/miczLogger.jsm");
var { OS } = ChromeUtils.import("resource://gre/modules/osfile.jsm");

// Services.console.logStringMessage("setting after imports");

var miczThunderStatsPrefPanel = {

    nbd_objs: {},
    nbd_objs_length: 0,
    nbd_tableList: {},

    onLoad: function () {

        let context = {};
        Services.console.logStringMessage("dialog onLoad event handler - load preferences");
        Services.scriptloader.loadSubScript("chrome://global/content/preferencesBindings.js", context, "UTF-8" /* The script's encoding */);

        Preferences.addAll([
            { id: "ThunderStats.identities_selector", name: "extensions.ThunderStats.identities_selector", type: "bool" },
            { id: "ThunderStats.inbox_search_only_curr_account", name: "extensions.ThunderStats.inbox_search_only_curr_account", type: "bool" },
            { id: "ThunderStats.global_update", name: "extensions.ThunderStats.global_update", type: "bool" },
            { id: "ThunderStats.debug", name: "extensions.ThunderStats.debug", type: "bool" },
            { id: "ThunderStats.debug_warn_show", name: "extensions.ThunderStats.debug_warn_show", type: "bool" },
            { id: "ThunderStats.folderspreadgraph_openinfirsttab", name: "extensions.ThunderStats.folderspreadgraph_openinfirsttab", type: "bool" },
            { id: "ThunderStats.today_time_graph_show_yesterday", name: "extensions.ThunderStats.today_time_graph_show_yesterday", type: "bool" },
            { id: "ThunderStats.today_time_graph_progressive", name: "extensions.ThunderStats.today_time_graph_progressive", type: "bool" },
            { id: "ThunderStats.aggregate_average_not_rounded", name: "extensions.ThunderStats.aggregate_average_not_rounded", type: "bool" },
            { id: "ThunderStats.many_days", name: "extensions.ThunderStats.many_days", type: "int" },
            { id: "ThunderStats.many_days_small_labels", name: "extensions.ThunderStats.many_days_small_labels", type: "bool" },
            { id: "ThunderStats.bday.use_last_business_day", name: "extensions.ThunderStats.bday.use_last_business_day", type: "bool" },
            { id: "ThunderStats.bday.easter", name: "extensions.ThunderStats.bday.easter", type: "bool" },
            { id: "ThunderStats.bday.weekday0", name: "extensions.ThunderStats.bday.weekday0", type: "bool" },
            { id: "ThunderStats.bday.weekday1", name: "extensions.ThunderStats.bday.weekday1", type: "bool" },
            { id: "ThunderStats.bday.weekday2", name: "extensions.ThunderStats.bday.weekday2", type: "bool" },
            { id: "ThunderStats.bday.weekday3", name: "extensions.ThunderStats.bday.weekday3", type: "bool" },
            { id: "ThunderStats.bday.weekday4", name: "extensions.ThunderStats.bday.weekday4", type: "bool" },
            { id: "ThunderStats.bday.weekday5", name: "extensions.ThunderStats.bday.weekday5", type: "bool" },
            { id: "ThunderStats.bday.weekday6", name: "extensions.ThunderStats.bday.weekday6", type: "bool" },
            { id: "ThunderStats.customquery_bookmark_immediate_update", name: "extensions.ThunderStats.customquery_bookmark_immediate_update", type: "bool" },
            { id: "ThunderStats.customquery_default_only_bd", name: "extensions.ThunderStats.customquery_default_only_bd", type: "bool" },
            { id: "ThunderStats.involved_num", name: "extensions.ThunderStats.involved_num", type: "int" },
            { id: "ThunderStats.involvedtable_forceidentityname", name: "extensions.ThunderStats.involvedtable_forceidentityname", type: "bool" },
        ]);

        Services.console.logStringMessage("Preferences 1: onload added preferences ");
        // Preferences.updateElements();
        Services.console.logStringMessage("Preferences 1: onload added preferences " + Preferences.get("ThunderStats.many_days").name + "\nPn: " + Preferences.get("ThunderStats.many_days").value);

        const elements = document.querySelectorAll(`[preference]`);
        // const elements = Preferences.getElementsByAttribute("preference");
        for (const element of elements) {
            const p = Preferences.get(element.getAttribute("preference"));
            Services.console.logStringMessage("Preferences 1: onload loaded  " + element.id + "  " + p.value);
            p.setElementValue(element);
        }

        //Setting the correct locale to display dates and times
        moment.locale(miczThunderStatsUtils.getCurrentSystemLocale());

        // cleidigh how did this get done before?
        miczThunderStatsDB.init();
        miczThunderStatsCore.loadIdentities();
        miczThunderStatsDB.close();

        //Loading accounts
        let chosen_strt_acc = miczThunderStatsPrefs.getCharPref_TS('strt_acc');
        let acc_list = document.getElementById('ts_accnt_lst');
        let strt_acc = document.getElementById('ts_strt_accnt');
        let strt_acc_sel_idx = 0;
        let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
        console.debug(miczThunderStatsCore.accounts);
        let s = _bundleCW.GetStringFromName("ThunderStats.AllAccounts");

        strt_acc.appendItem(_bundleCW.GetStringFromName("ThunderStats.AllAccounts"), 0);

        for (let key in miczThunderStatsCore.accounts) {
            Services.console.logStringMessage('account key ' + miczThunderStatsCore.accounts[key].name + " " + key);
            acc_list.appendItem(miczThunderStatsCore.accounts[key].name, key);
            let curr_item = strt_acc.appendItem(miczThunderStatsCore.accounts[key].name, key);
            if (key == chosen_strt_acc) {
                strt_acc_sel_idx = strt_acc.getIndexOfItem(curr_item);
            }
        }

        strt_acc.selectedIndex = strt_acc_sel_idx;
        acc_list.selectedIndex = strt_acc_sel_idx;
        this.onCIAccountChange();

        Services.console.logStringMessage('start index ' + strt_acc.selectedIndex);
        this.loadInfoFile('release_notes');

        
        // const nbd_table = document.getElementById('tableID');
        // let total_table_width = window.getComputedStyle(nbd_table, null).getPropertyValue('width');
        // console.debug('TableWith '+total_table_width); 
        // Services.console.logStringMessage("get table with "+total_table_width);
        const nbd_description_header = document.getElementById('description_header');
        // const hw = Number(total_table_width) - 160;
        // nbd_description_header.className += 'wider';
        // nbd_description_header.style.width = 300;
        var table_box = document.getElementById('nbd_table_box');
        var table_container = document.getElementById('tableID');
        const hwidth = window.getComputedStyle(table_box, null).getPropertyValue('width');

        Services.console.logStringMessage("get header with before " + hwidth);

        Services.console.logStringMessage("get table width after " + table_container.width);
        var nbd_table = document.getElementById('nbd_table');
        // nbd_table.width = table_container.width;
        nbd_table.width = hwidth;
        table_container.width = hwidth;
        Services.console.logStringMessage("get table width after " + nbd_table.width);

        /* List.js is required to make this table work. */

        Document.prototype.createElement = function (e) {
            var element = document.createElementNS("http://www.w3.org/1999/xhtml", e);
            return element;
        };

        var options = {
            //   valueNames: [ { data: ['date'] }, { data: ['description'] }, { data: ['yearly']} ],
            valueNames: ['date', 'description', 'yearly', { data: ['id']}],
            item: '<tr tabindex="0" class="list-row"><td class="date"></td><td class="description"></td><td class="yearly"></td></tr>'
        };

        miczThunderStatsPrefPanel.nbd_tableList = new List('tableID', options);
        miczThunderStatsPrefPanel.nbd_tableList.controller = new ListController(miczThunderStatsPrefPanel.nbd_tableList, {onSelectListRow: this.onSelectListRow});
        Services.console.logStringMessage("after table constructor");

        // miczThunderStatsPrefPanel.nbd_tableList.add({
        //     date: "11-6",
        //     description: "my birthday yeah",
        //     yearly: "True",
        // });

        Services.console.logStringMessage("get table info");
        this.loadNBDList('ThunderStats.NoBusinessDaysList');

        // nbd_table.addEventListener("click", this.onNBDItemClick, true);

        // Services.console.logStringMessage("after table add");
        //Fixing window height
        sizeToContent();
        var vbox = document.getElementById('ts_tabbox');
        vbox.height = vbox.boxObject.height;
        sizeToContent();

        // size non business day table
    },

    onCIAccountChange: function () {
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
        let sel_account_identities = miczThunderStatsPrefs.accountCustomIdentities(acc_list.selectedItem.value);
        cstid_txtbox.value = sel_account_identities.replace(',', "\r\n");
    },

    onCIAccountTextbox: function () {
        let acc_list = document.getElementById('ts_accnt_lst');
        let cstid_txtbox = document.getElementById('ts_cstmids');
        let ci_pref_string = cstid_txtbox.value.replace(/(?:\r\n|\r|\n)/g, ',');
        miczThunderStatsPrefs.saveAccountCustomIdentities(acc_list.selectedItem.value, ci_pref_string);
    },

    onDefaultAccountChange: function () {
        let strt_acc = document.getElementById('ts_strt_accnt');
        miczThunderStatsPrefs.setCharPref_TS('strt_acc', strt_acc.selectedItem.value);
    },

    loadInfoFile: function (filetype) {
        console.debug('load file');
        let url = '';
        switch (filetype) {
            case 'release_notes':
                url = "chrome://tsrl/content/CHANGELOG.md";
                break;
            case 'license':
                url = "chrome://tsrl/content/LICENSE";
                break;
        }
        let request = new XMLHttpRequest();
        request.responseType = "text";
        // request.addEventListener("load", function() {
        request.onload = function () {
            console.debug('Onload');
            console.debug(this.responseText);
            let relnotes = document.getElementById('mzts-release-notes');
            relnotes.value = this.responseText;
        };
        request.open("GET", url);
        request.send(null);
        console.debug('after said');
    },

    // ======= BUSINESS DAYS FUNCTIONS =======
         updateNBDButtons: function (win) {
        Services.console.logStringMessage("update buttons event");
        let doc = win.document;
        Services.console.logStringMessage("after table event"+doc.getElementById( 'tableID').outerHTML);
        // let currlist = doc.getElementById('ThunderStats.NoBusinessDaysList');
        // let numSelected = currlist.selectedItems.length;
        let numSelected = 1;
        let oneSelected = (numSelected == 1);
        if (oneSelected) {
            doc.getElementById("editButtonNBD").disabled = false;
            doc.getElementById("deleteButtonNBD").disabled = false;
        } else {
            doc.getElementById("editButtonNBD").disabled = true;
            doc.getElementById("deleteButtonNBD").disabled = true;
        }
    },

    onNewNBDDate: function () {
        let doc = document;
        // let container = doc.getElementById('ThunderStats.NoBusinessDaysList');
        let container = miczThunderStatsPrefPanel.nbd_tableList;
        let args = { "action": "new" };

        let features = (miczThunderStatsUtils.HostSystem == 'linux') ?
            'chrome,modal,titlebar,centerscreen,resizable,dependent,instantApply' :
            'chrome,modal,titlebar,centerscreen,resizable,alwaysRaised,instantApply';

        window.openDialog("chrome://thunderstats/content/fp3.xhtml", "NBDEditor", features, args);
        // window.openDialog("chrome://thunderstats/content/mzts-settings-nobusinessdayeditor.xul", "NBDEditor", features, args);

        // window.open("chrome://thunderstats/content/fp3.xhtml", "NBDEditor", features, args);
        Services.console.logStringMessage("arguments "+ JSON.stringify(args));

        if (("save" in args && args.save) && ("newnbd" in args && args.newnbd)) {
            Services.console.logStringMessage("new nonbusiness ");

            miczThunderStatsPrefPanel.createOneNBDRow(doc, container, args.newnbd, true);
            miczThunderStatsPrefPanel.saveNBDList();
            // Select the new nbd, it is at the end of the list.
            container.selectedIndex = container.itemCount - 1;
            container.ensureIndexIsVisible(container.selectedIndex);
        }

    },

    onEditNBDDate: function () {
        let container = document.getElementById('ThunderStats.NoBusinessDaysList');

        if (container.selectedIndex == -1) return;
        if (document.getElementById("editButtonNBD").disabled) return;

        let args = { "action": "edit", "newnbd": JSON.stringify(container.selectedItem._nbd) };

        window.openDialog("chrome://thunderstats/content/mzts-settings-nobusinessdayeditor.xul", "NBDEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

        if (("save" in args && args.save) && ("newnbd" in args && args.newnbd)) {
            //update the cust col in the listbox
            miczThunderStatsPrefPanel.editOneNBDRow(document, container, args.newnbd, container.selectedIndex);
            miczThunderStatsPrefPanel.saveNBDList();
            // Select the edited nbd
            container.ensureIndexIsVisible(container.selectedIndex);
        }

    },

    onDeleteNBDDate: function () {
        let doc = document;
        
        // let container = doc.getElementById('ThunderStats.NoBusinessDaysList');

        // if (container.selectedIndex == -1) return;
        // if (doc.getElementById("deleteButtonNBD").disabled) return;

        //Are you sure?
        let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
        let _bundleCW = miczThunderStatsI18n.createBundle("settings");

        if (!prompts.confirm(null, _bundleCW.GetStringFromName("ThunderStats.deletePromptNBD.title"), _bundleCW.GetStringFromName("ThunderStats.deletePromptNBD.text"))) return;

        //get the col id
        // let nbd_idx = container.selectedItem._nbd.tmp_id;
        //dump(">>>>>>>>>>>>> miczColumnsWizard: [onDeleteCustomCol] col_idx ["+col_idx+"]\r\n");
        let nbd_idx = doc.getElementById('nbd_table').getAttribute('selected-index');
        if (nbd_idx === '') {
            return;
        }
        miczThunderStatsPrefPanel.nbd_tableList.remove('id', nbd_idx);
        doc.getElementById('nbd_table').setAttribute('selected-index', '');
        // let nbd_idx = container.selectedItem._nbd.tmp_id;
        Services.console.logStringMessage("get active");
        let entry = document.activeElement;
        Services.console.logStringMessage("act development "+entry.outerHTML);
        //remove the nbd from the listbox and save the list to the prefs
        // miczThunderStatsPrefPanel.deleteOneNBDRow(container, container.selectedIndex);
        delete this.nbd_objs[nbd_idx];
        miczThunderStatsPrefPanel.saveNBDList();
    },

    createNBDRows: function (doc, container) {
        for (let nbdr in this.nbd_objs) {
            this.createOneNBDRow(doc, container, this.nbd_objs[nbdr], false);
        }
    },

    createOneNBDRow: function (doc, container, cur_nbdobj, force_save_obj) {
        if (!container) return;

        Services.console.logStringMessage("new nonbusiness create one");

        miczThunderStatsPrefPanel.nbd_tableList.add({
            date: cur_nbdobj.date,
            description: cur_nbdobj.desc,
            yearly: cur_nbdobj.every_year,
            id: cur_nbdobj.tmp_id,
        });

        cur_nbdobj.nbd_date_string = miczThunderStatsNBD.formatNBDDateString(cur_nbdobj, moment);
        if (force_save_obj) {
            this.nbd_objs_length++;
            let nbd_tmp_id = this.nbd_objs_length;
            cur_nbdobj.tmp_id = nbd_tmp_id;
            this.nbd_objs[nbd_tmp_id] = cur_nbdobj;
            //dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] nbd_tmp_id {"+JSON.stringify(nbd_tmp_id)+"}\r\n");
            //dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] currcol.desc {"+JSON.stringify(currcol.desc)+"}\r\n");
        }

        Services.console.logStringMessage("new nonbusiness finish");
/* 

        let listitem = doc.createElement("listitem");

        let nbd_date_string = miczThunderStatsNBD.formatNBDDateString(currcol, moment);
        currcol.date_string = nbd_date_string;
        let dateCell = doc.createElement("listcell");
        dateCell.setAttribute("label", nbd_date_string);
        listitem.appendChild(dateCell);

        let descCell = doc.createElement("listcell");
        descCell.setAttribute("label", currcol.desc);
        listitem.appendChild(descCell);
        if (force_save_obj) {
            this.nbd_objs_length++;
            let nbd_tmp_id = this.nbd_objs_length;
            cur_nbdobj.tmp_id = nbd_tmp_id;
            this.nbd_objs[nbd_tmp_id] = cur_nbdobj;
            //dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] nbd_tmp_id {"+JSON.stringify(nbd_tmp_id)+"}\r\n");
            //dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] currcol.desc {"+JSON.stringify(currcol.desc)+"}\r\n");
        }

        listitem._nbd = currcol;

        container.appendChild(listitem);
        // We have to attach this listener to the listitem, even though we only care
        // about clicks on the enabledCell. However, attaching to that item doesn't
        // result in any events actually getting received.
        listitem.addEventListener("click", this.onNBDItemClick, true);
        listitem.addEventListener("dblclick", thi.onNBDItemDoubleClick, true);
        return listitem;
     */
    
    },

    onSelectListRow(event,data_id) {
        Services.console.logStringMessage("onSelectListRow call");
        this.onNBDItemClick();
    },


    editOneNBDRow: function (doc, container, currcol, idx_col) {
        if (!container) return;
        let listitem = container.getItemAtIndex(idx_col);
        if (!listitem) return;

        //dump(">>>>>>>>>>>>> miczThunderStats: [editOneNBDRow] listitem "+JSON.stringify(listitem)+"\r\n");

        let nbd_date_string = miczThunderStatsNBD.formatNBDDateString(currcol, moment);
        currcol.date_string = nbd_date_string;
        let dateCell = listitem.childNodes[0];
        dateCell.setAttribute("label", nbd_date_string);

        let descCell = listitem.childNodes[1];
        descCell.setAttribute("label", currcol.desc);

        listitem._nbd = currcol;
        this.nbd_objs[currcol.tmp_id] = currcol;

        return listitem;
    },

    deleteOneNBDRow: function (container, col_idx) {
        this.nbd_objs_length--;
        // container.removeItemAt(col_idx);
    },

    onNBDItemClick: function (event) {
        //do nothing special
        var selector = 'tr'
        var iel = event.target.closest(selector)
        if (!iel) return
        var id = iel.getAttribute('data-id');
        Services.console.logStringMessage("table click 1");
        Services.console.logStringMessage("table click "+id);

        document.getElementById('nbd_table').setAttribute('selected-index', id);
        Services.console.logStringMessage("table click "+iel.outerHTML);
        miczThunderStatsPrefPanel.updateNBDButtons(window);
        return;
    },

    onNBDItemDoubleClick: function (event) {
        // we only care about button 0 (left click) events
        if (event.button != 0)
            return;

        miczThunderStatsPrefPanel.onEditNBDDate();
    },

    saveNBDList: function () {
        miczThunderStatsNBD.saveToPref(miczThunderStatsNBD.nbd_pref_name, this.nbd_objs);
    },

    loadNBDList: function (list_el) {
        // let container = document.getElementById(list_el);
        let container = miczThunderStatsPrefPanel.nbd_tableList;
        this.nbd_objs = miczThunderStatsNBD.readFromPref(miczThunderStatsNBD.nbd_pref_name);
        
        Services.console.logStringMessage("load nonbusiness "+JSON.stringify(this.nbd_objs));
        //reorder array
        // this.reindexNBDArray();
        dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] this.nbd_objs {"+JSON.stringify(this.nbd_objs)+"}\r\n");
        this.createNBDRows(document, container);
    },

    reindexNBDArray: function () {
        //dump(">>>>>>>>>>>>> miczThunderStats: [reindexNBDArray] this., BEFORE "+JSON.stringify(this.nbd_objs)+"\r\n");
        let tmp_array = new Array();
        for (let nn in this.nbd_objs) {
            tmp_array.push(this.nbd_objs[nn]);
        }
        //sort data
        tmp_array.sort(miczThunderStatsUtils.array_nbd_date_compare);
        this.nbd_objs = {};
        this.nbd_objs_length = 0;
        let ri = 1;
        for (let nbdr in tmp_array) {
            tmp_array[nbdr].tmp_id = ri;
            this.nbd_objs[ri] = tmp_array[nbdr];
            this.nbd_objs_length++;
            ri++;
        }
        //dump(">>>>>>>>>>>>> miczThunderStats: [reindexNBDArray] this.nbd_objs AFTER "+JSON.stringify(this.nbd_objs)+"\r\n");
    },

    // ======= BUSINESS DAYS FUNCTIONS ======= END

};


document.addEventListener('dialogcancel', function (e) {
    Services.console.logStringMessage("Preferences 1: dialogcancel event handler");
    return true;
});


document.addEventListener('dialogaccept', function (e) {
    Services.console.logStringMessage("Preferences 1: dialogaccept event handler");
    // Call our handler function - could be done here
    // onDialogAccept(e);
    return false;
});

window.addEventListener("load", function (e) { miczThunderStatsPrefPanel.onLoad(e); }, false);