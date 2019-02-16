/*
 * Original code thanks to https://bitbucket.org/squib/mail-summaries/
 *
*/

"use strict";
ChromeUtils.import("resource://thunderstats/miczLogger.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
ChromeUtils.import("resource:///modules/iteratorUtils.jsm");

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

	init:function(mFolders,mIdentityAddresses,mWindow,mSplitted,mCurrentAccountKey){
		if(mSplitted){	//go only the selected account's folders
			this.folders=mFolders[mCurrentAccountKey];
		}else{			//go in all folders
			this.folders=mFolders;
		}
		this.identityAddresses=mIdentityAddresses;
		this.win=mWindow;
	},

	run:function(){
		for (let analyzer of this._analyzers) {
		  analyzer.init(this);
		}
		let messages=new Array(); // actually creates an array of iterators
		for (let key in this.folders){
			messages.push(fixIterator(this.folders[key].msgDatabase.ReverseEnumerateMessages(), Ci.nsIMsgDBHdr));
			//let fld = this.folders[key],
			//	mails = fixIterator(fld.msgDatabase.ReverseEnumerateMessages(), Ci.nsIMsgDBHdr),
				//l = messages.length;
				//messages.push(mails);
				//miczLogger.log('Iterator ' + l + ' for server ' + fld.server.prettyName + ' ...\n'+'Total according to nsIMsgFolder: ' + fld.getTotalMessages(false) , 0);
		}
		//miczLogger.log('this.processMessages(messages) - messages:  '+JSON.stringify(messages));
		this.processMessages(messages);
	},

  /**
   * Register a new folder analyzer.
   *
   * @param analyzer the analyzer object
   */
  registerAnalyzer: function(analyzer) {
    if(this._analyzers.indexOf(analyzer)==-1){
		this._analyzers.push(analyzer);
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab registerAnalyzer] analyzer: '+analyzer +'\r\n');
	}
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
  processMessages: function(messageGenerator_array) {
    let gen = this._processMessages(messageGenerator_array),
        self = this,
        then = Date.now(),
        iErrors = 0,
        iGeneratorCalls = 0;

    //dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ processMessages] CALL\r\n');

	function defer(first) {
		iGeneratorCalls++;
		try{
			gen.next();
		}catch(e){
			iErrors++;
		}
		if(!self.loading){
			//dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ processMessages] DONE\r\n');
			self._timeoutId = null;
			//gen.close();
		}else{
			/*dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ processMessages] ITERATION\r\n');
			if (first){
			dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ processMessages] ITERATION - FIRST\r\n');
			//self._timeoutId = self.win.setTimeout(defer, 10);
			}*/
			self._timeoutId = self.win.setTimeout(defer, 10);
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
  _processMessages: function*(messageGenerator_array) {
    // Use microseconds here.
    let maxDate = Date.now() * 1000;
    this.numDays = 30;
    this.minDate = maxDate - this.numDays * 24 * 60 * 60 * 1000000;
    this.loading = true;

    let messagesProcessed = 0;
    let maxMessages = 100000;// Services.prefs.getIntPref("extensions.mailsummaries.max_messages");
    let overflowed = false;

    /*for (let analyzer of this._analyzers) {
      analyzer.init(this);
    }*/

    for (let messageGenerator of messageGenerator_array) {
      //let messageGenerator=messageGenerator_array[akey];
      //dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ _processMessages] akey: '+JSON.stringify(akey)+'\r\n');

      for (let message of messageGenerator) {
        messagesProcessed++;
        //dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ _processMessages] messagesProcessed: '+JSON.stringify(messagesProcessed)+'\r\n');
        if (maxMessages != -1 && messagesProcessed > maxMessages) {
        overflowed = true;
        break;
        }
        if (messagesProcessed % 500 == 0) yield undefined;
        if (this._processMessage(message)){
        return;
        }
      }
    }

   // Let the user know if we decided to bail out from processing all the
   // messages in the folder.
  if (overflowed){
		miczLogger.log("Too many message in the inbox! More than " + maxMessages + "... We stopped counting...",2);
	}

    for (let analyzer of this._analyzers)
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
      for (let analyzer of this._analyzers) {
        if (analyzer.processRecentMessage &&
            analyzer.processRecentMessage(message, deleted)) {
          reprocess = true;
          break;
        }
      }
    }

    for (let analyzer of this._analyzers) {
      if (analyzer.processMessage &&
          analyzer.processMessage(message, deleted)) {
        reprocess = true;
        break;
      }
    }

    if (reprocess) {
	//dump('>>>>>>>>>>>>>> [miczThunderStatsFolderQ _processMessage] reprocess: '+JSON.stringify(reprocess)+'\r\n');
      let self = this;
      this.win.setTimeout(function() { self.reprocessMessages(); }, 0);
    }
    return reprocess;
  },

  reprocessMessages: function() {
   //dump(" Reprocessing messages\n");
    for (let analyzer of this._analyzers)
      analyzer.uninit();
		let messages=new Array();
		for (let key of this.folders){
			 if (this.isVirtualFolder(this.folders[key])) { continue; }
			 messages.push(fixIterator(this.folders[key].msgDatabase.ReverseEnumerateMessages(),Ci.nsIMsgDBHdr));
    	}
    	this.processMessages(messages);
  },

  /**
   * Unload the folder summary, cleaning up widgets and unhooking event
   * listeners.
   */
  _onUnload: function() {
    //dump("Unloading folder summary\n\n");

    this.cancelProcessing();
    for (let analyzer of this._analyzers)
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
      for (let analyzer of this._analyzers) {
        if (analyzer.update)
          analyzer.update();
      }
    }
  },

    /**
   * Determine whether the current folder is virtual or not.
   *
   * @return true if the folder is virtual, false otherwise.
   */
  isVirtualFolder:function(mFolder) {
    return mFolder.isSpecialFolder(Ci.nsMsgFolderFlags.Virtual);
  },

  /**
   * Determine whether the current folder is an outgoing one or not.
   *
   * @return true if the folder is outgoing, false otherwise.
   */
  isOutgoingFolder:function(mFolder) {
    const outgoingFlags =
      Ci.nsMsgFolderFlags.SentMail | Ci.nsMsgFolderFlags.Drafts |
      Ci.nsMsgFolderFlags.Templates | Ci.nsMsgFolderFlags.Queue;
    return mFolder.isSpecialFolder(outgoingFlags);
  },

  isInbox:function(mFolder) {
    return mFolder.isSpecialFolder(Ci.nsMsgFolderFlags.Inbox);
  },


};
