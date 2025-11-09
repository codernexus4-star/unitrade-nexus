@echo off
echo ========================================
echo UniTrade Local Testing Setup
echo ========================================
echo.

echo Step 1: Starting Django Backend...
echo.
start cmd /k "cd django-backend && .\venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak > nul

echo Step 2: Starting Expo Mobile App...
echo.
start cmd /k "cd unitrade-mobile && npm start"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Expo: Check the second terminal window
echo.
echo IMPORTANT: 
echo - If testing on physical device, update config.js with your IP
echo - Run 'ipconfig' to find your IP address
echo - Make sure phone and computer are on same WiFi
echo.
echo Press any key to exit this window...
pause > nul
