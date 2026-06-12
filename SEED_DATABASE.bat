@echo off
echo ====================================
echo   Seeding Database with Sample Data
echo ====================================
echo.
echo This will create:
echo  - Admin user: admin@restaurant.com / admin123
echo  - 30+ menu items across all categories
echo  - 10 tables with QR codes
echo.
echo NOTE: Run this AFTER starting the backend server!
echo.
cd /d "%~dp0server"
npm run seed
echo.
echo ====================================
echo   Seeding Complete!
echo ====================================
pause
