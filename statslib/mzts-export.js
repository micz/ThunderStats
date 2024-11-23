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

import { tsCoreUtils } from '@statslib/mzts-statscore.utils';
import { tsStore } from '@statslib/mzts-store';

export const tsExport = {

    export: {
        correspondents: {
            type: 'correspondents',
            name: 'Correspondents',
        },
        time_emails: {
            type: 'time_emails',
            name: 'Time Emails',
        },
        daily_mails: {
            type: 'daily_mails',
            name: 'Daily Emails',
        },
        tags: {
            type: 'tags',
            name: 'Tags',
        },
        folders: {
            type: 'folders',
            name: 'Folders',
        },
        domains: {
            type: 'domains',
            name: 'Domains',
        },
    },

    getExportPrefix() {
        return 'ThunderStats_Export_';
    },

    /* https://stackoverflow.com/a/58769574 */
    arrayToCsv(data) {
        if (!data || data.length === 0) {
            return '';
        }

        const array = [Object.keys(data[0])].concat(data)

        return array.map(it => {
            return Object.values(it).toString()
        }).join('\n');
    },

    /* https://stackoverflow.com/a/68146412 */
    /* downloadBlob(csv, 'export.csv', 'text/csv;charset=utf-8;')*/
    downloadBlob(content, filename, contentType) {
        // Create a blob
        var blob = new Blob([content], { type: contentType });
        var url = URL.createObjectURL(blob);

        // Create a link to download it
        var pom = document.createElement('a');
        pom.href = url;
        pom.setAttribute('download', filename);
        pom.click();
    },

    downloadCSV(data, export_name) {
        let output_filename = tsExport.getExportPrefix() + tsExport.makeSafeForFilePath(export_name) + '_' + tsExport.getCurrentTimestamp() + '.csv';
        this.downloadBlob(this.arrayToCsv(data), output_filename, 'text/csv;charset=utf-8;');
    },

    makeSafeForFilePath(input) {
        // Replace unsafe characters with an underscore
        return input
            .replace(/[\/\\:*?"<>|]/g, '_') // Replace special characters
            .replace(/[^\w\-_.]/g, '_')     // Replace non-alphanumeric characters (except underscore, period, and hyphen)
            .replace(/_+/g, '_')            // Replace multiple consecutive underscores with a single one
            .trim();                        // Remove whitespace from the beginning and end
    },

    getCurrentTimestamp() {
        const now = new Date();
    
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so we add 1
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        // Combine all parts into the desired format
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    },

    mergeRecipientsAndSenders(recipients, senders) {
        const correspondents = {};
    
        // Process recipients
        for (const [email, details] of Object.entries(recipients)) {
            if (!correspondents[email]) {
                correspondents[email] = {
                    sent: 0,
                    received: details.count,
                    name: details.name
                };
            } else {
                correspondents[email].received = details.count;
            }
        }
    
        // Process senders
        for (const [email, details] of Object.entries(senders)) {
            if (!correspondents[email]) {
                correspondents[email] = {
                    sent: details.count,
                    received: 0,
                    name: details.name
                };
            } else {
                correspondents[email].sent = details.count;
            }
        }
    
        return correspondents;
    },

    transformCorrespondentsJsonToArray(json) {
        const resultArray = [];
        // console.log(">>>>>>>>>>>>> transformCorrespondentsJsonToArray json: " + JSON.stringify(json));
        const nameKey = browser.i18n.getMessage('Name');
        const mailKey = browser.i18n.getMessage('Mail');
        const sentKey = browser.i18n.getMessage('TimeChart.Sent');
        const rcvdKey = browser.i18n.getMessage('TimeChart.Rcvd');

        for (const email in json) {
            // console.log(">>>>>>>>>>>>> transformCorrespondentsJsonToArray email: " + JSON.stringify(email));
            if (json.hasOwnProperty(email)) {
                const obj = {};
                obj[nameKey] = json[email].name;
                obj[mailKey] = email;
                obj[sentKey] = json[email].sent;
                obj[rcvdKey] = json[email].received;

                resultArray.push(obj);
            }
        }
    
        return resultArray;
    },

    transformDailyMailsJsonToArray(json) {
        let resultArray = [];

        const dateKey = browser.i18n.getMessage('Date');
        const sentKey = browser.i18n.getMessage('TimeChart.Sent');
        const rcvdKey = browser.i18n.getMessage('TimeChart.Rcvd');
    
        for (let date in json) {
            let mailData = json[date];
            const obj = {};
            let formatted_date = tsCoreUtils.getManyDaysLabel(date);
            obj[dateKey] = formatted_date[1];
            obj[sentKey] = mailData.sent;
            obj[rcvdKey] = mailData.received;
            
            resultArray.push(obj);
        }
    
        return resultArray;
    },

    transformTimeMailsJsonToArray(json) {
        let resultArray = [];

        const timeKey = browser.i18n.getMessage('TimeChart.Time');
        const sentKey = browser.i18n.getMessage('TimeChart.Sent');
        const rcvdKey = browser.i18n.getMessage('TimeChart.Rcvd');
    
        const transformedArray = [];

            for (let hour in json) {
                const obj = {};
                obj[timeKey] = parseInt(hour);
                obj[sentKey] = json[hour].sent;
                obj[rcvdKey] = json[hour].received;
    
            resultArray.push(obj);
        }
    
        return resultArray;
    },

    transformTagsJsonToArray(json) {
        let resultArray = [];

        const tagKey = browser.i18n.getMessage('Tags');
        const sentKey = browser.i18n.getMessage('TimeChart.Sent');
        const rcvdKey = browser.i18n.getMessage('TimeChart.Rcvd');
    
        for (let tag in json) {
            let mailData = json[tag];
            const obj = {};
            obj[tagKey] =  tsStore.tags_list[tag].tag;
            obj[sentKey] = mailData.sent;
            obj[rcvdKey] = mailData.received;
            
            resultArray.push(obj);
        }
    
        return resultArray;
    },
}