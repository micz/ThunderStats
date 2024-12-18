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
import { tsPrefs } from "./mzts-options";
import { tsStore } from "./mzts-store";

export class thunderStastsCore {

  tsLog = null;
  do_debug = false;
  _involved_num = 10;
  _many_days = 7;
  accounts_adv_settings = [];

  constructor(options = {}) {
    this.do_debug = options.hasOwnProperty('do_debug') ? options.do_debug : false;
    this.tsLog = new tsLogger("thunderStastsCore",this.do_debug);
    tsPrefs.logger = this.tsLog;
    this._involved_num = options.hasOwnProperty('_involved_num') ? options._involved_num : 10;
    this._many_days = options.hasOwnProperty('_many_days') ? options._many_days : 7;
    this.accounts_adv_settings = options.hasOwnProperty('accounts_adv_settings') ? options.accounts_adv_settings : [];
  }

    async getAccountEmails(account_id = 0, no_custom_identities = false) {
      let account_emails = tsCoreUtils.getAccountEmails(account_id, no_custom_identities);
      
      this.tsLog.log("getAccountEmails => account_emails: " + JSON.stringify(account_emails));
      return account_emails;
    }

    // ================ TODAY TAB =====================
    async getToday(account_id = 0, account_emails = []) {

      let lastMidnight = new Date();
      lastMidnight.setHours(0, 0, 0, 0);
      //let lastMidnight = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY

      let filter_duplicates = await tsCoreUtils.getFilterDuplicatesPreference(account_id);

      // console.log(">>>>>>>> [getToday] filter_duplicates: " + filter_duplicates);

      return this.getFullStatsData(lastMidnight, new Date(), account_id, account_emails, false, filter_duplicates);   // the "false" is to not aggregate, we will aggregate in the TAB_ManyDays.vue to exclude today
    }

    async getToday_YesterdayData(account_id = 0, account_emails = [], count_data_to_current_time = true) {

      let yesterday_midnight = new Date();
      yesterday_midnight.setDate(yesterday_midnight.getDate() - 1);
      yesterday_midnight.setHours(0, 0, 0, 0);

      return this.getToday_SingleDayData(yesterday_midnight, account_id, account_emails, count_data_to_current_time);
    }

    async getToday_manyDaysData(account_id = 0, account_emails = []) {

      let fromDate = new Date();
      let start_date = fromDate.getDate() - this._many_days; // we get 7 days without today
      fromDate.setDate(start_date);
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date();
      let stop_date = toDate.getDate() - 1;  // we subtracting 1, to get 7 days without today
      toDate.setDate(stop_date);
      toDate.setHours(23, 59, 59, 999);

      this.tsLog.log("[getToday_manyDaysData] fromDate: " + fromDate + " - toDate: " + toDate);

      let filter_duplicates = await tsCoreUtils.getFilterDuplicatesPreference(account_id);

      return this.getAggregatedStatsData(fromDate, toDate, account_id, account_emails, filter_duplicates);
     }
    // ================ TODAY TAB - END =====================

    // ================ YESTERDAY TAB =====================
    async getYesterday(account_id = 0, account_emails = []) {

      let yesterdayMidnight = new Date();
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
      yesterdayMidnight.setHours(0, 0, 0, 0);

      return this.getSingleDay(yesterdayMidnight, account_id, account_emails);
    }
    // ================ YESTERDAY TAB - END =====================

    // ================ MANY DAYS TAB =====================
    async getManyDaysData(account_id = 0, account_emails = []) {

      let fromDate = new Date();
      let start_date = fromDate.getDate() - this._many_days; // we get 7 days + today
      fromDate.setDate(start_date);
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date();
      let stop_date = toDate.getDate();
      toDate.setDate(stop_date);
      toDate.setHours(23, 59, 59, 999);

      let filter_duplicates = await tsCoreUtils.getFilterDuplicatesPreference(account_id);

      return this.getFullStatsData(fromDate, toDate, account_id, account_emails, false, filter_duplicates);  // the "false" is to not aggregate, we will aggregate in the TAB_ManyDays.vue to exclude today
    }
    // ================ MANY DAYS TAB - END =====================

