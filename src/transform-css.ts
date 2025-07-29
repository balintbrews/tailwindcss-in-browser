import lightningCssInit, {
  Features as LightningCssFeatures,
  transform as lightningCssTransform,
} from "lightningcss-wasm";
import lightningCssWasm from "lightningcss-wasm/lightningcss_node.wasm";

/**
 * Options for transforming CSS.
 * @see {transformCss}
 */
export type TransformCssOptions = {
  /**
   * Whether to minify the CSS.
   *
   * @default true
   */
  minify?: boolean;
};

/**
 * Transforms CSS to ensure compatibility with older browsers.
 *
 * Uses the WASM build of Lightning CSS to match the behavior of Tailwind 4's
 * CLI.
 *
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.1.4/packages/%40tailwindcss-node/src/optimize.ts
 *
 * @param css - The CSS to transform.
 * @param options - Options for transforming the CSS.
 * @param [options.minify=true] - @see {TransformCssOptions.minify}
 *
 * @returns The transformed CSS.
 */
export default async function transformCss(
  css: string,
  { minify = true }: TransformCssOptions = {},
): Promise<string> {
  await lightningCssInit(new URL(lightningCssWasm, import.meta.url).href);

  function transform(code: Buffer | Uint8Array) {
    return lightningCssTransform({
      filename: "input.css",
      code: code as any,
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
