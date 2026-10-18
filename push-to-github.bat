@echo off
echo ===================================================
echo   Pushing HemoSync Blood Bank to GitHub (Tanishk88)
echo ===================================================
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Your code is now live on GitHub:
    echo https://github.com/Tanishk88/blood-bank-system
) else (
    echo.
    echo [ERROR] Make sure you have created the repository first:
    echo https://github.com/new?name=blood-bank-system
)
pause
