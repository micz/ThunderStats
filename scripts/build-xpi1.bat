
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
REM for /f %%i in ('node .\scripts\xml-util -get \"Description[\"em:version\"]\"') do set installRDFVer=%%i
REM for /f %%i in ('node .\scripts\xml-util') do set installRDFVer=%%i

FOR /F "tokens=* USEBACKQ" %%F IN (`node .\scripts\xml-util -get Description[\"em:version\"]`) DO (
SET installRDFVer=%%F
)

REM echo after %installRDFVer%

if %installRDFVer% neq %targetVersion% (
	echo Version Mismatch:  %installRDFVer% != %targetVersion%
	exit 1
)

set sourcePath=.\src
set targetPath=.\xpi

set targetName=%targetPath%\%targetBaseName%-%targetVersion%-tb.xpi

echo 9

