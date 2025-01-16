@echo off
set PATH=%~dp0\lib\;%PATH%

call npm run update

if not exist node_modules (
    call npm install 
    call npx rebrowser-patches@latest patch --packageName puppeteer-core
    if errorlevel 1 goto :next
)

:next
call npm run production
pause
