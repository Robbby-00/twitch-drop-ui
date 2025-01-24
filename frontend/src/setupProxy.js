const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/api/v1/ws",
        createProxyMiddleware({
            target: "http://localhost:17472",
            ws: true,
            changeOrigin: true,
        })
    );

    app.use(
        "/api",
        createProxyMiddleware({
            target: "http://localhost:17472",
            changeOrigin: true,
        })
    );
};
