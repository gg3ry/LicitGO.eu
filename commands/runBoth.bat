echo Backend szerver inditasa...
start cmd /k "call runBackend.bat"
echo Frontend szerver inditasa...
start cmd /k "call runFrontend.bat"
cd ..
echo Mindket szerver inditva.


timeout /t 2 /nobreak > nul
exit