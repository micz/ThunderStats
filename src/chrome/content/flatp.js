"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');


var flatp = {

	onLoad: function(){
		flatp.initDatePicker();
		//Fixing window height
		// this.fixWinHeight();

		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];

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
		if(!miczThunderStatsPrefPanel_NBDEditor.checkFields()){
			return false;
		}

		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];
			let newnbd={};

			if ("action" in args){
				switch (args.action){
					case "new":  //Save new NBD
						//get userinput val
						newnbd.desc=document.getElementById("ThunderStats.desc").value;
						newnbd.date=document.getElementById("ThunderStats.date").dateValue;
						newnbd.every_year=document.getElementById("ThunderStats.every_year").checked;
						//dump(">>>>>>>>>>>>> miczThunderStats->onAccept: [newnbd] "+JSON.stringify(newnbd)+"\r\n");
						window.arguments[0].save=true;
						window.arguments[0].newnbd=newnbd;
					break;
					case "edit":	//Modify the NBD
						let nbd=JSON.parse(args.newnbd);
						//get userinput val
						nbd.desc=document.getElementById("ThunderStats.desc").value;
						nbd.date=document.getElementById("ThunderStats.date").dateValue;
						nbd.every_year=document.getElementById("ThunderStats.every_year").checked;
						//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						//miczColumnsWizard_CustCols.addNewCustCol(newcol);
						window.arguments[0].save=true;
						window.arguments[0].newnbd=nbd;
					break;
				}
			}
		}

		return true;
	},

	tsOk: function(e) {
		Services.console.logStringMessage("okay");
		window.close();
	},

	checkFields:function(){
		//The fields must be filled!!

		return true;
	},

	initDatePicker: function() {
		Services.console.logStringMessage("init for business days 2");
		Services.console.logStringMessage("flatp locales "+ Object.keys(flatpickr.l10ns));
        // console.debug('flatp locales ' + Object.keys(flatpickr.l10ns));

        const flatpLocales = Object.keys(flatpickr.l10ns);

		console.debug('initialize piAnd and tocker');
		// let e = document.getElementById('date_picker1');
		// console.debug('picker '+e.getAttribute('placeholder'));

		flatpickr.localize(flatpickr.l10ns.default);
        let fp = flatpickr("#non_biz_date_picker", {
			// let fp = flatpickr("#date_picker1", {
			static: true,
            maxDate: "today",
            defaultDate: [ "2019-08-31"],
    
		});

		Services.console.logStringMessage("after picker");
		e.setAttribute('placeholder','pick a date');
		console.debug('initialize finish');
	},
	// defaultDate: [ f.format("YYYY-MM-DD"), t.format("YYYY-MM-DD") ],


};

Services.console.logStringMessage("active listener");
window.addEventListener("load", flatp.onLoad, false);