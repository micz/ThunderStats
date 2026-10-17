# ![ThunderStats icon](public/images/mzts-icon-32px.png "ThunderStats")  ThunderStats 3

This addon adds awesome statistics to your beloved Thunderbird!

Do you remember the good old Eudora statistics? Do you miss them? With ThunderStats you can finally keep an eye on how you use your email.

<br>

## What's new in 3.0
- Brand new look, with a light/dark theme you can switch on the fly.
- New Today/Yesterday dashboard: compare with your usual weekday and get inbox insights.
- New Many Days dashboard: day-by-day chart, averages, Inbox Zero calendar, activity heatmap, weekday chart and comparison with the previous period.
- New "How old is your inbox" card and folder details in "Where mails ended up".
- Redesigned Custom View, with quick date ranges and filter chips.
- Redesigned Options page, with automatic saving.
- Much faster statistics, thanks to caching and optimized folder scanning.

ThunderStats 3.0 requires **Thunderbird 140** or later.<br>
If you are using Thunderbird 115 or 128, you can still use [ThunderStats 2.4](https://github.com/micz/ThunderStats/releases/tag/v2.4.0).

See the full list of changes in the [changelog](CHANGELOG.md).

<br>

## Features
- **Today and Yesterday**
  - Sent and received mails, with a time of the day chart
  - Comparison with the usual weekday or with any other day
  - Top senders and recipients
  - Inbox Zero status and inbox insights
- **Many Days and Custom date ranges**
  - Daily, weekly, monthly and yearly sent and received mails charts
  - Time of the day and weekdays aggregation
  - Activity heatmap and Inbox Zero calendar
  - Total, max, min and average sent and received mails over the period
  - Comparison between two periods
  - Advanced filtering (folders, read/unread, starred, subject keyword)
- **Folders, tags and domains statistics**
- **Business days**: get statistics (total, max, min, average) ignoring non-business days
- **Internal domains**: see the percentage of internal and external mails
- **Custom identities**, with wildcard support
- **Export data in CSV format**

<br>

## Privacy
All data processing is performed locally on your device. No data is transmitted, shared, or stored on any external servers or third-party services.
This ensures that your information remains private and secure at all times.

<br>

## Issues & Questions
Post any issues or questions for ThunderStats under [Issues](https://github.com/micz/ThunderStats/issues).

<br>

## Changelog
ThunderStats's changes are logged [here](CHANGELOG.md).

<br>

## Build Instructions

Ensure you have installed [Node.js and npm](https://nodejs.org/).

Then, in the root folder of the project run:

`npm install`

### Production build (with minification)

`npm run build`

You'll find the compiled addon in the `dist` folder and the final `.xpi` package in the parent folder of the project root.

### Development build (without minification, auto-rebuild on changes)

`npm run dev`

The process watches for file changes and automatically recompiles the addon into the `dist` folder.

<br>

## Credits
Original Author: [Mic](https://github.com/micz)

Contributing Author for version 1.*: [Christopher Leidigh](https://github.com/cleidigh)

<br>

## Support this addon!
Are you using this addon in your Thunderbird?
<br>Consider supporting the development with a small donation. [Click here!](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=UHN4SXPGEXWQL&lc=IT&item_name=ThunderStats&item_number=thunderstats&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

<br>

## Attributions

### Translations
- Dutch (nl): [Fjoerfoks](https://github.com/Fjoerfoks) <img src="https://micz.it/weblate/thunderstats/nl.svg">
- Italian (it): [Mic](https://addons.thunderbird.net/thunderbird/user/Micz/) <img src="https://micz.it/weblate/thunderstats/it.svg">
- French (fr): Generated automatically, Goofy and Vittorio <img src="https://micz.it/weblate/thunderstats/fr.svg">
- German (de): Generated automatically, [Axel Grude](https://addons.thunderbird.net/thunderbird/user/realraven/) <img src="https://micz.it/weblate/thunderstats/de.svg">

Would you like to help translate ThunderStats? [Find out how!](https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/translate/)

<i>Thanks to <a href="https://hosted.weblate.org/engage/thunderstats/">Hosted Weblate</a> for managing the localization.</i>

<br>

### Javascript Libraries
See the [package.json](/package.json) file.

<br>

### Graphics
Addon icon thanks to http://hopstarter.deviantart.com/

Custom Query Bookmark icon thanks to http://www.iconarchive.com/artist/graphicrating.html

Loading SVGs thanks to https://loading.io

Business Days and Export Data icons thanks to https://www.iconarchive.com/artist/custom-icon-design.html

[Fluent Design System](https://www.iconfinder.com/fluent-designsystem) for the sorting icons
