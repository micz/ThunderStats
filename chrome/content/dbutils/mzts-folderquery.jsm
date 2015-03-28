/*
 * Original code thanks to https://bitbucket.org/squib/mail-summaries/
 *
*/

"use strict";
Components.utils.import("resource://thunderstats/miczLogger.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource:///modules/iteratorUtils.jsm");

let EXPORTED_SYMBOLS = ["miczThunderStatsFolderQ"];

const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

var miczThunderStatsFolderQ = {

	win:null,
	identityAddresses: null,
	_analyzers: [],
	folders: null,
	_timeoutId: null,
  /*_bundle: Cc["@mozilla.org/intl/stringbundle;1"]
                   .getService(Ci.nsIStringBundleService)
                   .createBundle("chrome://mailsummaries/locale/folderSummary.properties");
*/
	mailSession: Cc["@mozilla.org/messenger/services/session;1"].getService(Ci.nsIMsgMailSession),

	init:function(mFolders,mIdentityAddresses,mWindow){
		this.folders=mFolders;
		this.identityAddresses=mIdentityAddresses;
		this.win=mWindow;
	},

	run:function(){
		for (let key in this.folders){
			 let messages = fixIterator(this.folders[key].msgDatabase.ReverseEnumerateMessages(),Ci.nsIMsgDBHdr);
			 dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ run] messages: '+JSON.stringify(messages)+'\r\n');
			 this.processMessages(messages);
		}
	},

  /**
   * Register a new folder analyzer.
   *
   * @param analyzer the analyzer object
   */
  registerAnalyzer: function(analyzer) {
    this._analyzers.push(analyzer);
  },

  unregisterAnalyzer: function(analyzer) {
    this._analyzers.splice(this._analyzers.indexOf(analyzer));
  },

  /**
   * Process the messages in this folder. Since this can take a long time for
   * extremely large folders, we do this in small batches so as not to lock up
   * the UI.
   *
   * @param messageGenerator a generator returning a sequence of messages in the
   *        folder
   */
  processMessages: function(messageGenerator) {
    let gen = this._processMessages(messageGenerator);
    let self = this;
    let then = Date.now();

    function defer(first) {
      try {
        gen.next();
        if (first){
			self._timeoutId = self.win.setTimeout(defer, 10);
		}
      }
      catch(e if e instanceof StopIteration) {
        self._timeoutId = null;
        gen.close();
        dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ _processMessages] processMessages: Stopping...'+JSON.stringify(e)+'\r\n');
        //dump("  took "+(Date.now() - then)/1000+" seconds\n");
      }
      catch(e) {
        Cu.reportError(e);
      }
    }

    this.cancelProcessing();
    defer(true);
  },

  /**
   * Cancel any running message processing queues.
   */
  cancelProcessing: function() {
    if (this._timeoutId !== null)
      this.win.clearTimeout(this._timeoutId);
  },

  /**
   * Do the actual work for message processing. There are three phases of
   * processing, executed on each analyzer. The first phase is just
   * initializing whatever data structures are needed. In the second phase, a
   * function is called once per message. Finally, the third phase handles
   * the rendering.
   *
   * @param messageGenerator a generator returning a sequence of messages in the
   *        folder
   */
  _processMessages: function(messageGenerator) {
    // Use microseconds here.
    let maxDate = Date.now() * 1000;
    this.numDays = 30;
    this.minDate = maxDate - this.numDays * 24 * 60 * 60 * 1000000;
    this.loading = true;

    let messagesProcessed = 0;
    let maxMessages = 10000;// Services.prefs.getIntPref("extensions.mailsummaries.max_messages");
    let overflowed = false;

    for each (let [,analyzer] in Iterator(this._analyzers)) {
      analyzer.init(this);
    }

    for each (let message in messageGenerator) {
      messagesProcessed++;
      dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ _processMessages] messagesProcessed: '+JSON.stringify(messagesProcessed)+'\r\n');
      if (maxMessages != -1 && messagesProcessed > maxMessages) {
        overflowed = true;
        break;
      }
      if (messagesProcessed % 500 == 0) yield;
      if (this._processMessage(message)){
		 dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ _processMessages] returning: '+JSON.stringify(message)+'\r\n');
        return;
	  }
    }

/*   // Let the user know if we decided to bail out from processing all the
    // messages in the folder.
    document.getElementById("overflow").textContent = overflowed ?
      this.formatString("overflowNote", [maxMessages.toLocaleString()]) : "";
*/
    for each (let [,analyzer] in Iterator(this._analyzers))
      analyzer.render();

    this.loading = false;
  },

  /**
   * Process a single message.
   *
   * @param message the nsIMsgDBHdr for the message
   * @param deleted true if the message was deleted, false otherwise
   * @return true if a full reprocess was requested and queued
   */
  _processMessage: function(message, deleted) {
    // Don't process killed messages unless we're counting them as deleted.
    let isKilled = false;
    try {
      isKilled = message.isKilled
    } catch (e) {}

    if (isKilled && !deleted)
      return false;

    let reprocess = false;

    if (message.date > this.minDate) {
      for each (let [,analyzer] in Iterator(this._analyzers)) {
        if (analyzer.processRecentMessage &&
            analyzer.processRecentMessage(message, deleted)) {
          reprocess = true;
          break;
        }
      }
    }

    for each (let [,analyzer] in Iterator(this._analyzers)) {
      if (analyzer.processMessage &&
          analyzer.processMessage(message, deleted)) {
        reprocess = true;
        break;
      }
    }

    if (reprocess) {
	dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ _processMessage] reprocess: '+JSON.stringify(reprocess)+'\r\n');
      let self = this;
      setTimeout(function() { self.reprocessMessages(); }, 0);
    }
    return reprocess;
  },

  reprocessMessages: function() {
    dump(" Reprocessing messges\n");
    for each (let [,analyzer] in Iterator(this._analyzers))
      analyzer.uninit();

    if (this.isVirtualFolder) {
      this.onMessagesLoaded(gFolderDisplay, true);
    }
    else {
		let messages=new Array();
		for (let key in this.folders){
			 messages = miczThunderStatsUtils.arrayMerge(messages,fixIterator(this.folders[key].msgDatabase.ReverseEnumerateMessages(),Ci.nsIMsgDBHdr));
		}
       this.processMessages(messages);
    }
  },

  /**
   * Unload the folder summary, cleaning up widgets and unhooking event
   * listeners.
   */
  _onUnload: function() {
    //dump("Unloading folder summary\n\n");

    this.cancelProcessing();
    for each (let [,analyzer] in Iterator(this._analyzers))
      analyzer.uninit();

    this._removeListeners();
    this.folders = null;

    this.win.removeEventListener("unload", this._unloadFunc, false);
  },

  /**
   * Update analyzers (probably making them re-render their content), assuming
   * we've finished processing messages.
   */
  _updateAnalyzers: function() {
    if (!this.loading) {
      for each (let [,analyzer] in Iterator(this._analyzers)) {
        if (analyzer.update)
          analyzer.update();
      }
    }
  },

};
