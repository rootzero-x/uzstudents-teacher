import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/tapi": {
        target: "https://694fc8f1e1918.myxvest1.ru",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tapi/, ""),
      },
    },
  },
});
