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

export const tsExport = {

    /* https://stackoverflow.com/a/58769574 */
    arrayToCsv(data) {
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

    downloadCSV(data, filename) {
        this.downloadBlob(this.arrayToCsv(data), filename, 'text/csv;charset=utf-8;');
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

    transformCorrespondantsJsonToArray(json) {
        const resultArray = [];
        // console.log(">>>>>>>>>>>>> transformCorrespondantsJsonToArray json: " + JSON.stringify(json));
        for (const email in json) {
            // console.log(">>>>>>>>>>>>> transformCorrespondantsJsonToArray email: " + JSON.stringify(email));
            if (json.hasOwnProperty(email)) {
                resultArray.push({
                    name: json[email].name,
                    email: email,
                    number: json[email].count
                });
            }
        }
    
        return resultArray;
    }
}