@echo off
cd /d "%~dp0"
echo Installing dependencies...
npm install
echo Starting site at http://localhost:3000
node index.js
pause