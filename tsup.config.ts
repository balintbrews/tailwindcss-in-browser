import { cp, readFile } from "fs/promises";
import { createRequire } from "module";
import path from "path";
import { defineConfig } from "tsup";

// Get the version of the `lightningcss-wasm` package. It will be added to the
// bundled WASM file's filename in the `tsup` config below (`esbuildOptions` →
// `assetNames`).
const lightningCssWasmVersion = await (async () => {
  const require = createRequire(import.meta.url);
  const lightningCssWasmPackagePath = require.resolve("lightningcss-wasm");
  const lightningCssWasmPackageFullPath = path.join(
    path.dirname(lightningCssWasmPackagePath),
    "package.json",
  );
  return JSON.parse(await readFile(lightningCssWasmPackageFullPath, "utf8"))
    .version;
})();

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
  /* eslint-disable no-param-reassign */
  esbuildOptions(options) {
    // By default esbuild generates a hash for the filename based on the file
    // contents, which would work well, but there is no easy way to access the
    // generated hash value, which we will also need in the `banner` option
    // below. So instead the version of the `lightningcss-wasm` package is added
    // to the filename, which we can also access in the `banner` option.
    // CAVEAT: This configuration option affects all bundled assets. There is no
    // way to only apply it to the Lightning CSS WASM file. (The
    // `esbuildOptions` function takes a `context` parameter besides `options`,
    // but it doesn't contain any information about the asset being bundled.)
    // What's lucky is that the Lightning CSS WASM file is the only bundled
    // asset file.
    options.assetNames = `[name]-${lightningCssWasmVersion}`;
  },
  /* eslint-enable no-param-reassign */
  async onSuccess() {
    // Copy the `dist` directory to the `demo` folder for easy access.
    await cp("dist", "demo/tailwindcss-in-browser-dist", { recursive: true });
  },
});
