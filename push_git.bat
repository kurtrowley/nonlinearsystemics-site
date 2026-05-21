@echo off
cd /d "%~dp0"

git status

echo.
set /p MSG="Commit message: "
if "%MSG%"=="" (
  echo No message entered. Aborting.
  pause
  exit /b 1
)

git add .
git commit -m "%MSG%"

echo.
echo Pulling remote changes before push...
git pull --rebase origin main
if errorlevel 1 (
  echo Pull/rebase failed. Resolve conflicts, then push manually.
  pause
  exit /b 1
)

git push

echo.
echo Done.
pause
