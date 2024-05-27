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
            dateArray[formattedDate].count = 0;
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

    isToday(date) {
        const today = new Date();
        return date.getFullYear() === today.getFullYear() &&
               date.getMonth() === today.getMonth() &&
               date.getDate() === today.getDate();
    },

}
