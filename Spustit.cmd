@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% equ 0 (
  node server.cjs
) else (
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.cjs
  ) else (
    echo Nenasiel sa Node.js. Na spustenie je potrebny bezplatny Node.js.
    pause
  )
)
