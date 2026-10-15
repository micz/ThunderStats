/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024 - 2026 Mic (m@micz.it)

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
import { tsCoreUtils, clearContactsNamesCache } from "./mzts-statscore.utils";
import { tsUtils, EmailMatcher, DomainMatcher } from "./mzts-utils";
import { tsPrefs } from "./mzts-options";
import { tsStore } from "./mzts-store";
import { prefs_default } from "./mzts-options-default";

// Messages per page of a messages.query: bigger pages mean fewer round trips to Thunderbird for the same messages
export const MESSAGES_PER_PAGE = 500;
// Days ending today (today and yesterday) whose message headers the recent days cache keeps, so the
// Today and Yesterday tabs are built from the cache scan instead of running a full scan each
export const RECENT_MESSAGES_DAYS = 2;
// Folders never counted in the stats (with their subfolders)
const EXCLUDED_FOLDERS_SPECIAL_USE = ['drafts', 'trash', 'junk', 'templates', 'outbox'];

// messages.query does not document whether a message dated exactly fromDate or toDate is returned:
// every query asks for one more second on both sides and inRange() checks the range, both ends included.
// The ranges of a day end at 23:59:59.999, so a mail at midnight always belongs to exactly one day.
const QUERY_DATE_MARGIN_MS = 1000;

function queryDates(fromDate, toDate) {
  return {
    fromDate: new Date(fromDate.getTime() - QUERY_DATE_MARGIN_MS),
    toDate: new Date(toDate.getTime() + QUERY_DATE_MARGIN_MS),
  };
}

function inRange(message, fromDate, toDate) {
  let time = new Date(message.date).getTime();
  return time >= fromDate.getTime() && time <= toDate.getTime();
}

// Lower case address of the author, or null when the author has no address
function authorKey(message) {
  return tsUtils.extractEmail(message.author);
}

// With the duplicates filter on, true for a message whose Message-ID was already seen (and remembers it).
// A message without a Message-ID cannot be told apart from the others: never a duplicate
function isDuplicate(filter_duplicates, messages_hash, message) {
  if(!filter_duplicates || !message.headerMessageId) return false;
  if(messages_hash.has(message.headerMessageId)) return true;
  messages_hash.set(message.headerMessageId, true);
  return false;
}

export class thunderStastsCore {

  tsLog = null;
  do_debug = false;
  _involved_num = 10;
  _many_days = 7;
  accounts_adv_settings = [];
  include_archive = {};     // account_id -> include the "archives" folders (loaded by loadIncludeArchive before each scan)
  filter_duplicates = {};   // account_id -> filter duplicates setting (see getFilterDuplicates)
  folders_ids = {};         // account_id -> ids of the folders to query (see getStatsFoldersIds)

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
      
