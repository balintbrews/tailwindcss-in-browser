import { defineConfig } from "tsup";

export default defineConfig({
  platform: "browser",
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  bundle: true,
  noExternal: [
    "css-tree",
    "lightningcss-wasm",
    "tailwindcss-v3",
    "tailwindcss-v4",
  ],
  loader: {
    // Use the "text" loader from ESBuild for CSS files, so we can use the raw
    // CSS as strings in our processing.
    ".css": "text",
    ".wasm": "file",
  },
  esbuildOptions(options) {
    // By default esbuild generates a hash for the filename based on the file
    // contents, which would work well, but there is no easy way to access the
    // generated hash value, which we will also need in the `banner` option
    // below. So we remove that hash.
    // CAVEAT: This configuration option affects all bundled assets. There is no
    // way to only apply it to the Lightning CSS WASM file. (The
    // `esbuildOptions` function takes a `context` parameter besides `options`,
    // but it doesn't contain any information about the asset being bundled.)
    // What's lucky is that the Lightning CSS WASM file is the only bundled
    // asset file.
    options.assetNames = `[name]`;
  },
});
