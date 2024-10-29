import { copyFile } from "fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  bundle: true,
  noExternal: ["tailwindcss-v3", "tailwindcss-v4"],
  loader: {
    // Use the "text" loader from ESBuild for CSS files, so we can use the raw
    // CSS as strings in our processing.
    ".css": "text",
  },
  async onSuccess() {
    // Copy the built file to the demo directory for easy access.
    await copyFile("dist/index.js", "demo/tailwind-browser.js");
  },
});
