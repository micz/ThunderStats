"use strict";
ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");

var miczThunderStatsPrefPanel_NBDEditor = {

	onLoad: function(){
		this.initDatePicker();
		//Fixing window height
		this.fixWinHeight();

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

	checkFields:function(){
		//The fields must be filled!!

		return true;
	},

	initDatePicker: function() {
		moment.locale(miczThunderStatsUtils.getCurrentSystemLocale());
		//adding datepicker with week start init
		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] weekstart: "+JSON.stringify(moment().startOf("week").format('d'))+"\r\n");
		let locale_firstweekday=moment().startOf("week").format('d');
		let aDatepicker = document.createElement("datepicker");
		aDatepicker.setAttribute("id", "ThunderStats.date");
		aDatepicker.setAttribute("type", "popup");
		aDatepicker.setAttribute("class", "ts_datepicker");
		aDatepicker.setAttribute("firstdayofweek", locale_firstweekday);
		document.getElementById('ThunderStats.date_placeholder').appendChild(aDatepicker);
	},

	fixWinHeight:function(){
		sizeToContent();
		var vbox = document.getElementById('ts_vbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

};

