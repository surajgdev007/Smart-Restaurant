@echo off
echo ====================================
echo   Smart Restaurant - Starting App
echo ====================================
echo.

echo [1/2] Starting Backend Server (port 5001)...
start "Backend Server" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (port 5173)...
start "Frontend Server" cmd /k "cd /d "%~dp0client" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo   App is starting up!
echo   Backend:  http://localhost:5001
echo   Frontend: http://localhost:5173
echo   Admin:    http://localhost:5173/admin/login
echo ====================================
echo.
echo Wait about 10 seconds, then open your browser.
pause
