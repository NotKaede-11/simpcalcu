@echo off
echo ========================================
echo  Building SimpleGains Calculator Server
echo ========================================
echo.

cd /d "%~dp0"
echo Compiling server.cpp...
g++ backend\server.cpp -o server.exe -lws2_32

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Build successful!
    echo  Run server.exe to start the server
    echo ========================================
) else (
    echo.
    echo ========================================
    echo  Build failed! Check the errors above.
    echo ========================================
)

pause
