@echo off
rem Ensure we run relative to the commands folder
setlocal
pushd "%~dp0" >nul

:dotenvexists
cls
if exist "..\backend\.env" (
    echo .env fajl mar letezik a backend mappaban.
    choice /n /c YN /m "At szeretne irni a letezo .env fajlt? [Y/N] "
)
if %ERRORLEVEL% EQU 2 goto :dotenv_cancel
echo Ujra irom a .env fajlt...

:dotenvsetup
pushd "..\backend" >nul
set /p DB_HOST="Add meg az adatbazis szerver host nevet ( alapertelmezett: localhost ): "
if "%DB_HOST%"=="" set DB_HOST=localhost
set /p DB_USER="Add meg az adatbazis felhasznalonevet ( alapertelmezett: root ): "
if "%DB_USER%"=="" set DB_USER=root
set /p DB_PASSWORD="Add meg az adatbazis jelszavat ( ha uresen hagyva, nincs jelszo): "
if "%DB_PASSWORD%"=="" set DB_PASSWORD=
(
    echo DB_HOST="%DB_HOST%"
    echo DB_USER="%DB_USER%"
    echo DB_PASSWORD="%DB_PASSWORD%"
    echo DB_NAME="licitgoeu"
) > .env
echo .env fajl letrehozva a backend mappaban.
echo Nyomj egy gombot a folytatáshoz...
pause > nul
popd >nul
popd >nul
exit /b 0

:dotenv_cancel
echo Kilépés...
timeout /t 1 /nobreak > nul
exit