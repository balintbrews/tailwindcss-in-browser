import lightningCssInit, {
  Features as LightningCssFeatures,
  transform as lightningCssTransform,
} from "lightningcss-wasm";

/**
 * Options for transforming CSS.
 * @see {transformCss}
 */
export interface TransformCssOptions {
  /**
   * Whether to minify the CSS.
   *
   * @default true
   */
  minify?: boolean;
  /**
   * URL of the Lightning CSS WASM binary (`lightningcss_node.wasm`).
   *
   * By default, the binary is loaded from next to this bundle via
   * `new URL("./lightningcss_node.wasm", import.meta.url)`. Bundlers such as
   * Vite copy the file into your build and rewrite that URL using their
   * configured base path (e.g. `/assets/lightningcss_node.wasm`). Set this
   * if your app serves its assets from a different path than the bundler's base path.
   *
   * The binary is loaded once, on the first `transformCss()` call, so only the
   * value passed to that call is used.
   *
   * @default new URL("./lightningcss_node.wasm", import.meta.url)
   */
  wasmUrl?: string | URL;
}

/**
 * Transforms CSS to ensure compatibility with older browsers.
 *
 * Uses the WASM build of Lightning CSS to match the behavior of Tailwind 4's
 * CLI.
 *
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.1.13/packages/%40tailwindcss-node/src/optimize.ts
 *
 * @param css - The CSS to transform.
 * @param options - Options for transforming the CSS.
 * @param [options.minify=true] - @see {TransformCssOptions.minify}
 * @param [options.wasmUrl] - @see {TransformCssOptions.wasmUrl}
 *
 * @returns The transformed CSS.
 */
export default async function transformCss(
  css: string,
  { minify = true, wasmUrl }: TransformCssOptions = {},
): Promise<string> {
  await lightningCssInit(
    // Keep `new URL()` with a string literal inline: bundlers (e.g. Vite) only
    // detect and rewrite asset URLs in this exact form. The file is copied next
    // to the bundle by the build (see `copy` in `tsdown.config.ts`).
    wasmUrl?.toString() ??
      new URL("./lightningcss_node.wasm", import.meta.url).href,
  );

  function transform(code: Buffer | Uint8Array) {
    return lightningCssTransform({
      filename: "input.css",
      code: code as unknown as Buffer | Uint8Array,
      minify,
      drafts: {
        customMedia: true,
      },
      nonStandard: {
        deepSelectorCombinator: true,
      },
      include: LightningCssFeatures.Nesting | LightningCssFeatures.MediaQueries,
      exclude:
        LightningCssFeatures.LogicalProperties |
        LightningCssFeatures.DirSelector |
        LightningCssFeatures.LightDark,
      targets: {
        safari: (16 << 16) | (4 << 8),
        ios_saf: (16 << 16) | (4 << 8),
        firefox: 128 << 16,
        chrome: 111 << 16,
      },
      errorRecovery: true,
    }).code;
  }

  // Running Lightning CSS twice to ensure that adjacent rules are merged after
  // nesting is applied. This creates a more optimized output.
  let out = new TextDecoder().decode(
    transform(transform(new TextEncoder().encode(css))),
  );
  // Work around an issue where the media query range syntax transpilation
  // generates code that is invalid with `@media` queries level 3.
  out = out.replaceAll("@media not (", "@media not all and (");

  return out;
}
