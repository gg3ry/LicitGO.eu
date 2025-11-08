@echo off
rem
pushd "%~dp0" >nul

rem
if not exist "..\backend\node_modules" (
    echo node_modules mappa nem letezik, futtatom a 'npm install' parancsot...
    pushd "..\backend" >nul
    npm install
    if %errorlevel% neq 0 (
        echo Hiba tortent az 'npm install' parancs futtatasa kozben.
        pause
        popd >nul
        popd >nul
        exit
    )
    popd >nul
)

rem
if not exist "..\backend\.env" (
    echo .env fajl nem letezik, futtatom a Dotenvsetup.bat parancsot...
    start /wait cmd /c "call "%~dp0Dotenvsetup.bat""
    if %errorlevel% neq 0 (
        echo Hiba tortent a Dotenvsetup.bat futtatasa kozben.
        pause
        popd >nul
        exit
    )
)

rem
set /p PORT=Addj meg egy portot amin fusson a BACKEND szerver ( 3550 az alapertelmezett): 
if "%PORT%"=="" set PORT=3550

echo A backend szerver a %PORT% porton fog futni.
pushd "..\backend" >nul
echo Inditas...
node server.js --port %PORT%
if %errorlevel% neq 0 (
    echo Hiba tortent a backend szerver inditasa kozben.
    pause
    popd >nul
    popd >nul
    exit
)
popd >nul
rem
popd >nul
pause
exit