import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 20110,
    host: "0.0.0.0",
    proxy: {
      // 本地开发代理 /api 到后端 3000；容器生产环境由 frontend/nginx.conf 代理到 backend:3000
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
