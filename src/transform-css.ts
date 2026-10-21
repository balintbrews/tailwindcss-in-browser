import lightningCssInit, {
  Features as LightningCssFeatures,
  transform as lightningCssTransform,
} from "lightningcss-wasm";
import resolveWasmUrl from "./wasm-url.js";

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
   * Define the base URL of the directory the Lightning CSS WASM binary is
   * served from if necessary. Use if your app serves its assets from a different
   * path than what the app's bundler assumes.
   *
   * @example "/modules/my-module/dist/assets"
   */
  wasmBaseUrl?: string | URL;
}

/**
 * Transforms CSS to ensure compatibility with older browsers.
 *
 * Uses the WASM build of Lightning CSS to match the behavior of Tailwind 4's
 * CLI.
 *
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.3.3/packages/%40tailwindcss-node/src/optimize.ts
 *
 * @param css - The CSS to transform.
 * @param options - Options for transforming the CSS.
 * @param [options.minify=true] - @see {TransformCssOptions.minify}
 * @param [options.wasmBaseUrl] - @see {TransformCssOptions.wasmBaseUrl}
 *
 * @returns The transformed CSS.
 */
export default async function transformCss(
  css: string,
  { minify = true, wasmBaseUrl }: TransformCssOptions = {},
): Promise<string> {
  // The version number is inlined at build time (see `define` in `tsdown.config.ts`),
  const defaultWasmUrl = new URL(
    `./lightningcss_node-${__LIGHTNINGCSS_WASM_VERSION__}.wasm`,
    import.meta.url,
  ).href;

  await lightningCssInit(resolveWasmUrl(defaultWasmUrl, wasmBaseUrl));

  function transform(code: Buffer | Uint8Array) {
    return lightningCssTransform({
      filename: "input.css",
      code,
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
  // Upstream also logs Lightning CSS warnings to the console between the two
  // passes. That is formatted for the terminal and doesn't affect the output,
  // so it's left out here.
  let out = new TextDecoder().decode(
    transform(transform(new TextEncoder().encode(css))),
  );
  // Work around an issue where the media query range syntax transpilation
  // generates code that is invalid with `@media` queries level 3.
  out = out.replaceAll("@media not (", "@media not all and (");

  return out;
}
