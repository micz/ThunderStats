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
        for(let key in folders) {
            output_labels.push(folders[key].folder_data.name);
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
        return {labels: output_labels, colors: output_colors};
    },

    getFoldersCounts(folders) {
        let output = [];
        for(let key in folders) {
            output.push(folders[key].count);
        }
        return output;
    },

    transformDatesDataToDataset(data) {
        let datasets = [];
        let availableColors = [...inboxZeroColors];
        let total = 0;
        for(let key in data) {
            total += data[key];
        }
        for(let key in data) {
            let color = availableColors.shift();
            let value = data[key];
            let dataset = {
                label: key,
                data: [value/total],
                backgroundColor: color,
                borderColor: color,
            }
            datasets.push(dataset);
        }
        return datasets;
    },

    getDateString(originalDate) {
        // Extract the year from the date
        let year = originalDate.getFullYear();
        
        // Extract the month from the date and adjust for zero-index (0 for January, 11 for December)
        let month = originalDate.getMonth() + 1; 
        
        // Extract the day from the date
        let day = originalDate.getDate();
        
        // Format month and day to always have two digits
        let formattedMonth = month < 10 ? '0' + month : month;
        let formattedDay = day < 10 ? '0' + day : day;
        
        // Concatenate year, month, and day to form the YYYYMMDD string
        let dateString = '' + year + formattedMonth + formattedDay;

        // Return the formatted date string
        return dateString;
    },

    getDateArray(fromDate, toDate) {
        let dateArray = {};
        let currentDate = new Date(fromDate.getTime()); // Create a new date object to avoid mutating the original date
    
        while (currentDate <= toDate) {
            let formattedDate = this.getDateString(currentDate);
            dateArray[formattedDate] = {};
            dateArray[formattedDate].sent = 0;
            dateArray[formattedDate].received = 0;
            currentDate.setDate(currentDate.getDate() + 1); // Increment the date by one day
        }
        return dateArray;
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
