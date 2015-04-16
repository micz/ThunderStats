/*
 *	Original code thanks to Axel Grude: https://addons.mozilla.org/en-us/thunderbird/addon/quickfolders-tabbed-folders/
 *
 * */
"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsPrefs"];

var miczThunderStatsPrefs = {
	service: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
	pref_base:'extensions.ThunderStats.',

	get isDebug() {
		return this.getBoolPref_TS("debug");
	},

	get showLogPanelStartup() {
		return this.getBoolPref_TS("log_panel_startup");
	},

	get showIdentitiesSelector() {
		return this.getBoolPref_TS("identities_selector");
	},

	accountCustomIdentities:function(account_key){
		let account_pref='acc_cust_ids.'+account_key;
		if(this.existsCharPref(this.pref_base+account_pref)){
			return this.getCharPref_TS(account_pref);
		}else{
			return '';
		}
	},

	/*isDebugOption: function(option) { // granular debugging
		if(!this.isDebug) return false;
		try {return this.getBoolPref_TS("debug." + option);}
		catch(e) {return false;}
	},*/

	existsCharPref: function existsCharPref(pref) {
		try {
			if(this.service.prefHasUserValue(pref))
				return true;
			if (this.service.getCharPref(pref))
				return true;
		}
		catch (e) {return false; }
		return false;
	},

	existsBoolPref: function existsBoolPref(pref) {
		try {
			if(this.service.prefHasUserValue(pref))
				return true;
			if (this.service.getBoolPref(pref))
				return true;
		}
		catch (e) {return false; }
		return false;
	},

	getBoolPref_TS: function getBoolPref_TS(p) {
	  let ans;
	  try {
	    ans = this.service.getBoolPref(this.pref_base + p);
		}
		catch(ex) {
		  //QuickFolders.Util.logException("getBoolPref("  + p +") failed\n", ex);
		  throw(ex);
		}
		return ans;
	},

	getBoolPref: function getBoolPref(p) {
	  let ans;
	  try {
	    ans = this.service.getBoolPref(p);
		}
		catch(ex) {
		  //QuickFolders.Util.logException("getBoolPref("  + p +") failed\n", ex);
		  throw(ex);
		}
		return ans;
	},

	setBoolPref_TS: function setBoolPref_TS(p, v) {
		return this.service.setBoolPref(this.pref_base + p, v);
	},

	setBoolPref: function setBoolPref(p, v) {
		return this.service.setBoolPref(p, v);
	},

	getCharPref_TS: function getCharPref_TS(p) {
		return this.service.getCharPref(this.pref_base + p);
	},

	getCharPref: function getCharPref(p) {
		return this.service.getCharPref(p);
	},

	setCharPref_TS: function setCharPref_TS(p, v) {
		return this.service.setCharPref(this.pref_base + p, v);
	},

	setCharPref: function setCharPref(p, v) {
		return this.service.setCharPref(p, v);
	},

	getIntPref_TS: function getIntPref_TS(p) {
		return this.getIntPreference(this.pref_base + p);
	},

	getIntPref: function getIntPref(p) {
		return this.getIntPreference(p);
	},

	setIntPref_TS: function setIntPref_TS(p, v) {
		return this.service.setIntPref(this.pref_base + p, v);
	},

	setIntPref: function setIntPref(p, v) {
		return this.service.setIntPref(p, v);
	},

}