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

// Builds the props of WidgetDayDashboard (single-day layout) from the data loaded by a tab.
// Every input except "day" and "kind" may be null while it is still loading.

import { tsInsights, BASELINE_WEEKS, STREAK_STRIP_DAYS, CLEAR_IN_GOOD_DAYS } from "./mzts-insights.js";
import { tsUtils } from "./mzts-utils.js";

function msg(key, subs) {
    return browser.i18n.getMessage(key, subs);
}

// Dates are formatted in the Thunderbird UI language, like the rest of the texts
function locale() {
    return browser.i18n.getUILanguage ? browser.i18n.getUILanguage() : undefined;
}

// Labels that change with the kind of day: 'today', 'yesterday' or 'day' (any other single day)
const DAY_LABELS = {
    today: { received: "KpiReceivedToday", sent: "KpiSentToday", top: "TopCorrespondentsToday", ended: "EndedUpToday" },
    yesterday: { received: "KpiReceivedYesterday", sent: "KpiSentYesterday", top: "TopCorrespondentsYesterday", ended: "EndedUpYesterday" },
    day: { received: "KpiReceivedDay", sent: "KpiSentDay", top: "TopCorrespondentsDay", ended: "EndedUpDay" },
};

export const tsDayModel = {

    /*
      input = {
        kind: 'today' | 'yesterday' | 'day',
        day: Date,                    // the day shown
        result: object,               // getFullStatsData output for the day
        inbox: object,                // getInboxZeroDates output
        baseline_days: array,         // getWeekdayBaseline(...).days
        prev_days: object,            // msg_days of the previous days (getAggregatedStatsData)
        prev_days_num: number,
        progressive: boolean,         // _time_chart_progressive pref
        hide_future: boolean,         // today_time_chart_do_no_show_future pref
        cmp: { rcvd, sent, label },   // optional comparison day for the chart (hourly msg_hours)
        internal: { enabled, sent_percent, rcvd_percent },
        involved_num: number,
        first_day_week: number,
        duplicates_note: boolean,          // folder counts include duplicates (filter_duplicates on): explain it
        open_folder_in_first_tab: boolean, // inbox0_openFolderInFirstTab pref
      }
    */
    build(input) {
        let in_progress = input.kind == 'today';
        let labels = DAY_LABELS[input.kind] || DAY_LABELS.day;
        let weekday = input.day.toLocaleDateString(locale(), { weekday: 'long' });
        let now = new Date();
        let ref_hour = in_progress ? now.getHours() : 23;

        let baseline = input.baseline_days ? tsInsights.weekdayBaseline(input.baseline_days, input.progressive) : null;
        if(baseline && baseline.num_days == 0) baseline = null;

        let R = input.result ? input.result.received : 0;
        let S = input.result ? input.result.sent : 0;
        let day_key = tsUtils.dateToYYYYMMDD(input.day);
        // received mails of the day still in the inbox
        let L = input.result ? (input.result.dates[day_key] ? input.result.dates[day_key].inbox : 0) : 0;
        let H = Math.max(0, R - L);

        let inbox_total = input.inbox ? input.inbox.total : 0;
        let inbox_dates = input.inbox ? input.inbox.dates : {};

        return {
            strip: this.strip(input, { R, H, L, in_progress, now, inbox_total, inbox_dates }),
            kpis: this.kpis(input, { R, S, L, labels, weekday, in_progress, ref_hour, baseline, inbox_total, inbox_dates }),
            chart: this.chart(input, { R, weekday, in_progress, now, ref_hour, baseline }),
            top: this.top(input, labels),
            involved: this.involved(input),
            domains: input.result ? tsInsights.domainRows(input.result.domains) : [],
            ended: this.ended(input, labels, R),
            empty_text: msg("NoMailsReceived"),
        };
    },

    strip(input, d) {
        let first_day = tsUtils.getPreviousWeekday(input.day, input.first_day_week);
        let backlog_added = tsInsights.backlogAdded(d.inbox_dates, first_day, input.day);
        let clear_in = (input.inbox && input.prev_days) ? tsInsights.clearInDays(d.inbox_total, input.prev_days, d.inbox_dates) : null;

        let tone = 'neutral', badge = '';
        if(input.inbox && input.prev_days) {
            if(d.inbox_total == 0) {
                tone = 'good'; badge = msg("InboxAtZero");
            } else if(clear_in !== null && clear_in <= CLEAR_IN_GOOD_DAYS) {
                tone = 'good'; badge = msg("KeepingUp");
            } else {
                tone = 'warn'; badge = msg("BacklogGrowing");
            }
        }

        let date_line1 = input.day.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        let date_line2 = d.in_progress
            ? '00:00 → ' + d.now.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })
            : msg("FullDayRange");
        let pct = (v) => d.R > 0 ? (v / d.R * 100).toFixed(1) + '%' : '0%';
        let weekstart_name = first_day.toLocaleDateString(locale(), { weekday: 'short' });

        return {
            badge_label: badge,
            badge_tone: tone,
            date_line1,
            date_line2,
            flow: [
                { label: msg("Arrived"), value: d.R, sub: '' },
                { label: msg("FiledOrAnswered"), value: d.H, sub: pct(d.H), color: 'var(--good)', title: msg("FiledOrAnsweredTooltip") },
                { label: msg("StillInInbox"), value: d.L, sub: input.inbox ? msg("OfInboxTotal", [d.inbox_total]) : '', color: 'var(--rcvd)' },
            ],
            side: [
                { label: msg("BacklogTrend"), value: '+' + backlog_added, sub: msg("SinceWeekday", [weekstart_name]), title: msg("BacklogTrendTooltip") },
                { label: msg("ClearIn"), value: clear_in === null ? '—' : '~' + clear_in, sub: msg("WorkingDaysSmall"), title: msg("ClearInTooltip", [input.prev_days_num]) },
            ],
            bar_good: pct(d.H),
            bar_left: pct(d.L),
        };
    },

    kpis(input, d) {
        let kpis = [];
        let baseline_title = msg("BaselineTooltip", [BASELINE_WEEKS]);

        // received / sent against the usual day
        let compare = (value, field, increase_is_bad) => {
            if(!d.baseline) return { delta: null, sub: msg("NoWeekdayHistory") };
            let reference = d.in_progress
                ? (field == 'received' ? d.baseline.rcvd_cum_avg[d.ref_hour] : d.baseline.sent_cum_avg[d.ref_hour])
                : (field == 'received' ? d.baseline.avg_received : d.baseline.avg_sent);
            let reference_text = String(Math.round(reference));
            return {
                delta: tsInsights.delta(value, reference, increase_is_bad),
                sub: d.in_progress ? msg("VsUsualByNow", [d.weekday, reference_text]) : msg("VsWeekdayAverage", [d.weekday, reference_text]),
            };
        };
        let rcvd_cmp = compare(d.R, 'received', true);
        let sent_cmp = compare(d.S, 'sent', false);
        kpis.push({ id: 'rcvd', label: msg(d.labels.received), value: d.R, color: 'var(--rcvd)', delta: rcvd_cmp.delta, sub: rcvd_cmp.sub, sub_title: baseline_title, is_loading: !input.result });
        kpis.push({ id: 'sent', label: msg(d.labels.sent), value: d.S, color: 'var(--sent)', delta: sent_cmp.delta, sub: sent_cmp.sub, sub_title: baseline_title, is_loading: !input.result });

        // inbox backlog
        kpis.push({
            id: 'inbox', label: msg("InboxBacklog"), value: d.inbox_total,
            delta: (input.result && d.L > 0) ? { text: '+' + d.L, color: 'var(--warn)', title: msg("InboxBacklogDeltaTooltip") } : null,
            sub: input.inbox ? msg("InboxBacklogSub", [input.inbox.unread, tsInsights.oldestDays(d.inbox_dates)]) : '',
            is_loading: !input.inbox || !input.result,
        });

        // internal traffic, only when internal domains are configured and the option is on
        if(input.internal && input.internal.enabled) {
            kpis.push({
                id: 'internal', label: msg("InternalTraffic"), value: tsInsights.roundPercent(input.internal.rcvd_percent),
                sub: msg("InternalTrafficSub", [tsInsights.roundPercent(input.internal.sent_percent)]),
                is_loading: !input.result,
            });
        }

        // Inbox Zero streak
        let streak = { current: 0 }, squares = [], zero_days = 0;
        if(input.inbox) {
            streak = tsInsights.inboxZeroStreak(d.inbox_dates, input.day, d.in_progress);
            let days = tsInsights.inboxZeroDays(d.inbox_dates, input.day, STREAK_STRIP_DAYS);
            zero_days = days.filter(day => day.state == 'zero').length;
            squares = days.map((day, k) => {
                let is_ref_day = k == days.length - 1;
                let bg = is_ref_day ? 'var(--accent)' : (day.state == 'zero' ? 'var(--good)' : 'var(--surface3)');
                let opacity = (is_ref_day || day.state != 'zero') ? 1 : (0.35 + 0.65 * k / (days.length - 1)).toFixed(2);
                return {
                    key: tsUtils.dateToYYYYMMDD(day.date),
                    bg, opacity,
                    title: msg("InboxZeroDayLeft", [day.date.toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' }), day.left]),
                };
            });
        }
        kpis.push({
            id: 'streak', label: msg("InboxZeroStreak"), value: streak.current, color: 'var(--good)',
            aside: msg("InboxZeroStreakSub", [zero_days, STREAK_STRIP_DAYS]), sub_title: msg("InboxZeroStreakTooltip"),
            squares, is_loading: !input.inbox,
        });

        return kpis;
    },

    chart(input, d) {
        let title = d.in_progress
            ? msg("ChartTodayTitle")
            : msg("ChartDayTitle", [input.day.toLocaleDateString(locale(), { day: 'numeric', month: 'long' })]);
        if(!input.result) return { title, rcvd: [], sent: [], now_position: null, callout: null, note: '' };

        let series = (field) => {
            let values = tsInsights.hoursArray(input.result.msg_hours, field);
            if(input.progressive) values = tsInsights.cumulative(values);
            if(d.in_progress && input.hide_future) values = values.map((v, h) => h > d.ref_hour ? null : v);
            return values;
        };

        let chart = {
            title,
            rcvd: series('received'),
            sent: series('sent'),
            band_low: d.baseline ? d.baseline.band_low : null,
            band_high: d.baseline ? d.baseline.band_high : null,
            now_position: d.in_progress ? d.now.getHours() + d.now.getMinutes() / 60 : null,
            callout: null,
            note: '',
        };

        if(input.cmp) {
            let cmp_series = (field) => {
                let values = tsInsights.hoursArray(input.cmp.msg_hours, field);
                return input.progressive ? tsInsights.cumulative(values) : values;
            };
            chart.cmp_rcvd = cmp_series('received');
            chart.cmp_sent = cmp_series('sent');
            chart.cmp_label = input.cmp.label;
        }

        // received so far against the usual cumulative range at the same hour
        let time_text = d.in_progress ? d.now.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }) : '23:59';
        chart.callout = { title: msg("CalloutReceived", [time_text, d.R]), sub: '' };
        if(d.baseline) {
            let low = Math.round(d.baseline.rcvd_cum_low[d.ref_hour]);
            let high = Math.round(d.baseline.rcvd_cum_high[d.ref_hour]);
            chart.callout.sub = d.in_progress ? msg("UsualByNow", [low, high]) : msg("UsualByEndOfDay", [low, high]);
            let note_key = d.R > high ? "ChartNoteBusier" : (d.R < low ? "ChartNoteQuieter" : "ChartNoteUsual");
            chart.note = msg(note_key, [d.weekday]);
        }
        return chart;
    },

    top(input, labels) {
        if(!input.result) return { title: msg(labels.top), rows: [], count: 0, empty_text: '' };
        let top = tsInsights.topCorrespondents(input.result.senders, input.result.recipients, 5);
        return { title: msg(labels.top), rows: top.rows, count: top.count, empty_text: msg("NoCorrespondents") };
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

    ended(input, labels, R) {
        let output = { title: msg(labels.ended), folders: [], tags: [], note: '', info: input.duplicates_note ? msg("InboxZeroFolderLocationNote") : '', open_in_first_tab: !!input.open_folder_in_first_tab };
        if(!input.result) return output;
        output.folders = tsInsights.endedUpFolders(input.result.folders);
        output.tags = tsInsights.endedUpTags(input.result.tags);
        if(R > 0) {
            let in_inbox = output.folders.filter(f => f.kind == 'inbox').reduce((acc, f) => acc + f.n, 0);
            let moved = Math.max(0, R - in_inbox);
            let top_filed = output.folders.find(f => f.kind == 'filed');
            if(moved == 0 || !top_filed) {
                output.note = msg("EndedUpNoteNoneMoved", [R]);
            } else if(moved == R) {
                output.note = msg("EndedUpNoteAllMoved", [R, top_filed.name]);
            } else {
                output.note = msg("EndedUpNote", [moved, R, top_filed.name]);
            }
        }
        return output;
    },
};
