/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024  Mic (m@micz.it)

 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { tsLogger } from "./mzts-logger";
import { tsCoreUtils } from "./mzts-statscore.utils";
import { tsUtils } from "./mzts-utils";
import { TS_prefs } from "./mzts-options";

export class thunderStastsCore {

  tsLog = null;
  do_debug = false;
  _involved_num = 10;
  _many_days = 7;
  include_archive = [];

  constructor(options = {}) {
    this.do_debug = options.hasOwnProperty('do_debug') ? options.do_debug : false;
    this.tsLog = new tsLogger("thunderStastsCore",this.do_debug);
    TS_prefs.logger = this.tsLog;
    this._involved_num = options.hasOwnProperty('_involved_num') ? options._involved_num : 10;
    this._many_days = options.hasOwnProperty('_many_days') ? options._many_days : 7;
    this.include_archive = options.hasOwnProperty('include_archive') ? options.include_archive : [];
    // this.include_archive = await TS_prefs.getPref("include_archive_accounts");
  }

    async getAccountEmails(account_id = 0, no_custom_identities = false) {
      let accounts = await browser.accounts.list();
      let account_emails = [];

      if(account_id == 0) {
        for (let account of accounts) {
            for (let identity of account.identities) {
                account_emails.push(identity.email);
            }
        }
        if(!no_custom_identities) {
          let custom_ids = await this.getAccountCustomIdentities();
          for(let cids_account in custom_ids) {
            // console.log(">>>>>>>>>>>>> getAccountEmails (all account) cids_account: " + JSON.stringify(cids_account));
            custom_ids[cids_account].forEach(element => {
              // console.log(">>>>>>>>>>>>> getAccountEmails (all account) cids_account element: " + JSON.stringify(element));
              account_emails.push(element);
            });
          }
        }
      }else{
        for (let account of accounts) {
          if(account.id == account_id) {
            for (let identity of account.identities) {
              account_emails.push(identity.email);
            }
            if(!no_custom_identities) {
              let custom_ids = await this.getAccountCustomIdentities(account_id);
              for(let custom_id in custom_ids) {
                account_emails.push(custom_ids[custom_id]);
              }
            }
          }
        }
      }
      this.tsLog.log("getAccountEmails => account_emails: " + JSON.stringify(account_emails));
      return account_emails;
    }

    async getAccountCustomIdentities(account_id = 0) {
      let prefCustomIds = await TS_prefs.getPref("custom_identities");
      // console.log(">>>>>>>>>>>>> getAccountCustomIdentities prefCustomIds: " + JSON.stringify(prefCustomIds));
      if(account_id == 0){ return prefCustomIds; }
      if(prefCustomIds.hasOwnProperty(account_id)){
        return prefCustomIds[account_id];
      } else {
          return {};
      }
    }

    // ================ TODAY TAB =====================
    async getToday(account_id = 0, account_emails = [], filter_duplicates = false) {

      let lastMidnight = new Date();
      lastMidnight.setHours(0, 0, 0, 0);
      //let lastMidnight = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY

      return this.getFullStatsData(lastMidnight, new Date(), account_id, account_emails, filter_duplicates);
    }

    async getToday_YesterdayData(account_id = 0, account_emails = [], count_data_to_current_time = true, filter_duplicates = false) {

      let yesterday_midnight = new Date();
      yesterday_midnight.setDate(yesterday_midnight.getDate() - 1);
      yesterday_midnight.setHours(0, 0, 0, 0);
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);
      //yesterday.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds(), new Date().getMilliseconds());
      // console.log(">>>>>>>>>>>>>> getToday_YesterdayData yesterday_midnight: " + JSON.stringify(yesterday_midnight));
      // console.log(">>>>>>>>>>>>>> getToday_YesterdayData yesterday: " + JSON.stringify(yesterday));
      let fromDate = new Date(yesterday_midnight);
      let toDate = new Date(yesterday);
      // let fromDate = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY
      // let toDate = new Date(Date.now() - (24 * 60 * 60 * 1000))           // FOR TESTING ONLY

