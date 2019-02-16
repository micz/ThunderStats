call jpm xpi --dest-dir ./xpi --addon-dir ./src 
call 7z d .\xpi\columns-wizard-4.2.2-beta1-tb.xpi bootstrap.js
call 7z a .\xpi\thunderstats-4.2.2-beta1-tb.xpi ./src/manifest.json