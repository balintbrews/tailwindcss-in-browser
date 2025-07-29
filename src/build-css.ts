import compileCss, { type CompileCssOptions } from "./compile-css.js";
import extractClassNameCandidates from "./extract-class-name-candidates.js";
import transformCss, { type TransformCssOptions } from "./transform-css.js";

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
export default async function buildCss(
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
