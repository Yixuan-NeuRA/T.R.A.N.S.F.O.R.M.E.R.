@echo off
chcp 65001 >nul
title T.R.A.N.S.F.O.R.M.E.R
cd /d "D:\T.R.A.N.S.F.O.R.M.E.R"

set "NODEDIR=C:\Users\86150\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.16.0-win-x64"
set "PATH=%NODEDIR%;%PATH%"

echo ============================================
echo   T.R.A.N.S.F.O.R.M.E.R  -  starting...
echo   Browser will open at http://localhost:5173
echo   Keep this window OPEN while playing.
echo   Close this window to stop the game.
echo ============================================
echo.

if not exist "node_modules" (
  echo Installing dependencies for the first time...
  call "%NODEDIR%\npm.cmd" install
)

"%NODEDIR%\node.exe" "node_modules\vite\bin\vite.js" --open

echo.
echo Server stopped. Press any key to close.
pause >nul
