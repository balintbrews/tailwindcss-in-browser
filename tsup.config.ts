import { cp } from "fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  platform: "browser",
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  bundle: true,
  noExternal: ["lightningcss-wasm", "tailwindcss-v3", "tailwindcss-v4"],
  loader: {
    // Use the "text" loader from ESBuild for CSS files, so we can use the raw
    // CSS as strings in our processing.
    ".css": "text",
    ".wasm": "file",
  },
  async onSuccess() {
    // Copy the `dist` directory to the `demo` folder for easy access.
    await cp("dist", "demo/tailwindcss-in-browser-dist", { recursive: true });
  },
});
