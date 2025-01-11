#!/bin/bash
if [ ! -d "node_modules" ]; then
    npm install
    npx rebrowser-patches@latest patch --packageName puppeteer-core
fi

npm run production