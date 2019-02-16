call jpm xpi --dest-dir ./xpi --addon-dir ./src 
call 7z d .\xpi\columns-wizard-6.1.1-beta1-tb.xpi bootstrap.js
call 7z a .\xpi\columns-wizard-6.1.1-beta1-tb.xpi ./src/manifest.json