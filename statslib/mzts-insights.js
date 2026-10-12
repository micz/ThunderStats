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

// Derived metrics for the dashboard ("am I keeping up with my email?").
// Pure functions: they take the data returned by thunderStastsCore and return plain values.
//
// Inbox history is not stored by Thunderbird, so the Inbox Zero and backlog metrics are
// approximated from the arrival dates of the mails that are still in the inbox
// (the "dates" map returned by getInboxZeroDates): a day "closed at zero" when none
// of the mails received that day is still in the inbox.

import { tsUtils } from "./mzts-utils.js";
import { tsCoreUtils } from "./mzts-statscore.utils.js";

export const BASELINE_WEEKS = 6;            // past same weekdays used for the "usual day"
export const INBOX_FEW_LEFT = 5;            // a day with at most this many mails left is "almost at zero"
export const STREAK_STRIP_DAYS = 14;        // days shown in the Inbox Zero streak strip
export const STREAK_WINDOW_DAYS = 90;       // the current streak looks back at most this many days
export const CLEAR_IN_GOOD_DAYS = 5;        // backlog clearable within this many working days = keeping up

export const tsInsights = {

    hoursArray(msg_hours, field) {
        let output = [];
        for(let h = 0; h < 24; h++) {
            output.push(msg_hours[h] ? msg_hours[h][field] : 0);
        }
        return output;
    },

    cumulative(values) {
        let total = 0;
        return values.map(v => (v === null) ? null : (total += v));
    },

    sum(values) {
        return values.reduce((acc, v) => acc + (v || 0), 0);
    },

    // Usual range of the past same weekdays.
    // With 5 or more samples the highest and the lowest day are dropped, so one odd day does not stretch the range.
    weekdayBaseline(days_msg_hours, progressive) {
        if(!days_msg_hours || days_msg_hours.length == 0) return null;

        let rcvd = days_msg_hours.map(d => this.hoursArray(d, 'received'));
        let sent = days_msg_hours.map(d => this.hoursArray(d, 'sent'));
        let rcvd_cum = rcvd.map(d => this.cumulative(d));
        let sent_cum = sent.map(d => this.cumulative(d));

        let range = (series) => {
            let low = [], high = [];
            for(let h = 0; h < 24; h++) {
                let values = series.map(s => s[h]).sort((a, b) => a - b);
                if(values.length >= 5) values = values.slice(1, -1);
                low.push(values[0]);
                high.push(values[values.length - 1]);
            }
            return {low, high};
        };
        let mean = (series) => {
            let output = [];
            for(let h = 0; h < 24; h++) {
                output.push(series.reduce((acc, s) => acc + s[h], 0) / series.length);
            }
            return output;
        };

        let cum_range = range(rcvd_cum);
        let band = progressive ? cum_range : range(rcvd);

        return {
            num_days: days_msg_hours.length,
            band_low: band.low,
            band_high: band.high,
            rcvd_cum_low: cum_range.low,
            rcvd_cum_high: cum_range.high,
            rcvd_cum_avg: mean(rcvd_cum),
            sent_cum_avg: mean(sent_cum),
            avg_received: this.sum(rcvd.map(d => this.sum(d))) / rcvd.length,
            avg_sent: this.sum(sent.map(d => this.sum(d))) / sent.length,
        };
    },

    // Percentage change of value against reference, as shown in the KPI cards
    delta(value, reference, increase_is_bad) {
        if(!reference) return null;
        let pct = Math.round((value - reference) / reference * 100);
        return {
            text: pct == 0 ? '±0%' : ((pct > 0 ? '▲ ' : '▼ ') + Math.abs(pct) + '%'),
            color: (pct > 0 && increase_is_bad) ? 'var(--warn)' : 'var(--text2)',
        };
    },

    addDays(date, days) {
        let output = new Date(date);
        output.setDate(output.getDate() + days);
        return output;
    },

    // Inbox Zero state of the num_days days ending on end_date
    inboxZeroDays(inbox_dates, end_date, num_days) {
        let output = [];
        for(let k = num_days - 1; k >= 0; k--) {
            let day = this.addDays(end_date, -k);
            let left = inbox_dates[tsUtils.dateToYYYYMMDD(day)] || 0;
            output.push({
                date: day,
                left: left,
                state: left == 0 ? 'zero' : (left <= INBOX_FEW_LEFT ? 'few' : 'missed'),
            });
        }
        return output;
    },

    // Current streak of days at zero ending on end_date (looking back at most STREAK_WINDOW_DAYS days).
    // When the last day is still in progress and not at zero, the streak is counted up to the day before.
    // There is no "best streak": old days always end up at zero once their mails are processed,
    // so a best streak over a long window would be meaningless with this approximation.
    inboxZeroStreak(inbox_dates, end_date, last_day_in_progress) {
        let days = this.inboxZeroDays(inbox_dates, end_date, STREAK_WINDOW_DAYS);
        let i = days.length - 1;
        if(last_day_in_progress && days[i].state != 'zero') i--;
        let current = 0;
        while(i >= 0 && days[i].state == 'zero') {
            current++;
            i--;
        }
        return {current};
    },

    // Mails received between from_date and to_date (included) that are still in the inbox
    backlogAdded(inbox_dates, from_date, to_date) {
        let from_key = tsUtils.dateToYYYYMMDD(from_date);
        let to_key = tsUtils.dateToYYYYMMDD(to_date);
        let total = 0;
        for(let key in inbox_dates) {
            if(key >= from_key && key <= to_key) total += inbox_dates[key];
        }
        return total;
    },

    // Days the current inbox has been waiting since its oldest mail arrived
    oldestDays(inbox_dates, ref_date = new Date()) {
        let keys = Object.keys(inbox_dates).filter(k => inbox_dates[k] > 0).sort();
        if(keys.length == 0) return 0;
        let oldest = tsUtils.parseYYYYMMDDToDate(keys[0]);
        let today = new Date(ref_date);
        today.setHours(0, 0, 0, 0);
        return Math.max(0, Math.round((today - oldest) / 86400000));
    },

    // Working days needed to clear the backlog at the usual pace.
    // The pace is the average number of mails per working day that left the inbox (received minus still in inbox)
    // over the given days (msg_days: {YYYYMMDD: {received}}).
    clearInDays(backlog, msg_days, inbox_dates) {
        if(backlog == 0) return 0;
        let handled = [];
        for(let key in msg_days) {
            if(!tsCoreUtils.checkBusinessDay(key)) continue;
            handled.push(Math.max(0, (msg_days[key].received || 0) - (inbox_dates[key] || 0)));
        }
        if(handled.length == 0) return null;
        let pace = this.sum(handled) / handled.length;
        if(pace <= 0) return null;
        return Math.ceil(backlog / pace);
    },

    // Senders and recipients merged by address, for the "top correspondents" list
    topCorrespondents(senders, recipients, num) {
        let merged = {};
        for(let email in senders) {
            merged[email] = {email, name: senders[email].name, received: senders[email].count, sent: 0};
        }
        for(let email in recipients) {
            if(!merged[email]) merged[email] = {email, name: recipients[email].name, received: 0, sent: 0};
            merged[email].sent = recipients[email].count;
        }
        let rows = Object.values(merged).map(r => Object.assign(r, {total: r.received + r.sent}));
        rows.sort((a, b) => b.total - a.total);
        return {rows: rows.slice(0, num), count: rows.length};
    },

    isInboxFolder(folder_data) {
        return !!(folder_data && ((folder_data.specialUse && folder_data.specialUse.includes('inbox')) || folder_data.type == 'inbox'));
    },

    // Received mails of the period by folder: the inbox first, then the folders they were filed into
    endedUpFolders(folders) {
        let rows = [];
        for(let id in folders) {
            let folder = folders[id];
            if(!folder.received) continue;
            let is_inbox = this.isInboxFolder(folder.folder_data);
            rows.push({
                id: id,
                name: folder.folder_data.name,
                n: folder.received,
                kind: is_inbox ? 'inbox' : 'filed',
            });
        }
        rows.sort((a, b) => (a.kind == 'inbox' ? -1 : 0) - (b.kind == 'inbox' ? -1 : 0) || b.n - a.n);
        return rows;
    },

    // Tags of the period (tags = tags object returned by getFullStatsData)
    endedUpTags(tags) {
        let rows = [];
        for(let key in tags) {
            if(!tags[key].count) continue;
            rows.push({id: key, name: tags[key].tag, n: tags[key].count, color: tags[key].color});
        }
        rows.sort((a, b) => b.n - a.n);
        return rows;
    },

    // Domains sorted by total mails
    domainRows(domains) {
        let rows = [];
        for(let name in domains) {
            rows.push({name, sent: domains[name].sent, received: domains[name].received, internal: !!domains[name].internal});
        }
        rows.sort((a, b) => (b.sent + b.received) - (a.sent + a.received));
        return rows;
    },

    // "45%" from "45.23%"
    roundPercent(percent_string) {
        return Math.round(parseFloat(percent_string) || 0) + '%';
    },
};
