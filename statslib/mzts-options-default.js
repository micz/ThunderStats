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

export const prefs_default = {
    'do_debug': false,
    '_many_days': 7,
    'many_days_show_inbox': true,
    '_involved_num': 10,
    'today_time_chart_show_yesterday': true,
    'today_time_chart_do_no_show_future': true,
    '_time_chart_progressive': false,
    'inbox0_openFolderInFirstTab': false,
    'startup_account': 0,
    'remember_last_tab': false,
    'remember_last_account': false,
    '_last_account_id': 0,
    'always_reload_tab_data': false,
    'load_data_changing_account': true,
    'customqry_loaddata_when_selectingrange': true,
    'customqry_loaddata_when_opening_addon': true,    // choose to load the customqry data even if is the opening tab when launching ThunderStats
    'first_day_week': 1,
    'datepicker_locale': 'en-US',
    'custom_identities': {},
    'internal_domains': {},
    'include_archive_multi_account': true,
    'filter_duplicates_multi_account': false,
    'accounts_adv_settings': {},
    'bday_use_last_business_day': false,
    'bday_default_only': false,
    'bday_weekdays_0': false,   //Sunday
    'bday_weekdays_1': true,   //Monday
    'bday_weekdays_2': true,   //Tuesday
    'bday_weekdays_3': true,   //Wednesday
    'bday_weekdays_4': true,   //Thursday
    'bday_weekdays_5': true,   //Friday
    'bday_weekdays_6': false,   //Saturday
    'bday_custom_days': [],
    'bday_easter': true,
    'customqry_warn_onlongperiod_days': 90,
    'customqry_always_open_adv_filters': false,
    'inbox_percent_remaining': false,
    'show_internal_mail_percent': false,
}