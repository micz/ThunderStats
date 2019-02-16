# ![ThunderStats icon](rep-resources/images/mzts-icon.png "ThunderStats")  ThunderStats

This addon adds awesome statistics to your beloved Thunderbird!

More info on the homepage: http://micz.it/thunderdbird-addon-thunderstats-your-thunderbird-statistics/

This add-on is the original work of Micz and with his permission I will be updating
the code for compatibility going forward and possible improvements.

![ThunderStats_version](https://img.shields.io/badge/version-v1.4.2-darkorange.png?label=ThunderStats)
![ThunderStats_tb_version](https://img.shields.io/badge/version-v1.4.2-blue.png?label=Thunderbird%20Add-On)
![Thunderbird_version](https://img.shields.io/badge/version-v60.0_--_60.0-blue.png?label=Thunderbird)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-red.png)](./LICENSE.txt)
#

## ThunderStats Add-On Installation

Normal install from Thunderbird Add-On site:
- Download and install from the add-on menu
- Within Thunderbird ``Tools\Add-ons`` search for 'ThunderStats' install and reload.

Install XPI directly:
- Download desired version package from the [XPI](xpi) folder.
- Within Thunderbird ``Tools\Add-ons`` click the gear icon and choose ``Install Add-ons From File..``
- Choose XPI file, install and reload.

## XPI Add-On Package Build instructions

1. Make sure that you have [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation) tool installed.
2. Open a terminal in the repository root dir
3. Run ``./scripts/build-xpi.bat`` to make the xpi

Notes : 
- ``jpm xpi`` adds ``bootstrap.js`` to the src directory, this is deleted as a post-build step: 
- A ``manifest.json`` file is also introduced for testing in TB60+.

## Issues & Questions
Post any issues or questions for ThunderStats under [Issues](https://github.com/micz/ThunderStats/issues)

## Changelog
ThunderStats's changes are logged [here](CHANGELOG.md).

## Credits
Original Author: [Micz](https://addons.thunderbird.net/en-US/thunderbird/user/Micz/ "Micz")

