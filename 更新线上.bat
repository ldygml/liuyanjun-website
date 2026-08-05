@echo off
echo Publishing site to GitHub Pages...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish-api.ps1"
pause
