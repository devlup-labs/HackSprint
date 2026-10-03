import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const adminProxy = createProxyMiddleware({
  target: env.ADMIN_SERVICE_URL,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  on: {
    error(err, req, res) {
      console.error("Admin Service Error:", err.message);

      res.status(503).json({
        success: false,
        message: "Admin Service is unavailable",
      });
    },
  },
});
