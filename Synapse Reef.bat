@echo off
rem Synapse Reef launcher (Windows): double-click to start the local server and open the lake in your browser.
rem
rem   Synapse Reef.bat               normal page, in your default browser
rem   Synapse Reef.bat screensaver   the lake alone, full screen (see "Synapse Reef - Screensaver.bat")
rem
rem It reuses a reef server that is already running, otherwise starts one (Node.js, or Python 3 as a fallback) in a
rem minimised window called "Synapse Reef server". Close that window to stop the server.
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
set "MODE=%~1"
title Synapse Reef

where curl >nul 2>nul
if errorlevel 1 (
  rem no curl.exe, so Windows before 10 1803: start on 8000 blind and give the server a moment
  set "PORT=8000"
  call :serve || goto fail
  ping -n 3 127.0.0.1 >nul
  goto open
)

rem find the first port in 8000-8009 that is either already serving the reef or free
for %%P in (8000 8001 8002 8003 8004 8005 8006 8007 8008 8009) do (
  set "PORT=%%P"
  call :probe
  if "!UP!"=="reef" goto open
  if "!UP!"=="free" goto start
)
echo Ports 8000-8009 are all in use by other programs, so the reef server can't start.
goto fail

:start
call :serve || goto fail
rem wait up to ~20 s for the server to answer (each localhost ping -n 2 takes about a second)
for /l %%i in (1,1,20) do (
  call :probe
  if "!UP!"=="reef" goto open
  ping -n 2 127.0.0.1 >nul
)
echo The server did not start. Look in the "Synapse Reef server" window for the error.
goto fail

:open
set "URL=http://localhost:!PORT!/"
if defined REEF_LAUNCH_DRYRUN (echo DRYRUN serving !URL! mode=!MODE! & goto done)
if /i "!MODE!"=="screensaver" goto saver
echo Opening !URL!
start "" "!URL!"
goto done

:saver
rem A full-screen app window (no tabs or address bar) on its own browser profile: a separate profile starts a fresh
rem browser process, so --start-fullscreen is honoured even when Chrome or Edge is already open. F11 or Alt+F4 leaves.
set "B="
for %%E in ("%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe") do (
  if not defined B if exist %%E set "B=%%~E"
)
if not defined B (
  echo Chrome / Edge not found: opening your default browser instead. Press F11 there for full screen.
  start "" "!URL!#screensaver"
  goto done
)
echo Opening the screensaver full screen (Esc for the full page, F11 or Alt+F4 to leave)
start "" "!B!" --app="!URL!#screensaver" --start-fullscreen --user-data-dir="%LocalAppData%\SynapseReef\browser" --no-first-run --no-default-browser-check
goto done

rem ---- start the server on !PORT! in its own minimised window (errors keep that window open) ----
:serve
where node >nul 2>nul
if not errorlevel 1 (
  start "Synapse Reef server" /min cmd /c "node serve.mjs !PORT! || pause"
  exit /b 0
)
where py >nul 2>nul
if not errorlevel 1 (
  start "Synapse Reef server" /min cmd /c "py -3 serve.py !PORT! || pause"
  exit /b 0
)
python -c "import sys; sys.exit(sys.version_info[0] < 3)" >nul 2>nul
if not errorlevel 1 (
  start "Synapse Reef server" /min cmd /c "python serve.py !PORT! || pause"
  exit /b 0
)
echo Synapse Reef needs Node.js 18+ (https://nodejs.org) or Python 3 (https://www.python.org) to run its local server.
exit /b 1

rem ---- what is on 127.0.0.1:!PORT!? sets UP = reef / free / other ----
:probe
set "UP=other"
curl -s -m 2 "http://127.0.0.1:!PORT!/" 2>nul | findstr /c:"Synapse Reef" >nul
if not errorlevel 1 (set "UP=reef" & exit /b 0)
curl -s -m 2 -o nul "http://127.0.0.1:!PORT!/" >nul 2>nul
if "%errorlevel%"=="7" set "UP=free"
exit /b 0

:fail
echo.
pause
exit /b 1

:done
endlocal
exit /b 0
