import { defaultExtractor as tailwindV3Extractor } from "tailwindcss-v3/lib/lib/defaultExtractor.js";
import { compile as tailwindV4Compile } from "tailwindcss-v4";
import tailwindV4DefaultThemeCss from "tailwindcss-v4/theme.css";

/**
 * Extracts class name candidates from the markup.
 *
 * Uses the implementation from Tailwind V3, because it can run in the browser.
 * In Tailwind V4, this is handled by the Oxide engine that's written in Rust
 * and requires a Node.js runtime.
 *
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v3.4.14/src/lib/defaultExtractor.js
 *
 * @param markup - The markup from which to extract class name candidates.
 * @returns The class name candidates extracted from the markup. Note that there
 * can be invalid utility class names in the result, and that is expected.
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
 * Compiles CSS with Tailwind V4 based on class name candidates and CSS.
 *
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0-alpha.30/packages/tailwindcss/src/index.ts#L425
 * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0-alpha.30/packages/tailwindcss/theme.css
 *
 * @param classNameCandidates - The class name candidates for compilation.
 * @param css - CSS that acts as the Tailwind V4 configuration, as well as any
 * additional CSS.
 * @see {GenerateCssArgs['css']}
 * @returns The compiled CSS. The syntax is modern CSS syntax that needs
 * transpiling to be compatible with older browsers, adding vendor prefixing and
 * syntax lowering.
 */
async function compileTailwindCss(
  classNameCandidates: string[],
  css: string,
): Promise<string> {
  // @todo Add base/preflight CSS.
  const { build } = await tailwindV4Compile(
    `
    ${tailwindV4DefaultThemeCss}
    ${css}
    @tailwind utilities;
    `,
  );
  return build(classNameCandidates);
}

/**
 * Arguments for the `generateCss()` function.
 */
type GenerateCssArgs = {
  /**
   * The markup from which to extract Tailwind classes for generating the CSS.
   */
  markup: string;
  /**
   * CSS that acts as the Tailwind V4 configuration, as well as any additional
   * CSS. This is where you would normally do `@import "tailwindcss"`, which
   * imports the default theme, the `base`/`preflight` layer, and the
   * `utilities` layer. That is all already taken care of in this function. All
   * you need to do is add your customizations with a `@theme` directive.
   *
   * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0-alpha.30/packages/tailwindcss/theme.css
   */
  css: string;
};

/**
 * Generates CSS with Tailwind V4 using the given markup and CSS.
 *
 * @param args - Arguments for generating CSS.
 * @returns The generated CSS, ready to be added in a `<style>` tag or used any
 * other way.
 */
async function generateCss({ markup, css }: GenerateCssArgs): Promise<string> {
  const classNameCandidates = extractClassNameCandidates(markup);
  const compiledCss = await compileTailwindCss(classNameCandidates, css);
  // @todo Transpile CSS.
  return compiledCss;
}

export { extractClassNameCandidates, compileTailwindCss };
export type { GenerateCssArgs };
export default generateCss;
