import { reactive } from "vue"

export const tsStore = reactive({
    'do_debug': false,
    'darkmode': false,
    'businessdays_only': false,
    'bday_easter': false,
    'bday_custom_days': [],
    'bday_weekdays_0': false,   //Sunday
    'bday_weekdays_1': true,   //Monday
    'bday_weekdays_2': true,   //Tuesday
    'bday_weekdays_3': true,   //Wednesday
    'bday_weekdays_4': true,   //Thursday
    'bday_weekdays_5': true,   //Friday
    'bday_weekdays_6': false,   //Saturday
    'current_account_id': 0,
});