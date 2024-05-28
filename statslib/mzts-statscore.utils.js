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
        return [dayOfWeek,formattedDate,(tsUtils.isToday(date) ? "\n[" + browser.i18n.getMessage("Today") + "]" : "")];
    },

    getManyDaysBarColor(ctx, totalBars) {
        const defaultColor = '#4682B4';
        const todayColor = '#5BB4FD';
        return ctx.dataIndex === totalBars - 1 ? todayColor : defaultColor;
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
