const express = require("express");
const path = require("path");
const httpProxy = require("http-proxy");
const http = require("http");

const app = express();
const server = http.createServer(app);
const apiProxy = httpProxy.createProxyServer({
    ws: true,
});

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

server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/api/")) {
        try {
            apiProxy.ws(req, socket, head, { target: BACKEND }, (err) => {
                console.log(`[PROXY][WS][${err.code}] ${req.url}`);
                socket.destroy();
            });
        } catch {
            socket.destroy();
        }
    } else {
        socket.destroy();
    }
});

const WEB_PORT = process.env.WEB_PORT ?? 3000;
server.listen(WEB_PORT, () => {
    console.log(`Listening on port: ${WEB_PORT}`);
});
