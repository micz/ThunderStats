"use strict";
ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
ChromeUtils.import("resource://thunderstats/miczLogger.jsm");
ChromeUtils.import("resource:///modules/mailServices.js");

miczThunderStatsTab.folderworker={};

miczThunderStatsTab.folderworker.today_inboxmsg = {

  init: function(context) {
    this.context = context;
    this.inboxmsg = 0;
    this.inboxmsg_unread = 0;
    this.inbox0_msgdate = {};
    this.inbox0_msgdate_empty=true;
    this.msg_crunched=new Array();
    this.stale = true;
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] init done [inboxmsg: '+this.inboxmsg +'.\r\n');
  },

  uninit: function() {
    this._clear();
    delete this.inboxmsg;
    delete this.inboxmsg_unread;
    delete this.inbox0_msgdate;
    delete this.inbox0_msgdate_empty;
    delete this.msg_crunched;
  },

  /**
   * Do some processing on a message in this folder.
   *
   * @param message the message to process
   * @param deleted true if the message was deleted, false otherwise
   */
  processMessage: function(message,deleted) {
    this.stale = true;

    let addresses;
    let fullAddresses;

    //let headerValue = message.mime2DecodedAuthor;
    let headerValue = message.recipients.toLowerCase()+','+message.ccList.toLowerCase();
    let identity_addresses=this.context.identityAddresses.join(',');
    //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] identity_addresses '+JSON.stringify(identity_addresses)+'\r\n');
    //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] headerValue '+JSON.stringify(headerValue)+'\r\n');
    //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] message.recipients '+JSON.stringify(message.recipients)+'\r\n');
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] ccList '+JSON.stringify(message.getStringProperty("ccList"))+'\r\n');

    let tmpAddresses = {};
    let tmpFullAddresses = {};
    MailServices.headerParser
                .parseHeadersWithArray(headerValue, tmpAddresses, {},
                                       tmpFullAddresses);
    addresses = tmpAddresses.value;
    fullAddresses = tmpFullAddresses.value;

	//message date
	let msg_date=moment.unix(message.dateInSeconds).format("YYYY-MM-DD");
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] message.dateInSeconds '+JSON.stringify(message.dateInSeconds)+'\r\n');
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] msg_date '+JSON.stringify(msg_date)+'\r\n');
    //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] addresses '+JSON.stringify(addresses)+'\r\n');

    if (!deleted) {
      for (let i = 0; i < addresses.length; i++) {
		  if(identity_addresses.indexOf(addresses[i])>=0){
			  if(this.msg_crunched.indexOf(message.messageId)>-1)continue;
			  this.msg_crunched.push(message.messageId);
			  this.inboxmsg++;
			  if(!message.isRead){
				this.inboxmsg_unread++;
			  }
			  this.inbox0_msgdate_empty=false;
			  if(msg_date in this.inbox0_msgdate){
				this.inbox0_msgdate[msg_date]++;
			  }else{
				this.inbox0_msgdate[msg_date]=1;
			  }
			  //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] this.inboxmsg '+this.inboxmsg+'\r\n');
			  //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] headerValue '+JSON.stringify(headerValue)+'\r\n');
			  //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] message.date '+JSON.stringify(message.date)+'\r\n');
			  //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] message.messageId'+JSON.stringify(message.messageId)+'\r\n');
			  //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] message.recipients '+JSON.stringify(message.recipients)+'\r\n');
		  }
      }
    }
  },

  render:function() {
	//inbox total messages
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.today_inboxmsg] document.getElementById("today_inbox0_inboxmsg_wait") '+JSON.stringify(document.getElementById("today_inbox0_inboxmsg_wait"))+'\r\n');

	let _global_update=miczThunderStatsPrefs.getBoolPref_TS('global_update');

	miczThunderStatsTab.ui.update_inbox0_inboxmsg("today",this.inboxmsg,this.inboxmsg_unread);
	miczThunderStatsTab.ui.update_inbox0_inboxmsg("customqry_oneday",this.inboxmsg,this.inboxmsg_unread);
	if(_global_update){
		miczThunderStatsTab.ui.update_inbox0_inboxmsg("yesterday",this.inboxmsg,this.inboxmsg_unread);
	}
	miczLogger.log("Inbox messages loaded.",0);

	//inbox date spread graph
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.folderworker.today_inboxmsg render (this.inbox0_msgdate) '+JSON.stringify(this.inbox0_msgdate)+'\r\n');
	if(!this.inbox0_msgdate_empty){
		let data_array=new Array();
		for (let key in this.inbox0_msgdate){
			data_array.push({"Date":key,"Num":this.inbox0_msgdate[key]});
		}
		//sort data
		data_array.sort(miczThunderStatsUtils.array_inbox0_date_compare);
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.folderworker.today_inboxmsg render (data_array) '+JSON.stringify(data_array)+'\r\n');
		$jQ("#today_inbox0_datemsg_nomails").hide();
		$jQ("#customqry_oneday_inbox0_datemsg_nomails").hide();
		miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('today_inbox0_datemsg',data_array,true);	//the last parameter is to activate aggregation
		miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('customqry_oneday_inbox0_datemsg',data_array,true);	//the last parameter is to activate aggregation
		if(_global_update){
			$jQ("#yestarday_inbox0_datemsg_nomails").hide();
			miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('yesterday_inbox0_datemsg',data_array,true);	//the last parameter is to activate aggregation
		}
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_today_inbox0_datemsg handleCompletion '+JSON.stringify(this.data)+'\r\n');
	}else{
		miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('today_inbox0_datemsg',{},true);	//the last parameter is to activate aggregation
		miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('customqry_oneday_inbox0_datemsg',{},true);	//the last parameter is to activate aggregation
		$jQ("#today_inbox0_datemsg_nomails").show();
		$jQ("#customqry_oneday_inbox0_datemsg_nomails").show();
		if(_global_update){
			miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('yesterday_inbox0_datemsg',{},true);	//the last parameter is to activate aggregation
			$jQ("#yesterday_inbox0_datemsg_nomails").show();
		}
	}
	miczLogger.log("Date Inbox Mails data loaded.",0);

    this.stale = false;
  },

  update: function() {
    if (this.stale) {
      this._clear();
      this.render();
    }
  },

  _clear: function() {
	  //
  },

};