    // ================ CUSTOM QUERY TAB =====================
    async getCustomQryData(fromDate, toDate, account_id = 0, account_emails = [], only_businessdays = -99, adv_filters = null) {

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      let filter_duplicates = await tsCoreUtils.getFilterDuplicatesPreference(account_id);

      return this.getFullStatsData(fromDate, toDate, account_id, account_emails, true, filter_duplicates, only_businessdays, adv_filters);   // the "true" is to aggregate
    }
    // ================ CUSTOM QUERY TAB - END =====================

    // ================ SINGLE DAY METHODS =====================
    async getSingleDay(theDay, account_id = 0, account_emails = []) {

      theDay.setHours(0, 0, 0, 0);
      let theMidnightAfter = new Date(theDay);
      theMidnightAfter.setDate(theMidnightAfter.getDate() + 1);
      theMidnightAfter.setHours(0, 0, 0, 0);
      //let lastMidnight = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY

      // console.log(">>>>>>>>>>>>>> getYesterday yesterdayMidnight: " + JSON.stringify(yesterdayMidnight));
      // console.log(">>>>>>>>>>>>>> getYesterday lastMidnight: " + JSON.stringify(lastMidnight));

      let filter_duplicates = await tsCoreUtils.getFilterDuplicatesPreference(account_id);

      return this.getFullStatsData(theDay, theMidnightAfter, account_id, account_emails, false, filter_duplicates);   // the "false" is to not aggregate, we will aggregate in the TAB_ManyDays.vue to exclude today
    }

    async getToday_SingleDayData(theDay, account_id = 0, account_emails = [], count_data_to_current_time = true) {

      theDay.setHours(0, 0, 0, 0);
      let theMidnightAfter = new Date(theDay);
      theMidnightAfter.setDate(theMidnightAfter.getDate() + 1);
      theMidnightAfter.setHours(0, 0, 0, 0);

      let fromDate = new Date(theDay);
      let toDate = new Date(theMidnightAfter);
      // let fromDate = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY
      // let toDate = new Date(Date.now() - (24 * 60 * 60 * 1000))           // FOR TESTING ONLY

      let filter_duplicates = await tsCoreUtils.getFilterDuplicatesPreference(account_id);

      return this.getCountStatsData(fromDate, toDate, account_id, account_emails, count_data_to_current_time, filter_duplicates);
    }
    // ================ SINGLE DAY METHODS - END =====================

