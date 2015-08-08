"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");

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
					/*	let currcol=JSON.parse(args.currcol);
						let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
						let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
						document.getElementById("cw_desc.label").label=_bundleCW.GetStringFromName("ColumnsWizard.DescEdit.label");

						//fill the fields
						document.getElementById("ThunderStats.desc").setAttribute("value",currcol.index);
						document.getElementById("ThunderStats.date").setAttribute("value",currcol.dbHeader);
						document.getElementById("ThunderStats.every_year").setAttribute("value",currcol.labelString);

						//disable the ID and dbheader field
						document.getElementById("ColumnsWizard.id").setAttribute("readonly",true);
						document.getElementById("ColumnsWizard.dbHeader").setAttribute("readonly",true);
						document.getElementById("ColumnsWizard.labelString").focus();*/
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
					case "edit":	//Modify the custom column
						/*let currcol=JSON.parse(args.currcol);
						//fixed val
						newcol.isBundled=false;
						newcol.isCustom=true;
						newcol.def="";
						//get userinput val
						newcol.index=currcol.index;
						newcol.dbHeader=currcol.dbHeader;
						newcol.labelImagePath=miczColumnsWizardPref_CustColEditor.saveIcon(document.getElementById("ColumnsWizard.iconString").value,newcol.index);
						if(newcol.labelImagePath==""){	//no image, try to delete it, maybe we are modifying and removing an image
							this.deleteIcon(newcol.dbHeader);
						}
						newcol.labelString=document.getElementById("ColumnsWizard.labelString").value;
						newcol.tooltipString=document.getElementById("ColumnsWizard.tooltipString").value;
						newcol.sortnumber=document.getElementById("ColumnsWizard.sortnumber").checked;
						newcol.enabled=document.getElementById("ColumnsWizard.enabled").checked;
						//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						//miczColumnsWizard_CustCols.addNewCustCol(newcol);
						window.arguments[0].save=true;
						window.arguments[0].newcol=newcol;*/
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

