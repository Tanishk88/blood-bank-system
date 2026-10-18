@echo off
echo Starting HemoSync Backend and Frontend...
start cmd /k "cd server && npm.cmd run dev"
timeout /t 3
start cmd /k "cd client && npm.cmd run dev"
echo Both services launched!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
