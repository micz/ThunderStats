/*
 *  ThunderStats [https://micz.it/thunderdbird-addon-thunderstats-your-thunderbird-statistics/]
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
import { tsUtils } from "./mzts-utils";

export class thunderStastsCore {

  regexEmail = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  tsLog = null;
  do_debug = false;
  _involved_num = 10;
  _many_days = 7;

  constructor(options = {}) {
    this.do_debug = options.hasOwnProperty('do_debug') ? options.do_debug : false;
    this.tsLog = new tsLogger("thunderStastsCore",this.do_debug);
    this._involved_num = options.hasOwnProperty('_involved_num') ? options._involved_num : 10;
    this._many_days = options.hasOwnProperty('_many_days') ? options._many_days : 7;
  }

    async getAccountEmails(account_id = 0) {
      let accounts = await browser.accounts.list();
      let account_emails = [];

      if(account_id == 0) {
      for (let account of accounts) {
          for (let identity of account.identities) {
              account_emails.push(identity.email);
          }
        }
      }else{
        for (let account of accounts) {
          if(account.id == account_id) {
            for (let identity of account.identities) {
              account_emails.push(identity.email);
            }
          }
        }
      }

     return account_emails;
    }


    // ================ TODAY TAB =====================
    async getToday(account_id = 0, account_emails = []) {

      let lastMidnight = new Date();
      lastMidnight.setHours(0, 0, 0, 0);
      //let lastMidnight = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY

      return this.getFullStatsData(lastMidnight, new Date(), account_id, account_emails);
    }

    async getToday_YesterdayData(account_id = 0, account_emails = []) {

      let lastMidnight = new Date();
      lastMidnight.setHours(0, 0, 0, 0);

      let yesterday_midnight = new Date();
      yesterday_midnight.setDate(yesterday_midnight.getDate() - 1);
      yesterday_midnight.setHours(0, 0, 0, 0);
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds(), new Date().getMilliseconds());
      let fromDate = new Date(yesterday_midnight);
      let toDate = new Date(yesterday);
      // let fromDate = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY
      // let toDate = new Date(Date.now() - (24 * 60 * 60 * 1000))           // FOR TESTING ONLY

      return this.getCountStatsData(fromDate, toDate, account_id, account_emails);
    }

    async getToday_manyDaysData(account_id = 0, account_emails = []) {

      let fromDate = new Date();
      let start_date = fromDate.getDate() - this._many_days - 1; // TODO: why are we subtracting 1?
      fromDate.setDate(start_date);
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date();
      let stop_date = toDate.getDate();
      toDate.setDate(stop_date);
      toDate.setHours(23, 59, 59, 999);

       return this.getAggregatedStatsData(fromDate, toDate, account_id, account_emails);
     }
    // ================ TODAY TAB - END =====================


    // ================ YESTERDAY TAB =====================
    async getYesterday(account_id = 0, account_emails = []) {

      let yesterdayMidnight = new Date();
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
      yesterdayMidnight.setHours(0, 0, 0, 0);
      let lastMidnight = new Date();
      lastMidnight.setHours(0, 0, 0, 0);
      //let lastMidnight = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY

      return this.getFullStatsData(yesterdayMidnight, lastMidnight, account_id, account_emails);
    }

    // ================ YESTERDAY TAB - END =====================

    // ================ BASE METHODS ========================
    async getFullStatsData(fromDate, toDate, account_id = 0, account_emails = [], do_aggregate_stats = false) {

      let start_time = performance.now();

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
      let dates = {};

      let messageids_sent = [];

      let messages = this.getMessages(browser.messages.query(queryInfo_FullStatsData));

      let msg_hours = {};
      for(let i = 0; i < 24; i++) {
        msg_hours[i] = {};
        msg_hours[i].sent = 0;
        msg_hours[i].received = 0;
      }

      for await (let message of messages) {
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
          // dates
          let date_message_string = tsUtils.dateToYYYYMMDD(message.date);
          if (dates[date_message_string]) {
            dates[date_message_string].count++;
          } else {
            dates[date_message_string] = {};
            dates[date_message_string].count = 1;
            dates[date_message_string].sent = 0;
            dates[date_message_string].received = 0;
          }
          // check sender
          const match_author = message.author.match(this.regexEmail);
          if (match_author) {
            const key_author = match_author[0];
            if(account_emails.includes(key_author)) {
              messageids_sent.push(message.id);
              sent++;
              // group by date
              dates[date_message_string].sent++;
              // group by hour
              msg_hours[hour_message].sent++;
              // check recipients
              for (let recipient of message.recipients) {
                const match_recipient = recipient.match(this.regexEmail);
                if (match_recipient) {
                  const key_recipient = match_recipient[0];
                  if(!(account_emails.includes(key_recipient) || messageids_sent.includes(message.id))) {
                    if (recipients[key_recipient]) {
                      recipients[key_recipient] ++;
                    } else {
                      recipients[key_recipient] = 1;
                    }
                  }
                }
              }
              for (let cc of message.ccList) {
                const match_cc = cc.match(this.regexEmail);
                if (match_cc) {
                  const key_cc = match_cc[0];
                  if(!(account_emails.includes(key_cc) || messageids_sent.includes(message.id))) {
                    if (recipients[key_cc]) {
                      recipients[key_cc] ++;
                    } else {
                      recipients[key_cc] = 1;
                    }
                  }
                }
              }
            }else{
              if (senders[key_author]) {
                senders[key_author] ++;
              } else {
                senders[key_author] = 1;
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

      senders = Object.fromEntries(Object.entries(senders).sort((a, b) => b[1] - a[1]));
      senders = Object.fromEntries(Object.entries(senders).slice(0,this._involved_num));

      recipients = Object.fromEntries(Object.entries(recipients).sort((a, b) => b[1] - a[1]));
      recipients = Object.fromEntries(Object.entries(recipients).slice(0,this._involved_num));

      let stop_time = performance.now();

      let output = {senders: senders, recipients: recipients, sent: sent, received: received, count: count, msg_hours: msg_hours, folders: folders, dates: dates, elapsed: tsUtils.humanReadableMilliseconds(stop_time - start_time)};

      if(do_aggregate_stats) {
          let max_sent = 0;
          let min_sent = 0;
          let avg_sent = parseFloat((sent / tsUtils.daysBetween(fromDate, toDate)).toFixed(2));
          let max_received = 0;
          let min_received = 0;
          let avg_received = parseFloat((received / tsUtils.daysBetween(fromDate, toDate)).toFixed(2));

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
          output.aggregate = {max_sent: max_sent, min_sent: min_sent, avg_sent: avg_sent, max_received: max_received, min_received: min_received, avg_received: avg_received};
      }

      return output;
    }


    async getCountStatsData(fromDate, toDate, account_id = 0, account_emails = []) {

      let start_time = performance.now();

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
          //this.tsLog.log("message: " + JSON.stringify(message));
          let date_message = new Date(message.date);
          let hour_message = date_message.getHours();
          // check sender
          const match_author = message.author.match(this.regexEmail);
          if (match_author) {
            const key_author = match_author[0];
            if(account_emails.includes(key_author)) {
              sent++;
              // group by hour
              msg_hours[hour_message].sent++;
            }else{
              received++;
              // group by hour
              msg_hours[hour_message].received++;
            }
          }
        
        count++;
      }

      let stop_time = performance.now();

      return {sent: sent, received: received, count: count, msg_hours: msg_hours, elapsed: tsUtils.humanReadableMilliseconds(stop_time - start_time)};
    }

     async getAggregatedStatsData(fromDate, toDate, account_id = 0, account_emails = []) {

      let start_time = performance.now();

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

      for await (let message of messages) {
          //this.tsLog.log("message: " + JSON.stringify(message));
          let date_message = new Date(message.date);
          let day_message = tsUtils.dateToYYYYMMDD(date_message);
          msg_days[day_message] = msg_days[day_message] || {}; //ensure the object for that day exists
          // check sender
          const match_author = message.author.match(this.regexEmail);
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

      let max_sent = 0;
      let min_sent = 0;
      let avg_sent = parseFloat((sent / tsUtils.daysBetween(fromDate, toDate)).toFixed(2));
      let max_received = 0;
      let min_received = 0;
      let avg_received = parseFloat((received / tsUtils.daysBetween(fromDate, toDate)).toFixed(2));

      for(let i in msg_days) {
        if(msg_days[i].sent > max_sent) {
          max_sent = msg_days[i].sent;
        }
        if(msg_days[i].sent < min_sent) {
          min_sent = msg_days[i].sent;
        }
        if(msg_days[i].received > max_received) {
          max_received = msg_days[i].received;
        }
        if(msg_days[i].received < min_received) {
          min_received = msg_days[i].received;
        }
      }

      let stop_time = performance.now();

      return {sent: sent, received: received, count: count, msg_days: msg_days, max_sent: max_sent, min_sent: min_sent, max_received: max_received, min_received: min_received, avg_sent: avg_sent, avg_received: avg_received, elapsed: tsUtils.humanReadableMilliseconds(stop_time - start_time)};
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

      return {total: total, unread: unread, dates: dates, elapsed: tsUtils.humanReadableMilliseconds(stop_time - start_time)};
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
