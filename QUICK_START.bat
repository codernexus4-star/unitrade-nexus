@echo off
color 0A
echo ========================================
echo    UniTrade - Quick Start Setup
echo ========================================
echo.
echo Current IP: 192.168.1.155
echo.
echo This will set up your database and start the servers.
echo.
echo IMPORTANT: Make sure phone and computer are on SAME WiFi!
echo.
echo ========================================
echo.

echo [Step 1/3] Running database migrations...
echo.
cd C:\Users\damed\Desktop\UniTrade-Mobile-App\django-backend
call venv\Scripts\activate
python manage.py migrate
echo.

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database migration failed!
    echo Please check the error above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database ready! Starting servers...
echo ========================================
echo.

echo [Step 2/3] Starting Django Backend...
start "Django Backend" cmd /k "cd C:\Users\damed\Desktop\UniTrade-Mobile-App\django-backend && venv\Scripts\activate && echo. && echo ===== DJANGO BACKEND ===== && echo Backend: http://192.168.1.155:8000 && echo Admin: http://192.168.1.155:8000/admin/ && echo API: http://192.168.1.155:8000/api/ && echo. && echo Watch for API requests from your phone! && echo. && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak > nul

echo [Step 3/3] Starting Expo Mobile App...
start "Expo Mobile App" cmd /k "cd C:\Users\damed\Desktop\UniTrade-Mobile-App\unitrade-mobile && echo. && echo ===== EXPO MOBILE APP ===== && echo. && echo SCAN THE QR CODE WITH EXPO GO! && echo. && echo Current IP: 192.168.1.155 && echo. && npx expo start"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Install Expo Go on your phone
echo 2. Scan QR code from Expo terminal
echo 3. Wait for app to load on your phone
echo 4. Start testing!
echo.
echo ========================================
echo TROUBLESHOOTING:
echo ========================================
echo.
echo If app won't connect:
echo 1. Run 'ipconfig' to check your current IP
echo 2. Update src/constants/config.js with new IP
echo 3. Make sure phone and computer on same WiFi
echo 4. Restart both servers
echo.
echo Your Computer IP: 192.168.1.155
echo WiFi Network: Make sure phone is on same WiFi!
echo.
echo Press any key to close this window...
pause > nul
