@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo Current status:
git status --short
echo.

git add .

:: Check if there is anything staged to commit
git diff --cached --quiet
if errorlevel 1 (
  set /p MSG="Commit message: "
  if "!MSG!"=="" set MSG=Update site
  git commit -m "!MSG!"
) else (
  echo Nothing new to commit -- will push existing commits.
)

echo.
echo Syncing with remote...
git pull --rebase origin main
if errorlevel 1 (
  echo.
  echo Pull failed. Fix conflicts then run: git push
  pause
  exit /b 1
)

echo.
echo Pushing to GitHub...
git push
if errorlevel 1 (
  echo.
  echo Push failed.
  pause
  exit /b 1
)

echo.
echo Done. GitHub Actions will build and deploy in about 1-2 minutes.
pause
