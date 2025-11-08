@echo off
pushd "%~dp0" >nul

rem
if not exist "..\frontend\node_modules" (
    echo node_modules mappa nem letezik, futtatom az npm install parancsot...
    pushd "..\frontend" >nul
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

set /p PORT=Addj meg egy portot amin fusson a FRONTEND szerver ( 3000 az alapertelmezett): 
if "%PORT%"=="" set PORT=3000
echo A frontend szerver a %PORT% porton fog futni.
pushd "..\frontend" >nul
rem
echo Inditas...
start cmd /k "npm run dev -- --port %PORT%"
if %errorlevel% neq 0 (
    echo Hiba tortent a frontend szerver inditasa kozben.
    pause
    popd >nul
    popd >nul
    exit
)
echo szeretne megnyitni a bongeszoben [Y/N]?
set /p OPEN_BROWSER=
if /i "%OPEN_BROWSER%"=="Y" (
    start "" "http://localhost:%PORT%"
)
exit