      return this.getCountStatsData(fromDate, toDate, account_id, account_emails, count_data_to_current_time, filter_duplicates);
    }

    async getToday_manyDaysData(account_id = 0, account_emails = [], filter_duplicates = false) {

      let fromDate = new Date();
      let start_date = fromDate.getDate() - this._many_days; // we get 7 days without today
      fromDate.setDate(start_date);
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date();
      let stop_date = toDate.getDate() - 1;  // we subtracting 1, to get 7 days without today
      toDate.setDate(stop_date);
      toDate.setHours(23, 59, 59, 999);

      this.tsLog.log("[getToday_manyDaysData] fromDate: " + fromDate + " - toDate: " + toDate);

      return this.getAggregatedStatsData(fromDate, toDate, account_id, account_emails, filter_duplicates);
     }
    // ================ TODAY TAB - END =====================

    // ================ YESTERDAY TAB =====================
    async getYesterday(account_id = 0, account_emails = [], filter_duplicates = false) {

      let yesterdayMidnight = new Date();
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
      yesterdayMidnight.setHours(0, 0, 0, 0);
      let lastMidnight = new Date();
      lastMidnight.setHours(0, 0, 0, 0);
      //let lastMidnight = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY

      // console.log(">>>>>>>>>>>>>> getYesterday yesterdayMidnight: " + JSON.stringify(yesterdayMidnight));
      // console.log(">>>>>>>>>>>>>> getYesterday lastMidnight: " + JSON.stringify(lastMidnight));

      return this.getFullStatsData(yesterdayMidnight, lastMidnight, account_id, account_emails, filter_duplicates);
    }
    // ================ YESTERDAY TAB - END =====================

    // ================ MANY DAYS TAB =====================
    async getManyDaysData(account_id = 0, account_emails = [], filter_duplicates = false) {

      let fromDate = new Date();
      let start_date = fromDate.getDate() - this._many_days; // we get 7 days + today
      fromDate.setDate(start_date);
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date();
      let stop_date = toDate.getDate();
      toDate.setDate(stop_date);
      toDate.setHours(23, 59, 59, 999);

      return this.getFullStatsData(fromDate, toDate, account_id, account_emails, false, filter_duplicates);  // the "false" is to not aggregate, we will aggregate in the TAB_ManyDays.vue to exclude today
    }
    // ================ MANY DAYS TAB - END =====================

    // ================ CUSTOM QUERY TAB =====================
    async getCustomQryData(fromDate, toDate, account_id = 0, account_emails = [], filter_duplicates = false) {

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      return this.getFullStatsData(fromDate, toDate, account_id, account_emails, true, filter_duplicates);   // the "true" is to aggregate
    }
    // ================ CUSTOM QUERY TAB - END =====================

    // ================ BASE METHODS ========================
    async getFullStatsData(fromDate, toDate, account_id = 0, account_emails = [], do_aggregate_stats = false, filter_duplicates = false) {

      filter_duplicates= true; // for testing

      let start_time = performance.now();

      let messages_hash = new Map();

      this.tsLog.log("account_emails: " + JSON.stringify(account_emails));

      let queryInfo_FullStatsData = {
        accountId: account_id == 0?'':account_id,
        fromDate: fromDate,
        toDate: toDate,
      }
      this.tsLog.log("queryInfo_getFullStatsData: " + JSON.stringify(queryInfo_FullStatsData));
      
      let count = 0;
      let sent = 0;
      let received = 0;

      let senders = {};
      let recipients = {};

      let folders = {};
      let dates = tsUtils.getDateArray(fromDate,toDate);

      //let messageids_sent = [];

      let messages = this.getMessages(browser.messages.query(queryInfo_FullStatsData));

      let msg_hours = {};
      for(let i = 0; i < 24; i++) {
        msg_hours[i] = {};
        msg_hours[i].sent = 0;
        msg_hours[i].received = 0;
      }

      for await (let message of messages) {
          if(this.excludeMessage(message,account_id)) continue;
          // this.tsLog.log("message: " + JSON.stringify(message));
          let date_message = new Date(message.date);
          let hour_message = date_message.getHours();
          // folder
          if(message.folder){
            if(message.folder.specialUse=='sent') { continue; }
            if (folders[message.folder.id]) {
              folders[message.folder.id].count ++;
            } else {
              folders[message.folder.id] = {};
              folders[message.folder.id].count = 1;
              folders[message.folder.id].folder_data = message.folder;
            }
          }
          //console.log(">>>>>>>>>>>>>>>> message.folder: " + JSON.stringify(message.folder));
          if(filter_duplicates){
            // console.log(">>>>>>>>>>>>>> filter_duplicates: message.headerMessageId: " + message.headerMessageId);
            if(messages_hash.has(message.headerMessageId)){ 
              // console.log(">>>>>>>>>>>>>> filter_duplicates: found message.headerMessageId: " + message.headerMessageId);
              continue;
            }
            messages_hash.set(message.headerMessageId, true);
            // console.log(">>>>>>>>>>>>>> filter_duplicates: size: " + messages_hash.size);
          }
          // dates
          let date_message_string = tsUtils.dateToYYYYMMDD(message.date);
          dates[date_message_string].count++;
          // check sender
          const match_author = message.author.match(tsUtils.regexEmail);
          if (match_author) {
            const key_author = match_author[0];
            if(account_emails.includes(key_author)) {
              //messageids_sent.push(message.id);
              sent++;
              // group by date
              dates[date_message_string].sent++;
              // group by hour
              msg_hours[hour_message].sent++;
              // check recipients
              //console.log(">>>>>>>>>>>>> recipients: " + JSON.stringify(message.recipients));
              for (let recipient of message.recipients) {
                const match_recipient = recipient.match(tsUtils.regexEmail);
                if (match_recipient) {
                  const key_recipient = match_recipient[0];
                  //if(!(account_emails.includes(key_recipient) || messageids_sent.includes(message.id))) {
                  if(!(account_emails.includes(key_recipient))) {
                    if (recipients[key_recipient]) {
                      recipients[key_recipient].count++;
                    } else {
                      recipients[key_recipient] = {}
                      recipients[key_recipient].count = 1;
                      recipients[key_recipient].name = await tsCoreUtils.getCorrespondantName(recipient);
                    }
                  }
                }
              }
              for (let cc of message.ccList) {
                const match_cc = cc.match(tsUtils.regexEmail);
                if (match_cc) {
                  const key_cc = match_cc[0];
                  //if(!(account_emails.includes(key_cc) || messageids_sent.includes(message.id))) {
                  if(!(account_emails.includes(key_cc))) {
                    if (recipients[key_cc]) {
                      recipients[key_cc].count++;
                    } else {
                      recipients[key_cc] = {}
                      recipients[key_cc].count = 1;
                      recipients[key_cc].name = await tsCoreUtils.getCorrespondantName(cc);
                    }
                  }
                }
              }
            }else{
              if (senders[key_author]) {
                senders[key_author].count++;
              } else {
                senders[key_author] = {}
                senders[key_author].count = 1;
                senders[key_author].name = await tsCoreUtils.getCorrespondantName(message.author);
              }
              received++;
              // group by date
              dates[date_message_string].received++;
              // group by hour
              msg_hours[hour_message].received++;
            }
          }
        //check recipients - END
        
        count++;
      }

      senders = Object.fromEntries(Object.entries(senders).sort((a, b) => b[1].count - a[1].count));
      senders = Object.fromEntries(Object.entries(senders).slice(0,this._involved_num));

      recipients = Object.fromEntries(Object.entries(recipients).sort((a, b) => b[1].count - a[1].count));
      recipients = Object.fromEntries(Object.entries(recipients).slice(0,this._involved_num));

      let output = {senders: senders, recipients: recipients, sent: sent, received: received, count: count, msg_hours: msg_hours, folders: folders, dates: dates };

      if(do_aggregate_stats) {
        output.aggregate = this.aggregateData(dates, sent, received);
      }

      let stop_time = performance.now();

      output.elapsed = stop_time - start_time;

      return output;
    }


    async getCountStatsData(fromDate, toDate, account_id = 0, account_emails = [], count_data_to_current_time = true, filter_duplicates = false) {

      //filter_duplicates = true; // to test

      let start_time = performance.now();

      let messages_hash = new Map();

      this.tsLog.log("account_emails: " + JSON.stringify(account_emails));

      let queryInfo_CountStatsData = {
        accountId: account_id == 0?'':account_id,
        fromDate: fromDate,
        toDate: toDate,
      }
      this.tsLog.log("queryInfo_CountStatsData: " + JSON.stringify(queryInfo_CountStatsData));
      
      let count = 0;
      let sent = 0;
      let received = 0;

      let messages = this.getMessages(browser.messages.query(queryInfo_CountStatsData));

      let msg_hours = {};
      for(let i = 0; i < 24; i++) {
        msg_hours[i] = {};
        msg_hours[i].sent = 0;
        msg_hours[i].received = 0;
      }

      for await (let message of messages) {
        //console.log(">>>>>>>>>>>>>> filter_duplicates: iterating message.headerMessageId: " + message.headerMessageId);
          if(this.excludeMessage(message,account_id)) continue;
          if(filter_duplicates){
            //console.log(">>>>>>>>>>>>>> filter_duplicates: message.headerMessageId: " + message.headerMessageId);
            if(messages_hash.has(message.headerMessageId)){ 
              //console.log(">>>>>>>>>>>>>> filter_duplicates: found message.headerMessageId: " + message.headerMessageId);
              continue;
            }
            messages_hash.set(message.headerMessageId, true);
            //console.log(">>>>>>>>>>>>>> filter_duplicates: size: " + messages_hash.size);
          }
          //this.tsLog.log("message: " + JSON.stringify(message));
          let now = new Date();
          let date_message = new Date(message.date);
          let date_message_normalized = new Date(message.date);
          date_message_normalized.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
          let hour_message = date_message.getHours();
          // check sender
          const match_author = message.author.match(tsUtils.regexEmail);
          if (match_author) {
            const key_author = match_author[0];
            if(account_emails.includes(key_author)) {
              if((count_data_to_current_time)&&(date_message_normalized <= now)){
                sent++;
              }
              // group by hour
              msg_hours[hour_message].sent++;
            }else{
              if((count_data_to_current_time)&&(date_message_normalized <= now)){
                received++;
              }
              // group by hour
              msg_hours[hour_message].received++;
            }
          }
          if((count_data_to_current_time)&&(date_message_normalized <= now)){
            count++;
          }
      }
      let stop_time = performance.now();

      return {sent: sent, received: received, count: count, msg_hours: msg_hours, elapsed: stop_time - start_time};
    }

     async getAggregatedStatsData(fromDate, toDate, account_id = 0, account_emails = [], filter_duplicates = false) {

      //filter_duplicates = true; // to test

      let start_time = performance.now();

      let messages_hash = new Map();

      this.tsLog.log("account_emails: " + JSON.stringify(account_emails));

      let queryInfo_getAggregatedStatsData = {
        accountId: account_id == 0?'':account_id,
        fromDate: fromDate,
        toDate: toDate,
      }
      this.tsLog.log("queryInfo_getAggregatedStatsData: " + JSON.stringify(queryInfo_getAggregatedStatsData));
      
      let count = 0;
      let sent = 0;
      let received = 0;

      let messages = this.getMessages(browser.messages.query(queryInfo_getAggregatedStatsData));

      let msg_days = tsUtils.getDateArray(fromDate,toDate);

      this.tsLog.log("[getAggregatedStatsData] msg_days: " + JSON.stringify(msg_days));

      for await (let message of messages) {
          if(this.excludeMessage(message,account_id)) continue;
          //this.tsLog.log("message: " + JSON.stringify(message));
          if(filter_duplicates){
            // console.log(">>>>>>>>>>>>>> filter_duplicates: message.headerMessageId: " + message.headerMessageId);
            if(messages_hash.has(message.headerMessageId)){ 
              // console.log(">>>>>>>>>>>>>> filter_duplicates: found message.headerMessageId: " + message.headerMessageId);
              continue;
            }
            messages_hash.set(message.headerMessageId, true);
            // console.log(">>>>>>>>>>>>>> filter_duplicates: size: " + messages_hash.size);
          }
          let date_message = new Date(message.date);
          let day_message = tsUtils.dateToYYYYMMDD(date_message);
          msg_days[day_message] = msg_days[day_message] || {}; //ensure the object for that day exists
          // check sender
          const match_author = message.author.match(tsUtils.regexEmail);
          if (match_author) {
            const key_author = match_author[0];
            if(account_emails.includes(key_author)) {
              sent++;
              // group by hour
              msg_days[day_message].sent++;
            }else{
              received++;
              // group by hour
              msg_days[day_message].received++;
            }
          }
        
        count++;
      }

      let output = {sent: sent, received: received, count: count, msg_days: msg_days};

      output.aggregate = this.aggregateData(msg_days, sent, received);

      let stop_time = performance.now();

      output.elapsed = stop_time - start_time;

      return output;
    }

    aggregateData(dates, sent, received) {
      // dates must be popolated with all the days, even with 0 value
      let num_days = Object.keys(dates).length;
      let max_sent = 0;
      let min_sent = 0;
      //let avg_sent = parseFloat((sent / tsUtils.daysBetween(fromDate, toDate)).toFixed(2));
      let avg_sent = parseFloat((sent / num_days).toFixed(2));
      let max_received = 0;
      let min_received = 0;
      //let avg_received = parseFloat((received / tsUtils.daysBetween(fromDate, toDate)).toFixed(2));
      let avg_received = parseFloat((received / num_days).toFixed(2));

      for(let i in dates) {
        if(dates[i].sent > max_sent) {
          max_sent = dates[i].sent;
        }
        if(dates[i].sent < min_sent) {
          min_sent = dates[i].sent;
        }
        if(dates[i].received > max_received) {
          max_received = dates[i].received;
        }
        if(dates[i].received < min_received) {
          min_received = dates[i].received;
        }
      }
      return {max_sent: max_sent, min_sent: min_sent, avg_sent: avg_sent, max_received: max_received, min_received: min_received, avg_received: avg_received};
    }

    excludeMessage(message, account_id = 0){    // Returns true if the message should be excluded from the stats
      // do not include messages from drafts, trash, junk folders
      if(message.folder.specialUse && ['drafts', 'trash', 'junk'].some(specialUse => message.folder.specialUse.includes(specialUse))){
        return true;
      }
      
      // check if we have to include this message even if it is in a "archives" folder
      if(message.folder.specialUse && message.folder.specialUse.includes('archives')){
        // console.log(">>>>>>>>>>>>>>>> include_archive: " + JSON.stringify(this.include_archive));
        // console.log(">>>>>>>>>>>>>>>> this.include_archive.find(account => account.id == account_id): " + JSON.stringify(this.include_archive.find(account => account.id == account_id)));
        let element = this.include_archive.find(account => account.id == account_id);
        if(!element) return true;
        return !element.include_archive || false;
      }

      return false;
    }

    async getInboxZeroDates(account_id = 0) {

      let start_time = performance.now();

      let inboxFolders = await this.getInboxFolders(account_id);

      //total and unread mails in inbox
      let total = 0;
      let unread = 0;
      //dates spread
      let dates = {};

      for(let folder of inboxFolders) {

          let queryInfo_InboxZeroData = {
            accountId: account_id == 0?'':account_id,
            folderId: folder.id,
          }
          this.tsLog.log("queryInfo_InboxZeroData: " + JSON.stringify(queryInfo_InboxZeroData));
          
          let messages = this.getMessages(browser.messages.query(queryInfo_InboxZeroData));

          for await (let message of messages) {
            total++;
            if (!message.read) {
              unread++;
            }
            // dates
            if(message.date){
              let date_message = tsUtils.dateToYYYYMMDD(message.date);
              if (dates[date_message]) {
                dates[date_message]++;
              } else {
                dates[date_message] = 1;
              }
            }
          }
      }

      let stop_time = performance.now();

      return {total: total, unread: unread, dates: dates, elapsed: stop_time - start_time};
    }


    async getInboxFolders(account_id = 0){
      let queryInfo_InboxFolders = {
        accountId: account_id == 0?'':account_id,
        specialUse: ['inbox']
      }

      let folders = await browser.folders.query(queryInfo_InboxFolders);
      this.tsLog.log("folders: " + JSON.stringify(folders));
      return folders;
    }


    async *getMessages(list) {
      let page = await list;
      for (let message of page.messages) {
        yield message;
      }
    
      while (page.id) {
        page = await messenger.messages.continueList(page.id);
        for (let message of page.messages) {
          yield message;
        }
      }
    }

}