miczThunderStatsTab.folderworker.yesterday_inboxmsg = {

  init: function(context) {
    this.context = context;
    this.inboxmsg = 0;
    this.inboxmsg_unread = 0;
    this.inbox0_msgdate = {};
    this.inbox0_msgdate_empty=true;
    this.msg_crunched=new Array();
    this.stale = true;
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.yesterday_inboxmsg] init done [inboxmsg: '+this.inboxmsg +'.\r\n');
  },

  uninit: function() {
    this._clear();
    delete this.inboxmsg;
    delete this.inboxmsg_unread;
    delete this.inbox0_msgdate;
    delete this.inbox0_msgdate_empty;
    delete this.msg_crunched;
  },

  /**
   * Do some processing on a message in this folder.
   *
   * @param message the message to process
   * @param deleted true if the message was deleted, false otherwise
   */
  processMessage: function(message,deleted) {
    this.stale = true;

    let addresses;
    let fullAddresses;

    //let headerValue = message.mime2DecodedAuthor;
    let headerValue = message.recipients.toLowerCase()+','+message.ccList.toLowerCase();
    let identity_addresses=this.context.identityAddresses.join(',');
    //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.yesterday_inboxmsg] identity_addresses '+JSON.stringify(identity_addresses)+'\r\n');
    //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.yesterday_inboxmsg] headerValue '+JSON.stringify(headerValue)+'\r\n');

    let tmpAddresses = {};
    let tmpFullAddresses = {};
    MailServices.headerParser
                .parseHeadersWithArray(headerValue, tmpAddresses, {},
                                       tmpFullAddresses);
    addresses = tmpAddresses.value;
    fullAddresses = tmpFullAddresses.value;

    //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.yesterday_inboxmsg] addresses '+JSON.stringify(addresses)+'\r\n');

    //message date
	let msg_date=moment.unix(message.dateInSeconds).format("YYYY-MM-DD");

    if (!deleted) {
      for (let i = 0; i < addresses.length; i++) {
		  if(identity_addresses.indexOf(addresses[i])>=0){
			  if(this.msg_crunched.indexOf(message.messageId)>-1)continue;
			  this.msg_crunched.push(message.messageId);
			  this.inboxmsg++;
			  if(!message.isRead){
				this.inboxmsg_unread++;
			  }
			  this.inbox0_msgdate_empty=false;
			  if(msg_date in this.inbox0_msgdate){
				this.inbox0_msgdate[msg_date]++;
			  }else{
				this.inbox0_msgdate[msg_date]=1;
			  }
			  //dump('>>>>>>>>>>>>>> [miczThunderStatsTab.folderworker.yesterday_inboxmsg] this.inboxmsg '+this.inboxmsg+'\r\n');
		  }
      }
    }
  },

  render:function() {
	//inbox total messages
	miczThunderStatsTab.ui.update_inbox0_inboxmsg("yesterday",this.inboxmsg,this.inboxmsg_unread);
	miczLogger.log("Inbox messages loaded.",0);

	//inbox date spread graph
	//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.folderworker.yesterday_inboxmsg render (this.inbox0_msgdate) '+JSON.stringify(this.inbox0_msgdate)+'\r\n');
	if(!this.inbox0_msgdate_empty){
		let data_array=new Array();
		for (let key in this.inbox0_msgdate){
			data_array.push({"Date":key,"Num":this.inbox0_msgdate[key]});
		}
		//sort data
		data_array.sort(miczThunderStatsUtils.array_inbox0_date_compare);
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.folderworker.yesterday_inboxmsg render (data_array) '+JSON.stringify(data_array)+'\r\n');
		$jQ("#yesterday_inbox0_datemsg_nomails").hide();
		miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('yesterday_inbox0_datemsg',data_array,true);	//the last parameter is to activate aggregation
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.stats_yesterday_inbox0_datemsg handleCompletion '+JSON.stringify(this.data)+'\r\n');
	}else{
		miczThunderStatsTab.ui.drawInbox0DateSpreadGraph('yesterday_inbox0_datemsg',{},true);	//the last parameter is to activate aggregation
		$jQ("#yesterday_inbox0_datemsg_nomails").show();
	}
	miczLogger.log("Date Inbox Mails data loaded.",0);

    this.stale = false;
  },

  update: function() {
    if (this.stale) {
      this._clear();
      this.render();
    }
  },

  _clear: function() {
	  //
  },

};
