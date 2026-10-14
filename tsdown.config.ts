import { createRequire } from "module";
import { defineConfig } from "tsdown";

// Resolve the Lightning CSS WASM file shipped by the `lightningcss-wasm`
// package. It is copied into the output directory so the relative
// `new URL("./lightningcss_node.wasm", import.meta.url)` reference in
// `transform-css.ts` resolves to it.
const require = createRequire(import.meta.url);
const lightningCssWasmPath = require.resolve(
  "lightningcss-wasm/lightningcss_node.wasm",
);

export default defineConfig({
  platform: "browser",
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  deps: {
    alwaysBundle: [
      "css-tree",
      "lightningcss-wasm",
      "tailwindcss-v3",
      "tailwindcss-v4",
    ],
  },
  loader: {
    // Use the "text" loader for CSS files, so we can use the raw CSS as
    // strings in our processing.
    ".css": "text",
  },
  // Ship the Lightning CSS WASM file in the package so the relative
  // `new URL("./lightningcss_node.wasm", import.meta.url)` reference in
  // `transform-css.ts` resolves to it. It is copied verbatim from the
  // `lightningcss-wasm` package (the source filename is already stable and
  // un-hashed), placed at the output root next to `index.js`.
  copy: [{ from: lightningCssWasmPath, flatten: true }],
  plugins: [
    {
      // Load the Tailwind CSS files as raw strings via a virtual module. The
      // source imports them with a `?raw` suffix (a Vite convention Rolldown
      // doesn't resolve), and their contents must stay verbatim because they're
      // fed as `@import` sources into the browser-side Tailwind compiler.
      // tsdown's CSS handling would process them (and require `@tsdown/css`),
      // so route them through a virtual id that doesn't end in `.css`.
      name: "raw-imports",
      resolveId: {
        filter: { id: /\?raw$/ },
        async handler(source, importer) {
          const cleanSource = source.replace(/\?raw$/, "");
          const resolved = await this.resolve(cleanSource, importer, {
            skipSelf: true,
          });
          return resolved ? `${resolved.id}\0raw` : null;
        },
      },
      load: {
        filter: { id: /\0raw$/ },
        async handler(id) {
          const { readFile } = await import("fs/promises");
          return {
            code: await readFile(id.slice(0, -"\0raw".length), "utf8"),
            moduleType: "text",
          };
        },
      },
    },
  ],
});
