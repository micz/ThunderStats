"use strict";
ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
/**
 * @constructor
 *
 * @param {string} branch_name
 * @param {Function} callback must have the following arguments:
 *   branch, pref_leaf_name
 */
miczThunderStatsTab.PrefListener = function (branch_name, callback) {
  // Keeping a reference to the observed preference branch or it will get
  // garbage collected.
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService);
  this._branch = prefService.getBranch(branch_name);
  this._branch.QueryInterface(Components.interfaces.nsIPrefBranch);
  this._callback = callback;
}

miczThunderStatsTab.PrefListener.prototype.observe = function(subject, topic, data) {
  if (topic == 'nsPref:changed')
    this._callback(this._branch, data);
};

/**
 * @param {boolean=} trigger if true triggers the registered function
 *   on registration, that is, when this method is called.
 */
miczThunderStatsTab.PrefListener.prototype.register = function(trigger) {
  this._branch.addObserver('', this, false);
  if (trigger) {
    let that = this;
    this._branch.getChildList('', {}).
      forEach(function (pref_leaf_name)
        { that._callback(that._branch, pref_leaf_name); });
  }
};

miczThunderStatsTab.PrefListener.prototype.unregister = function() {
  if (this._branch)
    this._branch.removeObserver('', this);
};

//Adding preferences listener
miczThunderStatsTab.TSListener = new miczThunderStatsTab.PrefListener(
  "extensions.ThunderStats.bday.",
  function(branch, name) {//dump("PrefListener call: "+name+"\n\r");
		miczThunderStatsUtils._y_ui_strings_update_needed=true;
		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.TSListener: Prefs modified!\r\n");
  }
);
miczThunderStatsTab.TSListener.register(false);
