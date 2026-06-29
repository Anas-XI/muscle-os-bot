@echo off
cd /d "E:\MoS"
echo Checking if bot is already running...
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I /N "mos_bot.bot" >NUL
if "%ERRORLEVEL%"=="0" (
    echo Bot is already running.
    exit /b
)
echo Starting Muscle OS bot...
start /B /MIN "" "C:\Python314\python.exe" -m mos_bot.bot
echo Bot started in background.
