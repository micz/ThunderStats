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

import { reactive } from "vue"

export const tsStore = reactive({
    'do_debug': false,
    'isTB128plus': null,
    'darkmode': false,
    'businessdays_only': false,
    'bday_easter': false,
    'first_day_week': 0,
    'bday_custom_days': [],
    'bday_weekdays_0': false,   //Sunday
    'bday_weekdays_1': true,   //Monday
    'bday_weekdays_2': true,   //Tuesday
    'bday_weekdays_3': true,   //Wednesday
    'bday_weekdays_4': true,   //Thursday
    'bday_weekdays_5': true,   //Friday
    'bday_weekdays_6': false,   //Saturday
    'current_account_id': 0,
    'chart_colors':{
        many_days_default: '#4682B4',
        many_days_inbox: '#d84444',
        many_days_today_dark: '#1f9c6a',
        many_days_today_light: '#2bc285',
        _time_sent: '#1f77b4',
        _time_rcvd: '#ff7f0e',
        _time_sent_yesterday: '#17becf',
        _time_rcvd_yesterday: '#ffbb78',
        _weekday_sent: '#4682B4',
        _weekday_rcvd: '#FF8C45',
        compare_default: '#E86850',
        compare_time_sent: '#9467bd',
        compare_time_rcvd: '#d62728',
        compare_weekday_sent: '#E86850',
        compare_weekday_rcvd: '#BCBD22',
    },
    'tags_list': {},
    'currentTab': '',
    'show_tags': false,
});