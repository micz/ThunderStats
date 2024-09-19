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

    // convertToMilliseconds(timeStr) {
    //     const parts = timeStr.split(' ');
    //     const hours = parts[0].includes('h') ? parseInt(parts[0].slice(0, -1)) : 0;
    //     const minutes = parts[1].includes('m') ? parseInt(parts[1].slice(0, -1)) : 0;
    //     const seconds = parts[2].includes('s') ? parseInt(parts[2].slice(0, -1)) : 0;
    //     const milliseconds = parts[3].includes('ms') ? parseInt(parts[3].slice(0, -2)) : 0;
    
    //     const totalMilliseconds = (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
    //     return totalMilliseconds;
    // },

    convertFromMilliseconds(milliseconds) {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        const remainingMilliseconds = milliseconds % 1000;
        
        let result = '';
    
        if (hours !== 0) {
            result += hours + 'h ';
        }
    
        if (minutes !== 0) {
            result += minutes + 'm ';
        }
    
        if (seconds !== 0) {
            result += seconds + 's ';
        }
    
        if (remainingMilliseconds !== 0) {
            result += remainingMilliseconds + 'ms';
        }
    
        return result.trim();
    },

    sortDays(firstDayWeek, days) {
        const sortedDays = [...days]; // Create a shallow copy of the days array

        if (firstDayWeek == 0) {
          // Sort days normally by index if the first day of the week is 0 (Sunday)
          sortedDays.sort((a, b) => a.idx - b.idx);
        } else if (firstDayWeek == 6) {
          // Custom sort for when the first day of the week is 6 (Saturday)
          sortedDays.sort((a, b) => {
            if (a.idx === 6) return -1; // Move Saturday to the front
            if (b.idx === 6) return 1;
            if (a.idx === 0) return -1; // Then move Sunday to the second position
            if (b.idx === 0) return 1;
            return a.idx - b.idx; // Sort the rest normally
          });
        }

        return sortedDays; // Return the sorted copy
      },

      sortWeekdays(firstDayWeek, msg_weekdays) {
        // console.log(">>>>>>>>>> sortWeekdays: msg_weekdays: " + JSON.stringify(msg_weekdays));
        // console.log(">>>>>>>>>> sortWeekdays: firstDayWeek: " + firstDayWeek);
        // Convert the object to an array of entries to sort
        const weekdaysArray = Object.entries(msg_weekdays).map(([key, value]) => ({
          idx: parseInt(key),
          ...value
        }));
        // console.log(">>>>>>>>>>>> sortWeekdays: weekdaysArray: " + JSON.stringify(weekdaysArray));
        // Sort the array based on the firstDayWeek value
         // Ordina l'array basandoti su firstDayWeek
        weekdaysArray.sort((a, b) => {
          const aAdjusted = (a.idx - firstDayWeek + 7) % 7;
          const bAdjusted = (b.idx - firstDayWeek + 7) % 7;
          return aAdjusted - bAdjusted;
        });
        // console.log(">>>>>>>>>>>> sortWeekdays: weekdaysArray: " + JSON.stringify(weekdaysArray));
        
        return weekdaysArray;
      },
      
      async isThunderbird128OrGreater(){
        try {
          const info = await browser.runtime.getBrowserInfo();
          const version = info.version;
          // console.log(">>>>>>>>>> version: " + info.version)
          // console.log(">>>>>>>>>> isThunderbird128OrGreater: " + tsUtils.compareThunderbirdVersions(version, '128.0') >= 0)
          return tsUtils.compareThunderbirdVersions(version, '128.0') >= 0;
        } catch (error) {
          console.error('[ThunderStats] Error retrieving browser information:', error);
          return false;
        }
      },

      compareThunderbirdVersions(v1, v2) {
        const v1parts = v1.split('.').map(Number);
        const v2parts = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
          const v1part = v1parts[i] || 0;
          const v2part = v2parts[i] || 0;
          if (v1part > v2part) return 1;
          if (v1part < v2part) return -1;
        }
        return 0;
      },
        
}
