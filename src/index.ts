import lightningCssInit, {
  Features as LightningCssFeatures,
  transform as lightningCssTransform,
} from "lightningcss-wasm";
import lightningCssWasm from "lightningcss-wasm/lightningcss_node.wasm";
import { defaultExtractor as tailwindV3Extractor } from "tailwindcss-v3/lib/lib/defaultExtractor.js";
import { compile as tailwindV4Compile } from "tailwindcss-v4";
import tailwindV4PreflightCss from "tailwindcss-v4/preflight.css";
import tailwindV4DefaultThemeCss from "tailwindcss-v4/theme.css";

/**
 * Extracts class name candidates from the given markup.
 *
 * Uses the implementation from Tailwind V3, because it can run in the browser.
 * In Tailwind V4, this is handled by the Oxide engine that's written in Rust
 * and requires a Node.js runtime.
 *
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v3.4.14/src/lib/defaultExtractor.js
 *
 * @param markup - The markup from which to extract class name candidates.
 *
 * @returns The class name candidates extracted from the markup. Note that there
 *     can be invalid utility class names in the result, and that is expected.
 */
function extractClassNameCandidates(markup: string): string[] {
  return Array.from(
    new Set( // Using a Set to deduplicate the class names.
      tailwindV3Extractor({
        tailwindConfig: { separator: ":" },
      })(markup),
    ),
  );
}

/**
 * Options for compiling CSS.
 * @see {compileCss}
 */
type CompileCssOptions = {
  /**
   * Whether to add Tailwind's Preflight, a set of base styles and CSS reset.
   * @see https://tailwindcss.com/docs/preflight
   */
  addPreflight?: boolean;
};

/**
 * Compiles CSS from class name candidates and Tailwind 4 configuration CSS.
 *
 * Uses Tailwind 4 where configuration is done via CSS variables.
 * @see https://tailwindcss.com/blog/tailwindcss-v4-alpha#css-first-configuration
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0-alpha.30/packages/tailwindcss/src/index.ts#L425
 *
 * @param classNameCandidates - The class name candidates for compilation.
 * @param [configurationCss] - CSS that acts as the Tailwind V4 configuration,
 *     as well as any additional CSS. This is where you would normally add
 *     `@import "tailwindcss"`, which imports the followings:
 *       - the default theme,
 *         @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0-alpha.30/packages/tailwindcss/theme.css
 *       - the `base`/`preflight` layer,
 *       - the `components` layer —yet to be implemented in Tailwind 4—, and
 *       - the `utilities` layer.
 *     All of the above are already taken care of in this function. All you need
 *     to do is add your customizations with a `@theme` directive. See what you
 *     can override in Tailwind 4's default theme.
 *     @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0-alpha.30/packages/tailwindcss/theme.css
 *     You also have the option to skip adding the `base`/`preflight` layer.
 *     @see {CompileCssOptions.addPreflight}
 * @param options - Options for compiling the CSS.
 * @param [options.addPreflight=true] - @see {CompileCssOptions.addPreflight}
 *
 * @returns The compiled CSS. The syntax is modern CSS syntax that needs to be
 * transformed to ensure compatibility with older browsers.
 */
async function compileCss(
  classNameCandidates: string[],
  configurationCss: string,
  { addPreflight = true }: CompileCssOptions = {},
): Promise<string> {
  const { build } = await tailwindV4Compile(
    `
    ${addPreflight ? tailwindV4PreflightCss : ""}
    ${tailwindV4DefaultThemeCss}
    ${configurationCss}
    @tailwind utilities;
    `,
  );
  return build(classNameCandidates);
}

/**
 * Options for transforming CSS.
 * @see {transformCss}
 */
type TransformCssOptions = {
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
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0-alpha.30/packages/%40tailwindcss-cli/src/commands/build/index.ts#L378
 *
 * @param css - The CSS to transform.
 * @param options - Options for transforming the CSS.
 * @param [options.minify=true] - @see {TransformCssOptions.minify}
 *
 * @returns The transformed CSS.
 */
async function transformCss(
  css: string,
  { minify = true }: TransformCssOptions = {},
): Promise<string> {
  await lightningCssInit(new URL(lightningCssWasm, import.meta.url).href);

  const { code } = lightningCssTransform({
    filename: "input.css",
    code: new TextEncoder().encode(css),
    minify,
    drafts: {
      customMedia: true,
    },
    nonStandard: {
      deepSelectorCombinator: true,
    },
    include: LightningCssFeatures.Nesting,
    exclude: LightningCssFeatures.LogicalProperties,
    targets: {
      safari: (16 << 16) | (4 << 8), // eslint-disable-line no-bitwise
    },
    errorRecovery: true,
  });

  return new TextDecoder().decode(code);
}

/**
 * Builds CSS with Tailwind V4 using the given markup and CSS configuration.
 *
 * Process: extract class names from markup → Compile CSS → Transform CSS.
 * - @see {extractClassNameCandidates}
 * - @see {compileCss}
 * - @see {transformCss}
 * For more granular control, use the individual functions.
 *
 * @param markup - The markup from which to extract Tailwind classes for
 *     generating the CSS.
 * @param configurationCss - CSS that acts as the Tailwind V4 configuration, as
 *     well as any additional CSS.
 *     @see {compileCss}
 * @param [options] - Options to use for compiling and transforming the CSS.
 * @param [options.compileCssOptions] - @see {CompileCssOptions}
 * @param [options.transformCssOptions] - @see {TransformCssOptions}
 *
 * @returns Compiled and transformed CSS.
 */
async function buildCss(
  markup: string,
  configurationCss: string,
  {
    compileCssOptions,
    transformCssOptions,
  }: {
    compileCssOptions?: CompileCssOptions;
    transformCssOptions?: TransformCssOptions;
  } = {},
): Promise<string> {
  const classNameCandidates = extractClassNameCandidates(markup);
  const compiledCss = await compileCss(
    classNameCandidates,
    configurationCss,
    compileCssOptions,
  );
  const transformedCss = await transformCss(compiledCss, transformCssOptions);
  return transformedCss;
}

export { extractClassNameCandidates, compileCss, transformCss };
export type { CompileCssOptions, TransformCssOptions };
export default buildCss;