      this.tsLog.log(() => "getAccountEmails => account_emails: " + JSON.stringify(account_emails));
      return account_emails;
    }

    // ================ TODAY TAB =====================
    async getToday(account_id = 0, account_emails = [], internal_domains = []) {

      let lastMidnight = new Date();
      lastMidnight.setHours(0, 0, 0, 0);
      //let lastMidnight = new Date(Date.now() - 56 * (24 * 60 * 60 * 1000));   // FOR TESTING ONLY

      let filter_duplicates = await this.getFilterDuplicates(account_id);

      // console.log(">>>>>>>> [getToday] filter_duplicates: " + filter_duplicates);

      return this.getFullStatsData(lastMidnight, new Date(), account_id, account_emails, false, filter_duplicates, -99, null, internal_domains);   // the "false" is to not aggregate, we will aggregate in the TAB_ManyDays.vue to exclude today
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

      return this.getAggregatedRecentDays(fromDate, toDate, account_id, account_emails);
     }
    // ================ TODAY TAB - END =====================

    // ================ YESTERDAY TAB =====================
    async getYesterday(account_id = 0, account_emails = [], internal_domains = []) {

      let yesterdayMidnight = new Date();
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
      yesterdayMidnight.setHours(0, 0, 0, 0);

      return this.getSingleDay(yesterdayMidnight, account_id, account_emails, internal_domains);
    }
    // ================ YESTERDAY TAB - END =====================

    // ================ MANY DAYS TAB =====================
    async getManyDaysData(account_id = 0, account_emails = [], internal_domains = []) {

      let fromDate = new Date();
      let start_date = fromDate.getDate() - this._many_days; // we get 7 days + today
      fromDate.setDate(start_date);
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date();
      let stop_date = toDate.getDate();
      toDate.setDate(stop_date);
      toDate.setHours(23, 59, 59, 999);

      let filter_duplicates = await this.getFilterDuplicates(account_id);

      return this.getFullStatsData(fromDate, toDate, account_id, account_emails, false, filter_duplicates, -99, null, internal_domains);  // the "false" is to not aggregate, we will aggregate in the TAB_ManyDays.vue to exclude today
    }
    // Counts of the _many_days days before the Many Days period (which ends yesterday), for the comparison with the previous period.
    // Served from the recent days cache when the range is covered (2 * _many_days within the cache size), so the scan is shared with Today/Yesterday
    async getManyDaysPreviousPeriod(account_id = 0, account_emails = []) {

      let fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - (2 * this._many_days));
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date();
      toDate.setDate(toDate.getDate() - this._many_days - 1);
      toDate.setHours(23, 59, 59, 999);

      return this.getAggregatedRecentDays(fromDate, toDate, account_id, account_emails);
    }
    // ================ MANY DAYS TAB - END =====================

    // ================ CUSTOM QUERY TAB =====================
    async getCustomQryData(fromDate, toDate, account_id = 0, account_emails = [], only_businessdays = -99, adv_filters = null, internal_domains = []) {

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      let filter_duplicates = await this.getFilterDuplicates(account_id);

      return this.getFullStatsData(fromDate, toDate, account_id, account_emails, true, filter_duplicates, only_businessdays, adv_filters, internal_domains);   // the "true" is to aggregate
    }
    // Count-only stats of the num_days days before theDay (theDay excluded), for the pace of a single-day query
    async getDaysBefore(theDay, num_days, account_id = 0, account_emails = []) {

      let fromDate = new Date(theDay);
      fromDate.setDate(fromDate.getDate() - num_days);
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date(theDay);
      toDate.setDate(toDate.getDate() - 1);
      toDate.setHours(23, 59, 59, 999);

      return this.getAggregatedRecentDays(fromDate, toDate, account_id, account_emails);
    }
    // ================ CUSTOM QUERY TAB - END =====================


    // ================ SINGLE DAY METHODS =====================
    async getSingleDay(theDay, account_id = 0, account_emails = [], internal_domains = []) {

      theDay.setHours(0, 0, 0, 0);
      // the end of the day, not the next midnight: the date arrays of the output must not get the next day
      let theDayEnd = new Date(theDay);
      theDayEnd.setHours(23, 59, 59, 999);

      let filter_duplicates = await this.getFilterDuplicates(account_id);

      return this.getFullStatsData(theDay, theDayEnd, account_id, account_emails, false, filter_duplicates, -99, null, internal_domains);   // the "false" is to not aggregate, we will aggregate in the TAB_ManyDays.vue to exclude today
    }

    async getToday_SingleDayData(theDay, account_id = 0, account_emails = [], count_data_to_current_time = true) {

      theDay.setHours(0, 0, 0, 0);

      // the whole day, up to its last millisecond (a mail at the next midnight belongs to the next day)
      let fromDate = new Date(theDay);
      let toDate = new Date(theDay);
      toDate.setHours(23, 59, 59, 999);

      let filter_duplicates = await this.getFilterDuplicates(account_id);

      return this.getCountStatsData(fromDate, toDate, account_id, account_emails, count_data_to_current_time, filter_duplicates);
    }
    // Hourly counts of the same weekday in the previous num_weeks weeks, used as the "usual day" baseline.
    // When theDay is a business day, past non-business days (holidays) are skipped.
    // The days come from the recent days cache when the range is covered, otherwise from a single scan.
    async getWeekdayBaseline(theDay, account_id = 0, account_emails = [], num_weeks = 6) {

      let start_time = performance.now();
      let only_business_days = tsCoreUtils.checkBusinessDay(tsUtils.dateToYYYYMMDD(theDay));

      let days_keys = [];
      for(let week = num_weeks; week >= 1; week--) {
        let pastDay = new Date(theDay);
        pastDay.setDate(pastDay.getDate() - (7 * week));
        pastDay.setHours(0, 0, 0, 0);
        let key = tsUtils.dateToYYYYMMDD(pastDay);
        if(only_business_days && !tsCoreUtils.checkBusinessDay(key)) continue;
        days_keys.push(key);
      }

      if(days_keys.length == 0) {
        return {days: [], elapsed: performance.now() - start_time};
      }

      let fromDate = new Date(theDay);
      fromDate.setDate(fromDate.getDate() - (7 * num_weeks));
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date(theDay);
      toDate.setDate(toDate.getDate() - 1);
      toDate.setHours(23, 59, 59, 999);

      let scan = await this.getDays(fromDate, toDate, account_id, account_emails);
      let stop_time = performance.now();

      return {days: days_keys.map(key => scan.days[key].msg_hours), elapsed: stop_time - start_time};
    }

    // ================ RECENT DAYS CACHE =====================
    // Per-day sent/received counts and hourly grid of a date range, from the recent days cache when
    // the range is covered by it, otherwise from a direct scan. Output: {days: {YYYYMMDD: {sent, received, msg_hours}}, elapsed}
    async getDays(fromDate, toDate, account_id = 0, account_emails = []) {
      let filter_duplicates = await this.getFilterDuplicates(account_id);

      let range = tsRecentDaysCache.getRange();
      if(fromDate >= range.fromDate && toDate <= range.toDate) {
        let recent = await this.getRecentDays(account_id, account_emails, filter_duplicates);
        let days = {};
        for(let key of Object.keys(tsUtils.getDateArray(fromDate, toDate))) {
          days[key] = recent.days[key];
        }
        return {days: days, elapsed: recent.elapsed, from_cache: true};
      }

      return this.scanDays(fromDate, toDate, account_id, account_emails, filter_duplicates);
    }

    // Per-day sent/received counts of a range with their total/max/min/avg ({sent, received, count, msg_days, aggregate, elapsed}),
    // built from getDays (so from the cache when possible)
    async getAggregatedRecentDays(fromDate, toDate, account_id = 0, account_emails = []) {
      let start_time = performance.now();
      let scan = await this.getDays(fromDate, toDate, account_id, account_emails);

      let sent = 0;
      let received = 0;
      let msg_days = tsUtils.getDateArray(fromDate, toDate);
      for(let key in msg_days) {
        msg_days[key].sent = scan.days[key].sent;
        msg_days[key].received = scan.days[key].received;
        sent += scan.days[key].sent;
        received += scan.days[key].received;
      }

      let output = {sent: sent, received: received, count: sent + received, msg_days: msg_days};
      output.aggregate = await this.aggregateData(msg_days);
      output.elapsed = scan.from_cache ? performance.now() - start_time : scan.elapsed;
      return output;
    }

    // The last recent_days_cache_days days before today, scanned once and shared by all the tabs
    // (Today/Yesterday baseline and previous days, Custom Query pace). The cache key includes today's
    // date, the account, its emails, the duplicates and archive settings; clearCoreCaches() resets it.
    async getRecentDays(account_id = 0, account_emails = [], filter_duplicates = false) {
      let range = tsRecentDaysCache.getRange();
      let key = [
        tsUtils.dateToYYYYMMDD(range.toDate),
        tsRecentDaysCache.days,
        account_id,
        [...account_emails].sort().join(','),
        filter_duplicates,
        await this.loadIncludeArchive(account_id),
      ].join('|');

      if(tsRecentDaysCache.key != key) {
        this.tsLog.log("[getRecentDays] scanning, cache key: " + key);
        tsRecentDaysCache.key = key;
        tsRecentDaysCache.promise = this.scanDays(range.fromDate, range.toDate, account_id, account_emails, filter_duplicates, tsRecentDaysCache.getMessagesFromDate())
          .catch((error) => {
            if(tsRecentDaysCache.key == key) clearCoreCaches();
            throw error;
          });
      } else {
        this.tsLog.log("[getRecentDays] using the cache");
      }

      return tsRecentDaysCache.promise;
    }

    // One scan of a date range, grouped by day and hour. Output: {days: {YYYYMMDD: {sent, received, msg_hours}}, messages, elapsed}
    // With keep_messages_from, the headers of the messages dated from that day on are kept as they come from
    // the query (no exclusion, no duplicates filter) in messages: {YYYYMMDD: [MessageHeader]}, so the
    // callers that need the whole message can build their stats without a query of their own
    async scanDays(fromDate, toDate, account_id = 0, account_emails = [], filter_duplicates = false, keep_messages_from = null) {

      let start_time = performance.now();

      let days = {};
      let kept_messages = {};
      let keep_messages_from_key = keep_messages_from === null ? null : tsUtils.dateToYYYYMMDD(keep_messages_from);
      for(let key of Object.keys(tsUtils.getDateArray(fromDate, toDate))) {
        let msg_hours = {};
        for(let i = 0; i < 24; i++) {
          msg_hours[i] = {sent: 0, received: 0};
        }
        days[key] = {sent: 0, received: 0, msg_hours: msg_hours};
        if(keep_messages_from_key !== null && key >= keep_messages_from_key) kept_messages[key] = [];
      }

      const emailMatcher = new EmailMatcher(account_emails);
      let messages_hash = new Map();

      let queryInfo_ScanDays = {
        ...queryDates(fromDate, toDate),
        folderId: await this.getStatsFoldersIds(account_id),
        includeSubFolders: false,
        messagesPerPage: MESSAGES_PER_PAGE,
      }

      this.tsLog.log(() => "queryInfo_ScanDays: " + JSON.stringify(queryInfo_ScanDays));

      let messages = this.getMessages(() => browser.messages.query(queryInfo_ScanDays));

      await this.loadIncludeArchive(account_id);
      for await (let message of messages) {
          if(!inRange(message, fromDate, toDate)) continue;
          let date_message = new Date(message.date);
          let day_key = tsUtils.dateToYYYYMMDD(date_message);
          if(kept_messages[day_key] !== undefined) kept_messages[day_key].push(message);
          if(this.excludeMessage(message,account_id)) continue;
          if(isDuplicate(filter_duplicates, messages_hash, message)) continue;
          let day = days[day_key];
          if(day === undefined) continue;   // outside the range (should not happen)
          let hour_message = date_message.getHours();
          const key_author = authorKey(message);
          if(key_author !== null && emailMatcher.matches(key_author)) {
            day.sent++;
            day.msg_hours[hour_message].sent++;
          }else{
            day.received++;
            day.msg_hours[hour_message].received++;
          }
      }

      let stop_time = performance.now();

      return {days: days, messages: kept_messages, elapsed: stop_time - start_time};
    }

    // The messages of a date range, to iterate with for await: the headers kept by the recent days cache when
    // the range lies within the days it keeps (see RECENT_MESSAGES_DAYS), so Today and Yesterday share the
    // cache scan instead of each running a full scan, otherwise the pages of the query started by queryFn.
    // The callers apply the range, the exclusions and the duplicates filter themselves in both cases.
    async getRangeMessages(fromDate, toDate, account_id, account_emails, filter_duplicates, queryFn) {
      let range = tsRecentDaysCache.getRange();
      if(fromDate >= tsRecentDaysCache.getMessagesFromDate() && toDate <= range.toDate) {
        this.tsLog.log("[getRangeMessages] using the messages of the recent days cache");
        let recent = await this.getRecentDays(account_id, account_emails, filter_duplicates);
        let output = [];
        for(let key of Object.keys(tsUtils.getDateArray(fromDate, toDate))) {
          output.push(...(recent.messages[key] ?? []));
        }
        return output;
      }
      return this.getMessages(queryFn);
    }
    // ================ RECENT DAYS CACHE - END =====================
    // ================ SINGLE DAY METHODS - END =====================

    // ================ BASE METHODS ========================
    async getFullStatsData(fromDate, toDate, account_id = 0, account_emails = [], do_aggregate_stats = false, filter_duplicates = false, only_businessdays = -99, adv_filters = null, internal_domains = []) {

      let start_time = performance.now();
      // console.log(">>>>>>>>>>>> [getFullStatsData] filter_duplicates: " + filter_duplicates);
      let messages_hash = new Map();

      this.tsLog.log(() => "account_emails: " + JSON.stringify(account_emails));

      const emailMatcher = new EmailMatcher(account_emails);
      const domainMatcher = new DomainMatcher(internal_domains);

      let queryInfo_FullStatsData = {
        //accountId: account_id == 0?'':account_id,     // we are directly filtering using the folders if an account has been chosen
        ...queryDates(fromDate, toDate),
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

      this.tsLog.log(() => "adv_filters: " + JSON.stringify(adv_filters));

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

      if(filter_folders != null){
        // folders chosen by the user in the Custom Query advanced filters
        this.tsLog.log(() => "filter_folders: " + JSON.stringify(filter_folders));
        queryInfo_FullStatsData.folderId = filter_folders;
        queryInfo_FullStatsData.includeSubFolders = adv_filters.folders_do_subfolders;
      }else{
        queryInfo_FullStatsData.folderId = await this.getStatsFoldersIds(account_id);
        queryInfo_FullStatsData.includeSubFolders = false;
      }
      queryInfo_FullStatsData.messagesPerPage = MESSAGES_PER_PAGE;
      
      this.tsLog.log(() => "queryInfo_FullStatsData: " + JSON.stringify(queryInfo_FullStatsData));
      
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
      let unknown_tags = new Set();
      tsStore.tags_list = tags;

      //let messageids_sent = [];

      // the advanced filters are part of the query: with them the cached messages cannot be used
      let messages = adv_filters == null
        ? await this.getRangeMessages(fromDate, toDate, account_id, account_emails, filter_duplicates, () => browser.messages.query(queryInfo_FullStatsData))
        : this.getMessages(() => browser.messages.query(queryInfo_FullStatsData));

      let msg_hours = {};
      for(let i = 0; i < 24; i++) {
        msg_hours[i] = {};
        msg_hours[i].sent = 0;
        msg_hours[i].received = 0;
        msg_hours[i].sent_internal = 0;
        msg_hours[i].sent_external = 0;
        msg_hours[i].received_internal = 0;
        msg_hours[i].received_external = 0;
      }

      // day x hour sent/received counts (only the days with mails), so the averages can leave out the day in progress
      let msg_hours_days = {};
      const dayHours = (day_string) => {
        if(!msg_hours_days[day_string]) {
          msg_hours_days[day_string] = {};
          for(let h = 0; h < 24; h++) {
            msg_hours_days[day_string][h] = { sent: 0, received: 0 };
          }
        }
        return msg_hours_days[day_string];
      };

      // weekday x hour grid, used by the "when mail arrives" heatmap
      let msg_weekday_hours = {};
      for(let d = 0; d < 7; d++) {
        msg_weekday_hours[d] = {};
        for(let h = 0; h < 24; h++) {
          msg_weekday_hours[d][h] = { sent: 0, received: 0 };
        }
      }

      let msg_weekdays = {};
      for(let i = 0; i < 7; i++) {
        msg_weekdays[i] = {};
        msg_weekdays[i].sent = 0;
        msg_weekdays[i].received = 0;
        msg_weekdays[i].sent_internal = 0;
        msg_weekdays[i].sent_external = 0;
        msg_weekdays[i].received_internal = 0;
        msg_weekdays[i].received_external = 0;
      }

      await this.loadIncludeArchive(account_id);
      for await (let message of messages) {
          if(!inRange(message, fromDate, toDate)) continue;
          if(this.excludeMessage(message,account_id)) continue;
          // this.tsLog.log("message: " + JSON.stringify(message));
          let date_message = new Date(message.date);
          let hour_message = date_message.getHours();
          // folder
          if(message.folder){
            if (folders[message.folder.id]) {
              folders[message.folder.id].count ++;
            } else {
              folders[message.folder.id] = {};
              folders[message.folder.id].count = 1;
              folders[message.folder.id].sent = 0;
              folders[message.folder.id].received = 0;
              folders[message.folder.id].folder_data = message.folder;
            }
          }

          // an author without an address (e.g. "Mail Delivery System") is never one of the account emails: received
          const key_author = authorKey(message);
          const is_sent = key_author !== null && emailMatcher.matches(key_author);

          //console.log(">>>>>>>>>>>>>>>> message.folder: " + JSON.stringify(message.folder));
          if(isDuplicate(filter_duplicates, messages_hash, message)){
            //count sent and received per folder
            if(is_sent) {
              folders[message.folder.id].sent++;
            }else{
              folders[message.folder.id].received++;
            }
            continue;
          }
          // inbox (after the duplicates check, like every other counter)
          if(message.folder && message.folder.specialUse && message.folder.specialUse.includes('inbox')){
            count_in_inbox++;
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
            if(is_sent) {
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
              dayHours(date_message_string)[hour_message].sent++;
              // group by weekday
              msg_weekdays[date_message.getDay()].sent++;
              msg_weekday_hours[date_message.getDay()][hour_message].sent++;
              // group by domain
              let allRecipients = [...message.recipients, ...message.ccList, ...message.bccList];
              let domains_array = tsCoreUtils.extractDomains(allRecipients);
              let sent_has_internal = false;
              let sent_has_external = false;
              for (let domain of domains_array) {
                if (domainMatcher.matches(domain)) {
                  sent_has_internal = true;
                } else {
                  sent_has_external = true;
                }
                if (domains[domain]) {
                  domains[domain].count++;
                  domains[domain].sent++;
                } else {
                  domains[domain] = {
                    count: 1,
                    sent: 1,
                    received: 0,
                    internal: domainMatcher.matches(domain)
                  };
                }
              }
              // internal/external sent counters
              if (sent_has_internal && !sent_has_external) {
                dates[date_message_string].sent_internal++;
                dates_weeks[date_week_string].sent_internal++;
                dates_months[date_month_string].sent_internal++;
                dates_years[date_year_string].sent_internal++;
                msg_hours[hour_message].sent_internal++;
                msg_weekdays[date_message.getDay()].sent_internal++;
              } else {
                dates[date_message_string].sent_external++;
                dates_weeks[date_week_string].sent_external++;
                dates_months[date_month_string].sent_external++;
                dates_years[date_year_string].sent_external++;
                msg_hours[hour_message].sent_external++;
                msg_weekdays[date_message.getDay()].sent_external++;
              }
              // group by tag
              for (let tag of message.tags) {
                if (tags[tag]) {
                  tags[tag].count++;
                  tags[tag].sent++;
                  if (sent_has_internal && !sent_has_external) {
                    tags[tag].sent_internal = (tags[tag].sent_internal || 0) + 1;
                  } else {
                    tags[tag].sent_external = (tags[tag].sent_external || 0) + 1;
                  }
                } else {
                  unknown_tags.add(tag);
                }
              }
              // group by folder - internal/external
              if (sent_has_internal && !sent_has_external) {
                folders[message.folder.id].sent_internal = (folders[message.folder.id].sent_internal || 0) + 1;
              } else {
                folders[message.folder.id].sent_external = (folders[message.folder.id].sent_external || 0) + 1;
              }
              // check recipients
              //console.log(">>>>>>>>>>>>> recipients: " + JSON.stringify(message.recipients));
              for (let recipient of message.recipients) {
                const key_recipient = tsUtils.extractEmail(recipient);
                if (key_recipient !== null) {
                  //if(!(account_emails.includes(key_recipient) || messageids_sent.includes(message.id))) {
                  if(!(emailMatcher.matches(key_recipient))) {
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
                const key_cc = tsUtils.extractEmail(cc);
                if (key_cc !== null) {
                  //if(!(account_emails.includes(key_cc) || messageids_sent.includes(message.id))) {
                  if(!(emailMatcher.matches(key_cc))) {
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
              if (key_author !== null) {
                if (senders[key_author]) {
                  senders[key_author].count++;
                } else {
                  senders[key_author] = {}
                  senders[key_author].count = 1;
                  senders[key_author].name = await tsCoreUtils.getCorrespondantName(message.author);
                }
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
              // group by inbox
              if(message.folder.specialUse && message.folder.specialUse.includes('inbox')){
                dates[date_message_string].inbox++;
                dates_weeks[date_week_string].inbox++;
                dates_months[date_month_string].inbox++;
                dates_years[date_year_string].inbox++;
              }
              // group by hour
              msg_hours[hour_message].received++;
              dayHours(date_message_string)[hour_message].received++;
              // group by weekday
              msg_weekdays[date_message.getDay()].received++;
              msg_weekday_hours[date_message.getDay()][hour_message].received++;
              // group by domain (an author without an address has no domain: external)
              let curr_domain = tsCoreUtils.extractDomain(key_author);
              let is_received_internal = curr_domain !== null && domainMatcher.matches(curr_domain);
              if (curr_domain === null) {
                // nothing to group
              } else if (domains[curr_domain]) {
                domains[curr_domain].count++;
                domains[curr_domain].received++;
              } else {
                domains[curr_domain] = {
                  count: 1,
                  sent: 0,
                  received: 1,
                  internal: is_received_internal
                };
              }
              // internal/external received counters
              if (is_received_internal) {
                dates[date_message_string].received_internal++;
                dates_weeks[date_week_string].received_internal++;
                dates_months[date_month_string].received_internal++;
                dates_years[date_year_string].received_internal++;
                msg_hours[hour_message].received_internal++;
                msg_weekdays[date_message.getDay()].received_internal++;
              } else {
                dates[date_message_string].received_external++;
                dates_weeks[date_week_string].received_external++;
                dates_months[date_month_string].received_external++;
                dates_years[date_year_string].received_external++;
                msg_hours[hour_message].received_external++;
                msg_weekdays[date_message.getDay()].received_external++;
              }
              // group by tag
              for (let tag of message.tags) {
                if (tags[tag]) {
                  tags[tag].count++;
                  tags[tag].received++;
                  if (is_received_internal) {
                    tags[tag].received_internal = (tags[tag].received_internal || 0) + 1;
                  } else {
                    tags[tag].received_external = (tags[tag].received_external || 0) + 1;
                  }
                } else {
                  unknown_tags.add(tag);
                }
              }
              // group by folder - internal/external
              if (is_received_internal) {
                folders[message.folder.id].received_internal = (folders[message.folder.id].received_internal || 0) + 1;
              } else {
                folders[message.folder.id].received_external = (folders[message.folder.id].received_external || 0) + 1;
              }
            }
        //check recipients - END

        count++;
      }

      if(unknown_tags.size > 0) {
        // tags deleted from Thunderbird but still on some messages: not counted
        this.tsLog.log(() => "[getFullStatsData] tags not defined, not counted: " + [...unknown_tags].join(', '));
      }

      senders = Object.fromEntries(Object.entries(senders).sort((a, b) => b[1].count - a[1].count));
      senders = Object.fromEntries(Object.entries(senders).slice(0,this._involved_num));

      recipients = Object.fromEntries(Object.entries(recipients).sort((a, b) => b[1].count - a[1].count));
      recipients = Object.fromEntries(Object.entries(recipients).slice(0,this._involved_num));

      // console.log(">>>>>>>> final senders: " + JSON.stringify(senders));
      // console.log(">>>>>>>> final recipients: " + JSON.stringify(recipients));

      let output = {senders: senders, recipients: recipients, sent: sent, received: received, count: count, count_in_inbox: count_in_inbox, msg_hours: msg_hours, msg_hours_days: msg_hours_days, folders: folders, dates: dates, dates_weeks: dates_weeks, dates_months: dates_months, dates_years: dates_years, msg_weekdays: msg_weekdays, msg_weekday_hours: msg_weekday_hours, domains: domains, tags: tags};

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

      const emailMatcher = new EmailMatcher(account_emails);

      let messages_hash = new Map();

      this.tsLog.log(() => "account_emails: " + JSON.stringify(account_emails));

      let queryInfo_CountStatsData = {
        //accountId: account_id == 0?'':account_id,     // we are directly filtering using the folders if an account has been chosen
        ...queryDates(fromDate, toDate),
        folderId: await this.getStatsFoldersIds(account_id),
        includeSubFolders: false,
        messagesPerPage: MESSAGES_PER_PAGE,
      }

      this.tsLog.log(() => "queryInfo_CountStatsData: " + JSON.stringify(queryInfo_CountStatsData));

      let count = 0;
      let sent = 0;
      let received = 0;

      let messages = await this.getRangeMessages(fromDate, toDate, account_id, account_emails, filter_duplicates, () => browser.messages.query(queryInfo_CountStatsData));

      let msg_hours = {};
      for(let i = 0; i < 24; i++) {
        msg_hours[i] = {};
        msg_hours[i].sent = 0;
        msg_hours[i].received = 0;
      }

      await this.loadIncludeArchive(account_id);
      for await (let message of messages) {
        //console.log(">>>>>>>>>>>>>> filter_duplicates: iterating message.headerMessageId: " + message.headerMessageId);
          if(!inRange(message, fromDate, toDate)) continue;
          if(this.excludeMessage(message,account_id)) continue;
          if(isDuplicate(filter_duplicates, messages_hash, message)) continue;
          //this.tsLog.log("message: " + JSON.stringify(message));
          let now = new Date();
          let date_message = new Date(message.date);
          let date_message_normalized = new Date(message.date);
          date_message_normalized.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
          let hour_message = date_message.getHours();
          // check sender
          const key_author = authorKey(message);
          if(key_author !== null && emailMatcher.matches(key_author)) {
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
          if((count_data_to_current_time)&&(date_message_normalized <= now)){
            count++;
          }
      }
      let stop_time = performance.now();

      return {sent: sent, received: received, count: count, msg_hours: msg_hours, elapsed: stop_time - start_time};
    }

    async aggregateData(dates, only_businessdays = -99) {
      
      let filtered_dates = {};
      let prefs_bday_default_only = false;

      if(only_businessdays == -99) {
        prefs_bday_default_only = await tsPrefs.getPref('bday_default_only');
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

      // no days left (e.g. business days only on a weekend range): zeros instead of NaN and Infinity
      if(num_days == 0) {
        return {total_sent: 0, max_sent: 0, min_sent: 0, avg_sent: 0, total_received: 0, max_received: 0, min_received: 0, avg_received: 0};
      }

      // filtered_dates must be popolated with all the days, even with 0 values
      let avg_sent = parseFloat((total_sent / num_days).toFixed(2));
      let avg_received = parseFloat((total_received / num_days).toFixed(2));
      
      return {total_sent: total_sent, max_sent: max_sent, min_sent: min_sent, avg_sent: avg_sent, total_received: total_received, max_received: max_received, min_received: min_received, avg_received: avg_received};
    }

    // Per-instance memo of the settings and folder ids every query needs: the core of a tab is created
    // at each data load, so they are read once per load instead of once per query

    async getFilterDuplicates(account_id = 0) {
      if(!(account_id in this.filter_duplicates)) {
        this.filter_duplicates[account_id] = await tsCoreUtils.getFilterDuplicatesPreference(account_id);
      }
      return this.filter_duplicates[account_id];
    }

    // The ids of the folders to query for the stats of an account (0 = all the accounts): every folder except
    // drafts, trash, junk, templates and outbox with their subfolders and, when the account setting excludes
    // them, the archives. Filtering at the folder level saves Thunderbird from converting the skipped messages at all.
    async getStatsFoldersIds(account_id = 0) {
      if(account_id in this.folders_ids) return this.folders_ids[account_id];

      let include_archive = await this.loadIncludeArchive(account_id);
      let account_ids = [];
      if(account_id != 0) {
        account_ids = [account_id];
      } else {
        account_ids = (await browser.accounts.list(false)).map(account => account.id);
      }

      let output = [];
      const explore = (folders) => {
        for(let folder of folders) {
          let specialUse = folder.specialUse || [];
          if(EXCLUDED_FOLDERS_SPECIAL_USE.some(use => specialUse.includes(use))) continue;
          if(!include_archive && specialUse.includes('archives')) continue;
          output.push(folder.id);
          if(folder.subFolders && folder.subFolders.length > 0) explore(folder.subFolders);
        }
      };
      for(let id of account_ids) {
        explore(await browser.folders.getSubFolders(id, true));
      }

      this.tsLog.log(() => "[getStatsFoldersIds] account " + account_id + ": " + output.length + " folders");
      this.folders_ids[account_id] = output;
      return output;
    }

    // Reads the "include archives" preference of the account once, so excludeMessage can be synchronous
    async loadIncludeArchive(account_id = 0) {
      if(!(account_id in this.include_archive)) {
        this.include_archive[account_id] = await tsCoreUtils.getIncludeArchivePreference(account_id);
      }
      return this.include_archive[account_id];
    }

    // Returns true if the message should be excluded from the stats (call loadIncludeArchive first).
    // The queries already skip these folders (see getStatsFoldersIds); this is the safety net for the
    // folders chosen by the user in the Custom Query filters
    excludeMessage(message, account_id = 0){
      if(message.folder.specialUse && EXCLUDED_FOLDERS_SPECIAL_USE.some(specialUse => message.folder.specialUse.includes(specialUse))){
        return true;
      }
      
      // check if we have to include this message even if it is in a "archives" folder
      if(message.folder.specialUse && message.folder.specialUse.includes('archives')){
        return !(this.include_archive[account_id] ?? true);
      }

      return false;
    }

    // Inbox Zero data (total, unread, mails per date of the inbox folders), scanned once per account and
    // shared by all the tabs; the promise is shared by concurrent callers. clearCoreCaches() resets it.
    getInboxZeroDates(account_id = 0) {
      let key = tsUtils.dateToYYYYMMDD(new Date()) + '|' + account_id;

      if(tsInboxZeroCache.key != key) {
        this.tsLog.log("[getInboxZeroDates] scanning, cache key: " + key);
        tsInboxZeroCache.key = key;
        tsInboxZeroCache.promise = this.scanInboxZeroDates(account_id)
          .catch((error) => {
            if(tsInboxZeroCache.key == key) clearCoreCaches();
            throw error;
          });
      } else {
        this.tsLog.log("[getInboxZeroDates] using the cache");
      }

      return tsInboxZeroCache.promise;
    }

    async scanInboxZeroDates(account_id = 0) {

      let start_time = performance.now();

      let inboxFolders = await this.getInboxFolders(account_id);

      //total and unread mails in inbox
      let total = 0;
      let unread = 0;
      //dates spread
      let dates = {};

      for(let folder of inboxFolders) {
          let queryInfo_InboxZeroData = {
            folderId: folder.id,
            messagesPerPage: MESSAGES_PER_PAGE,
          }

          this.tsLog.log(() => "queryInfo_InboxZeroData: " + JSON.stringify(queryInfo_InboxZeroData));
          
          let messages = this.getMessages(() => browser.messages.query(queryInfo_InboxZeroData));

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
      this.tsLog.log(() => "folders: " + JSON.stringify(folders));
      return folders;
    }

    // Pages of a message list, one message at a time.
    // queryFn starts the query (browser.messages.query) and is called only when a slot
    // of the query queue is free: every query runs on Thunderbird's main thread, so
    // too many at once make the Thunderbird UI unresponsive.
    async *getMessages(queryFn) {
      const release = await tsQueryQueue.acquire();
      try {
        let page = await queryFn();
        for (let message of page.messages) {
          yield message;
        }

        while (page.id) {
          page = await browser.messages.continueList(page.id);
          for (let message of page.messages) {
            yield message;
          }
        }
      } finally {
        release();
      }
    }
}

// Limits the number of message queries running at the same time (shared by all core instances).
// The limit is the max_concurrent_queries preference, applied with setMaxConcurrentQueries().
export const MIN_CONCURRENT_QUERIES = 1;
export const MAX_CONCURRENT_QUERIES = 10;

class QueryQueue {
  running = 0;
  waiting = [];

  constructor(max_concurrent) {
    this.max_concurrent = max_concurrent;
  }

  setMaxConcurrent(max_concurrent) {
    this.max_concurrent = max_concurrent;
    while(this.running < this.max_concurrent && this.waiting.length > 0) {
      this.waiting.shift()();
    }
  }

  // Resolves with a release function when a slot is free; the caller must always call it (use finally).
  acquire() {
    return new Promise((resolve) => {
      const start = () => {
        this.running++;
        let released = false;
        resolve(() => {
          if(released) return;
          released = true;
          this.running--;
          const next = this.waiting.shift();
          if(next) next();
        });
      };
      if(this.running < this.max_concurrent) {
        start();
      } else {
        this.waiting.push(start);
      }
    });
  }
}

const tsQueryQueue = new QueryQueue(prefs_default.max_concurrent_queries);

// Applies the max_concurrent_queries preference (clamped to MIN/MAX_CONCURRENT_QUERIES)
export function setMaxConcurrentQueries(value) {
  let max_concurrent = Number(value);
  if(!Number.isFinite(max_concurrent)) max_concurrent = prefs_default.max_concurrent_queries;
  max_concurrent = Math.min(MAX_CONCURRENT_QUERIES, Math.max(MIN_CONCURRENT_QUERIES, Math.round(max_concurrent)));
  tsQueryQueue.setMaxConcurrent(max_concurrent);
}

// Recent days cache: the last recent_days_cache_days days before today plus today (default 7 weeks, so the
// baseline of yesterday always has 6 full weeks), shared by all core instances. See getRecentDays().
// The size comes from the recent_days_cache_days preference, applied with setRecentDaysCacheDays():
// at least MIN_RECENT_DAYS_CACHE_DAYS (6 full weeks before yesterday, needed by the weekday baseline).
// The scan also keeps the message headers of the last RECENT_MESSAGES_DAYS days (see getRangeMessages).
export const MIN_RECENT_DAYS_CACHE_DAYS = 43;
export const MAX_RECENT_DAYS_CACHE_DAYS = 365;

const tsRecentDaysCache = {
  key: null,
  promise: null,
  days: prefs_default.recent_days_cache_days,
  // From `days` days before today to the end of today
  getRange() {
    let fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - this.days);
    fromDate.setHours(0, 0, 0, 0);
    let toDate = new Date();
    toDate.setHours(23, 59, 59, 999);
    return {fromDate: fromDate, toDate: toDate};
  },
  // The first day whose message headers the scan keeps
  getMessagesFromDate() {
    let fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (RECENT_MESSAGES_DAYS - 1));
    fromDate.setHours(0, 0, 0, 0);
    return fromDate;
  },
};

// Inbox Zero cache: the inbox folders scan of an account, shared by all core instances. See getInboxZeroDates().
const tsInboxZeroCache = {
  key: null,
  promise: null,
};

// Applies the recent_days_cache_days preference (clamped to MIN/MAX_RECENT_DAYS_CACHE_DAYS); a new size invalidates the cache through its key
export function setRecentDaysCacheDays(value) {
  let days = Number(value);
  if(!Number.isFinite(days)) days = prefs_default.recent_days_cache_days;
  tsRecentDaysCache.days = Math.min(MAX_RECENT_DAYS_CACHE_DAYS, Math.max(MIN_RECENT_DAYS_CACHE_DAYS, Math.round(days)));
}

// Forget all the cached scans, so the next requests read the messages again (data refresh, account change)
export function clearCoreCaches() {
  tsRecentDaysCache.key = null;
  tsRecentDaysCache.promise = null;
  tsInboxZeroCache.key = null;
  tsInboxZeroCache.promise = null;
  clearContactsNamesCache();
}
