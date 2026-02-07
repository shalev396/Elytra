import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.glb"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching. Keep React in "vendor" to avoid circular chunk.
          // Don't split react-router-dom into "router" — it can become an empty chunk when tree-shaken into app code.
          if (id.includes("node_modules")) {
            // Redux
            if (id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
              return "redux";
            }
            // React Query
            if (id.includes("@tanstack/react-query")) {
              return "query";
            }
            // Icons
            if (id.includes("lucide-react")) {
              return "icons";
            }
            // UI Library (Radix)
            if (id.includes("@radix-ui")) {
              return "ui-lib";
            }
            // React, react-dom, and all other vendors in one chunk
            return "vendor";
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
});
