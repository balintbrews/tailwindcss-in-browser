import { compile as tailwindV4Compile } from "tailwindcss-v4";
import tailwindV4PreflightCss from "tailwindcss-v4/preflight.css";
import tailwindV4DefaultThemeCss from "tailwindcss-v4/theme.css";
import extractImports from "./extract-imports.js";

/**
 * Options for compiling CSS.
 * @see {compileCss}
 */
export type CompileCssOptions = {
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
 * @see https://tailwindcss.com/docs/configuration
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.1.4/packages/tailwindcss/src/index.ts#L761
 *
 * @param classNameCandidates - The class name candidates for compilation.
 * @param [configurationCss] - CSS that acts as the Tailwind V4 configuration,
 *     as well as any additional CSS. This is where you would normally add
 *     `@import "tailwindcss"`, which imports the followings:
 *       - the default theme,
 *         @see https://tailwindcss.com/docs/theme#default-theme-variable-reference
 *       - the `base`/`preflight` layer,
 *       - the `components` layer —yet to be implemented in Tailwind 4—, and
 *       - the `utilities` layer.
 *     All of the above are already taken care of in this function. All you need
 *     to do is add your customizations with a `@theme` directive. See what you
 *     can override in Tailwind 4's default theme.
 *     @see https://tailwindcss.com/docs/theme#default-theme-variable-reference
 *     You also have the option to skip adding the `base`/`preflight` layer.
 *     @see {CompileCssOptions.addPreflight}
 * @param options - Options for compiling the CSS.
 * @param [options.addPreflight=true] - @see {CompileCssOptions.addPreflight}
 *
 * @returns The compiled CSS. The syntax is modern CSS syntax that needs to be
 * transformed to ensure compatibility with older browsers.
 */
export default async function compileCss(
  classNameCandidates: string[],
  configurationCss: string,
  { addPreflight = true }: CompileCssOptions = {},
): Promise<string> {
  // Import at-rules need to be at the top of the CSS.
  const { cssWithoutImports: configurationCssWithoutImports, importRules } =
    extractImports(configurationCss);
  const { build } = await tailwindV4Compile(
    `
    ${importRules}
    ${addPreflight ? tailwindV4PreflightCss : ""}
    ${tailwindV4DefaultThemeCss}
    ${configurationCssWithoutImports}
    @tailwind utilities;
    `,
  );
  return build(classNameCandidates);
}