    // ================ BASE METHODS ========================
    async getFullStatsData(fromDate, toDate, account_id = 0, account_emails = [], do_aggregate_stats = false, filter_duplicates = false, only_businessdays = -99, adv_filters = null) {

      let start_time = performance.now();
      // console.log(">>>>>>>>>>>> [getFullStatsData] filter_duplicates: " + filter_duplicates);
      let messages_hash = new Map();

      this.tsLog.log("account_emails: " + JSON.stringify(account_emails));

      let queryInfo_FullStatsData = {
        //accountId: account_id == 0?'':account_id,     // we are directly filtering using the folders if an account has been chosen
        fromDate: fromDate,
        toDate: toDate,
      }

      // ====================== Advanced Filters ======================
      /*
        adv_filters is an object that contains various filters

        //Folders
          adv_filter.folders is an array with the "folders ids" to be included in the query
          adv_filter.folders_do_subfolders is a boolean that indicates if the subfolders should be included in the query

        // filterSubject
          adv_filter.filterSubject is a string that is searched in the subject

        // Read / Unread
          adv_filter.read_unread is an integer value: 0: all, 1: read, 2: unread

        // Flagged / Unflagged
          adv_filter.flagged_unflagged is an integer value: 0: all, 1: flagged, 2: unflagged
      */
     // ===============================================================

      let filter_folders = null;

      this.tsLog.log("adv_filters: " + JSON.stringify(adv_filters));

      if(adv_filters != null){
        //Folders
        if ((account_id != 0) && ('folders' in adv_filters) && (adv_filters.folders.length > 0)) {
          filter_folders = [...new Set(adv_filters.folders)];
        }

        // filterSubject
        if (('filterSubject' in adv_filters) && (adv_filters.filterSubject.length > 0)) {
          queryInfo_FullStatsData.subject = adv_filters.filterSubject;
        }

        // Read / Unread
        if ('read_unread' in adv_filters) {
          switch(String(adv_filters.read_unread)){
            case "1":
              queryInfo_FullStatsData.unread = false;
              break;
            case "2":
              queryInfo_FullStatsData.unread = true;
              break;
            case "0":
            default:
              break;
          }
        }

        // Flagged / Unflagged
        if ('flagged_unflagged' in adv_filters) {
          switch(String(adv_filters.flagged_unflagged)){
            case "1":
              queryInfo_FullStatsData.flagged = true;
              break;
            case "2":
              queryInfo_FullStatsData.flagged = false;
              break;
            case "0":
            default:
              break;
          }
        }
      }

      let filter_folders_115 = null;

      if(account_id != 0){
        if(filter_folders != null){
          this.tsLog.log("filter_folders: " + JSON.stringify(filter_folders));
          if(tsStore.isTB128plus){
            queryInfo_FullStatsData.folderId = filter_folders;
            queryInfo_FullStatsData.includeSubFolders = adv_filters.folders_do_subfolders;
          }else{
            filter_folders_115 = filter_folders;
            queryInfo_FullStatsData.includeSubFolders = adv_filters.folders_do_subfolders;
          }
        }else{
          if(tsStore.isTB128plus){
            queryInfo_FullStatsData.folderId = await tsCoreUtils.getAccountFoldersIds_TB128plus(account_id);
            queryInfo_FullStatsData.includeSubFolders = true;
          }else{
            filter_folders_115 = null;
            queryInfo_FullStatsData.includeSubFolders = true;
          }
        }
      }
      
      this.tsLog.log("queryInfo_FullStatsData: " + JSON.stringify(queryInfo_FullStatsData));
      
      let count = 0;
      let sent = 0;
      let received = 0;
      let count_in_inbox = 0;

      let senders = {};
      let recipients = {};

      let folders = {};
      let dates = tsUtils.getDateArray(fromDate,toDate);
      let dates_weeks = tsUtils.getDateArrayWeeks(fromDate,toDate);
      let dates_months = tsUtils.getDateArrayMonths(fromDate,toDate);
      let dates_years = tsUtils.getDateArrayYears(fromDate,toDate);

      let domains = {};
      let tags = await tsCoreUtils.getTagsList();
      tsStore.tags_list = tags;

      //let messageids_sent = [];

      let messages = null;
      
      if(tsStore.isTB128plus){
        messages = this.getMessages(browser.messages.query(queryInfo_FullStatsData));
      }else{
        if(filter_folders_115 == null){
          // get all messages for the account
          messages = this.getAccountMessages_TB115(queryInfo_FullStatsData, account_id, null, false);
        }else{
          //filter messages
          messages = this.getAccountMessages_TB115(queryInfo_FullStatsData, account_id, filter_folders_115, false);
        }
      }

      let msg_hours = {};
      for(let i = 0; i < 24; i++) {
        msg_hours[i] = {};
        msg_hours[i].sent = 0;
        msg_hours[i].received = 0;
      }

      let msg_weekdays = {};
      for(let i = 0; i < 7; i++) {
        msg_weekdays[i] = {};
        msg_weekdays[i].sent = 0;
        msg_weekdays[i].received = 0;
      }

      for await (let message of messages) {
          if(this.excludeMessage(message,account_id)) continue;
          // this.tsLog.log("message: " + JSON.stringify(message));
          let date_message = new Date(message.date);
          let hour_message = date_message.getHours();
          // folder
          if(message.folder){
          	if(!("id" in message.folder)){
          		message.folder.id = tsCoreUtils.getFolderId(message.folder);
              message.folder.specialUse = [message.folder.type];
          	}
            if (folders[message.folder.id]) {
              folders[message.folder.id].count ++;
            } else {
              folders[message.folder.id] = {};
              folders[message.folder.id].count = 1;
              folders[message.folder.id].sent = 0;
              folders[message.folder.id].received = 0;
              folders[message.folder.id].folder_data = message.folder;
            }
            if(message.folder.specialUse && message.folder.specialUse.includes('inbox')){
              count_in_inbox++;
            }
          }

          const match_author = message.author.match(tsUtils.regexEmail);

          //console.log(">>>>>>>>>>>>>>>> message.folder: " + JSON.stringify(message.folder));
          if(filter_duplicates){
            // console.log(">>>>>>>>>>>>>> filter_duplicates: message.headerMessageId: " + message.headerMessageId);
            if(messages_hash.has(message.headerMessageId)){ 
              // console.log(">>>>>>>>>>>>>> filter_duplicates: found message.headerMessageId: " + message.headerMessageId);
              //count sent and received per folder
              if (match_author) {
                const key_author = match_author[0].toLowerCase();
                if(account_emails.includes(key_author)) {
                  // group by folder
                  folders[message.folder.id].sent++;
                }else{
                  folders[message.folder.id].received++;
                }
                  continue;
                }
              }
              messages_hash.set(message.headerMessageId, true);
            // console.log(">>>>>>>>>>>>>> filter_duplicates: size: " + messages_hash.size);
          }
          // dates
          let date_message_string = tsUtils.dateToYYYYMMDD(message.date);
          let date_week_string = tsUtils.dateToYYYYWW(message.date);
          let date_month_string = tsUtils.dateToYYYYMM(message.date);
          let date_year_string = tsUtils.dateToYYYY(message.date);
          dates[date_message_string].count++;
          dates_weeks[date_week_string].count++;
          dates_months[date_month_string].count++;
          dates_years[date_year_string].count++;
          // check sender
          if (match_author) {
            const key_author = match_author[0].toLowerCase();
            if(account_emails.includes(key_author)) {
              //messageids_sent.push(message.id);
              sent++;
              // group by folder
              folders[message.folder.id].sent++;
              // group by date
              dates[date_message_string].sent++;
              dates_weeks[date_week_string].sent++;
              dates_months[date_month_string].sent++;
              dates_years[date_year_string].sent++;
              // group by hour
              msg_hours[hour_message].sent++;
              // group by weekday
              msg_weekdays[date_message.getDay()].sent++;
              // group by domain
              let allRecipients = [...message.recipients, ...message.ccList, ...message.bccList];
              let domains_array = tsCoreUtils.extractDomains(allRecipients);
              for (let domain of domains_array) {
                if (domains[domain]) {
                  domains[domain].count++;
                  domains[domain].sent++;
                } else {
                  domains[domain] = {}
                  domains[domain].count = 1;
                  domains[domain].sent = 1;
                  domains[domain].received = 0;
                }
              }
              // group by tag
              for (let tag of message.tags) {
                if (tags[tag]) {
                  tags[tag].count++;
                  tags[tag].sent++;
                } else {
                  this.tsLog.error("tag: " + tag + " not found!");
                }
              }
              // check recipients
              //console.log(">>>>>>>>>>>>> recipients: " + JSON.stringify(message.recipients));
              for (let recipient of message.recipients) {
                const match_recipient = recipient.match(tsUtils.regexEmail);
                if (match_recipient) {
                  const key_recipient = match_recipient[0].toLowerCase();
                  //if(!(account_emails.includes(key_recipient) || messageids_sent.includes(message.id))) {
                  if(!(account_emails.includes(key_recipient))) {
                    if (recipients[key_recipient]) {
                      recipients[key_recipient].count++;
                    } else {
                      recipients[key_recipient] = {}
                      recipients[key_recipient].count = 1;
                      recipients[key_recipient].name = await tsCoreUtils.getCorrespondantName(recipient);
                    }
                    // console.log(">>>>>>>>>>>>>> message.headerMessageId: " + message.headerMessageId);
                    // console.log(">>>>>>>> key_recipient: " + key_recipient);
                    // console.log(">>>>>>>> recipients[key_recipient].count: " + recipients[key_recipient].count);
                  }
                }
              }
              for (let cc of message.ccList) {
                const match_cc = cc.match(tsUtils.regexEmail);
                if (match_cc) {
                  const key_cc = match_cc[0].toLowerCase();
                  //if(!(account_emails.includes(key_cc) || messageids_sent.includes(message.id))) {
                  if(!(account_emails.includes(key_cc))) {
                    if (recipients[key_cc]) {
                      recipients[key_cc].count++;
                    } else {
                      recipients[key_cc] = {}
                      recipients[key_cc].count = 1;
                      recipients[key_cc].name = await tsCoreUtils.getCorrespondantName(cc);
                    }
                    // console.log(">>>>>>>>>>>>>> message.headerMessageId: " + message.headerMessageId);
                    // console.log(">>>>>>>> key_cc: " + key_cc);
                    // console.log(">>>>>>>> recipients[key_cc].count: " + recipients[key_cc].count);
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
              // console.log(">>>>>>>>>>>>>> message.headerMessageId: " + message.headerMessageId);
              // console.log(">>>>>>>> key_author: " + key_author);
              // console.log(">>>>>>>> senders[key_author].count: " + senders[key_author].count);
              received++;
              // group by folder
              folders[message.folder.id].received++;
              // group by date
              dates[date_message_string].received++;
              dates_weeks[date_week_string].received++;
              dates_months[date_month_string].received++;
              dates_years[date_year_string].received++;
              // group by hour
              msg_hours[hour_message].received++;
              // group by weekday
              msg_weekdays[date_message.getDay()].received++;
              // group by domain
              let curr_domain = tsCoreUtils.extractDomain(key_author);
              if (domains[curr_domain]) {
                domains[curr_domain].count++;
                domains[curr_domain].received++;
              } else {
                domains[curr_domain] = {}
                domains[curr_domain].count = 1;
                domains[curr_domain].sent = 0;
                domains[curr_domain].received = 1;
              }
              // group by tag
              for (let tag of message.tags) {
                if (tags[tag]) {
                  tags[tag].count++;
                  tags[tag].received++;
                } else {
                  this.logger.error("tag: " + tag + " not found!");
                }
              }
            }
          }
        //check recipients - END

        count++;
      }

      senders = Object.fromEntries(Object.entries(senders).sort((a, b) => b[1].count - a[1].count));
      senders = Object.fromEntries(Object.entries(senders).slice(0,this._involved_num));

      recipients = Object.fromEntries(Object.entries(recipients).sort((a, b) => b[1].count - a[1].count));
      recipients = Object.fromEntries(Object.entries(recipients).slice(0,this._involved_num));

      // console.log(">>>>>>>> final senders: " + JSON.stringify(senders));
      // console.log(">>>>>>>> final recipients: " + JSON.stringify(recipients));

      let output = {senders: senders, recipients: recipients, sent: sent, received: received, count: count, count_in_inbox: count_in_inbox, msg_hours: msg_hours, folders: folders, dates: dates, dates_weeks: dates_weeks, dates_months: dates_months, dates_years: dates_years, msg_weekdays: msg_weekdays, domains: domains, tags: tags};

      if(do_aggregate_stats) {
        output.aggregate = await this.aggregateData(dates, only_businessdays);
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
        //accountId: account_id == 0?'':account_id,     // we are directly filtering using the folders if an account has been chosen
        fromDate: fromDate,
        toDate: toDate,
        includeSubFolders: true,
      }

      if(account_id != 0){
        if(tsStore.isTB128plus){
          queryInfo_CountStatsData.folderId = await tsCoreUtils.getAccountFoldersIds_TB128plus(account_id);
        }
      }

      this.tsLog.log("queryInfo_CountStatsData: " + JSON.stringify(queryInfo_CountStatsData));

      let count = 0;
      let sent = 0;
      let received = 0;

      let messages = null;
      
      if(tsStore.isTB128plus){
        messages = this.getMessages(browser.messages.query(queryInfo_CountStatsData));
      }else{
        messages = this.getAccountMessages_TB115(queryInfo_CountStatsData, account_id, null, false);
      }

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
            const key_author = match_author[0].toLowerCase();
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
        //accountId: account_id == 0?'':account_id,     // we are directly filtering using the folders if an account has been chosen
        fromDate: fromDate,
        toDate: toDate,
        includeSubFolders: true,
      }

      if(account_id != 0){
        if(tsStore.isTB128plus){
          queryInfo_getAggregatedStatsData.folderId = await tsCoreUtils.getAccountFoldersIds_TB128plus(account_id);
        }
      }

      this.tsLog.log("queryInfo_getAggregatedStatsData: " + JSON.stringify(queryInfo_getAggregatedStatsData));
      
      let count = 0;
      let sent = 0;
      let received = 0;

      let messages = null;
      
      if(tsStore.isTB128plus){
        messages = this.getMessages(browser.messages.query(queryInfo_getAggregatedStatsData));
      }else{
        messages = this.getAccountMessages_TB115(queryInfo_getAggregatedStatsData, account_id, null, false);
      }

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
            const key_author = match_author[0].toLowerCase();
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

      output.aggregate = await this.aggregateData(msg_days);

      let stop_time = performance.now();

      output.elapsed = stop_time - start_time;

      return output;
    }

    async aggregateData(dates, only_businessdays = -99) {
      
      let filtered_dates = {};
      let prefs_bday_default_only = false;

      if(only_businessdays == -99) {
        prefs_bday_default_only = await tsPrefs.getPref(['bday_default_only']);
      } else {
        prefs_bday_default_only = only_businessdays;
      }

      // console.log(">>>>>>>>>>> bday_default_only: " + prefs_bday_default_only);
      if(prefs_bday_default_only == true){
        for (let day_message in dates) {
          if (tsCoreUtils.checkBusinessDay(day_message)) {
            filtered_dates[day_message] = dates[day_message];
            // console.log(">>>>>>>>>>>>> added day_message: " + JSON.stringify(day_message));
          }else{
            // console.log(">>>>>>>>>>>>> filtered day_message: " + JSON.stringify(day_message));
          }
        }
        // console.log(">>>>>>>>>>> filtered_dates: " + JSON.stringify(filtered_dates));
      }else{
        filtered_dates = dates;
      }

      let total_sent = 0;
      let total_received = 0;
      let max_sent = 0;
      let min_sent = Infinity;
      let max_received = 0;
      let min_received = Infinity;

      let num_days = 0;

      // console.log(">>>>>>>>>>> filtered_dates: " + JSON.stringify(filtered_dates));

      for(let i in filtered_dates) {
        total_sent += filtered_dates[i].sent;
        total_received += filtered_dates[i].received;

        if(filtered_dates[i].sent > max_sent) {
          max_sent = filtered_dates[i].sent;
        }
        if(filtered_dates[i].sent < min_sent) {
          min_sent = filtered_dates[i].sent;
        }
        if(filtered_dates[i].received > max_received) {
          max_received = filtered_dates[i].received;
        }
        if(filtered_dates[i].received < min_received) {
          min_received = filtered_dates[i].received;
        }
        num_days++;
      }

      // filtered_dates must be popolated with all the days, even with 0 values
      let avg_sent = parseFloat((total_sent / num_days).toFixed(2));
      let avg_received = parseFloat((total_received / num_days).toFixed(2));
      
      return {total_sent: total_sent, max_sent: max_sent, min_sent: min_sent, avg_sent: avg_sent, total_received: total_received, max_received: max_received, min_received: min_received, avg_received: avg_received};
    }

    excludeMessage(message, account_id = 0){    // Returns true if the message should be excluded from the stats
      if(!("specialUse" in message.folder)){
        message.folder.specialUse = [message.folder.type];
      }
      // do not include messages from drafts, trash, junk folders
      if(message.folder.specialUse && ['drafts', 'trash', 'junk'].some(specialUse => message.folder.specialUse.includes(specialUse))){
        return true;
      }
      
      // check if we have to include this message even if it is in a "archives" folder
      if(message.folder.specialUse && message.folder.specialUse.includes('archives')){
        return !tsCoreUtils.getIncludeArchivePreference(account_id);
      }

      return false;
    }

    async getInboxZeroDates(account_id = 0) {

      let start_time = performance.now();

      let inboxFolders = null;
      
      if(tsStore.isTB128plus){
        inboxFolders = await this.getInboxFolders(account_id);
      }else{
        inboxFolders = await this.getInboxFolders_TB115(account_id);
      }

      //total and unread mails in inbox
      let total = 0;
      let unread = 0;
      //dates spread
      let dates = {};

      for(let folder of inboxFolders) {
          let queryInfo_InboxZeroData = {
            //accountId: account_id == 0?'':account_id,
          }

          if(tsStore.isTB128plus){
            queryInfo_InboxZeroData.folderId = folder.id;
          }else{
            queryInfo_InboxZeroData.folder = folder;
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

    async getInboxFolders_TB115(account_id = 0){
      // let queryInfo_InboxFolders = {
      //   accountId: account_id == 0?'':account_id,
      //   specialUse: ['inbox']
      // }

      // let folders = await browser.folders.query(queryInfo_InboxFolders);

      let account = null;
      let folders = null;

      if(account_id == 0) {
        account = await browser.accounts.list(true);
        folders = account.flatMap(acc => acc.folders.filter(folder => folder.type === 'inbox'));
      } else {
        account = await browser.accounts.get(account_id, true);
        folders = account.folders.filter(folder => folder.type == 'inbox');
      }

      //test code to print the account_folders
      // let account_folders = await browser.folders.getSubFolders(await browser.accounts.get(account_id));
      // console.log(">>>>>>>>>>>>>>> account_folders: " + JSON.stringify(account_folders));

      this.tsLog.log("folders: " + JSON.stringify(folders));
      return folders;
    }

    async *getAccountMessages_TB115(queryInfo, account_id = 0, filter_folders_115 = null, do_subfolders = true) {
      this.tsLog.log("getAccountMessages_TB115 queryInfo: " + JSON.stringify(queryInfo));
      if(account_id == 0) {
        yield* this.getMessages(browser.messages.query(queryInfo));
        return;
      }

      let account = await browser.accounts.get(account_id, true);
      let folders = null;
      
      if(filter_folders_115 == null) {
        folders = await browser.folders.getSubFolders(account, do_subfolders);
      } else {
        this.tsLog.log("filter_folders_115: " + JSON.stringify(filter_folders_115));
        folders = await tsCoreUtils.getFoldersArrayFromIds(filter_folders_115, account_id);
      }

      this.tsLog.log("getAccountMessages_TB115 folders: " + JSON.stringify(folders));

      for (let folder of folders) {
        this.tsLog.log("processFolderAndSubfolders_TB115 on folder: " + JSON.stringify(folder));
        yield* this.processFolderAndSubfolders_TB115(folder, queryInfo, account_id, do_subfolders);
      }
    }

    async *processFolderAndSubfolders_TB115(folder, queryInfo, account_id, do_subfolders = true) {
      //if (this.excludeFolder(folder, account_id)) return;
      queryInfo = { ...queryInfo };
      this.tsLog.log("processFolderAndSubfolders_TB115 queryInfo: " + JSON.stringify(queryInfo));
      this.tsLog.log(` processFolderAndSubfolders Listing messages for folder: ${folder.name}, path: ${folder.path}`);
      queryInfo.folder = folder;
      this.tsLog.log("processFolderAndSubfolders queryInfo: " + JSON.stringify(queryInfo));
      yield* this.getMessages(browser.messages.query(queryInfo));
  
      if(do_subfolders){
        let subfolders = await browser.folders.getSubFolders(folder);
        for (let subfolder of subfolders) {
          this.tsLog.log("processFolderAndSubfolders_TB115 on subfolder: " + JSON.stringify(subfolder));
            yield* this.processFolderAndSubfolders_TB115(subfolder, queryInfo, account_id);
        }
      }
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
