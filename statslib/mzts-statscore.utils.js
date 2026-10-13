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

import { tsUtils } from "./mzts-utils";
import { tsPrefs } from "./mzts-options";
import { tsStore } from "./mzts-store";

// Address book names cache: a promise of a Map email -> display name (vCard FN), built once from all the
// address books and shared by every query. One addressBooks.list call replaces a contacts.quickSearch
// per correspondent. clearContactsNamesCache() resets it (data refresh, account change).
let contactsNamesCache = null;

export function clearContactsNamesCache() {
    contactsNamesCache = null;
}

export const tsCoreUtils = {

    // Shows a folder in a Thunderbird mail tab: the first mail tab when in_first_tab is true, otherwise a new one
    async openFolder(folder_data, in_first_tab = false) {
        let first_mail_tab = null;
        let tabs = await browser.tabs.query({windowId: browser.mailTabs.WINDOW_ID_CURRENT});
        for(let tab of tabs) {
            if(tab.mailTab) {
                first_mail_tab = tab;
                break;
            }
        }
        if(!folder_data.id) folder_data.id = this.getFolderId(folder_data);
        if(!in_first_tab) {
            browser.mailTabs.create({displayedFolder: folder_data.id});
            return;
        }
        if(first_mail_tab == null) return;
        browser.mailTabs.update(first_mail_tab.id, {displayedFolder: folder_data.id});
        browser.tabs.update(first_mail_tab.id, {active: true});
    },

    getFolderId(folder) {
      return `${folder.accountId}:/${folder.path}`
    },

    getFolderPath(folderId, do_split = false) {
      const [accountId, path] = folderId.split(':/');
      if(!do_split) {
        return path.slice(1);
      } else {
        return path.slice(1).split(/(?<=\/)/);
      }
    },

    async getTagsList(){
        let messageTags = await browser.messages.tags.list();
        const output = messageTags.reduce((acc, messageTag) => {
            acc[messageTag.key] = {
                tag: messageTag.tag,
                color: messageTag.color,
                key: messageTag.key,
                ordinal: messageTag.ordinal,
                count: 0,
                sent: 0,
                received: 0,
            };
            return acc;
          }, {});
        // console.log(">>>>>>>>>>> getTagsList: " + JSON.stringify(output));
        return output;
    },

    // getManyDaysLabels(labels) {
    //     const daysOfWeek = ["WeekDay0", "WeekDay1", "WeekDay2", "WeekDay3", "WeekDay4", "WeekDay5", "WeekDay6"];

    //     return labels.map(label => {
    //         const year = parseInt(label.slice(0, 4));
    //         const month = parseInt(label.slice(4, 6));
    //         const day = parseInt(label.slice(6, 8));
    
    //         const date = new Date(year, month - 1, day);
    //         const dayOfWeek = browser.i18n.getMessage(daysOfWeek[date.getDay()]);
    
    //         const dateFormatter = new Intl.DateTimeFormat(undefined, {
    //             weekday: 'long',
    //             day: '2-digit',
    //             month: '2-digit',
    //             year: 'numeric'
    //         });
    
    //         const formattedDate = dateFormatter.format(date);
    
    //         return dayOfWeek + "\r\n" + formattedDate;
    //     });
    // },

    getCustomQryLabel(label, data_type) {      // data_type = "YYYY" | "YYYYMM" | "YYYYWW" | "YYYYMMDD"
        switch(data_type) {
            case "YYYY":
                return label;
            case "YYYYMM":
                let mm_year = label.slice(0, 4);
                let mm_month = label.slice(4);
                return `${mm_month}/${mm_year}`;
            case "YYYYWW":
                let ww_year = label.slice(0, 4); // First 4 characters are the year
                let ww_week = label.slice(4);   // Remaining characters are the week number
                // Format the string as "WW [YYYY]"
                return `${ww_week} [${ww_year}]`;
            case "YYYYMMDD":
                const year = parseInt(label.slice(0, 4));
                const month = parseInt(label.slice(4, 6));
                const day = parseInt(label.slice(6, 8));

                const date = new Date(year, month - 1, day);

                // the Thunderbird UI language, like the dates of the dashboards
                const dateFormatter = new Intl.DateTimeFormat(browser.i18n.getUILanguage(), {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                const formattedDate = dateFormatter.format(date);

                return formattedDate;
        }
    },
      


    // The names of all the contacts in the address books, keyed by lowercase email (see contactsNamesCache)
    getAddressBookNames() {
        if(contactsNamesCache == null) {
            contactsNamesCache = this.loadAddressBookNames().catch((error) => {
                console.error("[ThunderStats] loadAddressBookNames: " + error);
                return new Map();
            });
        }
        return contactsNamesCache;
    },

    async loadAddressBookNames() {
        let names = new Map();
        let books = await browser.addressBooks.list(true);
        // vCard lines: "FN:Name", "EMAIL;TYPE=work:addr", "item1.EMAIL:addr"; long lines are folded on "\r\n "
        const fnRegex = /^(?:[^:\r\n]*\.)?FN[^:\r\n]*:(.*)$/im;
        const emailRegex = /^(?:[^:\r\n]*\.)?EMAIL[^:\r\n]*:(.*)$/gim;
        for (let book of books) {
            for (let contact of (book.contacts || [])) {
                let vCard = contact.properties ? contact.properties.vCard : null;
                if(!vCard) continue;
                vCard = vCard.replace(/\r?\n[ \t]/g, '');
                let fn = vCard.match(fnRegex);
                let name = fn ? fn[1].trim() : '';
                if(name == '') continue;
                let match_email = null;
                emailRegex.lastIndex = 0;
                while ((match_email = emailRegex.exec(vCard)) !== null) {
                    let email = match_email[1].trim().toLowerCase();
                    if(email != '' && !names.has(email)) names.set(email, name);
                }
            }
        }
        return names;
    },

    async getNameFromAddressBook(address) {
        const email = tsUtils.extractEmail(address);
        if (email === null) return '';
        let names = await this.getAddressBookNames();
        return names.get(email) || '';
    },

    getNameFromAddress(address) {
        if (address.includes('<') && address.includes('>')) {
            const nameMatch = address.match(/^[^<]+/);
            if (nameMatch) {
                return nameMatch[0].trim();
            }
        }
        return '';
    },

    async getCorrespondantName(address){
        let name = await this.getNameFromAddressBook(address);
        //console.log(">>>>>>>>>>>>>> [getCorrespondantName] name 1: " + name);
        if(name == '') name = this.getNameFromAddress(address);
        //console.log(">>>>>>>>>>>>>> [getCorrespondantName] name 2: " + name);
        return name;
    },

    async getAccountsList(hide_AllAccounts = true){    // Returns an array of { id: account.id, text: account.name }
        let output = [];
        let accounts = await browser.accounts.list();
        if(!hide_AllAccounts) output.push({ id: 0, name: browser.i18n.getMessage('AllAccounts') });
        for (let account of accounts) {
          output.push({ id: account.id, name: account.name });
        }
        output = output.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
        return output;
    },

    async getAccountEmails(account_id = 0, no_custom_identities = false) {
        let accounts = await browser.accounts.list();
        let account_emails = [];
  
        if(account_id == 0) {
          for (let account of accounts) {
              for (let identity of account.identities) {
                  account_emails.push(identity.email.toLowerCase());
              }
          }
          if(!no_custom_identities) {
            let custom_ids = await this.getAccountCustomIdentities();
            for(let cids_account in custom_ids) {
              // console.log(">>>>>>>>>>>>> getAccountEmails (all account) cids_account: " + JSON.stringify(cids_account));
              custom_ids[cids_account].forEach(element => {
                // console.log(">>>>>>>>>>>>> getAccountEmails (all account) cids_account element: " + JSON.stringify(element));
                account_emails.push(element.toLowerCase());
              });
            }
          }
          //console.log(">>>>>>>>>>>>> getAccountEmails (all account) account_emails: " + JSON.stringify(account_emails));
        }else{
          for (let account of accounts) {
            if(account.id == account_id) {
              for (let identity of account.identities) {
                account_emails.push(identity.email.toLowerCase());
              }
              if(!no_custom_identities) {
                let custom_ids = await this.getAccountCustomIdentities(account_id);
                for(let custom_id in custom_ids) {
                  account_emails.push(custom_ids[custom_id].toLowerCase());
                }
              }
            }
          }
          //console.log(">>>>>>>>>>>> getAccountEmails (one account) account_emails: " + JSON.stringify(account_emails));
        }

        return account_emails;
    },

    async getAccountCustomIdentities(account_id = 0) {
        let prefCustomIds = await tsPrefs.getPref("custom_identities");
        // console.log(">>>>>>>>>>>>> getAccountCustomIdentities prefCustomIds: " + JSON.stringify(prefCustomIds));
        if(account_id == 0){ return prefCustomIds; }
        if(prefCustomIds.hasOwnProperty(account_id)){
          return prefCustomIds[account_id];
        } else {
            return {};
        }
    },

    async getAccountInternalDomains(account_id = 0) {
        let prefInternalDomains = await tsPrefs.getPref("internal_domains");
        if(account_id == 0){ return prefInternalDomains; }
        if(prefInternalDomains.hasOwnProperty(account_id)){
          return prefInternalDomains[account_id];
        } else {
            return [];
        }
    },

    getInternalMailLabel(domains) {
        let totalSent = 0;
        let totalReceived = 0;
        let internalSent = 0;
        let internalReceived = 0;
        for (let domain in domains) {
            totalSent += domains[domain].sent;
            totalReceived += domains[domain].received;
            if (domains[domain].internal) {
                internalSent += domains[domain].sent;
                internalReceived += domains[domain].received;
            }
        }
        let sentPercent = totalSent > 0 ? (Math.round(internalSent / totalSent * 10000) / 100).toFixed(2) + '%' : '0.00%';
        let receivedPercent = totalReceived > 0 ? (Math.round(internalReceived / totalReceived * 10000) / 100).toFixed(2) + '%' : '0.00%';
        return { sentPercent, receivedPercent };
    },

    async mergeAccountsAdvSettings(accounts, accounts_adv_settings) {
        let output = [];
        let settings = Array.isArray(accounts_adv_settings) ? accounts_adv_settings : [];
        for(let account of accounts) {
            let element = settings.find(element => element.id === account.id);
            let include_archive = element?.include_archive ?? true;
            let filter_duplicates = element?.filter_duplicates ?? await this.getDefaultAccountFilterDuplicatesOption(account.id);
            output.push({
                id: account.id,
                name: account.name,
                include_archive: include_archive,
                filter_duplicates: filter_duplicates,
            });
        }
        output = output.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
        return output;
    },

    async getDefaultAccountFilterDuplicatesOption(account_id){
        let account_emails = await this.getAccountEmails(account_id,true);
        // console.log(">>>>>>>>>>>>> getDefaultAccountFilterDuplicatesOption account_emails: " + JSON.stringify(account_emails));
        return account_emails.some(email => email.toLowerCase().endsWith("@gmail.com"));
    },

    // return an array of objects {value, label}
    async getAccountFoldersNames(account_id, ignore_archive_folders = false) {
        let output = [];
        let checked_folders = [];
    
        async function exploreFolders(folders) {
            for (let folder of folders) {
                if (["trash", "templates", "drafts", "junk", "outbox"].some(specialUse => folder.specialUse.includes(specialUse))) continue;
                if (ignore_archive_folders && folder.specialUse.includes('archives')) {
                    continue;
                }
                if (!checked_folders.includes(folder.id)) {
                    output.push({value: folder.id, label: folder.path});
                    checked_folders.push(folder.id);
                }
    
                // Recursively explore subfolders
                if (folder.subFolders && folder.subFolders.length > 0) {
                    await exploreFolders(folder.subFolders);
                }
            }
        }

        let folders = await browser.folders.getSubFolders(account_id, true);
    
        //console.log(">>>>>>>>>> getAccountFoldersNames folders: " + JSON.stringify(folders));
    
        await exploreFolders(folders);
        // console.log(">>>>>>>>>> getAccountFoldersNames output: " + JSON.stringify(output));
        return output;
    },

    // The advanced settings of an account ({id, include_archive, filter_duplicates}), or null when it has none
    async getAccountAdvSettings(account_id) {
        let accounts_adv_settings = await tsPrefs.getPref("accounts_adv_settings");
        if(!Array.isArray(accounts_adv_settings)) return null;
        return accounts_adv_settings.find(account => account.id == account_id) ?? null;
    },

    // Whether the messages in the "archives" folders are included: the global preference for all the
    // accounts, the advanced account setting (default true) for a single account
    async getIncludeArchivePreference(account_id) {
        if(account_id == 0) {
           return await tsPrefs.getPref("include_archive_multi_account");
        }
        let element = await this.getAccountAdvSettings(account_id);
        return element?.include_archive ?? true;
     },

    async getFilterDuplicatesPreference(account_id) {
        if(account_id == 0) {
            return await tsPrefs.getPref("filter_duplicates_multi_account");
        }
        let element = await this.getAccountAdvSettings(account_id);
        return element?.filter_duplicates ?? await this.getDefaultAccountFilterDuplicatesOption(account_id);
    },

    extractDomain(email) {
        if (typeof email === 'string' && email.includes('@')) {
          return email.split('@')[1];
        }
        return null;
    },

    // Lower case domains of the recipients ("Name <email@example.com>" or "email@example.com"), from the
    // same address as the correspondent (tsUtils.extractEmail); entries without an address are skipped
    extractDomains(recipients) {
        const domains = [];

        for (const recipient of recipients) {
          const email = tsUtils.extractEmail(recipient);
          if (email !== null) domains.push(this.extractDomain(email));
        }

        return domains;
    },

    // This function finds the first previous business day before the given date
    findPreviousBusinessDay(date) {
        let previousDate = new Date(date); // Create a copy of the original date

        // Loop until a business day is found
        do {
            previousDate.setDate(previousDate.getDate() - 1); // Move to the previous day
        } while (!this.checkBusinessDay(tsUtils.dateToYYYYMMDD(previousDate)));

        return previousDate;
    },

    checkBusinessDay(datestr) {    //datestr is a string like YYYYMMDD
        let date = tsUtils.parseYYYYMMDDToDate(datestr);
        let date_weekday = date.getDay();

        // console.log(">>>>>>>>>>>>>> checkBusinessDay: " + datestr);

        // check weekeday preference
        if(tsStore["bday_weekdays_" + date_weekday] == false) {
            return false;
        }

        // check easter preference
        if(tsStore.bday_easter == true) {
            if(this.isEasterOrEasterMonday(date)) {
                return false;
            }
        }

        // check custom non-business days preference
        let custom_nbd = tsStore.bday_custom_days;

        if(custom_nbd && custom_nbd.length > 0) {
            for (let element of custom_nbd) {
                let nbd_datestr = String(element.year == 'every_year' ? date.getFullYear() : element.year) + 
                                  String(element.month + 1).padStart(2, '0') + 
                                  String(element.day).padStart(2, '0');
                // console.log(">>>>>>>>>>>>>> nbd_datestr: " + nbd_datestr);
                // console.log(">>>>>>>>>>>>>> datestr: " + datestr);
                if (nbd_datestr == datestr) {
                    // console.log(">>>>>>>>>>>>>> nbd_datestr == datestr: " + nbd_datestr + " == " + datestr);
                    return false;
                }
            }
        }

        // console.log(">>>>>>>>>>>>>> checkBusinessDay ["+datestr+"]: return true");
        return true;
    },

    isToday(dateString) {
        // Get the current date
        const today = new Date();
        
        // Format the current date as YYYYMMDD
        const currentDate = today.getFullYear().toString() +
                            (today.getMonth() + 1).toString().padStart(2, '0') +
                            today.getDate().toString().padStart(2, '0');
      
        // Check if the provided date string matches today's date
        return dateString === currentDate;
    },

    isEasterOrEasterMonday(date) {
        const year = date.getFullYear();
        const easterDate = this.calculateEaster(year);
    
        // Calculate Easter Monday
        const easterMonday = new Date(easterDate);
        easterMonday.setDate(easterDate.getDate() + 1);
    
        // Compare the provided date with Easter and Easter Monday
        return (date.toDateString() === easterDate.toDateString()) ||
               (date.toDateString() === easterMonday.toDateString());
    },

    calculateEaster(year) {
        const f = Math.floor;
        const G = year % 19;
        const C = f(year / 100);
        const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
        const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
        const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
        const L = I - J;
        const month = 3 + f((L + 40) / 44);  // March = 3, April = 4
        const day = L + 28 - 31 * f(month / 4);
        return new Date(year, month - 1, day);
    },

}

