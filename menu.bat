@echo off
rem
setlocal

:menu
cls
echo ============================
echo      LicitGO Menu
echo ============================
echo 1) Backend futtatasa (backend.bat)
echo 2) Frontend futtatasa (frontend.bat)
echo 3) Backend es frontend futtatasa (runboth.bat)
echo 4) dotenv letrehozasa (dotenvsetup.bat)
echo 0) Kilépés
echo ============================
echo.
choice /n /c 12340 /m "Valassz egy opciot (1-4) vagy 0 a kilepéshez: "
rem ERRORLEVEL = 1 for '1', 2 for '2', ..., 5 for 'Q'
set "choice=%ERRORLEVEL%"
if "%choice%"=="1" goto run_backend
if "%choice%"=="2" goto run_frontend
if "%choice%"=="3" goto run_both
if "%choice%"=="4" goto run_dotenv
if "%choice%"=="5" goto quit

echo.
echo Ervenytelen valasztas, probalja ujra.
pause >nul
goto menu

:run_backend
cd commands
if exist "runBackend.bat" (
    echo Backend futtatasa...
    start cmd /k "call runBackend.bat"
) else (
    echo runBackend.bat nem lett megtalalva "%~dp0%".
)
pause
cd ..
goto menu

:run_frontend
cd commands
if exist "runFrontend.bat" (
    echo Frontend futtatasa...
    start cmd /k "call runFrontend.bat"
) else (
    echo runFrontend.bat nem lett megtalalva "%~dp0%".
)
pause
cd ..
goto menu

:run_both
cd commands
if exist "runBoth.bat" (
    echo runBoth.bat futtatasa...
    start cmd /k "call runBoth.bat"
) else (
    echo runBoth.bat nem lett megtalalva "%~dp0%".
)
pause
cd ..
goto menu

:run_dotenv
cd commands
if exist "Dotenvsetup.bat" (
    echo Dotenvsetup.bat futtatasa...
    start /wait cmd /c "call Dotenvsetup.bat"
) else (
    echo Dotenvsetup.bat nem lett megtalalva "%~dp0%".
)
echo.
echo Nyomj egy gombot a folytatáshoz...
pause >nul
goto menu

:quit
endlocal
echo Kilépés...
exit /b 0