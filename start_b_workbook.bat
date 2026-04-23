@echo off
setlocal enabledelayedexpansion
echo 🚀 Starting Top English Workbook Generator...
echo Please wait while the server starts...

:: Start npm run dev in a new window/background
start "Workbook Server" /B npm run dev

:: Wait for a few seconds to let the server initialize
timeout /t 5 >nul

:: If a file is passed as an argument, read its content and base64 encode it using PowerShell
set "DATA_PARAM="
if not "%~1"=="" if exist "%~1" (
  echo 📄 Loading file: %~1
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "[Convert]::ToBase64String([IO.File]::ReadAllBytes('%~1'))"`) do set "B64_DATA=%%i"
  set "DATA_PARAM=#data=!B64_DATA!"
  setlocal enabledelayedexpansion
  start "" "http://localhost:5173!DATA_PARAM!"
  endlocal
) else (
  :: Open the browser normally
  start http://localhost:5173
)

echo ✅ App is running!
echo You can close this window to stop the server (or press Ctrl+C).
pause
