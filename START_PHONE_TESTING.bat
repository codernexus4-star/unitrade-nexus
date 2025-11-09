@echo off
color 0A
echo ========================================
echo    UniTrade - Phone Testing Setup
echo ========================================
echo.
echo Your Computer IP: 10.90.201.155
echo Backend will run at: http://10.90.201.155:8000
echo.
echo ========================================
echo.

echo [1/2] Starting Django Backend...
start "Django Backend" cmd /k "cd django-backend && .\venv\Scripts\activate && echo. && echo ===== DJANGO BACKEND ===== && echo Backend running at: http://10.90.201.155:8000 && echo Admin panel: http://10.90.201.155:8000/admin/ && echo API root: http://10.90.201.155:8000/api/ && echo. && echo Watch this window for API requests from your phone! && echo. && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Expo Mobile App...
start "Expo Mobile App" cmd /k "cd unitrade-mobile && echo. && echo ===== EXPO MOBILE APP ===== && echo. && echo SCAN THE QR CODE WITH EXPO GO APP ON YOUR PHONE! && echo. && echo Make sure your phone is on the same WiFi network! && echo. && npm start"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Install Expo Go app on your phone
echo 2. Make sure phone is on same WiFi network
echo 3. Scan QR code from Expo terminal
echo 4. Wait for app to load (1-2 minutes first time)
echo.
echo TROUBLESHOOTING:
echo - If connection fails, check Windows Firewall
echo - Both terminals must stay open
echo - Check PHONE_TESTING_STEPS.md for details
echo.
echo Press any key to close this window...
pause > nul
