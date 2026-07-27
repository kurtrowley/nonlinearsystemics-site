@echo off
cd /d "%~dp0"
start http://localhost:5174/research-theme/
npm run dev -- --port 5174
