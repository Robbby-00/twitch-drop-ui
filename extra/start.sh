#!/bin/bash

if [ -d "node_modules" ]; then
    npm run update
else
    echo "Skip update: no node_modules found!"
fi

if [ ! -d "node_modules" ]; then
    npm install
    npx rebrowser-patches@latest patch --packageName puppeteer-core
fi

npm run production