"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

miczThunderStatsTab.folderworker={};

miczThunderStatsTab.folderworker.today_inboxmsg = {

  init: function(context) {
    this.context = context;
    this.inboxmsg = 0;
    this.stale = true;
  },

  uninit: function() {
    this._clear();
    delete this.inboxmsg;
  },

  /**
   * Do some processing on a message in this folder.
   *
   * @param message the message to process
   * @param deleted true if the message was deleted, false otherwise
   */
  processMessage: function (message,deleted) {
    this.stale = true;

    let addresses;
    let fullAddresses;

    let headerValue = message.mime2DecodedAuthor;
    let identity_address=this.context.identityAddress;

    let tmpAddresses = {};
    let tmpFullAddresses = {};
    MailServices.headerParser
                .parseHeadersWithArray(headerValue, tmpAddresses, {},
                                       tmpFullAddresses);
    addresses = tmpAddresses.value;
    fullAddresses = tmpFullAddresses.value;

    if (!deleted) {
      for (let i = 0; i < addresses.length; i++) {
		  if(identity_address==addresses[i]){
			  this.inboxmsg++;
		  }
      }
    }
  },

  /**
   * Render the top correspondents list. This includes the subset of the
   * sparkline for each correspondent, to be shown on mouseover.
   */
  render:function() {
	miczThunderStatsTab.ui.hideLoadingElement("today_inbox0_inboxmsg_wait");
	$jQ("#today_inbox0_inboxmsg").text(this.inboxmsg);
	miczLogger.log("Inbox messages loaded.",0);
    this.stale = false;
  },

  update: function topCorrespondentsWidget_update() {
    if (this.stale) {
      this._clear();
      this.render();
    }
  },

  _clear: function() {

  },

};
