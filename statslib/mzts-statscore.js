import { tsLogger } from "./mzts-logger";
import { tsUtils } from "./mzts-utils";

export class thunderStastsCore {

  regexEmail = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  do_debug = false;
  tsLog = null;

  constructor(do_debug) {
    this.do_debug = do_debug;
    this.tsLog = new tsLogger("thunderStastsCore",do_debug);
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
      let start_date = fromDate.getDate() - 8 // TODO: number of days, to be used the _many_days pref
      fromDate.setDate(start_date);
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date();
      let stop_date = toDate.getDate();
      toDate.setDate(stop_date);
      toDate.setHours(23, 59, 59, 999);

       return this.getAggregatedStatsData(fromDate, toDate, account_id, account_emails);
     }
    // ================ TODAY TAB - END =====================



    // ================ BASE METHODS ========================
    async getFullStatsData(fromDate, toDate, account_id = 0, account_emails = []) {

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
          if(message.date){
            let date_message = tsUtils.dateToYYYYMMDD(message.date);
            if (dates[date_message]) {
              dates[date_message]++;
            } else {
              dates[date_message] = 1;
            }
          }
          // check sender
          const match_author = message.author.match(this.regexEmail);
          if (match_author) {
            const key_author = match_author[0];
            if(account_emails.includes(key_author)) {
              messageids_sent.push(message.id);
              sent++;
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
              // group by hour
              msg_hours[hour_message].received++;
            }
          }
        //check recipients - END
        
        count++;
      }


      senders = Object.fromEntries(Object.entries(senders).sort((a, b) => b[1] - a[1]));
      recipients = Object.fromEntries(Object.entries(recipients).sort((a, b) => b[1] - a[1]));

      let stop_time = performance.now();

      return {senders: senders, recipients: recipients, sent: sent, received: received, count: count, msg_hours: msg_hours, folders: folders, dates: dates, elapsed: tsUtils.humanReadableMilliseconds(stop_time - start_time)};
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
      let avg_sent = parseFloat((sent / 7).toFixed(2));
      let max_received = 0;
      let min_received = 0;
      let avg_received = parseFloat((received / 7).toFixed(2));

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

    async getInboxZeroData(account_id = 0) {

      let start_time = performance.now();

      let inboxFolders = await this.getInboxFolders(account_id);

      //total and unread mails in inbox
      let total = 0;
      let unread = 0;

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
          }
      }

      let stop_time = performance.now();

      return {total: total, unread: unread, elapsed: tsUtils.humanReadableMilliseconds(stop_time - start_time)};
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
