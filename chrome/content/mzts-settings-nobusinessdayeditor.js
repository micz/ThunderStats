"use strict";

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
			let newcol={};

			if ("action" in args){
				switch (args.action){
					case "new":  //Save new custom column
						//fixed val
						/*newcol.isBundled=false;
						newcol.isCustom=true;
						newcol.def="";
						//get userinput val
						if(document.getElementById("ColumnsWizard.id").value.match(re_id)!=null){
							newcol.index=document.getElementById("ColumnsWizard.id").value.match(re_id).join('').toLowerCase();
						}else{
							newcol.index=document.getElementById("ColumnsWizard.id").value.toLowerCase();
						}
						//Check if the custom column is already present
						let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
						let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
						let CustColIndexStr=prefs.getCharPref("index");
						let CustColIndex=new Array();
						if(CustColIndexStr!=''){
							CustColIndex=JSON.parse(CustColIndexStr);
							//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol.index] "+JSON.stringify(newcol.index)+"\r\n");
							if(CustColIndex.indexOf(newcol.index)!=-1){
								//custom column already present
								//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [CustColIndex] "+JSON.stringify(CustColIndex)+"\r\n");
								let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
								let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
								let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
								prompts.alert(window,
											  _bundleCW.GetStringFromName("ColumnsWizard.emptyFields.title"),
											  _bundleCW.GetStringFromName("ColumnsWizard.duplicatedID.text"));
								return false;
							}
						}

						if(document.getElementById("ColumnsWizard.dbHeader").value.match(re_dbh)!=null){
							newcol.dbHeader=document.getElementById("ColumnsWizard.dbHeader").value.match(re_dbh).join('').replace(':','').toLowerCase();
						}else{
							newcol.dbHeader=document.getElementById("ColumnsWizard.dbHeader").value.toLowerCase();
						}
						newcol.labelImagePath=miczColumnsWizardPref_CustColEditor.saveIcon(document.getElementById("ColumnsWizard.iconString").value,newcol.index);
						newcol.labelString=document.getElementById("ColumnsWizard.labelString").value;
						newcol.tooltipString=document.getElementById("ColumnsWizard.tooltipString").value;
						newcol.sortnumber=document.getElementById("ColumnsWizard.sortnumber").checked;
						newcol.enabled=document.getElementById("ColumnsWizard.enabled").checked;
						//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						//miczColumnsWizard_CustCols.addNewCustCol(newcol);
						window.arguments[0].save=true;
						window.arguments[0].newcol=newcol;*/
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

