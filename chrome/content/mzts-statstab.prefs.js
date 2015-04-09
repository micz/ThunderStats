/*
 *	Original code thanks to Axel Grude: https://addons.mozilla.org/en-us/thunderbird/addon/quickfolders-tabbed-folders/
 *
 * */
"use strict";
var miczThunderStatsPrefs = {
	service: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
	pref_base:'extensions.ThunderStats.',

	get isDebug() {
		return this.getBoolPref("debug");
	},

	/*isDebugOption: function(option) { // granular debugging
		if(!this.isDebug) return false;
		try {return this.getBoolPref("debug." + option);}
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

	getBoolPrefGeneric: function getBoolPrefSilent(p) {
		try {
			return this.service.getBoolPref(p);
		}
		catch(e) {
			return false;
		}
	},

	getBoolPref: function getBoolPref(p) {
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

	setBoolPref: function setBoolPref(p, v) {
		return this.service.setBoolPref(this.pref_base + p, v);
	},

	getCharPref: function getCharPref(p) {
		return this.service.getCharPref(this.pref_base + p);
	},

	setCharPref: function setCharPref(p, v) {
		return this.service.setCharPref(this.pref_base + p, v);
	},

	getIntPref: function getIntPref(p) {
		return this.getIntPreference(this.pref_base + p);
	},

	setIntPref: function setIntPref(p, v) {
		return this.service.setIntPref(this.pref_base + p, v);
	},

	setBoolPrefVerbose: function setBoolPrefVerbose(p, v) {
		try {
			return this.service.setBoolPref(p, v);
		}
    	catch(e) {
			let s="Err:" +e;
//			QuickFolders.Util.logException("setBoolPrefVerbose(" + p + ") failed\n", e);
			return false;
		}
	},

}