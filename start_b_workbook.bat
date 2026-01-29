@echo off
echo 🚀 Starting Top English Workbook Generator...
echo Please wait while the server starts...

:: Start npm run dev in a new window/background
start "Workbook Server" /B npm run dev

:: Wait for a few seconds to let the server initialize
timeout /t 5 >nul

:: Open the browser
start http://localhost:5173

echo ✅ App is running!
echo You can close this window to stop the server (or press Ctrl+C).
pause
