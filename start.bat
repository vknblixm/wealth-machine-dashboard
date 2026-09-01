@echo off
REM 🔥 WEALTH MACHINE - QUICK START SCRIPT (Windows)
REM One command to get everything running

echo.
echo 🔥 WEALTH MACHINE DASHBOARD - QUICK START
echo.

REM Check if deploy.bat exists
if not exist deploy.bat (
    echo Error: deploy.bat not found
    pause
    exit /b 1
)

REM Run deployment script with local option
call deploy.bat local
