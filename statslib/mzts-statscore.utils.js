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

import { tsUtils } from "./mzts-utils";
import { tsPrefs } from "./mzts-options";
import { tsStore } from "./mzts-store";

export const tsCoreUtils = {

    transformCountDataToDataset(data, do_progressive = false, get_labels = false) {
        let dataset_sent = [];
        let dataset_rcvd = [];
        for(let key in data) {
            let value = data[String(key)];
            dataset_sent.push(value.sent);
            dataset_rcvd.push(value.received);
        }
        
        if (do_progressive) {
            let cumulative_sent = 0;
            let cumulative_rcvd = 0;
            
            for (let key in dataset_sent) {
                cumulative_sent += dataset_sent[key];
                cumulative_rcvd += dataset_rcvd[key];
                dataset_sent[key] = cumulative_sent;
                dataset_rcvd[key] = cumulative_rcvd;
            }
        }

        let output = { dataset_sent, dataset_rcvd };
        if(get_labels) {
            let labels = [];
            for(let key in data) {
                labels.push(key);
            }
            output.labels = labels;
        }
        return output;
    },

    getFoldersLabelsColors(folders) {
        let availableColors = [...inboxZeroColors];
        let output_labels = [];
        let output_colors = [];
        let output_paths = [];
        //console.log(">>>>>>>>>>>> folders: " + JSON.stringify(folders));
        for(let key in folders) {
            output_labels.push(folders[key].folder_data.name);
            if(!("id" in folders[key].folder_data)){
            	folders[key].folder_data.id = tsCoreUtils.getFolderId(folders[key].folder_data);
            }
            output_paths.push(folders[key].folder_data.id);
            if(folders[key].folder_data.type == 'inbox') {
                output_colors.push(inboxZeroInboxColor);
            } else {
                // Random color
                // let index = Math.floor(Math.random() * availableColors.length);
                // let color = availableColors[index];
                // availableColors.splice(index, 1);
                let color = availableColors.shift();
                output_colors.push(color);
            }
        }
        let output = {labels: output_labels, colors: output_colors, folder_paths: output_paths}

        if(!tsStore.isTB128plus) {
            const foldersArray = Object.values(folders);
            output.folders = foldersArray.map(({folder_data: { id, specialUse, ...item }}) => item);
            // console.log(">>>>>>>>>> getFoldersLabelsColors output: " + JSON.stringify(output));
        }

        return output;
    },

    getFoldersCounts(folders, type = 'rcvd') {  //type is 'sent' or 'rcvd'
        let output = [];
        switch(type) {
            case 'sent':
                for(let key in folders) {
                    output.push(folders[key].sent);
                }
                break;
            case 'rcvd':
                for(let key in folders) {
                    output.push(folders[key].received);
                }
                break;
        }
        return output;
    },

    // Function to filter folders with received > 0
    filterReceivedFolders(folders) {
        let result = {};
        for (let key in folders) {
            if (folders[key].received > 0) {
                result[key] = folders[key];
            }
        }
        return result;
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

    filterTodayNextHours(hours) {
        // Get the current time
        const now = new Date();
        const currentHour = now.getHours();

        // Iterate over the array and set null for hours after the current hour
        return hours.map((value, index) => index > currentHour ? null : value);
    },

    async getTagsList(){
        let messageTags = {};
        if(tsStore.isTB128plus) {
            messageTags = await browser.messages.tags.list();
        } else {
            messageTags = await browser.messages.listTags();
        }
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

    async transformTagsLabels(labels) {
        let output = [];
        let tags = tsStore.tags_list;
        for(let label of labels) {
            output.push(tags[label].tag);
        }
        return output;
    },

    getTagsLabelColor(label) {
        let color = Object.values(tsStore.tags_list).find(tag => tag.tag === label).color;
        if(tsStore.darkmode && color === '#000000') {
            color = '#ffffff';
        }
        
        return color;
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

    getDaysLabelColor(label, color_today = true, color_nobusiness_day = true) {
        let isBusinessDay = true;

        // console.log(">>>>>>>>>> color_today: " + color_today);
        // console.log(">>>>>>>>>> color_nobusiness_day: " + color_nobusiness_day);

        const bd_color = tsStore.darkmode ? "white" : "black";
        const nbd_color = tsStore.darkmode ? "#C18F2A" : "#725419";

        if(color_today && tsCoreUtils.isToday(label)) {
            return tsStore.darkmode ? tsStore.chart_colors.many_days_today_dark : tsStore.chart_colors.many_days_today_light;
        }

        if(color_nobusiness_day) {
            isBusinessDay = this.checkBusinessDay(label);
        }

        return (isBusinessDay ? bd_color : nbd_color);
    },

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

                const dateFormatter = new Intl.DateTimeFormat(undefined, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                const formattedDate = dateFormatter.format(date);

                return formattedDate;
        }
    },

    getManyDaysLabel(label) {
        const daysOfWeek = ["WeekDay0", "WeekDay1", "WeekDay2", "WeekDay3", "WeekDay4", "WeekDay5", "WeekDay6"];

        const year = parseInt(label.slice(0, 4));
        const month = parseInt(label.slice(4, 6));
        const day = parseInt(label.slice(6, 8));

        const date = new Date(year, month - 1, day);
        const dayOfWeek = browser.i18n.getMessage(daysOfWeek[date.getDay()]);

        const dateFormatter = new Intl.DateTimeFormat(undefined, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const formattedDate = dateFormatter.format(date);

        // return dayOfWeek + "\n" + formattedDate + (tsUtils.isToday(date) ? "\n[" + browser.i18n.getMessage("Today") + "]" : "");
        return [
            dayOfWeek,
            formattedDate,
            (tsUtils.isToday(date) ? "\n[" + browser.i18n.getMessage("Today") + "]" : ""),
        ];
    },

    getManyDaysBarColor(ctx, totalBars) {
        const defaultColor = tsStore.chart_colors.many_days_default;
        const todayColor = tsStore.darkmode ? tsStore.chart_colors.many_days_today_dark : tsStore.chart_colors.many_days_today_light;
        return ctx.dataIndex === totalBars - 1 ? todayColor : defaultColor;
    },

    getWeekDaysLabel(label) {
        const daysOfWeek = ["WeekDay0", "WeekDay1", "WeekDay2", "WeekDay3", "WeekDay4", "WeekDay5", "WeekDay6"];
        let first_day_week = tsStore.first_day_week;
        label = parseInt(label) + parseInt(first_day_week);
        if(label >= 7) label = label - 7;
        const dayOfWeek = browser.i18n.getMessage(daysOfWeek[label]);
        return [
            dayOfWeek
        ];
    },

    getWeekDaysLabelColor(label) {
        const daysOfWeek = ["WeekDay0", "WeekDay1", "WeekDay2", "WeekDay3", "WeekDay4", "WeekDay5", "WeekDay6"];
        let first_day_week = tsStore.first_day_week;
        label = parseInt(label) + parseInt(first_day_week);
        if(label >= 7) label = label - 7;
        // check weekeday preference
        let isBusinessDay = tsStore["bday_weekdays_" + label]
        const bd_color = tsStore.darkmode ? "white" : "black";
        const nbd_color = tsStore.darkmode ? "#C18F2A" : "#725419";
        return (isBusinessDay ? bd_color : nbd_color);
    },

    transformInboxZeroDatesDataToDataset(data) {
        let datasets = [];
        let availableColors = [...inboxZeroColors];
        let total = 0;
        let aggregate_day_date_string = '';

        for(let key in data) {
            total += data[key];
        }
        let data_length = Object.keys(data).length;
         //we are going to aggregate old days
        let max_el = 20; //choose how much to aggregate
        if( data_length > max_el) {  // ok, we really need to aggregate
            let spin_day = Object.keys(data)[data_length - max_el - 1];
            let spin_day_date = tsUtils.parseYYYYMMDDToDate(spin_day);
            let tmp_array = {};
            let aggregate_day_value = 0;
            let aggregate_day_date = new Date(1900, 0, 1);
            for(let key in data) {
                let current_date = tsUtils.parseYYYYMMDDToDate(key);
                if(current_date <= spin_day_date) {
                    aggregate_day_value += data[key];
                    aggregate_day_date = (aggregate_day_date < current_date) ? current_date : aggregate_day_date;
                }else{
                    tmp_array[key] = data[key];
                }
            }
            aggregate_day_date_string = tsUtils.dateToYYYYMMDD(aggregate_day_date);
            tmp_array[aggregate_day_date_string] = aggregate_day_value;
            data = tmp_array;
        }
        for(let key in data) {
            let color = availableColors.shift();
            let value = data[key];
            let value_percentage = value / total;
            let current_date = tsUtils.parseYYYYMMDDToDate(key);
            let dataset = {
                label: (key==aggregate_day_date_string?browser.i18n.getMessage('Before') +'<br>':'') + current_date.toLocaleDateString(undefined,{day: '2-digit', month: '2-digit', year: 'numeric'}) + "<br>" + browser.i18n.getMessage('Mail') +':&nbsp;' + value + '&nbsp;(' + Math.round(value_percentage * 100) + '%)',
                data: [value_percentage],
                backgroundColor: color,
                borderColor: color,
            }
            datasets.push(dataset);
        }
        return datasets;
    },

    transformQueryDataToDataset(data) {
        let output = {};
        let dataset = {};
        dataset.data = [];
        let labels = [];
        let total = 0;

        for(let key in data) {
            total += data[key];
        }

        for(let key in data) {
            let value = data[key];
            dataset.data.push(value);
            // let current_date = tsUtils.parseYYYYMMDDToDate(key);
            // labels.push(current_date.toLocaleDateString(undefined,{day: '2-digit', month: '2-digit', year: 'numeric'}));
            labels.push(key);
        }

        let targetLength = labels.length;
        let availableColors = [...inboxZeroColors];
        while (availableColors.length < targetLength) {
          availableColors.push(...inboxZeroColors);
        }
        dataset.backgroundColor = [...availableColors];
        dataset.borderColor = [...availableColors];

        output.dataset = dataset;
        output.labels = labels;
        output.total = total;

        // console.log(">>>>>>>>>>>>>> Length of labels: " + labels.length);
        // console.log(">>>>>>>>>>>>>> Length of available colors: " + availableColors.length);
        // console.log(">>>>>>>>>>>>>> Length of dataset.data: " + dataset.data.length);
        // console.log(">>>>>>>>>>>>>> targetLength: " + targetLength);

        return output;
    },

    transformDatasetToOrdinableArray(dataObject) {
      return dataObject.labels.map((label, index) => {
        //   const [day, month, year] = label.split("/").map(Number);
          return {
            // date: new Date(year, month - 1, day),
            date: tsUtils.parseYYYYMMDDToDate(label),
            label,
            value: dataObject.datasets[0].data[index],
            bgColor: dataObject.datasets[0].backgroundColor[index],
            borderColor: dataObject.datasets[0].borderColor[index]
          };
      });
    },

    sortDatasetOrdinableArray(tempArray, type = 'date', order = 'asc') {
      if (type === 'date') {
        if (order === 'asc') {
          return tempArray.sort((a, b) => a.date - b.date);
        } else if (order === 'desc') {
          return tempArray.sort((a, b) => b.date - a.date);
        }
      } else if (type === 'mails') {
        if (order === 'asc') {
          return tempArray.sort((a, b) => a.value - b.value);
        } else if (order === 'desc') {
          return tempArray.sort((a, b) => b.value - a.value);
         }
      } else {
        throw new Error("Invalid type. Use 'date' or 'mails' for sorting.");
      }
      
      throw new Error("Invalid order. Use 'asc' or 'mails' for sorting.");
    },

    updateDatasetFromSorted(dataObject, sortedArray) {
      dataObject.labels = sortedArray.map(item => item.label);
      dataObject.datasets[0].data = sortedArray.map(item => item.value);
      dataObject.datasets[0].backgroundColor = sortedArray.map(item => item.bgColor);
      dataObject.datasets[0].borderColor = sortedArray.map(item => item.borderColor);
    },

    sortDoubleDatasetsByTotal(data) {
      // console.log(">>>>>>>>>>>>>> [sortDoubleDatasetsByTotal] data: " + JSON.stringify(data));
      // Create an array of objects containing labels and the sum of data values
      const summedData = data.labels.map((label, index) => {
        const sum = data.datasets.reduce((acc, dataset) => acc + dataset.data[index], 0);
        return { label, sum };
      });
    
      // Sort the array by sum in descending order
      summedData.sort((a, b) => b.sum - a.sum);
    
      // Rebuild the sorted object
      const sortedLabels = summedData.map(item => item.label);
      const sortedDatasets = data.datasets.map(dataset => ({
        ...dataset,
        data: summedData.map(item => dataset.data[data.labels.indexOf(item.label)])
      }));
    
      return {
        labels: sortedLabels,
        datasets: sortedDatasets
      };
    },      

    // getMaxFromData(data) {      // data is an object like this: {"20240517":2,"20240518":4,"20240519":4,"20240520":2,"20240521":0,"20240522":2,"20240523":4,"20240524":0}
    //     let maxValue = 0;
    //     for (const [date, value] of Object.entries(data)) {
    //         if (value > maxValue) {
    //             maxValue = value;
    //         }
    //     }
    //     return maxValue;
    // },

    getMaxFromData(data) {      // data is an array like this: [2,0,2,4,0,2,0,0]
        let maxValue = 0;
        //console.log(">>>>>>>>>>>>>>> [getMaxFromData] data: " + JSON.stringify(data));
        for (const value of data) {
            if (value > maxValue) {
                maxValue = value;
            }
        }
        return maxValue;
    },

    async getNameFromAddressBook(address) {
        //console.log(">>>>>>>>>>>>>> [getNameFromAddressBook] address: " + address);
        const match_address = address.match(tsUtils.regexEmail);
        if (match_address) {
            address = match_address[0];
        }
        //console.log(">>>>>>>>>>>>>> [getNameFromAddressBook] address cleared: " + address);
        let contacts = await browser.contacts.quickSearch(address);
        if(contacts.length == 0) return '';

        let vCard = contacts[0].properties.vCard;

        //console.log(">>>>>>>>>>>>>> [getNameFromAddressBook] vCard: " + vCard);

        const nameRegex = /FN:(.*)/i;
        const match = vCard.match(nameRegex);

        let name = '';

        if (match && match[1]) {
            name = match[1].trim();
        }
        return name;
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

    async mergeAccountsAdvSettings(accounts, accounts_adv_settings) {
        let output = [];
        for(let account of accounts) {
            let include_archive = true;
            let filter_duplicates = await this.getDefaultAccountFilterDuplicatesOption(account.id);
            if(accounts_adv_settings.length > 0) {
                include_archive = accounts_adv_settings.find(element => element.id === account.id)?.include_archive ?? include_archive;
                filter_duplicates = accounts_adv_settings.find(element => element.id === account.id)?.filter_duplicates ?? filter_duplicates;
            }
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

    async getSubfoldersFoldersIds(folder_id, account_id, ignore_archive_folders = false) {
        let output = [];
    
        async function exploreFolders(folders) {
            for (let folder of folders) {
                if(!("specialUse" in folder)){
                    folder.specialUse = [folder.type];
                    folder.id = tsCoreUtils.getFolderId(folder);
                }
                if (["trash", "templates", "drafts", "junk", "outbox"].some(specialUse => folder.specialUse.includes(specialUse))) continue;
                if (ignore_archive_folders && folder.specialUse.includes('archives')) {
                    continue;
                }
                if (!output.includes(folder.id)) {
                    output.push(folder.id);
                }
    
                // Recursively explore subfolders
                if (folder.subFolders && folder.subFolders.length > 0) {
                    await exploreFolders(folder.subFolders);
                }
            }
        }
    
        let folders = null;
        if(tsStore.isTB128plus){
            folders = await browser.folders.getSubFolders(account_id);
        }else{
            // console.log(">>>>>>>>>> getAccountFoldersIds account_id: " + account_id);
            let start_folder = await tsCoreUtils.getFolderFromId(folder_id, account_id);
            // console.log(">>>>>>>>>> getAccountFoldersIds start_folder: " + JSON.stringify(start_folder));
            folders = await browser.folders.getSubFolders(start_folder);
        }
    
        //console.log(">>>>>>>>>> getAccountFoldersIds folders: " + JSON.stringify(folders));
    
        await exploreFolders(folders);
    
        return output;
    },

    async getAccountFoldersIds_TB128plus(account_id) {
        let folders = await browser.folders.getSubFolders(account_id, false);
        //console.log(">>>>>>>>>> getAccountFoldersIds folders: " + JSON.stringify(folders));
        let output = folders.map(folder => folder.id);
        return output;
    },

    // extractPath(folder_id) {
    //     // Check if the string contains '://'
    //     const index = folder_id.indexOf('://');
    //     if (index === -1) {
    //       return folder_id; // Return the original string if '://' is not found
    //     }
    //     // Return the part of the string after '://'
    //     return folder_id.substring(index + 3);
    // },

    // return an array of objects {value, label}
    async getAccountFoldersNames(account_id, ignore_archive_folders = false) {
        let output = [];
        let checked_folders = [];
    
        async function exploreFolders(folders) {
            for (let folder of folders) {
                if(!("specialUse" in folder)){
                    folder.specialUse = [folder.type];
                    folder.id = tsCoreUtils.getFolderId(folder);
                }
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

        let folders = null;
        if(tsStore.isTB128plus){
            folders = await browser.folders.getSubFolders(account_id);
        }else{
            let account = await browser.accounts.get(account_id, true);    
            folders = await browser.folders.getSubFolders(account);
        }
    
        //console.log(">>>>>>>>>> getAccountFoldersNames folders: " + JSON.stringify(folders));
    
        await exploreFolders(folders);
        // console.log(">>>>>>>>>> getAccountFoldersNames output: " + JSON.stringify(output));
        return output;
    },

    async getFoldersArrayFromIds(folder_ids, account_id) {
        let output = [];
        // console.log(">>>>>>>>>> getFoldersArrayFromIds folder_ids: " + JSON.stringify(folder_ids));

        // console.log(">>>>>>>>>> getFoldersArrayFromIds account_id: " + JSON.stringify(account_id));
        let account = await browser.accounts.get(account_id, true);
        // console.log(">>>>>>>>>> getFoldersArrayFromIds account: " + JSON.stringify(account));
        let all_account_folders = tsCoreUtils.flattenFolders(await browser.folders.getSubFolders(account));
        // console.log(">>>>>>>>>> getFoldersArrayFromIds all_account_folders: " + JSON.stringify(all_account_folders));

        for(let folder_id of folder_ids) {
            // console.log(">>>>>>>>>> getFoldersArrayFromIds folder_id: " + folder_id);
            let folder_info = tsCoreUtils.splitAccountAndPath(folder_id);
            // console.log(">>>>>>>>>> getFoldersArrayFromIds folder_info: " + JSON.stringify(folder_info));
            // let folder = all_account_folders.find(folder => folder.path == folder_info.path);
            let folder = all_account_folders.find(function(folder) {
                // console.log(">>>>>>>>>> getFoldersArrayFromIds folder_iterator: " + JSON.stringify(folder));
                return folder.path == folder_info.path;
            });
            // console.log(">>>>>>>>>> getFoldersArrayFromIds folder: " + JSON.stringify(folder));
            output.push(folder);
        }
        // console.log(">>>>>>>>>> getFoldersArrayFromIds output: " + JSON.stringify(output));
        return output;
    },

    async getFolderFromId(folder_id, account_id) {
        // console.log(">>>>>>>>>> getFolderFromId folder_id: " + folder_id);
        // console.log(">>>>>>>>>> getFolderFromId account_id: " + account_id);
        let folderArray = await tsCoreUtils.getFoldersArrayFromIds([folder_id], account_id);
        // console.log(">>>>>>>>>> getFolderFromId folderArray: " + JSON.stringify(folderArray));
        if(folderArray.length > 0) {
            return folderArray[0];
        } else {
            return null;
        }
    },

    flattenFolders(folders, pathsSet = new Set()) {
        return folders.flatMap(folder => {
        let result = [];
        if (!pathsSet.has(folder.path)) {
            const { subFolders, ...folderWithoutSubFolders } = folder;
            result.push(folderWithoutSubFolders);
            pathsSet.add(folder.path);
        }
        if (folder.subFolders && folder.subFolders.length > 0) {
            result = result.concat(tsCoreUtils.flattenFolders(folder.subFolders, pathsSet));
        }
        return result;
        });
    },

    splitAccountAndPath(inputString) {
        // console.log(">>>>>>>>>> splitAccountAndPath inputString: " + inputString);
        const separator = ":/";
        const index = inputString.indexOf(separator);
    
        if (index !== -1) {
            const account = inputString.substring(0, index);
            const path = inputString.substring(index + separator.length);
            return { account: account, path: path };
        } else {
           return false;
        }
    },

    async getIncludeArchivePreference(account_id) {
        if(account_id == 0) {
           return await tsPrefs.getPref("include_archive_multi_account");
        } else {
           let accounts_adv_settings = await tsPrefs.getPref("accounts_adv_settings");
         //   console.log(">>>>>>>>>>>> [getFilterDuplicatesPreference] accounts_adv_settings: " + JSON.stringify(accounts_adv_settings));
         let element = null;
         if(accounts_adv_settings.length > 0) {
           element = accounts_adv_settings.find(account => account.id == account_id);
         }
         //   console.log(">>>>>>>>>>>> [getFilterDuplicatesPreference] element: " + JSON.stringify(element));
         let filter_duplicates_defaults = await this.getDefaultAccountFilterDuplicatesOption(account_id);
         if(!element) return filter_duplicates_defaults;
         return element.filter_duplicates ?? filter_duplicates_defaults;
        }
     },

    async getFilterDuplicatesPreference(account_id) {
        if(account_id == 0) {
            return await tsPrefs.getPref("filter_duplicates_multi_account");
        } else {
            let accounts_adv_settings = await tsPrefs.getPref("accounts_adv_settings");
            //console.log(">>>>>>>>>>>> [getFilterDuplicatesPreference] accounts_adv_settings: " + JSON.stringify(accounts_adv_settings));
            let element = null;
            if(accounts_adv_settings.length > 0) {
                element = accounts_adv_settings.find(account => account.id == account_id);
            }
            //console.log(">>>>>>>>>>>> [getFilterDuplicatesPreference] element: " + JSON.stringify(element));
            let filter_duplicates_defaults = await this.getDefaultAccountFilterDuplicatesOption(account_id);
            if(!element) return filter_duplicates_defaults;
            return element.filter_duplicates ?? filter_duplicates_defaults;
        }
    },

    extractDomain(email) {
        if (typeof email === 'string' && email.includes('@')) {
          return email.split('@')[1];
        }
        return null;
    },

    extractDomains(recipients) {
        const domains = [];
      
        recipients.forEach((recipient) => {
          // Use regex to extract the email from a string like "Name <email@example.com>" or just "email@example.com"
          const emailMatch = recipient.match(/<(.+?)>|(.+?@.+)/);
          const email = emailMatch ? (emailMatch[1] || emailMatch[2]) : null;
      
          if (email && email.includes('@')) {
            let domain = email.split('@')[1].trim();
            domain = domain.replace(/>/g, '').trim();
            domains.push(domain);
          }
        });
      
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


const inboxZeroColors = [
    "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", 
    "#98df8a", "#ff9896", "#9467bd", "#c5b0d5", 
    "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", 
    "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5",
    "#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
    "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
    "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
    "#843c39", "#ad494a", "#d6616b", "#e7969c",
    "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
];

const inboxZeroInboxColor = "#d62728";
