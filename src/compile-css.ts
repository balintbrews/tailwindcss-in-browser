import { compile as tailwindV4Compile } from "tailwindcss-v4";
import assets from "./assets.js";
import extractImports from "./extract-imports.js";

/**
 * Same as loadStylesheet function from `@tailwindcss/browser`,
 * but with instrumentation removed.
 *
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.1.13/packages/%40tailwindcss-browser/src/index.ts#L109
 */
// eslint-disable-next-line @typescript-eslint/require-await
async function loadStylesheet(id: string, base: string) {
  if (id === "tailwindcss") {
    return {
      path: "virtual:tailwindcss-v4/index.css",
      base,
      content: assets.css.index,
    };
  }
  if (
    id === "tailwindcss/preflight" ||
    id === "tailwindcss/preflight.css" ||
    id === "./preflight.css"
  ) {
    return {
      path: "virtual:tailwindcss-v4/preflight.css",
      base,
      content: assets.css.preflight,
    };
  }
  if (
    id === "tailwindcss/theme" ||
    id === "tailwindcss/theme.css" ||
    id === "./theme.css"
  ) {
    return {
      path: "virtual:tailwindcss-v4/theme.css",
      base,
      content: assets.css.theme,
    };
  }
  if (
    id === "tailwindcss/utilities" ||
    id === "tailwindcss/utilities.css" ||
    id === "./utilities.css"
  ) {
    return {
      path: "virtual:tailwindcss-v4/utilities.css",
      base,
      content: assets.css.utilities,
    };
  }

  throw new Error(`The browser build does not support @import for "${id}"`);
}

const configurationCssId = "tailwindcss-in-browser/configuration";

function createStylesheetLoader(configurationCss?: string) {
  return async (id: string, base: string) => {
    if (configurationCss && id === configurationCssId) {
      return {
        path: `virtual:${configurationCssId}.css`,
        base,
        content: configurationCss,
      };
    }
    return loadStylesheet(id, base);
  };
}

function prepareTailwindConfiguration(
  configurationCss: string,
  addPreflight = true,
): string {
  // Import at-rules need to be at the top of the CSS.
  const { cssWithoutImports: configurationCssWithoutImports, importRules } =
    extractImports(configurationCss);
  // Since preflight can be disabled, we need to import each layer explicitly,
  // instead of just `@import "tailwindcss"`.
  return `
    ${importRules}
    @layer theme, base, components, utilities;
    @import "tailwindcss/theme.css" layer(theme);
    ${addPreflight ? '@import "tailwindcss/preflight.css" layer(base);' : ""}
    @import "tailwindcss/utilities.css" layer(utilities);
    ${configurationCssWithoutImports}
    `;
}

/**
 * Compiles component CSS that uses `@apply` directives.
 * @see https://tailwindcss.com/docs/functions-and-directives#apply-directive
 *
 * @param componentCss - The CSS containing `@apply` directives. Normally this
 *     would also contain `@reference` to the Tailwind configuration, but here
 *     the configuration is provided via `configurationCss` parameter.
 *     @see https://tailwindcss.com/docs/functions-and-directives#reference-directive
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
 */
export async function compileComponentCss(
  componentCss: string,
  configurationCss: string,
): Promise<string> {
  const tailwindConfiguration = prepareTailwindConfiguration(configurationCss);
  const compiler = await tailwindV4Compile(
    `
    @reference "${configurationCssId}";
    ${componentCss}
    `,
    { loadStylesheet: createStylesheetLoader(tailwindConfiguration) },
  );
  // Component CSS does not need separate class name candidates,
  // it provides class names via `@apply` directives.
  return compiler.build([]);
}

/**
 * Options for compiling CSS.
 * @see {compileCss}
 */
export interface CompileCssOptions {
  /**
   * Whether to add Tailwind's Preflight, a set of base styles and CSS reset.
   * @see https://tailwindcss.com/docs/preflight
   */
  addPreflight?: boolean;
}

/**
 * Compiles CSS from class name candidates and Tailwind 4 configuration CSS.
 *
 * Uses Tailwind 4 where configuration is done via CSS variables.
 * @see https://tailwindcss.com/docs/configuration
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.1.13/packages/tailwindcss/src/index.ts#L699
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
  const compiler = await tailwindV4Compile(
    prepareTailwindConfiguration(configurationCss, addPreflight),
    { loadStylesheet: createStylesheetLoader() },
  );
  return compiler.build(classNameCandidates);
}
