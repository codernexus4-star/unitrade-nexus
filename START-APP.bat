@echo off
echo ========================================
echo    UniTrade Mobile App Quick Start
echo ========================================
echo.
echo Current IP: 192.168.1.119
echo.
echo This will start:
echo 1. Django Backend Server (Port 8000)
echo 2. Expo Mobile App
echo.
echo Make sure your phone and computer are on the SAME WiFi network!
echo.
pause

echo.
echo ========================================
echo Starting Django Backend Server...
echo ========================================
start cmd /k "cd /d c:\Users\damed\Desktop\UniTrade-Mobile-App\django-backend && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Starting Expo Mobile App...
echo ========================================
start cmd /k "cd /d c:\Users\damed\Desktop\UniTrade-Mobile-App\unitrade-mobile && npx expo start"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Next Steps:
echo 1. Open Expo Go app on your phone
echo 2. Scan the QR code from the Expo terminal
echo 3. App should load on your phone
echo.
echo If you get connection errors:
echo - Run 'ipconfig' to check your current IP
echo - Update src/constants/config.js with new IP
echo - Make sure phone and computer are on same WiFi
echo.
echo Press any key to exit...
pause >nul
