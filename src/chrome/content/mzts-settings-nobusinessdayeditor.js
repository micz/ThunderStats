"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

var { miczThunderStatsUtils } = ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
var { miczLogger } = ChromeUtils.import("resource://thunderstats/miczLogger.jsm");

var miczThunderStatsPrefPanel_NBDEditor = {

	onLoad: function(){
		Services.console.logStringMessage("onLoad start");
		miczThunderStatsPrefPanel_NBDEditor.initDatePicker();
		//Fixing window height
		// this.fixWinHeight();

		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];

			Services.console.logStringMessage(args);

			if ("action" in args){
				switch (args.action){
					//case "new":
					//break;
					case "edit":
						let nbd=JSON.parse(args.newnbd);
						//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] nbd: "+JSON.stringify(nbd)+"\r\n");
						//fill the fields
						document.getElementById("ThunderStats.desc").setAttribute("value",nbd.desc);
						document.getElementById("ThunderStats.date").dateValue=new Date(nbd.date);
						document.getElementById("ThunderStats.every_year").setAttribute("checked",nbd.every_year);
						document.getElementById("ThunderStats.desc").focus();
					break;
				}
			}
		}
	},

	onAccept:function(){
		Services.console.logStringMessage("on except");
		// if(!miczThunderStatsPrefPanel_NBDEditor.checkFields()){
			// return false;
		// }Was
		Services.console.logStringMessage("on except: "+ JSON.stringify(window.arguments[0]));
		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];
			let newnbd={};

			Services.console.logStringMessage("check-action");
			if ("action" in args){	
				switch (args.action){
					case "new":  //Save new NBD
						//get userinput val
						newnbd.desc=document.getElementById("ThunderStats.desc").value;
						newnbd.date=document.getElementById("non_biz_date_picker").value;
						newnbd.every_year=document.getElementById("ThunderStats.every_year").checked;
						//dump(">>>>>>>>>>>>> miczThunderStats->onAccept: [newnbd] "+JSON.stringify(newnbd)+"\r\n");
						window.arguments[0].save=true;
						window.arguments[0].newnbd=newnbd;
					break;
					case "edit":	//Modify the NBD
						let nbd=JSON.parse(args.newnbd);
						//get userinput val
						nbd.desc=document.getElementById("ThunderStats.desc").value;
						nbd.date=document.getElementById("non_biz_date_picker").value;
						nbd.every_year=document.getElementById("ThunderStats.every_year").checked;
						//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						//miczColumnsWizard_CustCols.addNewCustCol(newcol);
						window.arguments[0].save=true;
						window.arguments[0].newnbd=nbd;
					break;
				}
			}
		}

		window.close();
		return true;
	},

	checkFields:function(){
		//The fields must be filled!!

		return true;
	},

	initDatePicker: function() {
		Services.console.logStringMessage("init for business days 3");
		// moment.locale(miczThunderStatsUtils.getCurrentSystemLocale());
		//adding datepicker with week start init
		// dump(">>>>>>>>>>>>>> [miczThunderStatsTab] weekstart: "+JSON.stringify(moment().startOf("week").format('d'))+"\r\n");

		// let locale_firstweekday=moment().startOf("week").format('d');
		// let aDatepicker = document.createElement("datepicker");
		// aDatepicker.setAttribute("id", "ThunderStats.date");
		// aDatepicker.setAttribute("type", "popup");
		// aDatepicker.setAttribute("class", "ts_datepicker");
		// aDatepicker.setAttribute("firstdayofweek", locale_firstweekday);
		// document.getElementById('ThunderStats.date_placeholder').appendChild(aDatepicker);

		const currentLocale = miczThunderStatsUtils.getCurrentSystemLocale();
        const currentLocaleBase = currentLocale.split('-')[0];

        const flatpLocales = Object.keys(flatpickr.l10ns);

        if (currentLocaleBase !== 'en') {

            if (flatpLocales.includes(currentLocale)) {
                flatpickr.localize(flatpickr.l10ns[currentLocale]);
            } else if (currentLocale.includes('-') && flatpLocales.includes(currentLocaleBase)) {
                flatpickr.localize(flatpickr.l10ns[currentLocaleBase]);
            } else {
                flatpickr.localize(flatpickr.l10ns.default);
            }
        }

		let e = document.getElementById('non_biz_date_picker');
        let fp = flatpickr("#non_biz_date_picker", {
			static: true,
    
		});

		// defaultDate: [ "2019-08-30"],

	},
	// defaultDate: [ f.format("YYYY-MM-DD"), t.format("YYYY-MM-DD") ],


	fixWinHeight:function(){
		sizeToContent();
		var vbox = document.getElementById('ts_vbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

};

Services.console.logStringMessage("listener");
window.addEventListener("load", miczThunderStatsPrefPanel_NBDEditor.onLoad, false);