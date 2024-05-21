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

export const tsUtils = {
    humanReadableMilliseconds(tot_milliseconds) {
        let hours = Math.floor(tot_milliseconds / 3600000);
        let minutes = Math.floor((tot_milliseconds - (hours * 3600000)) / 60000);
        let seconds = Math.floor((tot_milliseconds - (hours * 3600000) - (minutes * 60000)) / 1000);
        let milliseconds = tot_milliseconds - (hours * 3600000) - (minutes * 60000) - (seconds * 1000);
        return hours + "h " + minutes + "m " + seconds + "s " + milliseconds + "ms";
    },

    transformHoursDataToDataset(data, do_progressive = false) {
        //============== test
        // let msg_hours = [];
        // for(let i = 0; i < 24; i++) {
        //     msg_hours[i] = {};
        //     msg_hours[i].sent = Math.floor(Math.random() * 20);
        //     msg_hours[i].received = Math.floor(Math.random() * 20);
        //   }
        // data = msg_hours;
        //============== test END
        let dataset_sent = Array.from({length: 25}, () => 0);
        let dataset_rcvd = Array.from({length: 25}, () => 0);
        for(let key in data) {
            let value = data[key];
            let hour = parseInt(key);
            dataset_sent[hour] = value.sent;
            dataset_rcvd[hour] = value.received;
        }
        if(do_progressive) {
            for(let i = 1; i < 24; i++) {
                dataset_sent[i] = dataset_sent[i] + dataset_sent[i-1];
                dataset_rcvd[i] = dataset_rcvd[i] + dataset_rcvd[i-1];
                }
            }
        return { dataset_sent, dataset_rcvd };
    },

    getFoldersLabelsColors(folders) {
        let availableColors = [...inboxZeroColors];
        let output_labels = [];
        let output_colors = [];
        let output_paths = [];
        for(let key in folders) {
            output_labels.push(folders[key].folder_data.name);
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
        return {labels: output_labels, colors: output_colors, folder_paths: output_paths};
    },

    getFoldersCounts(folders) {
        let output = [];
        for(let key in folders) {
            output.push(folders[key].count);
        }
        return output;
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
            let spin_day_date = this.parseYYYYMMDDToDate(spin_day);
            let tmp_array = {};
            let aggregate_day_value = 0;
            let aggregate_day_date = new Date(1900, 0, 1);
            for(let key in data) {
                let current_date = this.parseYYYYMMDDToDate(key);
                if(current_date <= spin_day_date) {
                    aggregate_day_value += data[key];
                    aggregate_day_date = (aggregate_day_date < current_date) ? current_date : aggregate_day_date;
                }else{
                    tmp_array[key] = data[key];
                }
            }
            aggregate_day_date_string = this.dateToYYYYMMDD(aggregate_day_date);
            tmp_array[aggregate_day_date_string] = aggregate_day_value;
            data = tmp_array;
        }
        for(let key in data) {
            let color = availableColors.shift();
            let value = data[key];
            let value_percentage = value / total;
            let current_date = this.parseYYYYMMDDToDate(key);
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

    dateToYYYYMMDD(originalDate) {
        // Extract the year from the date
        let year = originalDate.getFullYear();
        // Extract the month from the date and adjust for zero-index (0 for January, 11 for December)
        let month = originalDate.getMonth() + 1; 
        // Extract the day from the date
        let day = originalDate.getDate();
        // Format month and day to always have two digits
        let formattedMonth = month < 10 ? '0' + month : month;
        let formattedDay = day < 10 ? '0' + day : day;

        let dateString = '' + year + formattedMonth + formattedDay;

        return dateString;
    },

    parseYYYYMMDDToDate(dateString) {
        // Extract year, month, and day from the string
        let year = parseInt(dateString.substring(0, 4), 10);
        let month = parseInt(dateString.substring(4, 6), 10) - 1; // Months are zero-based in JavaScript
        let day = parseInt(dateString.substring(6, 8), 10);
        
        // Create a Date object using the extracted year, month, and day
        let dateObject = new Date(year, month, day);
        
        return dateObject;
    },

    getDateArray(fromDate, toDate) {
        let dateArray = {};
        let currentDate = new Date(fromDate.getTime()); // Create a new date object to avoid mutating the original date
    
        while (currentDate <= toDate) {
            let formattedDate = this.dateToYYYYMMDD(currentDate);
            dateArray[formattedDate] = {};
            dateArray[formattedDate].sent = 0;
            dateArray[formattedDate].received = 0;
            currentDate.setDate(currentDate.getDate() + 1); // Increment the date by one day
        }
        return dateArray;
    },

    daysBetween(fromDate, toDate) {
        const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 12, 0, 0);
        const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 12, 0, 0);
        
        const differenceInTime = to - from;
        
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        
        return Math.ceil(differenceInDays) +1;
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
