@echo off
echo ================================================
echo   Starting etrl.chat Development Environment
echo ================================================
echo.

echo [1/4] Starting Frontend Application...
start cmd /k "cd front-beta && npm run dev"
timeout /t 2 /nobreak > nul

echo [2/4] Starting Landing Page...
start cmd /k "cd landing && npm run dev"
timeout /t 2 /nobreak > nul

echo.
echo ================================================
echo   All services started successfully!
echo ================================================
echo.
echo   Frontend App: http://localhost:3000
echo   Landing Page: http://localhost:5173
echo.
echo   Press any key to exit...
pause > nul

