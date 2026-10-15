import { createRequire } from "module";
import { defineConfig } from "tsdown";

// Resolve the Lightning CSS WASM file shipped by the `lightningcss-wasm`
// package. It is copied into the output directory in the `copy` option below.
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
  // Ship the Lightning CSS WASM binary as a static asset alongside the bundle.
  // The runtime loads it over HTTP via a relative URL, so it must exist next to
  // the output with this exact filename.
  copy: [{ from: lightningCssWasmPath, flatten: true }],
  plugins: [
    {
      // The source imports Tailwind's CSS as `?raw` strings (a Vite convention, so
      // Vitest handles them natively). Rolldown can't resolve `?raw`, and tsdown's
      // CSS handling would process any `.css` id, so resolve the real file under a
      // virtual id that doesn't end in `.css` and load its contents verbatim as text.
      name: "raw-imports",
      resolveId: {
        filter: { id: /\?raw$/ },
        async handler(source, importer) {
          const cleanSource = source.replace(/\?raw$/, "");
          const resolved = await this.resolve(cleanSource, importer, {
            skipSelf: true,
          });
          // Return a virtual id: the `\0` prefix is the Rolldown
          // virtual-module convention (other plugins skip it), and keeping the
          // `?raw` suffix means the id doesn't end in `.css`, which is what
          // tsdown's CSS guard matches on. Leave unresolved or external ids to
          // the default behavior.
          if (!resolved || resolved.external) return null;
          return `\0${resolved.id}?raw`;
        },
      },
      load: {
        // Only run for the virtual ids created in `resolveId`.
        filter: { id: /^\0.*\?raw$/ },
        async handler(id) {
          const { readFile } = await import("fs/promises");
          return {
            // Strip "\0" and "?raw" and read it as text.
            code: await readFile(id.slice(1, -"?raw".length), "utf8"),
            moduleType: "text",
          };
        },
      },
    },
  ],
});
