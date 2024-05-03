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

var miczThunderStatsPrefPanel = {

    nbd_objs: {},
    nbd_objs_length: 0,
    nbd_tableList: {},

    onLoad: function () {

        let context = {};
        // Services.console.logStringMessage("dialog onLoad event handler - load preferences");
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

        // Services.console.logStringMessage("Preferences 1: onload added preferences ");
        // Services.console.logStringMessage("Preferences 1: onload added preferences " + Preferences.get("ThunderStats.many_days").name + "\nPn: " + Preferences.get("ThunderStats.many_days").value);

        const elements = document.querySelectorAll(`[preference]`);
        // const elements = Preferences.getElementsByAttribute("preference");
        for (const element of elements) {
            const p = Preferences.get(element.getAttribute("preference"));
            // Services.console.logStringMessage("Preferences 1: onload loaded  " + element.id + "  " + p.value);
            p.setElementValue(element);
        }


        const versionChecker = Services.vc;
        const currentVersion = Services.appinfo.platformVersion;

        // cleidigh - TB68 groupbox needs hbox/label
        if (versionChecker.compare(currentVersion, "61") >= 0) {
            var captions = document.querySelectorAll("caption");
            for (let i = 0; i < captions.length; i++) {
                captions[i].style.display = "none";
            }
        } else {
            var groupboxtitles = document.querySelectorAll(".groupbox-title");
            for (let i = 0; i < groupboxtitles.length; i++) {
                groupboxtitles[i].style.display = "none";
            }
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
        // Services.console.logStringMessage(miczThunderStatsCore.accounts);
        let s = _bundleCW.GetStringFromName("ThunderStats.AllAccounts");

        strt_acc.appendItem(_bundleCW.GetStringFromName("ThunderStats.AllAccounts"), 0);

        for (let key in miczThunderStatsCore.accounts) {
            // Services.console.logStringMessage('account key ' + miczThunderStatsCore.accounts[key].name + " " + key);
            acc_list.appendItem(miczThunderStatsCore.accounts[key].name, key);
            let curr_item = strt_acc.appendItem(miczThunderStatsCore.accounts[key].name, key);
            if (key == chosen_strt_acc) {
                strt_acc_sel_idx = strt_acc.getIndexOfItem(curr_item);
            }
        }

        strt_acc.selectedIndex = strt_acc_sel_idx;
        acc_list.selectedIndex = strt_acc_sel_idx;
        this.onCIAccountChange();

        this.loadInfoFile('release_notes');

        var table_box = document.getElementById('nbd_table_box');
        var table_container = document.getElementById('nbd_table_container');
        const hwidth = window.getComputedStyle(table_box, null).getPropertyValue('width');
        var nbd_table = document.getElementById('nbd_table');
        nbd_table.width = hwidth;
        table_container.width = hwidth;

        /* List.js is required to make this table work. */

        Document.prototype.createElement = function (e) {
            var element = document.createElementNS("http://www.w3.org/1999/xhtml", e);
            return element;
        };

        var options = {
            valueNames: ['date', 'description', 'yearly', { data: ['id'] }],
            item: '<tr class="list-row"><td class="date"></td><td class="description"></td><td class="yearly"></td></tr>'
        };

        miczThunderStatsPrefPanel.nbd_tableList = new List('nbd_table_container', options);
        miczThunderStatsPrefPanel.nbd_tableList.controller = new ListController(miczThunderStatsPrefPanel.nbd_tableList, { onSelectedCB: this.onSelectListRow });

        this.loadNBDList('ThunderStats.NoBusinessDaysList');

        //Fixing window height
        sizeToContent();
        var vbox = document.getElementById('ts_tabbox');
        vbox.height = vbox.boxObject.height;
        sizeToContent();

        // let e = document.getElementById('nbd_table_container');
        // e.focus();
        // size non business day table
        // miczThunderStatsPrefPanel.nbd_tableList.controller.list_container.focus();
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
            let relnotes = document.getElementById('mzts-release-notes');
            relnotes.value = this.responseText;
        };
        request.open("GET", url);
        request.send(null);
    },

    // ======= BUSINESS DAYS FUNCTIONS =======
    updateNBDButtons: function (win) {
        // Services.console.logStringMessage("update buttons event");
        let doc = win.document;

        let numSelected = 1;
        let oneSelected = (numSelected == 1);
        if (oneSelected) {
            Services.console.logStringMessage("update buttons now");
            doc.getElementById("editButtonNBD").disabled = false;
            doc.getElementById("deleteButtonNBD").disabled = false;
        } else {
            doc.getElementById("editButtonNBD").disabled = true;
            doc.getElementById("deleteButtonNBD").disabled = true;
        }
    },

    onNewNBDDate: function () {
        let doc = document;
        let container = miczThunderStatsPrefPanel.nbd_tableList;
        let args = { "action": "new" };

        let features = (miczThunderStatsUtils.HostSystem == 'linux') ?
            'chrome,modal,titlebar,centerscreen,resizable,dependent,instantApply' :
            'chrome,modal,titlebar,centerscreen,resizable,alwaysRaised,instantApply';

        window.openDialog("chrome://thunderstats/content/mzts-settings-nobusinessdayeditor.xhtml", "NBDEditor", features, args);

        // Services.console.logStringMessage("arguments "+ JSON.stringify(args));

        if (("save" in args && args.save) && ("newnbd" in args && args.newnbd)) {
            miczThunderStatsPrefPanel.createOneNBDRow(doc, container, args.newnbd, true);
            Services.console.logStringMessage("new d " + doc.getElementById('nbd_table').outerHTML);

            miczThunderStatsPrefPanel.saveNBDList();
            // Select the new nbd, it is at the end of the list.
            miczThunderStatsPrefPanel.nbd_tableList.controller.selectRowByDataId('1');
        } else {
            let e = document.getElementById('weekday1');
            miczThunderStatsPrefPanel.nbd_tableList.controller.selectRowByDataId('-1');
            e.focus();

        }
    },

    onEditNBDDate: function () {
        let container = document.getElementById('ThunderStats.NoBusinessDaysList');

        if (document.getElementById("editButtonNBD").disabled) return;

        let nbd_idx = miczThunderStatsPrefPanel.nbd_tableList.list.getAttribute('selected-index');
        if (nbd_idx === '') {
            return;
        }

        let args = { "action": "edit", "newnbd": JSON.stringify(this.nbd_objs[nbd_idx]) };

        window.openDialog("chrome://thunderstats/content/mzts-settings-nobusinessdayeditor.xhtml", "NBDEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

        if (("save" in args && args.save) && ("newnbd" in args && args.newnbd)) {
            //update the cust col in the listbox
            miczThunderStatsPrefPanel.editOneNBDRow(document, container, args.newnbd, 0);
            miczThunderStatsPrefPanel.saveNBDList();
            // Select the edited nbd
            miczThunderStatsPrefPanel.nbd_tableList.controller.selectRowByDataId(nbd_idx);
            let e = document.getElementById('nbd_table_container');
            e.focus();
        } else {
            miczThunderStatsPrefPanel.nbd_tableList.controller.selectRowByDataId(nbd_idx);
            let e = document.getElementById('nbd_table_container');
            e.focus();

        }


    },

    onDeleteNBDDate: function () {
        let doc = document;

        let nbd_idx = miczThunderStatsPrefPanel.nbd_tableList.list.getAttribute('selected-index');
        //Are you sure?
        let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
        let _bundleCW = miczThunderStatsI18n.createBundle("settings");

        if (!prompts.confirm(null, _bundleCW.GetStringFromName("ThunderStats.deletePromptNBD.title"), _bundleCW.GetStringFromName("ThunderStats.deletePromptNBD.text"))) return;

        //dump(">>>>>>>>>>>>> miczColumnsWizard: [onDeleteCustomCol] col_idx ["+col_idx+"]\r\n");

        if (nbd_idx === '') {
            return;
        }
        Services.console.logStringMessage('Delete ' + nbd_idx);
        miczThunderStatsPrefPanel.nbd_tableList.remove('id', nbd_idx);

        let entry = document.activeElement;
        //remove the nbd from the listbox and save the list to the prefs
        delete this.nbd_objs[nbd_idx];
        this.nbd_objs_length--;

        //reorder array
        this.reindexNBDArray();
        miczThunderStatsPrefPanel.saveNBDList();

        // clear list/rebuild
        miczThunderStatsPrefPanel.nbd_tableList.clear();
        this.createNBDRows(document, miczThunderStatsPrefPanel.nbd_tableList);
        miczThunderStatsPrefPanel.nbd_tableList.controller.selectRowByDataId('1');
    },

    createNBDRows: function (doc, container) {
        for (let nbdr in this.nbd_objs) {
            this.createOneNBDRow(doc, container, this.nbd_objs[nbdr], false);
        }
    },

    createOneNBDRow: function (doc, container, cur_nbdobj, force_save_obj) {
        if (!container) return;


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


    },

    onSelectListRow(event, data_id) {
        Services.console.logStringMessage("onSelectListRow call " + event.type + " " + data_id);
        if (event.type === 'onclick') {
            miczThunderStatsPrefPanel.onNBDItemClick(event, data_id);

        } else {
            Services.console.logStringMessage("enable buttons");
            miczThunderStatsPrefPanel.updateNBDButtons(window);
        }
    },


    editOneNBDRow: function (doc, container, cur_nbdobj, idx_col) {
        // let doc = document;
        // if (!container) return;
        Services.console.logStringMessage("EditRow");
        let nbd_idx = miczThunderStatsPrefPanel.nbd_tableList.list.getAttribute('selected-index');
        if (nbd_idx === '') {
            return;
        }

        // Services.console.logStringMessage(">>>>>>>>>>>>> miczThunderStats: [editOneNBDRow] listitem "+JSON.stringify(cur_nbdobj)+"\r\n");

        let nbd_date_string = miczThunderStatsNBD.formatNBDDateString(cur_nbdobj, moment);
        cur_nbdobj.date_string = nbd_date_string;

        let item = miczThunderStatsPrefPanel.nbd_tableList.get("id", nbd_idx)[0];

        item.values({
            date: cur_nbdobj.date,
            description: cur_nbdobj.desc,
            yearly: cur_nbdobj.every_year,
            id: cur_nbdobj.nbd_idx,
        });

        this.nbd_objs[cur_nbdobj.tmp_id] = cur_nbdobj;
        return;
    },

    deleteOneNBDRow: function (container, col_idx) {
        this.nbd_objs_length--;
    },

    onNBDItemClick: function (event, data_id) {
        //do nothing special
        Services.console.logStringMessage("onSelectListRow onItemClick");
        var selector = 'tr'
        var iel = event.target.closest(selector)
        Services.console.logStringMessage("iel " + iel);
        if (!iel) return
        var id = iel.getAttribute('data-id');

        let nbd_idx = miczThunderStatsPrefPanel.nbd_tableList.list.getAttribute('selected-index');
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
        Services.console.logStringMessage("Save nonbusiness " + this.nbd_objs.length + " " + JSON.stringify(this.nbd_objs));
        miczThunderStatsNBD.saveToPref(miczThunderStatsNBD.nbd_pref_name, this.nbd_objs);
    },

    loadNBDList: function (list_el) {
        // let container = document.getElementById(list_el);
        let container = miczThunderStatsPrefPanel.nbd_tableList;
        this.nbd_objs = miczThunderStatsNBD.readFromPref(miczThunderStatsNBD.nbd_pref_name);

        Services.console.logStringMessage("Load NBDs: " + this.nbd_objs.length + " " + JSON.stringify(this.nbd_objs));
        //reorder array
        this.reindexNBDArray();
        // dump(">>>>>>>>>>>>> miczThunderStats: [createOneCustomColRow] this.nbd_objs {"+JSON.stringify(this.nbd_objs)+"}\r\n");
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
    return true;
});


document.addEventListener('dialogaccept', function (e) {
    // Call our handler function - could be done here
    // onDialogAccept(e);
    return false;
});

window.addEventListener("load", function (e) { miczThunderStatsPrefPanel.onLoad(e); }, false);