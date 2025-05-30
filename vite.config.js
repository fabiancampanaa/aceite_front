import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/aplicacion/", // 👈 necesario para despliegue en subcarpeta
  plugins: [react()],
  optimizeDeps: {
    include: ["jwt-decode"],
  },
});
