"use strict";
var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

var { miczThunderStatsI18n } = ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
var { miczThunderStatsNBD } = ChromeUtils.import("chrome://thunderstats/content/mzts-nobusinessday.jsm");
var { miczThunderStatsUtils } = ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
var { fixIterator } = ChromeUtils.import("resource:///modules/iteratorUtils.jsm");
var { miczLogger } = ChromeUtils.import("resource://thunderstats/miczLogger.jsm");

const versionChecker = Services.vc;
const currentVersion = Services.appinfo.platformVersion;

if (versionChecker.compare(currentVersion, "61") >= 0) {
    var { MailUtils } = ChromeUtils.import("resource:///modules/MailUtils.jsm");

} else {
    var { MailUtils } = ChromeUtils.import("resource:///modules/MailUtils.js");
}

miczThunderStatsTab.ui = {

    last_pos0: 0,
    last_pos1: 0,
    label_height: 15,
    _tmp_i: -1,
    mwin: null,

    showLoadingElement: function(element) {
        $jQ("#" + element).show();
    },

    hideLoadingElement: function(element) {
        $jQ("#" + element).hide();
    },

    update_inbox0_inboxmsg: function(type, total_msg, unread_msg) { //type is "today" or "yesterday" or "customqry_oneday"
        //miczLogger.log('>>>>>>>>>>>>>> [miczThunderStatsTab.ui.update_inbox0_inboxmsg] type '+JSON.stringify(type)+'\r\n');
        miczThunderStatsTab.ui.hideLoadingElement(type + "_inbox0_inboxmsg_wait");
        $jQ("#" + type + "_inbox0_inboxmsg").text(total_msg);
        miczThunderStatsTab.ui.hideLoadingElement(type + "_inbox0_inboxmsg_unread_wait");
        $jQ("#" + type + "_inbox0_inboxmsg_unread").text(unread_msg);
    },

    loadIdentitiesSelector:function(selector_id,custom_account_key){
        Services.console.logStringMessage("load identities start");

		// $jQ("select#"+selector_id).find('option').remove();
		let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
        // $jQ("#"+selector_id).append('<option value="0">'+_bundleCW.GetStringFromName("ThunderStats.AllAccounts")+'</option>');

        const account_selector = document.getElementById(selector_id);
        let option = document.createElement('option');
        option.value = "0";
        option.text = _bundleCW.GetStringFromName("ThunderStats.AllAccounts");
        account_selector.appendChild(option);
        

		for(let key in miczThunderStatsCore.accounts){
			let debug_txt='';
			if(miczThunderStatsPrefs.isDebug){
				debug_txt="["+miczThunderStatsCore.accounts[key].key+':'+miczThunderStatsCore.accounts[key].identities.join(',')+"] ";
			}
			let item_css_class='mzts-sel-account';
			let show_identities=miczThunderStatsPrefs.showIdentitiesSelector||(key==custom_account_key);
			/*if(!show_identities){
				item_css_class='';
			}*/
			// $jQ("#"+selector_id).append('<option class="'+item_css_class+'" value="'+miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[key].key+'">'+miczThunderStatsUtils.escapeHTML(debug_txt+miczThunderStatsCore.accounts[key].name)+'</option>');

            let option = document.createElement('option');
            option.classList += 'item_css_class';
            option.value = miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[key].key;
            option.text = miczThunderStatsUtils.escapeHTML(debug_txt+miczThunderStatsCore.accounts[key].name);
            account_selector.appendChild(option);
    

            if(show_identities){
				for(let ikey in miczThunderStatsCore.accounts[key].identities){
					let curr_idn=miczThunderStatsCore.accounts[key].identities[ikey];
					let debug_txt_idn='';
					if(miczThunderStatsPrefs.isDebug){
						debug_txt_idn="["+miczThunderStatsCore.identities[curr_idn]["id"]+":"+miczThunderStatsCore.identities[curr_idn]["key"]+"] ";
					}

                    // $jQ("#"+selector_id).append('<option class="mzts-sel-identity" value="'+miczThunderStatsCore.identities[curr_idn]["id"]+'">'+miczThunderStatsUtils.escapeHTML(debug_txt_idn+miczThunderStatsCore.identities[curr_idn]["fullName"]+" ("+miczThunderStatsCore.identities[curr_idn]["email"]+")")+'</option>');

                    let option = document.createElement('option');
                    option.classList += 'mzts-sel-identity';
                    option.value = miczThunderStatsCore.identities[curr_idn]["id"];
                    option.text = miczThunderStatsUtils.escapeHTML(debug_txt_idn+miczThunderStatsCore.identities[curr_idn]["fullName"] + " (" + miczThunderStatsCore.identities[curr_idn]["email"] + ")");
                    account_selector.appendChild(option);
        
				}
			}
			if(Object.keys(miczThunderStatsCore.accounts).length==1){	//If there is only one account, autochoose it
				//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector autochoosing.\r\n");
				// $jQ("#"+selector_id).val(miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[key].key);
				// $jQ("#"+selector_id).change();
                account_selector.value = miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[key].key;
                Services.console.logStringMessage("load selector "+ account_selector.value +'  '+account_selector.selectedIndex);

                // account_selector.selected
            }else{	//choose the chosen startup account from prefs
				let strt_acc=miczThunderStatsPrefs.startupAccount;
				if(strt_acc!=0){
					// $jQ("#"+selector_id).val(miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[strt_acc].key);
                    // $jQ("#"+selector_id).change();
                    account_selector.value = miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[strt_acc].key;
                    Services.console.logStringMessage("load selector multiple "+ account_selector.value +'  '+account_selector.selectedIndex);
				}
			}
        }
        
        // account_selector.selectedIndex = 0;

		/*for(let key in miczThunderStatsCore.identities){
			//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities.length "+Object.keys(miczThunderStatsCore.identities).length+"\r\n");
			//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities "+miczThunderStatsCore.identities[key]["fullName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")\r\n");
			if(tmp_account_key!=miczThunderStatsCore.identities[key]["account_key"]){	//it's a new account
				tmp_account_key=miczThunderStatsCore.identities[key]["account_key"];
				$jQ("#"+selector_id).append('<option class="mzts-sel-account" value="'+miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.identities[key]["account_key"]+'">'+miczThunderStatsUtils.escapeHTML("["+miczThunderStatsCore.identities[key]["account_key"]+"] "+miczThunderStatsCore.identities[key]["account_name"])+'</option>');
			}
			$jQ("#"+selector_id).append('<option class="mzts-sel-identity" value="'+miczThunderStatsCore.identities[key]["id"]+'">'+miczThunderStatsUtils.escapeHTML("["+miczThunderStatsCore.identities[key]["id"]+":"+miczThunderStatsCore.identities[key]["key"]+"] "+miczThunderStatsCore.identities[key]["fullName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")")+'</option>');
			if(Object.keys(miczThunderStatsCore.identities).length==1){	//If there is only one identity, autochoose it
				//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector autochoosing.\r\n");
				$jQ("#"+selector_id).val(miczThunderStatsCore.identities[key]["id"]);
				$jQ("#"+selector_id).change();
			}
		}*/
        $jQ("#"+selector_id).change(miczThunderStatsTab.updateStats);
        
        Services.console.logStringMessage("load identities finish");
	},



    loadIdentitiesSelector2: function(selector_id, custom_account_key) {

        Services.console.logStringMessage("load identities start");
        // let selectv = $jQ("#" + selector_id).val();
        // $jQ("select#" + selector_id).find('option').remove();
        
        let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
    
        let aa = _bundleCW.GetStringFromName("ThunderStats.AllAccounts");

        // $jQ("#" + selector_id).append('<option value="0">' + _bundleCW.GetStringFromName("ThunderStats.AllAccounts") + '</option>');
        // $jQ("#" + selector_id).append('<option value="0">' + _bundleCW.GetStringFromName("ThunderStats.AllAccounts") + '</option>');

            // let o = document.createElement('option');
            // o.setAttribute('value', '0');
            // o.textContent = "All Accounts Test"
            // document.getElementById(selector_id).appendChild(o);
            // // document.getElementById(selector_id).remove(0);

        // let o2 = document.createXULElement('option');
        // o2.setAttribute('value', '0');
        // o2.textContent = "Test 2"
        // document.getElementById(selector_id).appendChild(o2);
        

        for (let key in miczThunderStatsCore.accounts) {
            let debug_txt = '';
            if (miczThunderStatsPrefs.isDebug) {
                debug_txt = "[" + miczThunderStatsCore.accounts[key].key + ':' + miczThunderStatsCore.accounts[key].identities.join(',') + "] ";
            }
            let item_css_class = 'mzts-sel-account';
            let show_identities = miczThunderStatsPrefs.showIdentitiesSelector || (key == custom_account_key);
            /*if(!show_identities){
            	item_css_class='';
            }*/
            // $jQ("#" + selector_id).append('<option class="' + item_css_class + '" value="' + miczThunderStatsCore._account_selector_prefix + miczThunderStatsCore.accounts[key].key + '">' + miczThunderStatsUtils.escapeHTML(debug_txt + miczThunderStatsCore.accounts[key].name) + '</option>');

            let o = document.createElement('option');
            o.classList += item_css_class;
            o.setAttribute('value', (miczThunderStatsCore._account_selector_prefix + miczThunderStatsCore.accounts[key].key) );
            o.text = miczThunderStatsCore.accounts[key].name;
            o.setAttribute('selected', 'selected');
            document.getElementById(selector_id).appendChild(o);
    
            // $jQ("#" + selector_id).append('<option class="' + item_css_class + '" value="' + miczThunderStatsCore._account_selector_prefix + miczThunderStatsCore.accounts[key].key + '">' + miczThunderStatsUtils.escapeHTML(debug_txt + miczThunderStatsCore.accounts[key].name) + '</option>');
            
            if (show_identities) {
                for (let ikey in miczThunderStatsCore.accounts[key].identities) {
                    let curr_idn = miczThunderStatsCore.accounts[key].identities[ikey];
                    let debug_txt_idn = '';
                    if (miczThunderStatsPrefs.isDebug) {
                        debug_txt_idn = "[" + miczThunderStatsCore.identities[curr_idn]["id"] + ":" + miczThunderStatsCore.identities[curr_idn]["key"] + "] ";
                    }
                    $jQ("#" + selector_id).append('<option class="mzts-sel-identity" value="' + miczThunderStatsCore.identities[curr_idn]["id"] + '">' + miczThunderStatsUtils.escapeHTML(debug_txt_idn + miczThunderStatsCore.identities[curr_idn]["fullName"] + " (" + miczThunderStatsCore.identities[curr_idn]["email"] + ")") + '</option>');
                }
            }
            if (Object.keys(miczThunderStatsCore.accounts).length == 1) { //If there is only one account, autochoose it
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector autochoosing.\r\n");
                
                document.getElementById(selector_id).setAttribute('value', miczThunderStatsCore.accounts[key].name);
                // $jQ("#" + selector_id).val(miczThunderStatsCore._account_selector_prefix + miczThunderStatsCore.accounts[key].key);

                $jQ("#" + selector_id).change();
                // document.getElementById(selector_id).selectedIndex = 1;


            } else { //choose the chosen startup account from prefs
                let strt_acc = miczThunderStatsPrefs.startupAccount;
                if (strt_acc != 0) {
                    $jQ("#" + selector_id).val(miczThunderStatsCore._account_selector_prefix + miczThunderStatsCore.accounts[strt_acc].key);
                    $jQ("#" + selector_id).change();
                }
            }
        }
        /*for(let key in miczThunderStatsCore.identities){
        	//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities.length "+Object.keys(miczThunderStatsCore.identities).length+"\r\n");
        	//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities "+miczThunderStatsCore.identities[key]["fullName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")\r\n");
        	if(tmp_account_key!=miczThunderStatsCore.identities[key]["account_key"]){	//it's a new account
        		tmp_account_key=miczThunderStatsCore.identities[key]["account_key"];
        		$jQ("#"+selector_id).append('<option class="mzts-sel-account" value="'+miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.identities[key]["account_key"]+'">'+miczThunderStatsUtils.escapeHTML("["+miczThunderStatsCore.identities[key]["account_key"]+"] "+miczThunderStatsCore.identities[key]["account_name"])+'</option>');
        	}
        	$jQ("#"+selector_id).append('<option class="mzts-sel-identity" value="'+miczThunderStatsCore.identities[key]["id"]+'">'+miczThunderStatsUtils.escapeHTML("["+miczThunderStatsCore.identities[key]["id"]+":"+miczThunderStatsCore.identities[key]["key"]+"] "+miczThunderStatsCore.identities[key]["fullName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")")+'</option>');
        	if(Object.keys(miczThunderStatsCore.identities).length==1){	//If there is only one identity, autochoose it
        		//miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector autochoosing.\r\n");
        		$jQ("#"+selector_id).val(miczThunderStatsCore.identities[key]["id"]);
        		$jQ("#"+selector_id).change();
        	}
        }*/
        // $jQ("#" + selector_id).change(miczThunderStatsTab.updateStats);
        Services.console.logStringMessage("stats UI load identity selector end: ");
    },

    updateTab: function() {
        miczThunderStatsDB.init();
        switch (miczThunderStatsTab.currentTab) {
            case '#tab_today':
                miczThunderStatsTab.getTodayStats(miczThunderStatsTab.getCurrentIdentityId());
                break;
            case '#tab_yesterday':
                miczThunderStatsTab.getYesterdayStats(miczThunderStatsTab.getCurrentIdentityId());
                break;
            case '#tab_7days':
                miczThunderStatsTab.getLast7DaysStats(miczThunderStatsTab.getCurrentIdentityId());
                break;
            case '#tab_info':
                //TODO
                break;
        }
        miczThunderStatsTab.getLastIndexedMessage();
        miczThunderStatsDB.close();
        return true;
    },

    initDatePickers: function() {

        let today = new Date();
        // let d = moment(today.toLocaleString()).format("YYYY-MM-DD");
        let f = moment().subtract(1, 'd');
        let t = moment().subtract(0, 'd');

        miczThunderStatsUtils._customqry_mToDay = t.toDate();
		miczThunderStatsUtils._customqry_mFromDay = f.toDate();

        const currentLocale = miczThunderStatsUtils.getCurrentSystemLocale();
        const currentLocaleBase = currentLocale.split('-')[0];

        // console.debug('current system locale is ' + currentLocale);
        // console.debug('flatp locales ' + Object.keys(flatpickr.l10ns));

        const flatpLocales = Object.keys(flatpickr.l10ns);

        // console.debug('locale type of = ' + typeof flatpickr.l10ns[currentLocale]);
        if (currentLocaleBase !== 'en') {

            if (flatpLocales.includes(currentLocale)) {
                flatpickr.localize(flatpickr.l10ns[currentLocale]);
                // console.debug('flat locale is '+ currentLocale);
            } else if (currentLocale.includes('-') && flatpLocales.includes(currentLocaleBase)) {
                // console.debug('flat locale is '+ currentLocale + "  shortLocale : " + currentLocale.split('-')[0]);
                flatpickr.localize(flatpickr.l10ns[currentLocaleBase]);
            } else {
                // console.debug('default English');
                flatpickr.localize(flatpickr.l10ns.default);
            }
        }

        let fp = flatpickr("#date_range_picker", {
            mode: "range",
            maxDate: "today",
            defaultDate: [ f.format("YYYY-MM-DD"), t.format("YYYY-MM-DD") ],
        });


        let locale_firstweekday = moment().startOf("week").format('d');

    },

    initDatePickers_dates: function() {
        // cleidigh What dates?
        // document.getElementById('datepicker_from').dateValue = moment().subtract(15, 'd').toDate();
        // document.getElementById('datepicker_to').dateValue = moment().subtract(1, 'd').toDate();
    },

    checkDatePickers_To: function(event) {
        // let dto = document.getElementById('datepicker_to');
        // let dfrom = document.getElementById('datepicker_from');
        // if (dto.dateValue < dfrom.dateValue) {
        //     dfrom.dateValue = dto.dateValue;
        // }
    },

    checkDatePickers_From: function(event) {
        // let dto = document.getElementById('datepicker_to');
        // let dfrom = document.getElementById('datepicker_from');
        // if (dto.dateValue < dfrom.dateValue) {
        //     dto.dateValue = dfrom.dateValue;
        // }
    },

    customQueryViewSelect: function(bkselected) {
        Services.console.logStringMessage("stats UI view select: " + bkselected);
        let dfrom = moment();
        let dto = moment();
        switch (bkselected) {
            case '#currentweek':
                dfrom.weekday(0);
                break;
            case '#currentmonth':
                dfrom.subtract(dfrom.format('D'), 'day').add(1, 'day');
                break;
            case '#currentyear':
                dfrom.set({ 'month': 0, 'date': 1 });
                break;
            case '#lastweek':
                dfrom.weekday(0).subtract(1, 'day').weekday(0);
                dto.weekday(0).subtract(1, 'day').weekday(6);
                break;
            case '#last2week':
                dfrom.weekday(0).subtract(1, 'day').weekday(0);
                // dfrom.weekday(0).subtract(2, 'week').weekday(0);
                break;
            case '#lastmonth':
                dfrom.subtract(1, 'month').subtract(dfrom.format('D'), 'day').add(1, 'day');
                dto.subtract(dto.format('D'), 'day');
                //dto.subtract(1,'month').endOf('month');
                break;
            case '#lastyear':
                dfrom.set({ 'date': 1, 'month': 0 }).subtract(1, 'year');
                dto.set({ 'date': 1, 'month': 0 }).subtract(1, 'day');
                break;
            default:
                return;
        }
        //DST fix
        /*if(!dfrom.isDST()){
        	//miczLogger.log(">>>>>>>>>>>>>> [customQueryViewSelect] dfrom isDST fix.\r\n");
        	dfrom.subtract(1,'hour');
        }
        if(!dto.isDST()){
        	//miczLogger.log(">>>>>>>>>>>>>> [customQueryViewSelect] dto isDST fix.\r\n");
        	dto.subtract(1,'hour');
        }*/
        
        // cleidigh tweak for real-time updates
        // document.getElementById('datepicker_from').dateValue = dfrom.toDate();
        // document.getElementById('datepicker_to').dateValue = dto.toDate();
        miczThunderStatsUtils._customqry_mFromDay = dfrom.toDate();
        miczThunderStatsUtils._customqry_mToDay = dto.toDate();

        let fp = document.querySelector("#date_range_picker")._flatpickr;
        fp.setDate( [ dfrom.format("YYYY-MM-DD"), dto.format("YYYY-MM-DD")]);
        // fp.selectedDates = [ "2019-08-02", "2019-08-23"];

        Services.console.logStringMessage("stats UI view select From: " + miczThunderStatsUtils._customqry_mFromDay);
        Services.console.logStringMessage("stats UI view select To: " + miczThunderStatsUtils._customqry_mToDay);
        if (miczThunderStatsPrefs.customQryBookmarkImmediateUpdate) { //update statistics
            miczThunderStatsTab.updateCustomQry();
        }
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] datepicker_from init: "+JSON.stringify(document.getElementById('datepicker_from').dateValue)+"\r\n");
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] datepicker_to init: "+JSON.stringify(document.getElementById('datepicker_to').dateValue)+"\r\n");
    },

    openPrefWindow: function() {
        let features = (miczThunderStatsUtils.HostSystem == 'linux') ?
            'chrome,titlebar,centerscreen,resizable,dependent,instantApply' :
            'chrome,titlebar,centerscreen,resizable,alwaysRaised,instantApply';
        window.openDialog('chrome://thunderstats/content/mzts-settings.xul', 'ThunderStats_Settings', features).focus();
    },

    formatInvolvedTable: function(involvedData) { //data columns ["ID","Name","Mail","Num"]
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] formatInvolvedTable involvedData: "+JSON.stringify(involvedData)+"\r\n");
        let outString = "<table class='mzts-tinvolved'>";
        let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
        outString += "<tr class='mzts-thead'><td class='mzts-row-num'>#</td><td>" + _bundleCW.GetStringFromName("ThunderStats.Name") + "</td><td>" + _bundleCW.GetStringFromName("ThunderStats.Mail") + "</td><td>" + _bundleCW.GetStringFromName("ThunderStats.Total") + "</td></tr>";

        let ind = 1;
        for (let key in involvedData) {
            //fix identity name if it's an user account identity
            if ((miczThunderStatsPrefs.involvedTableForceIdentityName) && (involvedData[key]["Mail"] in miczThunderStatsCore.identities_email_name)) {
                involvedData[key]["Name"] = miczThunderStatsCore.identities_email_name[involvedData[key]["Mail"]];
            }
            outString += "<tr class='mzts-trow'><td class='mzts-row-num'>" + ind + "</td><td>" + involvedData[key]["Name"] + "</td><td>" + involvedData[key]["Mail"] + "</td><td>" + involvedData[key]["Num"] + "</td></tr>";
            ind++;
        }

        outString += "</table>";
        return outString;
    },

    showGlobalIndexingWarning: function(show) {
        if (!show) {
            $jQ('#mzts-main-error').show();
            $jQ('#mzts-idnt_sel').hide();
            $jQ('#mzts-last_msg').hide();
            $jQ('#mzts-idx_update').hide();
        } else {
            $jQ('#mzts-main-error').hide();
            $jQ('#mzts-idnt_sel').show();
            $jQ('#mzts-last_msg').show();
            $jQ('#mzts-idx_update').show();
        }
    },

    util7DaysGraph_InsertLinebreaks: function(d) {
        let el = d3.select(this);
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] d: "+JSON.stringify(d)+"\r\n");
        let words = d.day_str.split('|');
        el.text('');

        for (let i = 0; i < words.length; i++) {
            let tspan = el.append('tspan').text(words[i]);
            if (i > 0) {
                tspan.attr('x', el.attr('x')).attr('dy', el.attr('dy') + 15).attr('dx', el.attr('dx'));
            }
        }
    },

    util7DaysGraph_getTickValues: function(_many_days) {
        if (_many_days == 1) return [0.5];

        let output = new Array();

        for (let _id = 0; _id < _many_days; _id++) {
            output.push(_id + 0.4);
        }
        return output; //[0.4,1.4,2.4,3.4,4.4,5.4,6.4];
    },

    draw7DaysGraph: function(element_id_txt, data_array, _many_days, do_today, _small_labels) {
        let _many_days_max_labels = (_small_labels && _many_days > 1) ? 0 : _many_days + 1;

        let margin = { top: 5, right: 0, bottom: _many_days <= _many_days_max_labels ? 40 : 60, left: 30 };
        if (_small_labels) {
            margin.top = 20;
        }
        let barWidth = _many_days <= _many_days_max_labels ? 50 : 12;
        if (_many_days == 1) barWidth = 100;
        let w = ((barWidth + 15) * _many_days) - margin.left - margin.right;
        let h = 220 - margin.top - margin.bottom;

        //data_array=JSON.parse('[{"day":1425337200,"day_str":"03/03/15","num":11},{"day":1425423600,"day_str":"04/03/15","num":78},{"day":1425510000,"day_str":"05/03/15","num":55},{"day":1425596400,"day_str":"06/03/15","num":2},{"day":1425682800,"day_str":"07/03/15","num":0},{"day":1425769200,"day_str":"08/03/15","num":21},{"day":1425855600,"day_str":"09/03/15","num":5},{"day":1425772800,"day_str":"10/03/15","num":5}]');

        let x = d3.scale.linear().domain([0, data_array.length]).range([0, w]);
        let y = d3.scale.linear().domain([0, Math.ceil((d3.max(data_array, function(datum) { return datum.num; }) + 1) / 10) * 10]).rangeRound([h, 0]);

        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab draw7DaysGraph] data_array: "+JSON.stringify(data_array)+"\r\n");

        //remove old graph
        $jQ("#" + element_id_txt + "_svg_graph").remove();

        let chart = d3.select("#" + element_id_txt)
            .append("svg:svg")
            .attr("id", element_id_txt + "_svg_graph")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //graph bars
        chart.selectAll("rect")
            .data(data_array)
            .enter()
            .append("svg:rect")
            .attr("x", function(datum, index) { return _many_days <= _many_days_max_labels ? x(index) : x(index) + 3.5; })
            .attr("y", function(datum) { return y(datum.num); })
            .attr("height", function(datum) { return y(0) - y(datum.num); })
            .attr("width", barWidth)
            .attr("fill", function(datum, index) { return do_today && (index == _many_days - 1) ? "#5BB4FD" : "#4682B4"; });

        //data labels
        chart.selectAll("text")
            .data(data_array)
            .enter()
            .append("svg:text")
            .attr("x", function(datum, index) { return x(index) + barWidth - (_many_days == 1 ? 7 : 0); })
            .attr("y", function(datum) { return y(datum.num); })
            .attr("dx", _many_days <= _many_days_max_labels ? -barWidth / 2 : (-barWidth / 2) + 3.5)
            .attr("dy", function(datum) { return (y(0) - y(datum.num) > 24) && !_small_labels ? "1.7em" : "-1em"; })
            .attr("text-anchor", "middle")
            .text(function(datum) { return datum.num; })
            .attr("class", function(datum) { return (y(0) - y(datum.num) > 24) && !_small_labels ? "data_label" : "zero_data_label"; });

        //x axis labels
        chart.selectAll("text.xAxis")
            .data(data_array)
            .enter().append("svg:text")
            .attr("x", function(datum, index) { return x(index) + barWidth; })
            .attr("y", h)
            .attr("dx", -barWidth / 2 - (_many_days == 1 ? 7 : 0))
            .attr("text-anchor", "middle")
            .text(function(datum, index) {
                let output = datum.day_str;
                if (do_today && (index == _many_days - 1)) {
                    let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
                    output += "|[" + _bundleCW.GetStringFromName("ThunderStats.TimeGraph.today") + "]";
                    datum.day_str = output;
                }
                //miczLogger.log(">>>>> TS: output: "+output+"\r\n");
                if (_many_days > _many_days_max_labels) {
                    let splitted = output.split('|');
                    output = splitted[1];
                }
                return output;
            })
            .attr("transform", function(datum, index) {
                return "translate(" + (_many_days > _many_days_max_labels ? "1.5" : "0") + ", " + (margin.bottom / 2) + ")" + (_many_days > _many_days_max_labels ? ' rotate(-90 ' + (x(index) + barWidth) + ',' + h + ')' : '');
            })
            .attr("class", "xAxis");

        //x axis
        let xAxis = d3.svg.axis().scale(x).orient("bottom")
            .tickValues(miczThunderStatsTab.ui.util7DaysGraph_getTickValues(_many_days))
            .outerTickSize(0);
        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        if (_many_days <= _many_days_max_labels) {
            //break x axis labels in new lines
            chart.selectAll('text.xAxis').each(miczThunderStatsTab.ui.util7DaysGraph_InsertLinebreaks);
        }

        //y axis
        let num_ticks = (d3.max(data_array, function(datum) { return datum.num; }) > 10 ? 10 : d3.max(data_array, function(datum) { return datum.num; }));
        let yAxis = d3.svg.axis().tickFormat(d3.format('0:d')).ticks(num_ticks).scale(y).orient("left");
        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);
    },

    drawInbox0DateSpreadGraph: function(element_id_txt, data_array, aggregate) {
        let margin = { top: 5, right: 0, bottom: 5, left: 43 };
        let barWidth = 40;
        let w = barWidth;
        let h = 220 - margin.top - margin.bottom;
        let min_bar_height = 12;

        //remove old graph
        $jQ("#" + element_id_txt + "_svg_graph").remove();

        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] data_array: "+JSON.stringify(data_array)+"\r\n");
        if (Object.keys(data_array).length == 0) {
            return;
        }

        //calculating total elements
        let data_sum = 0;
        for (let key in data_array) {
            data_sum += data_array[key].Num;
        }

        if (aggregate) { //we are going to aggregate old days
            //choose how much to aggregate
            let max_el = 20;
            if (data_array.length > max_el) { // ok, we really need to aggregate
                let spin_day = moment(data_array[data_array.length - max_el].Date);
                let tmp_array = new Array();
                let aggregate_day = {};
                aggregate_day.Num = 0;
                aggregate_day.Date = moment('1900-01-01');
                aggregate_day.aggregate = true;
                for (let key in data_array) {
                    if (moment(data_array[key].Date) <= spin_day) { //aggregate day
                        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] aggregating: "+JSON.stringify(data_array[key])+"\r\n");
                        aggregate_day.Num += data_array[key].Num;
                        aggregate_day.Date = Math.max(moment(aggregate_day.Date), moment(data_array[key].Date));
                    } else { //keep day
                        data_array[key].aggregate = false;
                        tmp_array.push(data_array[key]);
                    }

                }
                tmp_array.unshift(aggregate_day);
                data_array = tmp_array;
            }
        }

        let x = d3.scale.linear().domain([0, 1]).range([0, w]);
        let y = d3.scale.linear().domain([0, 1]).range([h, 0]);
        let color = d3.scale.category20();

        //adding normalized data
        let incr_num = 0;
        let incr_norm = 0;
        let total_bar_height = 0;
        let incr_bar_height = 0;
        for (let key in data_array) {
            data_array[key].incremental = data_array[key].Num + incr_num;
            incr_num += data_array[key].Num;
            data_array[key].normalized = data_array[key].Num / data_sum;
            data_array[key].incremental_normalized = data_array[key].normalized + incr_norm;
            incr_norm += data_array[key].normalized;
            data_array[key].bar_height = y(0) - y(data_array[key].normalized);
            //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] data_array[key].bar_height: "+JSON.stringify(data_array[key].bar_height)+"\r\n");
            total_bar_height += data_array[key].bar_height;
            incr_bar_height += data_array[key].bar_height;
            data_array[key].y = h - incr_bar_height;
            //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] total_bar_height: "+JSON.stringify(total_bar_height)+"\r\n");
        }

        //data_array=JSON.parse('[{"Date":"2010-09-21","Num":3,"incremental":3,"normalized":0.1875,"incremental_normalized":0.1875},{"Date":"2012-01-26","Num":1,"incremental":4,"normalized":0.0625,"incremental_normalized":0.25},{"Date":"2015-03-02","Num":3,"incremental":7,"normalized":0.1875,"incremental_normalized":0.4375},{"Date":"2015-03-08","Num":1,"incremental":8,"normalized":0.0625,"incremental_normalized":0.5},{"Date":"2015-03-13","Num":3,"incremental":11,"normalized":0.1875,"incremental_normalized":0.6875},{"Date":"2015-03-14","Num":5,"incremental":16,"normalized":0.3125,"incremental_normalized":1}]');

        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] data_array: "+JSON.stringify(data_array)+"\r\n");

        let chart = d3.select("#" + element_id_txt)
            .append("svg:svg")
            .attr("id", element_id_txt + "_svg_graph")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");

        //graph bars
        chart.selectAll("rect")
            .data(data_array)
            .enter()
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", function(datum) { return y(datum.incremental_normalized); })
            //.attr("y", function(datum) { return datum.y; })
            .attr("height", function(datum) { return y(0) - y(datum.normalized); })
            //.attr("height", function(datum) { return datum.bar_height; })
            .attr("width", barWidth)
            .attr("class", "tooltip")
            .attr("title", function(datum) { return (datum.aggregate ? _bundleCW.GetStringFromName("ThunderStats.Before") + '<br/>' : '') + miczThunderStatsUtils.getDateStringYY(moment(datum.Date), false) + "<br/>" + _bundleCW.GetStringFromName("ThunderStats.Mails") + ": " + datum.Num + " (" + (datum.normalized * 100).toFixed(0) + "%)"; })
            .attr("fill", function(d) { return color(d.Date); });

        $jQ('rect.tooltip').tooltipster({ debug: false, theme: 'tooltipster-light', contentAsHTML: true, arrow: false, position: 'left' });

        //data labels
        /*chart.selectAll("text")
		  .data(data_array)
		  .enter()
		  .append("svg:text")
		  .attr("x", 0)
		  //.attr("y", function(datum) { return y(datum.incremental_normalized); })
		  //.attr("y", function(datum) { return datum.y; })
		  .attr("y", function(datum) { return datum.label_y})
		  .attr("dx", 2*barWidth)
		  //.attr("dy", function(datum) { return margin.top/2 + datum.bar_height/2; })
		  .attr("class","tooltip")
		  .attr("title",function(datum) { return miczThunderStatsUtils.getDateStringYY(moment(datum.Date),false)+"<br/>Mails: "+datum.Num+" ("+(datum.normalized*100).toFixed(0)+"%)";})
		  .text(function(datum) { return miczThunderStatsUtils.getDateStringYY(moment(datum.Date),false);});

		$jQ('text.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true});

		//labels lines
		chart.selectAll("polyline")
			.data(data_array)
			.enter()
			.append("svg:polyline")
			.attr("points",function(datum){
				return [barWidth+1,y(datum.incremental_normalized)+(y(0) - y(datum.normalized))/2,
						barWidth+12,datum.label_y-5];
					});
*/
        //y axis
        let yAxis = d3.svg.axis().tickFormat(d3.format(".0%")).ticks(5).scale(y).orient("left");
        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);
    },

    utilDrawInbox0FolderSpreadGraph_getInboxColors: function(num_elements) {
        let output = new Array();
        let step = Math.floor(255 / num_elements);
        for (let cc = 255; cc > 127; cc = cc - step) { //darker colors
            output.push('#' + cc.toString(16) + "0000");
        }
        for (let cc = step; cc < 127; cc = cc + step) { //ligther colors
            output.push('#' + parseInt(255).toString(16) + cc.toString(16) + cc.toString(16));
        }
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab utilDrawInbox0FolderSpreadGraph_getInboxColors] num_elements: "+JSON.stringify(num_elements)+"\r\n");
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab utilDrawInbox0FolderSpreadGraph_getInboxColors] step: "+JSON.stringify(step)+"\r\n");
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab utilDrawInbox0FolderSpreadGraph_getInboxColors] output: "+JSON.stringify(output)+"\r\n");
        return output;
    },

    utilDrawInbox0FolderSpreadGraph_getOtherFoldersColors: function(num_elements) {
        let output;
        let output1 = ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef",
            "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
            "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
            "#636363", "#969696", "#bdbdbd", "#d9d9d9"
        ];
        let output2 = ["#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
            "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
            "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
            "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
        ];
        if (num_elements <= output1.length) {
            return output1;
        } else {
            output = output1.concat(output2);
        }
        while (output.length < num_elements) {
            output = output.concat(output1, output2);
        }
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab utilDrawInbox0FolderSpreadGraph_getOtherFoldersColors] num_elements: "+JSON.stringify(num_elements)+"\r\n");
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab utilDrawInbox0FolderSpreadGraph_getOtherFoldersColors] step: "+JSON.stringify(step)+"\r\n");
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab utilDrawInbox0FolderSpreadGraph_getOtherFoldersColors] output: "+JSON.stringify(output)+"\r\n");
        return output;
    },

    utilDrawInbox0FolderSpreadGraph_getFolderClick: function(d) {
        let mwin = miczThunderStatsTab.ui.mwin;
        let mdoc = miczThunderStatsTab.ui.mwin.document;
        if (!miczThunderStatsPrefs.openFolderInFirstTab) {
            // cleidigh - conditional for TB67+
            // mdoc.getElementById("tabmail").openTab("folder", { folder: MailUtils.getFolderForURI(d.data.folder_url) });
            mdoc.getElementById("tabmail").openTab("folder", { folder: MailUtils.getExistingFolder(d.data.folder_url) });
        } else {
            let tabmail = mdoc.getElementById("tabmail");
            tabmail.selectTabByIndex(null, 0);
            //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] mKey: "+JSON.stringify(d.data.mKey)+"\r\n");
            let curr_folder = MailUtils.getExistingFolder(d.data.folder_url);
            let do_select_message = (mwin.gFolderDisplay.displayedFolder != curr_folder); //the selected folder is the same
            if (do_select_message) {
                mwin.gFolderTreeView.selectFolder(curr_folder);
            }
            do_select_message = do_select_message && (mwin.gFolderDisplay.selectedCount == 0); //there is already a selected folder
            //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] mwin.gFolderDisplay.selectedCount: "+mwin.gFolderDisplay.selectedCount+"\r\n");
            if (do_select_message) {
                try {
                    let folder_msg_iterator = fixIterator(curr_folder.msgDatabase.ReverseEnumerateMessages(), Ci.nsIMsgDBHdr);
                    for (let fmsg of folder_msg_iterator) {
                        mwin.gFolderDisplay.selectMessage(fmsg);
                        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] subject: "+JSON.stringify(fmsg.subject)+"\r\n");
                        break;
                    }
                } catch (e) {
                    miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] error: " + e.message + "\r\n");
                }
            }
        }
    },

    drawInbox0FolderSpreadGraph: function(element_id_txt, data_array) {
        //miczLogger.log(">>>>>>>>>>>>>> Inbox0FolderSpreadGraph start ["+element_id_txt+"]",0);
        let inboxFolderURLs = miczThunderStatsDB.queryGetInboxFolderURLs();
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] inboxFolderURLs: "+JSON.stringify(inboxFolderURLs)+"\r\n");
        miczThunderStatsTab.ui.mwin = miczThunderStatsUtils.getMail3PaneWindow();
        //let mtabcontainer=mwin.document.getElementById('tabmail').tabContainer;
        //let mdoc=mwin.document;

        //remove old graph
        $jQ("#" + element_id_txt + "_svg_graph").remove();
        miczThunderStatsTab.ui.last_pos0 = [];
        miczThunderStatsTab.ui.last_pos1 = [];
        miczThunderStatsTab.ui.last_pos0['text_' + element_id_txt] = 0;
        miczThunderStatsTab.ui.last_pos1['text_' + element_id_txt] = 0;
        miczThunderStatsTab.ui.last_pos0['poly_' + element_id_txt] = 0;
        miczThunderStatsTab.ui.last_pos1['poly_' + element_id_txt] = 0;
        /*miczLogger.log(">>>>>>>>>>>>>> drawInbox0FolderSpreadGraph miczThunderStatsTab.ui.last_pos0[text_"+element_id_txt+": "+miczThunderStatsTab.ui.last_pos0['text_'+element_id_txt],0);
    miczLogger.log(">>>>>>>>>>>>>> drawInbox0FolderSpreadGraph miczThunderStatsTab.ui.last_pos1[text_"+element_id_txt+": "+miczThunderStatsTab.ui.last_pos1['text_'+element_id_txt],0);
    miczLogger.log(">>>>>>>>>>>>>> drawInbox0FolderSpreadGraph miczThunderStatsTab.ui.last_pos0[poly_"+element_id_txt+": "+miczThunderStatsTab.ui.last_pos0['poly_'+element_id_txt],0);
    miczLogger.log(">>>>>>>>>>>>>> drawInbox0FolderSpreadGraph miczThunderStatsTab.ui.last_pos1[poly_"+element_id_txt+": "+miczThunderStatsTab.ui.last_pos1['poly_'+element_id_txt],0);
*/
        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] data_array: "+JSON.stringify(data_array)+"\r\n");

        //data_array=JSON.parse('[{"Folder":"All Mail","Num":10},{"Folder":"Inbox","Num":21},{"Folder":"test1","Num":21},{"Folder":"test2","Num":21},{"Folder":"test3","Num":21},{"Folder":"test4","Num":21},{"Folder":"test5","Num":21},{"Folder":"test6","Num":21},{"Folder":"test7","Num":2},{"Folder":"test8","Num":3},{"Folder":"test________________9","Num":14},{"Folder":"test_____________10","Num":14},{"Folder":"test11","Num":14},{"Folder":"test12","Num":14}]');

        let svg = d3.select("#" + element_id_txt)
            .append("svg")
            .attr("id", element_id_txt + "_svg_graph")
            .append("g");

        svg.append("g")
            .attr("class", "slices");
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");

        let arc_width = 350,
            arc_height = 200,
            width = 450,
            height = 250,
            radius = Math.min(arc_width, arc_height) / 2;

        //calculating total elements
        let data_sum = 0;
        for (let key in data_array) {
            data_sum += data_array[key].Num;
        }

        //normalize data
        let norm_data = new Array();
        for (let key in data_array) {
            let element = {};
            element.value = data_array[key].Num;

            var tmp_folder;
            if (versionChecker.compare(currentVersion, "61") >= 0) {
                tmp_folder = MailUtils.getExistingFolder(data_array[key].FolderURI);
            } else {
                tmp_folder = MailUtils.getFolderForURI(data_array[key].FolderURI);
            }
            element.label = tmp_folder.prettyName;
            //element.label=data_array[key].Folder;
            element.folder_url = data_array[key].FolderURI;
            element.normalized = data_array[key].Num / data_sum;
            //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] FolderURI "+data_array[key].FolderURI+"\r\n");
            //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] Folder "+data_array[key].Folder+"\r\n");
            //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] prettyName "+tmp_folder.prettyName+"\r\n");
            norm_data.push(element);
        }

        let pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.value;
            });

        let arc = d3.svg.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        let outerArc = d3.svg.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let key = function(d) { return d.data.folder_url; };

        //let color = d3.scale.category20c();
        let color = d3.scale.ordinal().range(miczThunderStatsTab.ui.utilDrawInbox0FolderSpreadGraph_getOtherFoldersColors(norm_data.length));
        let color_inbox = d3.scale.ordinal().range(miczThunderStatsTab.ui.utilDrawInbox0FolderSpreadGraph_getInboxColors(inboxFolderURLs.length));


        /* ------- PIE SLICES -------*/
        let slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(norm_data), key);

        slice.enter()
            .insert("path")
            .style("fill", function(d) { return inboxFolderURLs.indexOf(d.data.folder_url) > -1 ? color_inbox(d.data.folder_url) : color(d.data.folder_url); })
            //.style("fill", function(d) { return color(d.data.folder_url); })
            .attr("class", "slice tooltip")
            .on('click', miczThunderStatsTab.ui.utilDrawInbox0FolderSpreadGraph_getFolderClick)
            .attr("title", function(d) { return d.data.label + "<br/>Mails: " + d.data.value + " (" + (d.data.normalized * 100).toFixed(0) + "%)"; });

        slice
            .transition().duration(1000)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                let interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    return arc(interpolate(t));
                };
            })

        slice.exit()
            .remove();

        $jQ('path.tooltip').tooltipster({ debug: false, theme: 'tooltipster-light', contentAsHTML: true, arrow: false });

        /* ------- TEXT LABELS -------*/
        let text = svg.select(".labels").selectAll("text")
            .data(pie(norm_data), key);

        let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .text(function(d) {
                return d.data.label + " (" + d.data.value + ")";
            })
            .attr("class", function(d) {
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] d.data.folder_url: "+JSON.stringify(d.data.folder_url)+"\r\n");
                if (inboxFolderURLs.indexOf(d.data.folder_url) > -1) {
                    return "tooltip inbox_label pointer";
                } else {
                    return "tooltip pointer";
                }
            })
            .on('click', miczThunderStatsTab.ui.utilDrawInbox0FolderSpreadGraph_getFolderClick)
            .attr("title", function(d) { return d.data.label + "<br/>" + _bundleCW.GetStringFromName("ThunderStats.Mails") + ": " + d.data.value + " (" + (d.data.normalized * 100).toFixed(0) + "%)"; });

        $jQ('text.tooltip').tooltipster({ debug: false, theme: 'tooltipster-light', contentAsHTML: true, arrow: false });

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        text.attr("transform", function(d) {
                let pos = outerArc.centroid(d);
                pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
                pos[1] = miczThunderStatsTab.ui.utilInbox0FolderSpreadGraph_LabelPosition(pos, 'text_' + element_id_txt);
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] "+d.data.label+" "+JSON.stringify(pos)+"\r\n");
                return "translate(" + pos + ")";
            })
            .style("text-anchor", function(d) {
                return midAngle(d) < Math.PI ? "start" : "end";
            });

        text.exit()
            .remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/

        var polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(norm_data), key);

        polyline.enter()
            .append("polyline");

        polyline.attr("points", function(d) {
                let pos = outerArc.centroid(d);
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                pos[1] = miczThunderStatsTab.ui.utilInbox0FolderSpreadGraph_LabelPosition(pos, 'poly_' + element_id_txt);
                return [arc.centroid(d), outerArc.centroid(d), pos];
            })
            .style("stroke", function(d) { return inboxFolderURLs.indexOf(d.data.folder_url) > -1 ? color_inbox(d.data.folder_url) : color(d.data.folder_url); })
            .style("stroke-width", 2)
            .style("opacity", 1);

        polyline.exit()
            .remove();

        //miczLogger.log(">>>>>>>>>>>>>> Inbox0FolderSpreadGraph done ["+element_id_txt+"]",0);
    },

    utilInbox0FolderSpreadGraph_LabelPosition: function(pos, namespace) {
        let offset_labelpos = 0;
        //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"]",0);

        //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] miczThunderStatsTab.ui.last_pos0: "+miczThunderStatsTab.ui.last_pos0[namespace],0);
        //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] miczThunderStatsTab.ui.last_pos1: "+miczThunderStatsTab.ui.last_pos1[namespace],0);

        if ((miczThunderStatsTab.ui.last_pos0[namespace] == 0) || (miczThunderStatsTab.ui.last_pos1[namespace] == 0)) {
            miczThunderStatsTab.ui.last_pos0[namespace] = pos[0];
            miczThunderStatsTab.ui.last_pos1[namespace] = pos[1];
            //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] first label\r\n");
            //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] first label",0);
            return pos[1];
        } //first label
        if (pos[0] > 0) { //starting from 12 hours CW...
            if (pos[1] < 0) { //first quarter
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] first quarter\r\n");
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] first quarter",0);
                let label_diff = Math.abs(pos[1] - miczThunderStatsTab.ui.last_pos1[namespace]);
                //if(((pos[1]*miczThunderStatsTab.ui.last_pos1[namespace])>0)&&(pos[1]<miczThunderStatsTab.ui.last_pos1[namespace])){
                if (pos[1] < miczThunderStatsTab.ui.last_pos1[namespace]) {
                    label_diff = -1;
                }
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[0]: "+pos[0],0);
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[1]: "+pos[1],0);
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] label_diff: "+label_diff,0);
                if (label_diff < miczThunderStatsTab.ui.label_height + offset_labelpos) {
                    //pos[1]+=miczThunderStatsTab.ui.label_height-label_diff;
                    pos[1] = miczThunderStatsTab.ui.last_pos1[namespace] + miczThunderStatsTab.ui.label_height + offset_labelpos;
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] fixing position",0);
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[0]: "+pos[0],0);
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[1]: "+pos[1],0);
                }
            } else { //second quarter
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] second quarter\r\n");
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] second quarter",0);
                let label_diff = Math.abs(pos[1] - miczThunderStatsTab.ui.last_pos1[namespace]);
                //if(((pos[1]*miczThunderStatsTab.ui.last_pos1[namespace])>0)&&(pos[1]<miczThunderStatsTab.ui.last_pos1[namespace])){
                if (pos[1] < miczThunderStatsTab.ui.last_pos1[namespace]) {
                    label_diff = -1;
                }
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[0]: "+pos[0],0);
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[1]: "+pos[1],0);
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] label_diff: "+label_diff,0);
                if (label_diff < miczThunderStatsTab.ui.label_height + offset_labelpos) {
                    //pos[1]+=miczThunderStatsTab.ui.label_height-label_diff;
                    pos[1] = miczThunderStatsTab.ui.last_pos1[namespace] + miczThunderStatsTab.ui.label_height + offset_labelpos;
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] fixing position",0);
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[0]: "+pos[0],0);
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[1]: "+pos[1],0);
                }
            }
        } else { //second half
            if (miczThunderStatsTab.ui.last_pos0[namespace] > 0) { //first label in the second half
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] first label in the second half\r\n");
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] first label in second half",0);
                miczThunderStatsTab.ui.last_pos0[namespace] = pos[0];
                miczThunderStatsTab.ui.last_pos1[namespace] = pos[1];
                return pos[1];
            }
            if (pos[1] > 0) { //third quarter
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] third quarter\r\n");
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] third quarter",0);
                let label_diff = Math.abs(pos[1] - miczThunderStatsTab.ui.last_pos1[namespace]);
                //if(((pos[1]*miczThunderStatsTab.ui.last_pos1[namespace])>0)&&(pos[1]>miczThunderStatsTab.ui.last_pos1[namespace])){
                if (pos[1] > miczThunderStatsTab.ui.last_pos1[namespace]) {
                    label_diff = -1;
                }
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[0]: "+pos[0],0);
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[1]: "+pos[1],0);
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] label_diff: "+label_diff,0);
                if (label_diff < miczThunderStatsTab.ui.label_height + offset_labelpos) {
                    //pos[1]-=miczThunderStatsTab.ui.label_height+label_diff;
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] fixing position",0);
                    pos[1] = miczThunderStatsTab.ui.last_pos1[namespace] - miczThunderStatsTab.ui.label_height - offset_labelpos;
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[0]: "+pos[0],0);
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[1]: "+pos[1],0);
                }
            } else { //fourth quarter
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] fourth quarter\r\n");
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] fourth quarter",0);
                let label_diff = miczThunderStatsTab.ui.last_pos1[namespace] - pos[1];
                //if(((pos[1]*miczThunderStatsTab.ui.last_pos1[namespace])>0)&&(pos[1]>miczThunderStatsTab.ui.last_pos1[namespace])){
                if (pos[1] > miczThunderStatsTab.ui.last_pos1[namespace]) {
                    label_diff = -1;
                }
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[0]: "+pos[0],0);
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[1]: "+pos[1],0);
                //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] label_diff: "+label_diff,0);
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] label_diff: "+label_diff+"\r\n");
                if (label_diff < miczThunderStatsTab.ui.label_height + offset_labelpos) {
                    //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] fixing position\r\n");
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] fixing position",0);
                    //pos[1]-=miczThunderStatsTab.ui.label_height+label_diff;
                    pos[1] = miczThunderStatsTab.ui.last_pos1[namespace] - miczThunderStatsTab.ui.label_height - offset_labelpos;
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[0]: "+pos[0],0);
                    //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos[1]: "+pos[1],0);
                }
            }
        }
        miczThunderStatsTab.ui.last_pos0[namespace] = pos[0];
        miczThunderStatsTab.ui.last_pos1[namespace] = pos[1];
        //miczLogger.log(">>>>>>>>>>>>>> utilInbox0FolderSpreadGraph_LabelPosition ["+namespace+"] pos (0 - 1): ["+pos[0]+"] - ["+pos[1]+"]",0);
        return pos[1];
    },

    utilDrawTimeGraph_ArrangeData: function(data_array, is_today) {
        let _show_yesterday = miczThunderStatsPrefs.getBoolPref_TS('today_time_graph_show_yesterday');
        let data_output = new Array();
        let _data_handles;
        if (is_today) {
            if (_show_yesterday) {
                _data_handles = ['today_sent', 'today_rcvd', 'yesterday_sent', 'yesterday_rcvd'];
            } else {
                _data_handles = ['today_sent', 'today_rcvd'];
            }
        } else {
            _data_handles = ['yesterday_sent', 'yesterday_rcvd'];
        }

        for (let h_el in _data_handles) {
            let current_data = {};
            current_data['type'] = _data_handles[h_el];
            current_data['data'] = new Array();
            //rearrange actual data
            for (let el in data_array[_data_handles[h_el]]) {
                if (data_array[_data_handles[h_el]][el]['mHour'] >= 0) {
                    current_data['data'].push({ 'type': _data_handles[h_el], 'hour': data_array[_data_handles[h_el]][el]['mHour'], 'value': data_array[_data_handles[h_el]][el]['Num'] });
                }
            }

            //add missing hours
            if (current_data['data'].length < 24) {
                for (this._tmp_i = 0; this._tmp_i <= 23; this._tmp_i++) {
                    if (!current_data['data'].some(this.utilDrawTimeGraph_CheckRecord, this)) {
                        current_data['data'].push({ 'type': _data_handles[h_el], 'hour': this._tmp_i, 'value': 0 });
                        //current_data['data'].push({'type':_data_handles[h_el],'hour':this._tmp_i,'value':Math.floor(Math.random() * (42 - 0)) + 0});
                    }
                }
            }

            current_data.data.sort(this.utilDrawTimeGraph_ArrayCompare);

            if (miczThunderStatsPrefs.getBoolPref_TS('today_time_graph_progressive')) { //show progressive data
                let tmp_prgrss_data = 0;
                for (let eld in current_data.data) {
                    current_data.data[eld].value_h = current_data.data[eld].value;
                    if ((is_today) && (current_data.type.indexOf('yesterday_') == -1) && (current_data.data[eld].hour > moment().format("H"))) break;
                    current_data.data[eld].value += tmp_prgrss_data;
                    tmp_prgrss_data = current_data.data[eld].value;
                }
                //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] utilDrawTimeGraph_ArrangeData current_data: "+JSON.stringify(current_data)+"\r\n");
            }

            data_output.push(current_data);
        }

        return data_output;
    },

    utilDrawTimeGraph_ArrayCompare: function(a, b) {
        if (a.hour < b.hour) {
            return -1;
        }
        if (a.hour > b.hour) {
            return 1;
        }
        return 0;
    },

    utilDrawTimeGraph_CheckRecord: function(currentValue) {
        if (parseInt(currentValue.hour) === this._tmp_i) {
            return true;
        }
        return false;
    },


    drawTimeGraph: function(element_id_txt, data_array, is_today, is_oneday) {
        let margin = {
            top: 10,
            right: 92,
            bottom: 40,
            left: 40
        };
        let full_width = 560;
        let full_height = 150;
        let width = full_width - margin.left - margin.right;
        let height = full_height - margin.top - margin.bottom;

        let legendRectSize = 10;
        let legendSpacing = 8;

        let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
        let _go_progressive = miczThunderStatsPrefs.getBoolPref_TS('today_time_graph_progressive');

        let data = this.utilDrawTimeGraph_ArrangeData(data_array, is_today);
        let data_types = new Array();

        for (let eel in data) {
            data_types.push(data[eel]["type"]);
        }

        let bar_width = (width / (23 * data_types.length));

        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] drawTimeGraph data_types: "+JSON.stringify(data_types)+"\r\n");

        //let data = [{"type": "today_sent","data": [{"type": "today_sent","hour": "11","value": "63"},{"type": "today_sent","hour": "18","value": "18"},{"type": "today_sent","date": "21","value": "53"}]}];

        //miczLogger.log(">>>>>>>>>>>>>> [miczThunderStatsTab] drawTimeGraph data: "+JSON.stringify(data)+"\r\n");

        //remove old graph
        $jQ("#" + element_id_txt + "_svg_graph").remove();

        let x = d3.scale.linear().domain([0, 24]).range([0, width]);
        let y = d3.scale.linear().range([height, 0]);

        //let color = d3.scale.category10();
        let color;
        if (is_today) { //Today
            color = d3.scale.ordinal().range(['#1f77b4', '#ff7f0e', '#64d4e9', '#ffc26a']);
        } else { //Yestarday
            color = d3.scale.ordinal().range(['#64d4e9', '#ffc26a']);
        }

        let xAxis = d3.svg.axis()
            .ticks(13)
            .outerTickSize(1)
            .tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22])
            .scale(x)
            .orient("bottom");

        let y_num_ticks = d3.max(data, function(kv) { return d3.max(kv.data, function(d) { return d.value; }) }) < 10 ? d3.max(data, function(kv) { return d3.max(kv.data, function(d) { return d.value; }) }) : d3.max(data, function(kv) { return d3.max(kv.data, function(d) { return d.value; }) }) < 80 ? 4 : 8;

        let yAxis = d3.svg.axis()
            .scale(y)
            .outerTickSize(1)
            .ticks(y_num_ticks)
            .tickFormat(d3.format('0'))
            .orient("left");

        /*let line = d3.svg.line()
        	.interpolate("linear")	/*linear basis step-before step-after cardinal monotone*/
        /*
        			.x(function (d) {
        			return x(d.hour);
        		})
        			.y(function (d) {
        			return y(d.value);
        		});*/

        let svg = d3.select("#" + element_id_txt).append("svg")
            .attr("width", full_width)
            .attr("height", full_height)
            .attr("id", element_id_txt + "_svg_graph")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        color.domain(data.map(function(d) { return d.type; }));

        let minY = d3.min(data, function(kv) { return d3.min(kv.data, function(d) { return d.value; }) });
        let maxY = d3.max(data, function(kv) { return d3.max(kv.data, function(d) { return d.value; }) < 10 ? d3.max(kv.data, function(d) { return d.value; }) : Math.ceil((d3.max(kv.data, function(d) { return d.value; }) + 1) / 5) * 5 });

        y.domain([minY, maxY]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("dx", bar_width * 2)
            .call(xAxis)
            .append("text")
            .attr("y", 30)
            .attr("x", width / 2)
            .style("text-anchor", "middle")
            .text(_bundleCW.GetStringFromName("ThunderStats.TimeGraph.Time"));

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left / 2 - 4)
            .attr("x", -height / 2 - 10)
            .style("text-anchor", "start")
            .text(_bundleCW.GetStringFromName("ThunderStats.Mails"));

        let serie = svg.selectAll(".serie")
            .data(data)
            .enter().append("g")
            .attr("class", "serie");

        serie.selectAll("rect")
            .data(function(d) { return d.data; })
            .enter().append("rect")
            .attr("width", function(d) {
                if (data_types.length > 2) {
                    return bar_width * (data_types.indexOf(d.type) < 2 ? 2 : 1);
                } else {
                    return bar_width;
                }
            })
            .attr("x", function(d) {
                if (data_types.length > 2) {
                    return x(d.hour) + (bar_width * (data_types.indexOf(d.type) == 1 ? 2 : data_types.indexOf(d.type) == 2 ? 1 : data_types.indexOf(d.type)));
                } else {
                    return x(d.hour) + (bar_width * data_types.indexOf(d.type));
                }
            })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .style("fill", function(d) { return color(d.type); })
            .attr("class", "tooltip")
            .attr("title", function(d) {
                let mh_from = 0;
                if (_go_progressive) { //show progressive data
                    //mh_from=moment().hours(0).minutes(0).format("LT");
                    mh_from = _bundleCW.GetStringFromName("ThunderStats.TimeGraph.until") + " ";
                } else {
                    mh_from = moment().hours(d.hour).minutes(0).format("LT") + " - ";
                }
                let mh_to = moment().hours(d.hour).minutes(59).format("LT");
                let mh_str = " " + mh_from + mh_to;
                let yt_str = "";
                let ii = data_types.indexOf(d.type);
                if (!is_oneday) {
                    if ((ii <= 1) && is_today) {
                        yt_str = _bundleCW.GetStringFromName("ThunderStats.TimeGraph.today");
                    } else {
                        if ((ii > 1) || (!is_today)) {
                            if ((miczThunderStatsPrefs.useLastBusinessDay) && (!miczThunderStatsUtils._y_is_last_business_day)) {
                                yt_str = _bundleCW.GetStringFromName("ThunderStats.LastBusinessDay_short");
                            } else {
                                yt_str = _bundleCW.GetStringFromName("ThunderStats.TimeGraph.yesterday");
                            }
                        }
                    }
                }
                let value_h_str = "";
                if (_go_progressive) {
                    value_h_str = " (";
                    value_h_str += "+" + d.value_h;
                    value_h_str += ")";
                }
                return yt_str + mh_str + "<br/>" + _bundleCW.GetStringFromName("ThunderStats.TimeGraph." + d.type) + ": " + d.value + value_h_str;
            })
            .on('mouseover', function() {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .style('fill', 'red')
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .style("fill", function(d) { return color(d.type); })
            });

        $jQ('.serie rect.tooltip').tooltipster({ debug: false, theme: 'tooltipster-light', contentAsHTML: true, arrow: false, position: 'top' });

        //Legend
        let legend = svg.selectAll('.legend')
            .data(data_types)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
                let l_height = legendRectSize + legendSpacing;
                let horz = full_width - legendRectSize - margin.right - 10;
                let vert = i * l_height + 15 + (i >= 2 ? 15 : 0);
                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', color)
            .style('stroke', color)
            /*.attr('class',function(d,i){
			  	return (i>=2?"yday_hours":"tday_hours");
			  })*/
        ;

        legend.append('text')
            .text(function(d) {
                return _bundleCW.GetStringFromName("ThunderStats.TimeGraph." + d);
            })
            .attr('transform', function(d, i) {
                let l_height = legendRectSize + legendSpacing;
                let horz = legendRectSize + 3;
                let vert = l_height / 2;
                return 'translate(' + horz + ',' + vert + ')';
            })
            .attr('height', legendRectSize);

        //Legend "Today" title
        let legend_day_title_today = svg.selectAll('.legend_day_title')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend_day_title')
            .append('text')
            .text(
                function(d, i) {
                    if (!is_oneday) {
                        if ((i == 0) && is_today) {
                            return _bundleCW.GetStringFromName("ThunderStats.TimeGraph.today");
                        } else {
                            if ((i == 2) || (!is_today && i == 0)) {
                                if ((miczThunderStatsPrefs.useLastBusinessDay) && (!miczThunderStatsUtils._y_is_last_business_day)) {
                                    return _bundleCW.GetStringFromName("ThunderStats.LastBusinessDay_short");
                                } else {
                                    return _bundleCW.GetStringFromName("ThunderStats.TimeGraph.yesterday");
                                }
                            }
                        }
                    }
                    return "";
                })
            .attr('transform',
                function(d, i) {
                    let ldt_horz = full_width - legendRectSize - margin.right - 10;
                    let ldt_vert = i * (legendRectSize + legendSpacing) + 10 + (i >= 2 ? 15 : 0);
                    return 'translate(' + ldt_horz + ',' + ldt_vert + ')'
                }
            );

        /*		 let focus = svg.append("g")
        					  .attr("class", "focus")
        					  .style("display", "none");

        		  focus.append("circle")
        			  .attr("r", 2.5);

        		  focus.append("text")
        			  .attr("x", 9)
        			  .attr("dy", ".35em");

        		  svg.append("rect")
        			  .attr("class", "overlay")
        			  .attr("width", width)
        			  .attr("height", height)
        			  .on("mouseover", function() { focus.style("display", null); })
        			  .on("mouseout", function() { focus.style("display", "none"); })
        			  .on("mousemove", mousemove);

        		let bisectDate = d3.bisector(function(d) { return d.hour; }).left;

        		  function mousemove() {
        			let x0 = x.invert(d3.mouse(this)[0]),
        				i = bisectDate(data, x0, 1),
        				d0 = data[i - 1],
        				d1 = data[i],
        				d = x0 - d0.value > d1.value - x0 ? d1 : d0;
        			focus.attr("transform", "translate(" + x(d.data.hour) + "," + y(d.data.value) + ")");
        			focus.select("text").text(d.data.value);
        		  }*/

    },

}; 