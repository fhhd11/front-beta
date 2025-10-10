@echo off
echo ================================================
echo   Building etrl.chat for Production
echo ================================================
echo.

echo [1/2] Building Frontend Application...
cd front-beta
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/2] Building Landing Page...
cd landing
call npm run build
if %errorlevel% neq 0 (
    echo Error building landing!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ================================================
echo   Build completed successfully!
echo ================================================
echo.
echo   Frontend: front-beta/dist
echo   Landing: landing/dist
echo.
pause

