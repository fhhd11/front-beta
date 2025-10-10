@echo off
echo ================================================
echo   Installing etrl.chat Dependencies
echo ================================================
echo.

echo [1/2] Installing Frontend Dependencies...
cd front-beta
call npm install
cd ..

echo.
echo [2/2] Installing Landing Dependencies...
cd landing
call npm install
cd ..

echo.
echo ================================================
echo   Installation completed successfully!
echo ================================================
echo.
pause

