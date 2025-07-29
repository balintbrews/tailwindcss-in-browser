import { defaultExtractor as tailwindV3Extractor } from "tailwindcss-v3/lib/lib/defaultExtractor.js";

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
export default function extractClassNameCandidates(markup: string): string[] {
  return Array.from(
    new Set( // Using a Set to deduplicate the class names.
      tailwindV3Extractor({
        tailwindConfig: { separator: ":" },
      })(markup),
    ),
  );
}
