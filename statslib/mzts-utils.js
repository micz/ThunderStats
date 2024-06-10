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

export const tsUtils = {

    regexEmail: /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    
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

    getPreviousWeekday(input_date,weekday) {
        let curr_date = new Date(input_date);        
        // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        let dayOfWeek = curr_date.getDay();
        // Calculate the difference in days to the last desired weekday
        let difference = (dayOfWeek + 7 - weekday) % 7;
        // Subtract the difference in days from the current date
        curr_date.setDate(curr_date.getDate() - difference);
        curr_date.setHours(12, 0, 0, 0);
        return curr_date;
    },

    getLastWeekday(weekday) {
        return this.getPreviousWeekday(new Date(), weekday);
    },

    getLastSunday() {
        return this.getLastWeekday(0); // 0 represents Sunday
    },

    getLastMonday() {
        return this.getLastWeekday(1); // 1 represents Monday
    },

    getFirstDayOfCurrentMonth() {
        // Create a new Date object for the current date
        let month_first_day = new Date();
        // Set the date to the first day of the current month
        month_first_day.setDate(1);
        month_first_day.setHours(12, 0, 0, 0);
        return month_first_day;
    },

    getFirstDayOfLastMonth() {
        // Create a new Date object for the current date
        let month_first_day = new Date();
        // Set the date to the first day of the current month
        month_first_day.setDate(1);
        // Subtract one month
        month_first_day.setMonth(month_first_day.getMonth() - 1);
        month_first_day.setHours(12, 0, 0, 0);
        return month_first_day;
    },

    getLastDayOfLastMonth() {
        // Create a new Date object for the current date
        let month_last_day = new Date();
        // Set the date to the first day of the current month
        month_last_day.setDate(1);
        // Subtract one day to get the last day of the previous month
        month_last_day.setDate(0);
        month_last_day.setHours(12, 0, 0, 0);
        return month_last_day;
    },

    getFirstDayOfCurrentYear() {
        // Create a new Date object for the current date
        let first_year_day = new Date();
        // Set the month to January (0) and the date to the 1st
        first_year_day.setMonth(0); // January is 0
        first_year_day.setDate(1);
        first_year_day.setHours(12, 0, 0, 0);
        return first_year_day;
    },

    getFirstDayOfLastYear() {
        // Create a new Date object for the current date
        let first_year_day = new Date();
        // Set the year to the last year and the month to January (0) and the date to the 1st
        first_year_day.setFullYear(first_year_day.getFullYear() - 1);
        first_year_day.setMonth(0); // January is 0
        first_year_day.setDate(1);
        first_year_day.setHours(0, 0, 0, 0);
        return first_year_day;
    },

    getLastDayOfLastYear() {
        // Create a new Date object for the current date
        let last_year_day = new Date();
        // Set the year to the last year and the month to December (11) and the date to the 31st
        last_year_day.setFullYear(last_year_day.getFullYear() - 1);
        last_year_day.setMonth(11); // December is 11
        last_year_day.setDate(31);
        last_year_day.setHours(23, 59, 59, 999);
        return last_year_day;
    },

    formatDateStringLocale(locale) {
        const date = new Date(2000, 6, 27);

        const formatter = new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        const formattedDate = formatter.format(date);
        //console.log(">>>>>>>>>>>>>> formattedDate: " + formattedDate);
        const formatString = formattedDate.replace('27', 'dd')
                                          .replace('07', 'MM')
                                          .replace('2000', 'yyyy');

        //console.log(">>>>>>>>>>>>>> formatString: " + formatString);
        return formatString;
    },

    safeConcat(dataArray, index) {
        return (dataArray[index] && dataArray[index].data) ? dataArray[index].data : [];
    },

    isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

}
