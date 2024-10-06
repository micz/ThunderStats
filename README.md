# ![ThunderStats icon](public/images/mzts-icon-32px.png "ThunderStats")  ThunderStats 2

This addon adds awesome statistics to your beloved Thunderbird!


<br>

The addon has been rewritten from scratch using Vue.js.

Features from the previous version 1.4.5, not already implemented, have been assigned the label "[road to 2.0](https://github.com/micz/ThunderStats/labels/road%20to%202.0)".

More info on [#194](https://github.com/micz/ThunderStats/issues/194) and [#195](https://github.com/micz/ThunderStats/issues/195)

<br>

## Features
- Sent and received mails
- Day time chart
- Top senders and recipients list
- Inbox Zero status
- Multiple days and Custom range date statistics with:
  - Time and weekdays aggregation
  - Max, min, average sent and received mails over the period
- Define the business days, to get statistics (total, max, min, average) ignoring non-business days.
- Export data in CSV format


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

Then, in the root folder of the project use these commands:

`npm install`

`npm run build`

You'll find the compiled addon in the `dist` folder.

Change the `minify` (`true`|`false`) property in the `vite.config.js` file to choose whether to minify the final code.

<br>

## Credits
Original Author: [Mic](https://github.com/micz)

Contributing Author: [Christopher Leidigh](https://github.com/cleidigh)

<br>

## Support this addon!
Are you using this addon in your Thunderbird?
<br>Consider to support the development making a small donation. [Click here!](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=UHN4SXPGEXWQL&lc=IT&item_name=ThunderStats&item_number=thunderstats&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

<br>

## Attributions

### Translations
- English (en-US)	: [Mic](https://addons.thunderbird.net/thunderbird/user/Micz/)
- Italian (it)		: [Mic](https://addons.thunderbird.net/thunderbird/user/Micz/)
- French (fr)		: Goofy and Vittorio
- German (de)		: [Axel Grude](https://addons.thunderbird.net/thunderbird/user/realraven/) and ChatGPT (for version 2.0 new text)

<br>

### Javascript Libraries
See the [package.json](/package.json) file.

<br>

### Graphics
Addon icon thanks to http://hopstarter.deviantart.com/

Custom Query Bookmark icon thanks to http://www.iconarchive.com/artist/graphicrating.html

Loading SVGs thanks to https://loading.io

Business Days and Export Data icons thanks to https://www.iconarchive.com/artist/custom-icon-design.html

