call jpm xpi --dest-dir ./xpi --addon-dir ./src 
call 7z d .\xpi\thunderstats-1.4.3-beta1-tb.xpi bootstrap.js
call 7z a .\xpi\thunderstats-1.4.3-beta1-tb.xpi ./src/manifest.json