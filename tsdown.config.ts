import { readFile } from "fs/promises";
import { createRequire } from "module";
import path from "path";
import { defineConfig } from "tsdown";

// Get the version of the `lightningcss-wasm` package. It will be added to the
// bundled WASM file's filename below (`outputOptions` → `assetFileNames`).
const lightningCssWasmVersion = await (async (): Promise<string> => {
  const require = createRequire(import.meta.url);
  const lightningCssWasmPackagePath = require.resolve("lightningcss-wasm");
  const lightningCssWasmPackageFullPath = path.join(
    path.dirname(lightningCssWasmPackagePath),
    "package.json",
  );
  return (
    JSON.parse(await readFile(lightningCssWasmPackageFullPath, "utf8")) as {
      version: string;
    }
  ).version;
})();

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
    ".wasm": "asset",
  },
  plugins: [
    {
      // The Tailwind CSS files are imported as raw text (their contents are
      // used as strings). They are imported with a `?raw` suffix (a Vite
      // convention). Rolldown doesn't resolve query suffixes, and tsdown's CSS
      // handling matches modules by their `.css` id (requiring `@tsdown/css`),
      // so resolve the real file, then load its contents through a virtual
      // module id that the text loader handles.
      name: "raw-imports",
      resolveId: {
        filter: { id: /\?raw$/ },
        async handler(source, importer) {
          const cleanSource = source.replace(/\?raw$/, "");
          const resolved = await this.resolve(cleanSource, importer, {
            skipSelf: true,
          });
          // Use a virtual id that doesn't end in `.css` so tsdown's CSS
          // handling (which matches on the id) leaves it to the text loader.
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
  banner: {
    // The LightningCSS WASM file is referenced in the codebase as
    // `new URL(${wasmFilePath}, import.meta.url).href`, which is then passed to
    // `lightningCssInit()` that uses `fetch` to load the WASM file. Bundlers
    // used by consumers of this library (e.g. Vite) can't statically analyze
    // that import, so the WASM file will not be included in the consumer's
    // bundle.
    // As a workaround, we add a statement to `index.js` to explicitly import
    // the Lightning CSS WASM file as a URL. The `?url` suffix is used in the
    // import statement to ensure the WASM file is loaded as a URL. This is
    // recognized by the most commonly used bundlers.
    // CAVEAT: The `banner` option can add an arbitrary to string to all
    // generated JS and CSS files, but there is no way to limit it to only the
    // `index.js` file. What's lucky is that it's the only generated JS file.
    js: `import './lightningcss_node-${lightningCssWasmVersion}.wasm?url';`,
  },
  outputOptions: {
    // By default the bundler generates a hash for the filename based on the
    // file contents, which would work well, but there is no easy way to access
    // the generated hash value, which we will also need in the `banner` option
    // below. So instead the version of the `lightningcss-wasm` package is added
    // to the filename, which we can also access in the `banner` option.
    // CAVEAT: This configuration option affects all bundled assets. There is no
    // way to only apply it to the Lightning CSS WASM file. What's lucky is that
    // the Lightning CSS WASM file is the only bundled asset file.
    assetFileNames: `[name]-${lightningCssWasmVersion}.[ext]`,
  },
});
