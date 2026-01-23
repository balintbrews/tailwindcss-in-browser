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

/**
 * Creates a stylesheet loader for the Tailwind CSS compiler.
 *
 * @param configurationCss - CSS that acts as the Tailwind V4 configuration, with
 *     no @import or @layer at-rules.
 * @returns The stylesheet loader.
 */
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

/**
 * Module loader for the Tailwind CSS compiler used for loading JavaScript-based plugins.
 * Uses the native `import()` function to let the browser handle module loading.
 *
 * @see https://tailwindcss.com/docs/functions-and-directives#plugin-directive
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.1.13/packages/tailwindcss/src/index.ts#L57-L65
 *
 * @param id - The module identifier/path/url to import.
 * @param base - The base path for resolving relative imports.
 * @returns A promise that resolves to an object containing the module path, base, and the loaded module.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadModule(id: string, base: string): Promise<any> {
  const module = await import(/* @vite-ignore */ id); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  return {
    path: id,
    base,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    module: module.default ?? module,
  };
}

/**
 * Prepares CSS with @layer and @import at-rules for compiling Tailwind CSS.
 *
 * @param configurationCss - CSS that acts as the Tailwind V4 configuration, with
 *     no @import or @layer at-rules.
 * @param addPreflight - Whether to add the Preflight layer.
 * @returns The prepared CSS with @layer and @import at-rules.
 */
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
 * Compiles partial CSS that uses `@apply` directives.
 * @see https://tailwindcss.com/docs/functions-and-directives#apply-directive
 *
 * @param css - The CSS containing `@apply` directives. Normally this
 *     would also contain `@reference` to the Tailwind configuration, but here
 *     the configuration is provided via `configurationCss` parameter.
 *     @see https://tailwindcss.com/docs/functions-and-directives#reference-directive
 * @param configurationCss - CSS that acts as the Tailwind V4 configuration,
 *     as well as any additional CSS. This is where you would normally add
 *     `@import "tailwindcss"`, which imports the followings:
 *       - the default theme,
 *         @see https://tailwindcss.com/docs/theme#default-theme-variable-reference
 *       - the `base`/`preflight` layer,
 *       - the `components` layer, and
 *       - the `utilities` layer.
 *     All of the above are already taken care of in this function. All you need
 *     to do is add your customizations with a `@theme` directive. See what you
 *     can override in Tailwind 4's default theme.
 *     @see https://tailwindcss.com/docs/theme#default-theme-variable-reference
 */
export async function compilePartialCss(
  css: string,
  configurationCss: string,
): Promise<string> {
  const tailwindConfiguration = prepareTailwindConfiguration(configurationCss);
  const compiler = await tailwindV4Compile(
    `
    @reference "${configurationCssId}";
    ${css}
    `,
    {
      loadStylesheet: createStylesheetLoader(tailwindConfiguration),
      loadModule,
    },
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
  /**
   * Array of utility class names where the compiled definitions should not be
   * placed in a CSS cascade layer (i.e. `@layer utilities`).
   * Class name candidates that end with any of these utility names (e.g., "block",
   * "md:block", "dark:block" would all match "block") will not be placed in the
   * `utilities` layer.
   */
  unlayeredUtilities?: string[];
}

/**
 * Splits class name candidates into layered and unlayered groups based on
 * unlayered utilities.
 *
 * @param classNameCandidates - The class name candidates to split.
 * @param unlayeredUtilities - Array of utility class names. Candidates that end
 *     with any of these utilities will be placed in the unlayered group.
 * @returns An object with `layered` and `unlayered` arrays of class names.
 */
export function splitClassNameCandidates(
  classNameCandidates: string[],
  unlayeredUtilities: string[],
): { layered: string[]; unlayered: string[] } {
  const layered: string[] = [];
  const unlayered: string[] = [];

  for (const candidate of classNameCandidates) {
    // Check if this candidate ends with any of the unlayeredUtilities.
    const shouldUnlayer = unlayeredUtilities.some((utility) =>
      candidate.endsWith(utility),
    );
    if (shouldUnlayer) {
      unlayered.push(candidate);
    } else {
      layered.push(candidate);
    }
  }

  return { layered, unlayered };
}

/**
 * Compiles CSS from class name candidates and Tailwind 4 configuration CSS.
 *
 * Uses Tailwind 4 where configuration is done via CSS variables.
 * @see https://tailwindcss.com/docs/configuration
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.1.13/packages/tailwindcss/src/index.ts#L699
 *
 * @param classNameCandidates - The class name candidates for compilation.
 * @param configurationCss - CSS that acts as the Tailwind V4 configuration,
 *     as well as any additional CSS. This is where you would normally add
 *     `@import "tailwindcss"`, which imports the followings:
 *       - the default theme,
 *         @see https://tailwindcss.com/docs/theme#default-theme-variable-reference
 *       - the `base`/`preflight` layer,
 *       - the `components` layer, and
 *       - the `utilities` layer.
 *     All of the above are already taken care of in this function. All you need
 *     to do is add your customizations with a `@theme` directive. See what you
 *     can override in Tailwind 4's default theme.
 *     @see https://tailwindcss.com/docs/theme#default-theme-variable-reference
 *     You also have the option to skip adding the `base`/`preflight` layer.
 *     @see {CompileCssOptions.addPreflight}
 * @param options - Options for compiling the CSS.
 * @param [options.addPreflight=true] - @see {CompileCssOptions.addPreflight}
 * @param [options.unlayeredUtilities] - @see {CompileCssOptions.unlayeredUtilities}
 *
 * @returns The compiled CSS. The syntax is modern CSS syntax that needs to be
 * transformed to ensure compatibility with older browsers.
 */
export default async function compileCss(
  classNameCandidates: string[],
  configurationCss: string,
  { addPreflight = true, unlayeredUtilities = [] }: CompileCssOptions = {},
): Promise<string> {
  // Split classNameCandidates into layered and unlayered sets.
  const { layered: layeredCandidates, unlayered: unlayeredCandidates } =
    splitClassNameCandidates(classNameCandidates, unlayeredUtilities);

  // Compile both sets.
  const compilations = await Promise.all([
    // Layered compilation (normal behavior):
    // Always compile to preserve layer structure, even with empty candidates.
    (async () => {
      const compiler = await tailwindV4Compile(
        prepareTailwindConfiguration(configurationCss, addPreflight),
        { loadStylesheet: createStylesheetLoader(), loadModule },
      );
      return compiler.build(layeredCandidates);
    })(),
    // Unlayered compilation:
    // Only compile if there are unlayered candidates.
    (async () => {
      if (unlayeredCandidates.length === 0) {
        return "";
      }
      // Prepare configuration for unlayered compilation.
      const unlayeredConfiguration = `
        @import "tailwindcss/theme.css" layer(theme);
        @import "tailwindcss/utilities.css";
      `;
      const compiler = await tailwindV4Compile(unlayeredConfiguration, {
        loadStylesheet: createStylesheetLoader(),
        loadModule,
      });
      return compiler.build(unlayeredCandidates);
    })(),
  ]);

  // Merge the results, filtering out empty strings
  return compilations.filter((css) => css.length > 0).join("\n");
}
