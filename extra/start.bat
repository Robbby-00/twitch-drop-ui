@echo off
set PATH=%~dp0\lib\;%PATH%

if exist node_modules (
    call npm run update
    if errorlevel 1 goto :modules
) else (
    echo "Skip update: no node_modules found!"
)

:modules
if not exist node_modules (
    call npm install 
    call npx rebrowser-patches@latest patch --packageName puppeteer-core
    if errorlevel 1 goto :run
)

:run
call npm run production
pause
