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

// Builds the props of WidgetPeriodDashboard (many-days layout) from the data loaded by a tab.
// Every input except kind, days and stat_days may be null while it is still loading.

import { tsInsights, CLEAR_IN_GOOD_DAYS } from "./mzts-insights.js";

const INBOX_CALENDAR_MAX_DAYS = 42;     // the Inbox Zero calendar shows at most the last 6 weeks of the period
import { tsCoreUtils } from "./mzts-statscore.utils.js";
import { tsUtils } from "./mzts-utils.js";

function msg(key, subs) {
    return browser.i18n.getMessage(key, subs);
}

// Dates are formatted in the Thunderbird UI language, like the rest of the texts
function locale() {
    return browser.i18n.getUILanguage ? browser.i18n.getUILanguage() : undefined;
}

function toDate(key) {
    return tsUtils.parseYYYYMMDDToDate(key);
}

function hourText(hour) {
    return String(hour % 24).padStart(2, '0') + ':00';
}

function round1(value) {
    return value < 10 ? (Math.round(value * 10) / 10) : Math.round(value);
}

export const tsPeriodModel = {

    /*
      input = {
        kind: 'manydays' | 'custom',
        days: [YYYYMMDD],            // days shown in the day-by-day chart and in the calendar
        stat_days: [YYYYMMDD],       // days counted in totals and averages (Many Days: without today)
        today_key: YYYYMMDD | null,  // today, highlighted and reported apart ("+N today")
        result: object,              // getFullStatsData output
        inbox: object,               // getInboxZeroDates output
        prev: object,                // previous period counts { sent, received } (Many Days only)
        aggregate: object,           // aggregateData output for stat_days (total/max/min/avg)
        only_businessdays: boolean,  // averages on business days only
        show_inbox: boolean,         // many_days_show_inbox pref
        internal: { enabled, sent_percent, rcvd_percent },
        involved_num: number,
        first_day_week: number,
        duplicates_note: boolean,          // folder counts include duplicates (filter_duplicates on): explain it
        open_folder_in_first_tab: boolean, // inbox0_openFolderInFirstTab pref
        aggregation: 'day' | 'week' | 'month' | 'year',   // grouping of the main chart (Custom Query)
        cmp_result: object,          // Period B getFullStatsData output (Custom Query comparison), or null
      }
    */
    build(input) {
        let dates = input.result ? input.result.dates : {};
        let stat = input.stat_days;
        let sumOf = (keys, field) => keys.reduce((acc, k) => acc + (dates[k] ? dates[k][field] : 0), 0);
        let R = sumOf(stat, 'received');
        let S = sumOf(stat, 'sent');
        let L = sumOf(stat, 'inbox');
        let business_days = stat.filter(k => tsCoreUtils.checkBusinessDay(k));
        // The averages leave out the day in progress (Many Days keeps it out of stat_days already, a Custom Query may end today)
        let current_key = tsUtils.dateToYYYYMMDD(new Date());
        let avg_days = stat.filter(k => k != current_key);
        let avg_business_days = business_days.filter(k => k != current_key);
        let avg_keys = (input.only_businessdays && avg_business_days.length > 0) ? avg_business_days : avg_days;

        let d = { dates, stat, R, S, L, H: Math.max(0, R - L), business_days, current_key, avg_days, avg_business_days, avg_keys };

        return {
            strip: this.strip(input, d),
            kpis: this.kpis(input, d),
            chart: this.chart(input, d),
            tod: this.timeOfDay(input, d),
            iz: this.inboxZero(input),
            heat: this.heat(input),
            weekday: this.weekday(input, d),
            involved: this.involved(input),
            domains: this.domains(input),
            ended: this.ended(input, d),
            empty_text: msg("NoMailsReceived"),
        };
    },

    rangeText(keys) {
        if(keys.length == 0) return '';
        let first = toDate(keys[0]), last = toDate(keys[keys.length - 1]);
        let format = new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
        return format.formatRange ? format.formatRange(first, last) : format.format(first) + ' – ' + format.format(last);
    },

    shortDay(key) {
        return toDate(key).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric' });
    },

    strip(input, d) {
        let tone = 'neutral', badge = msg("QueryResult");
        if(input.kind == 'manydays') {
            badge = '';
            if(input.inbox && input.result) {
                let clear_in = tsInsights.clearInDays(input.inbox.total, this.daysObject(d), input.inbox.dates);
                if(input.inbox.total == 0) {
                    tone = 'good'; badge = msg("InboxAtZero");
                } else if(clear_in !== null && clear_in <= CLEAR_IN_GOOD_DAYS) {
                    tone = 'good'; badge = msg("KeepingUp");
                } else {
                    tone = 'warn'; badge = msg("BacklogGrowing");
                }
            }
        }

        let pct = (v) => d.R > 0 ? (v / d.R * 100).toFixed(1) + '%' : '0%';
        let per_working_day = d.avg_business_days.length ? Math.round(this.sumKeys(d, d.avg_business_days, 'received') / d.avg_business_days.length) : 0;
        let busiest = null;
        for(let key of d.stat) {
            if(d.dates[key] && (!busiest || d.dates[key].received > d.dates[busiest].received)) busiest = key;
        }

        return {
            badge_label: badge,
            badge_tone: tone,
            date_line1: this.rangeText(d.stat),
            date_line2: msg("PeriodDaysInfo", [d.stat.length, d.business_days.length]),
            flow: [
                { label: msg("Arrived"), value: d.R, sub: '' },
                { label: msg("FiledOrAnswered"), value: d.H, sub: pct(d.H), color: 'var(--good)', title: msg("FolderLocation_percent_handled") },
                { label: msg("FolderLocation_percent_remaining"), value: d.L, sub: msg("AddedToBacklog"), color: 'var(--rcvd)' },
            ],
            side: [
                { label: msg("PerWorkingDay"), value: per_working_day, sub: msg("received") },
                { label: msg("BusiestDay"), value: busiest ? this.shortDay(busiest) : '—', sub: busiest ? msg("BusiestDaySub", [d.dates[busiest].received]) : '' },
            ],
            bar_good: pct(d.H),
            bar_left: pct(d.L),
        };
    },

    sumKeys(d, keys, field) {
        return keys.reduce((acc, k) => acc + (d.dates[k] ? d.dates[k][field] : 0), 0);
    },

    // total/max/min/avg of the given days, like thunderStastsCore.aggregateData
    aggregateKeys(d, keys) {
        let output = {};
        for(let field of ['sent', 'received']) {
            let values = keys.map(k => d.dates[k] ? d.dates[k][field] : 0);
            let total = tsInsights.sum(values);
            output['total_' + field] = total;
            output['max_' + field] = values.length ? Math.max(...values) : 0;
            output['min_' + field] = values.length ? Math.min(...values) : 0;
            output['avg_' + field] = values.length ? parseFloat((total / values.length).toFixed(2)) : 0;
        }
        return output;
    },

    // Hourly totals of a result without the day in progress, and the number of days they cover
    hoursWithoutCurrentDay(result, current_key) {
        let current = (result.msg_hours_days && result.msg_hours_days[current_key]) || null;
        let hours = (field) => tsInsights.hoursArray(result.msg_hours, field).map((v, h) => v - (current && current[h] ? current[h][field] : 0));
        let num_days = Object.keys(result.dates).filter(k => k != current_key).length;
        return { rcvd: hours('received'), sent: hours('sent'), num_days: Math.max(1, num_days) };
    },

    // Days and weekday totals of a result without the day in progress
    weekdaysWithoutCurrentDay(result, current_key) {
        let dates = Object.assign({}, result.dates);
        let msg_weekdays = result.msg_weekdays;
        if(dates[current_key]) {
            let wd = toDate(current_key).getDay();
            msg_weekdays = Object.assign({}, msg_weekdays, { [wd]: {
                received: msg_weekdays[wd].received - dates[current_key].received,
                sent: msg_weekdays[wd].sent - dates[current_key].sent,
            } });
            delete dates[current_key];
        }
        return { dates, msg_weekdays };
    },

    // {YYYYMMDD: {received}} of the counted days, as expected by tsInsights.clearInDays
    daysObject(d) {
        let output = {};
        for(let key of d.stat) output[key] = d.dates[key] || { received: 0 };
        return output;
    },

    kpis(input, d) {
        let kpis = [];
        let today = (input.today_key && d.dates[input.today_key]) ? d.dates[input.today_key] : null;
        // the aggregate of the tab counts the day in progress when the range ends today
        let agg = (input.aggregate && d.stat.includes(d.current_key)) ? this.aggregateKeys(d, input.only_businessdays ? d.avg_business_days : d.avg_days) : input.aggregate;
        let daily = (field) => agg ? msg("DailyStats", [agg['max_' + field], agg['min_' + field], agg['avg_' + field]]) : '';
        let daily_title = input.only_businessdays ? msg("InfoTotal_BDMails_Only") : '';

        // reference for the change: the previous period (Many Days) or Period B (Custom Query comparison)
        let reference = null, reference_sub = null;
        if(input.kind == 'manydays' && input.prev) {
            reference = input.prev;
            reference_sub = (value) => msg("VsPreviousPeriod", [d.stat.length, value]);
        } else if(input.cmp_result) {
            reference = { received: input.cmp_result.received, sent: input.cmp_result.sent };
            reference_sub = (value) => msg("VsPeriodB", [value]);
        }
        let waiting_reference = input.kind == 'manydays' && !input.prev;

        let counter = (id, field, color, increase_is_bad) => ({
            id, label: msg(id == 'rcvd' ? "ReceivedMails" : "SentMails"), value: d[field == 'received' ? 'R' : 'S'], color,
            delta: reference ? tsInsights.delta(d[field == 'received' ? 'R' : 'S'], reference[field], increase_is_bad) : null,
            aside: (today && today[field] > 0) ? msg("PlusToday", [today[field]]) : '',
            sub: reference ? reference_sub(reference[field]) : msg("AvgPerDay", [round1(this.sumKeys(d, d.avg_days, field) / Math.max(1, d.avg_days.length))]),
            sub2: daily(field), sub_title: daily_title,
            is_loading: !input.result || waiting_reference,
        });
        kpis.push(counter('rcvd', 'received', 'var(--rcvd)', true));
        kpis.push(counter('sent', 'sent', 'var(--sent)', false));

        if(input.internal && input.internal.enabled) {
            kpis.push({
                id: 'internal', label: msg("InternalTraffic"), value: tsInsights.roundPercent(input.internal.rcvd_percent),
                sub: msg("InternalTrafficSub", [tsInsights.roundPercent(input.internal.sent_percent)]),
                is_loading: !input.result,
            });
        }

        let ratio = d.S > 0 ? (d.R / d.S).toFixed(1) : null;
        kpis.push({
            id: 'ratio', label: msg("ReplyRatio"), value: ratio ? '1 : ' + ratio : '—',
            sub: ratio ? msg("ReplyRatioSub", [ratio]) : msg("NoMailsSent"),
            is_loading: !input.result,
        });
        return kpis;
    },

    chart(input, d) {
        let title = input.kind == 'manydays' ? msg("ChartPeriodTitle", [d.stat.length]) : msg("ChartPeriodTitleCustom");
        let step = input.days.length <= 14 ? 1 : Math.ceil(input.days.length / 7);
        let days = input.days.map((key, i) => {
            let date = toDate(key);
            let label = '';
            if(step == 1) label = this.shortDay(key);
            else if(i % step == 0) label = date.toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
            return {
                key, label,
                is_today: key == input.today_key,
                is_business: tsCoreUtils.checkBusinessDay(key),
                date_label: date.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' }),
            };
        });
        let field = (name) => input.days.map(k => d.dates[k] ? d.dates[k][name] : 0);
        let rcvd = field('received'), inbox = field('inbox'), sent = field('sent');

        let avg_rcvd = d.avg_keys.length ? this.sumKeys(d, d.avg_keys, 'received') / d.avg_keys.length : 0;
        let avg_sent = d.avg_keys.length ? this.sumKeys(d, d.avg_keys, 'sent') / d.avg_keys.length : 0;

        // note: working days against the other days, and the peak day
        let note = '';
        let other_days = d.avg_days.filter(k => !tsCoreUtils.checkBusinessDay(k));
        let busiest = null;
        for(let key of d.stat) {
            if(d.dates[key] && (!busiest || d.dates[key].received > d.dates[busiest].received)) busiest = key;
        }
        if(input.result && busiest && d.dates[busiest].received > 0) {
            let peak = msg("PeriodNotePeak", [this.shortDay(busiest), d.dates[busiest].received]);
            if(d.avg_business_days.length && other_days.length) {
                let bd_avg = Math.round(this.sumKeys(d, d.avg_business_days, 'received') / d.avg_business_days.length);
                let other_avg = Math.round(this.sumKeys(d, other_days, 'received') / other_days.length);
                note = msg("PeriodNoteWorkingDays", [bd_avg, other_avg]) + ' ' + peak;
            } else {
                note = peak;
            }
        }

        let chart = {
            title, days,
            rcvd: input.show_inbox ? rcvd.map((v, i) => Math.max(0, v - inbox[i])) : rcvd,
            rcvd_inbox: input.show_inbox ? inbox : null,
            sent,
            avg_rcvd, avg_sent,
            avg_label: input.only_businessdays ? msg("AvgPerWorkingDayChip") : msg("AvgChip"),
            note,
        };
        if(input.aggregation && input.aggregation != 'day') chart = this.bucketChart(input, chart);
        return this.addComparison(input, chart);
    },

    // Main chart grouped by week, month or year (Custom Query)
    bucketChart(input, chart) {
        let source = { week: 'dates_weeks', month: 'dates_months', year: 'dates_years' }[input.aggregation];
        let buckets = input.result ? input.result[source] : {};
        let keys = Object.keys(buckets).sort();
        let value = (k, field) => buckets[k][field] || 0;
        let rcvd = keys.map(k => value(k, 'received'));
        let inbox = keys.map(k => value(k, 'inbox'));
        let sent = keys.map(k => value(k, 'sent'));
        let step = keys.length <= 14 ? 1 : Math.ceil(keys.length / 7);
        let days = keys.map((key, i) => {
            let label = this.bucketLabel(key, input.aggregation);
            return { key, label: i % step == 0 ? label : '', date_label: label, is_today: false, is_business: true };
        });
        let peak = keys.length ? keys.reduce((a, b) => value(b, 'received') > value(a, 'received') ? b : a) : null;
        return Object.assign(chart, {
            days,
            rcvd: input.show_inbox ? rcvd.map((v, i) => Math.max(0, v - inbox[i])) : rcvd,
            rcvd_inbox: input.show_inbox ? inbox : null,
            sent,
            avg_rcvd: keys.length ? tsInsights.sum(rcvd) / keys.length : 0,
            avg_sent: keys.length ? tsInsights.sum(sent) / keys.length : 0,
            avg_label: msg("AvgChip"),
            note: (peak && value(peak, 'received') > 0) ? msg("PeriodNotePeak", [this.bucketLabel(peak, input.aggregation), value(peak, 'received')]) : '',
        });
    },

    bucketLabel(key, aggregation) {
        switch(aggregation) {
            case 'week':
                return msg("WeekLabel", [String(parseInt(key.slice(4), 10)), key.slice(0, 4)]);
            case 'month':
                return new Date(parseInt(key.slice(0, 4), 10), parseInt(key.slice(4, 6), 10) - 1, 1).toLocaleDateString(locale(), { month: 'short', year: 'numeric' });
            default:
                return key;
        }
    },

    // Period B (Custom Query comparison) on the main chart, aligned by position with Period A
    addComparison(input, chart) {
        if(!input.cmp_result) return chart;
        let aggregation = input.aggregation || 'day';
        let source = { day: 'dates', week: 'dates_weeks', month: 'dates_months', year: 'dates_years' }[aggregation];
        let buckets = input.cmp_result[source];
        let keys = Object.keys(buckets).sort().slice(0, chart.days.length);
        chart.cmp_rcvd = keys.map(k => buckets[k].received || 0);
        chart.cmp_sent = keys.map(k => buckets[k].sent || 0);
        chart.cmp_label = msg("PeriodB");
        return chart;
    },

    timeOfDay(input, d) {
        if(!input.result) return { rcvd: [], sent: [], note: '' };
        let hours = this.hoursWithoutCurrentDay(input.result, d.current_key);
        let rcvd = hours.rcvd.map(v => v / hours.num_days);
        let sent = hours.sent.map(v => v / hours.num_days);
        let r_peak = tsInsights.peakWindow(rcvd, 2);
        let s_peak = tsInsights.peakWindow(sent, 2);
        let note = '';
        if(r_peak !== null && s_peak !== null) {
            note = msg("TimeOfDayNote", [hourText(r_peak), hourText(r_peak + 2), hourText(s_peak), hourText(s_peak + 2)]);
        } else if(r_peak !== null) {
            note = msg("TimeOfDayNoteReceived", [hourText(r_peak), hourText(r_peak + 2)]);
        }
        let output = { rcvd, sent, note };
        if(input.cmp_result) {
            let cmp = this.hoursWithoutCurrentDay(input.cmp_result, d.current_key);
            output.cmp_rcvd = cmp.rcvd.map(v => v / cmp.num_days);
            output.cmp_sent = cmp.sent.map(v => v / cmp.num_days);
        }
        return output;
    },

    weekdayName(weekday, style) {
        // 2023-01-01 was a Sunday
        return new Date(2023, 0, 1 + weekday).toLocaleDateString(locale(), { weekday: style });
    },

    inboxZero(input) {
        let shown = input.days.slice(-INBOX_CALENDAR_MAX_DAYS);
        let output = { cells: [], weekday_labels: [], zero: 0, total: shown.length, streak: 0, big: shown.length <= 8, is_loading: !input.inbox };
        output.weekday_labels = tsInsights.orderedWeekdays(input.first_day_week).map(wd => this.weekdayName(wd, 'short'));
        if(!input.inbox || shown.length == 0) return output;

        let last = toDate(shown[shown.length - 1]);
        let days = tsInsights.inboxZeroDays(input.inbox.dates, last, shown.length);
        let pad = (toDate(shown[0]).getDay() - Number(input.first_day_week) + 7) % 7;
        for(let i = 0; i < pad; i++) output.cells.push({ key: 'pad' + i, pad: true });
        for(let day of days) {
            let key = tsUtils.dateToYYYYMMDD(day.date);
            output.cells.push({
                key, n: day.date.getDate(), state: day.state, is_today: key == input.today_key,
                title: msg("InboxZeroDayLeft", [day.date.toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' }), day.left]),
            });
        }
        output.zero = days.filter(day => day.state == 'zero').length;
        output.streak = tsInsights.inboxZeroStreak(input.inbox.dates, last, last.toDateString() == new Date().toDateString()).current;
        return output;
    },

    heat(input) {
        let weekday_labels = tsInsights.orderedWeekdays(input.first_day_week).map(wd => this.weekdayName(wd, 'short'));
        if(!input.result) return { msg_weekday_hours: null, first_day_week: input.first_day_week, weekday_labels, note: '' };
        let grid = tsInsights.heatGrid(input.result.msg_weekday_hours, 0, 23, input.first_day_week);
        let by_hour = grid.rows.map(r => tsInsights.sum(r.cells));
        let by_weekday = grid.weekdays.map((wd, c) => tsInsights.sum(grid.rows.map(r => r.cells[c])));
        let peak = tsInsights.peakWindow(by_hour, 2);
        let note = '';
        if(peak !== null) {
            let top_col = by_weekday.indexOf(Math.max(...by_weekday));
            note = msg("HeatNote", [hourText(peak), hourText(peak + 2), this.weekdayName(grid.weekdays[top_col], 'long')]);
        }
        return { msg_weekday_hours: input.result.msg_weekday_hours, first_day_week: input.first_day_week, weekday_labels, note };
    },

    weekday(input, d) {
        if(!input.result) return { rows: [], note: '' };
        let main = this.weekdaysWithoutCurrentDay(input.result, d.current_key);
        let averages = tsInsights.weekdayAverages(main.dates, main.msg_weekdays, input.first_day_week);
        let cmp = null;
        if(input.cmp_result) {
            let cmp_days = this.weekdaysWithoutCurrentDay(input.cmp_result, d.current_key);
            cmp = tsInsights.weekdayAverages(cmp_days.dates, cmp_days.msg_weekdays, input.first_day_week);
        }
        let rows = averages.map((a, i) => ({
            label: this.weekdayName(a.weekday, 'short'),
            received: a.received, sent: a.sent,
            cmp_received: cmp ? cmp[i].received : null,
            title: this.weekdayName(a.weekday, 'long') + ': ' + msg("WeekdayTooltip", [round1(a.received), round1(a.sent)]),
        }));
        // busiest weekday against the lightest business weekday
        let note = '';
        let business = averages.filter(a => a.occurrences > 0 && tsCoreUtils.checkBusinessDay(this.keyOfWeekday(a.weekday)));
        if(business.length >= 2) {
            let top = business.reduce((a, b) => b.received > a.received ? b : a);
            let low = business.reduce((a, b) => b.received < a.received ? b : a);
            if(top.received > 0 && top.weekday != low.weekday) {
                let lighter = Math.round((1 - low.received / top.received) * 100);
                note = msg("WeekdayNote", [this.weekdayName(top.weekday, 'long'), this.weekdayName(low.weekday, 'long'), lighter]);
            }
        }
        return { rows, note };
    },

    // A date key with the given weekday, used to test the business weekday preferences.
    // Holidays are ignored on purpose: only the weekday matters here.
    keyOfWeekday(weekday) {
        let date = new Date(2023, 0, 2 + ((weekday + 6) % 7));     // 2023-01-02 was a Monday
        return tsUtils.dateToYYYYMMDD(date);
    },

    domains(input) {
        if(!input.result) return [];
        let rows = tsInsights.domainRows(input.result.domains);
        if(input.cmp_result) {
            let cmp = input.cmp_result.domains;
            rows.forEach(row => {
                row.cmp_sent = cmp[row.name] ? cmp[row.name].sent : 0;
                row.cmp_received = cmp[row.name] ? cmp[row.name].received : 0;
            });
        }
        return rows;
    },

    involved(input) {
        return {
            recipients: input.result ? input.result.recipients : {},
            senders: input.result ? input.result.senders : {},
            recipients_title: msg("TopRecipients", [input.involved_num]),
            senders_title: msg("TopSenders", [input.involved_num]),
            no_recipients_text: msg("NoMailsSent"),
            no_senders_text: msg("NoMailsReceived"),
        };
    },

    ended(input, d) {
        let output = { title: msg("FolderLocation"), folders: [], tags: [], note: '', info: input.duplicates_note ? msg("InboxZeroFolderLocationNote") : '', open_in_first_tab: !!input.open_folder_in_first_tab };
        if(!input.result) return output;
        output.folders = tsInsights.endedUpFolders(input.result.folders);
        output.tags = tsInsights.endedUpTags(input.result.tags);
        if(input.cmp_result) {
            let cmp_folders = {}, cmp_tags = {};
            for(let row of tsInsights.endedUpFolders(input.cmp_result.folders)) cmp_folders[row.id] = row.n;
            for(let row of tsInsights.endedUpTags(input.cmp_result.tags)) cmp_tags[row.id] = row.n;
            output.folders.forEach(row => row.cmp_n = cmp_folders[row.id] || 0);
            output.tags.forEach(row => row.cmp_n = cmp_tags[row.id] || 0);
        }
        // same days as the KPIs and the status strip: received in the counted days and no longer in the inbox
        let total = d.R;
        if(total > 0) {
            let moved = d.H;
            let top_filed = output.folders.find(f => f.kind == 'filed');
            if(moved == 0 || !top_filed) {
                output.note = msg("EndedUpNoteNoneMoved", [total]);
            } else if(moved == total) {
                output.note = msg("EndedUpNoteAllMoved", [total, top_filed.name]);
            } else {
                output.note = msg("EndedUpNote", [moved, total, top_filed.name]);
            }
        }
        return output;
    },
};
