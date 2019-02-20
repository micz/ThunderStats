
if not defined npm_package_name ( 
	set targetBaseName=%1
) else (
	set targetBaseName=%npm_package_name%
)

if not defined npm_package_version ( 
	set targetVersion=%2
) else (
	set targetVersion=%npm_package_version%
)

rem get RDF version
rem for /f %%i in ('.\scripts\xml-util -get \"Description[\"em:version\"]\"') do set installRDFVer=%%i

rem echo:%installRDFVer%

set sourcePath=.\src
set targetPath=.\xpi

set targetName=%targetPath%\%targetBaseName%-%targetVersion%-tb.xpi

del "%targetName%"

call 7z a %targetName% %sourcePath%\* -x@%sourcePath%\.jpmignore
rem call 7z d .\xpi\thunderstats-1.4.3-tb.xpi bootstrap.js
call 7z d %targetName% ./src/manifest.json
call 7z a %targetName% .\license.txt
call 7z a %targetName% .\release_notes.txt

call 7z l %targetName%