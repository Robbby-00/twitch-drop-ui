const express = require("express");
const path = require("path");
const app = express();
const httpProxy = require("http-proxy");
const apiProxy = httpProxy.createProxyServer();

const BACKEND = `http://localhost:${process.env.API_PORT ?? 17472}`;

app.use(express.static(path.join(__dirname, "build")));

app.use((req, res, next) => {
    if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path) || req.path.startsWith("/api")) {
        next();
    } else {
        res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
        res.header("Expires", "-1");
        res.header("Pragma", "no-cache");
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.all("/api/*", function (req, res) {
    apiProxy.web(req, res, { target: BACKEND }, (err) => {
        console.log(`[PROXY][${err.code}] ${req.url}`);
    });
});

const WEB_PORT = process.env.WEB_PORT ?? 3000;
app.listen(WEB_PORT, () => {
    console.log(`Listening on port: ${WEB_PORT}`);
});
