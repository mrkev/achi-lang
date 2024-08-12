import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  logLevel: "info",
  plugins: [dts()],
  server: {
    port: 5174,
  },
  build: {
    outDir: "dist",
    minify: false,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "baaxlang",
      // the proper extensions will be added
      fileName: "baaxlang",
    },
  },
});
