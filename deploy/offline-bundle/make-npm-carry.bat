@echo off
REM Offline npm cache builder (internet PC). Details: docs\REQUIRED_FILES.md 3-5
REM Usage: double-click, or  make-npm-carry.bat [output folder]   (default D:\npm-carry-build)
node "%~dp0make-npm-carry.mjs" %*
echo.
pause
