import { reactive } from "vue"

export const tsStore = reactive({
    'do_debug': false,
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
        many_days_today_dark: '#1f9c6a',
        many_days_today_light: '#2bc285',
        _time_sent: '#1f77b4',
        _time_rcvd: '#ff7f0e',
        _time_sent_yesterday: '#17becf',
        _time_rcvd_yesterday: '#ffbb78',
        _weekday_sent: '#4682B4',
        _weekday_rcvd: '#FF8C45',
    },
});