@echo off
setlocal enabledelayedexpansion
set "SITE=%~dp0"
set "DEPLOY=E:\Vibe\liuyanjun-website"

if not exist "%DEPLOY%\.git" (
  echo [1/4] Cloning deploy repo...
  git clone https://github.com/ldygml/liuyanjun-website.git "%DEPLOY%"
  if errorlevel 1 ( echo Clone failed. Check network. & pause & exit /b 1 )
) else (
  echo [1/4] Syncing remote...
  git -C "%DEPLOY%" pull origin main
  if errorlevel 1 ( echo Warn: pull failed, continuing... )
)

echo [2/4] Copying site files...
copy /Y "%SITE%index.html" "%DEPLOY%\index.html" >nul
copy /Y "%SITE%admin.html" "%DEPLOY%\admin.html" >nul
copy /Y "%SITE%article.html" "%DEPLOY%\article.html" >nul
copy /Y "%SITE%game.html" "%DEPLOY%\game.html" >nul
copy /Y "%SITE%games.html" "%DEPLOY%\games.html" >nul
copy /Y "%SITE%spidey-miner.html" "%DEPLOY%\spidey-miner.html" >nul
xcopy /E /Y /I /Q "%SITE%css" "%DEPLOY%\css" >nul
xcopy /E /Y /I /Q "%SITE%js" "%DEPLOY%\js" >nul
xcopy /E /Y /I /Q "%SITE%assets" "%DEPLOY%\assets" >nul
xcopy /E /Y /I /Q "%SITE%avatars" "%DEPLOY%\avatars" >nul
copy /Y "%SITE%README.md" "%DEPLOY%\README.md" >nul
copy /Y "%SITE%robots.txt" "%DEPLOY%\robots.txt" >nul
copy /Y "%SITE%sitemap.xml" "%DEPLOY%\sitemap.xml" >nul

echo [3/4] Committing...
git -C "%DEPLOY%" add -A
git -C "%DEPLOY%" commit -m "update site"
if errorlevel 1 ( echo No changes to publish. & pause & exit /b 0 )

echo [4/4] Pushing...
set /a attempts=0
:push
set /a attempts+=1
git -C "%DEPLOY%" push origin main
if errorlevel 1 (
  if %attempts% LSS 3 (
    echo Push failed (attempt %attempts%/3), retrying in 5s...
    timeout /t 5 /nobreak >nul
    goto push
  )
  echo Push failed after 3 attempts. Check network.
  pause
  exit /b 1
)

echo.
echo ==========================================
echo  Done! Site updated.
echo  Refresh the live page with Ctrl+F5.
echo  https://ldygml.github.io/liuyanjun-website/
echo ==========================================
pause
