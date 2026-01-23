import { describe, expect, it } from "vitest";
import compileCss, {
  compilePartialCss,
  splitClassNameCandidates,
} from "./compile-css.js";

describe("compiled CSS", () => {
  it("should contain standard tailwindcss layers", async () => {
    const compiledCss = await compileCss([], "", { addPreflight: true });
    const standardLayers = ["theme", "base", "utilities"];
    standardLayers.forEach((layer) => {
      expect(compiledCss).toContain(`@layer ${layer}`);
    });
  });

  it("should contain standard tailwindcss layers order declaration", async () => {
    const compiledCss = await compileCss([], "", { addPreflight: true });
    expect(compiledCss).toContain("@layer theme, base, components, utilities;");
  });

  it("should compile unlayered utilities outside of utilities layer", async () => {
    const compiledCss = await compileCss(["block", "text-red-500"], "", {
      addPreflight: false,
      unlayeredUtilities: ["block"],
    });

    expect(compiledCss).toMatchInlineSnapshot(`
      "/*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      @layer theme, base, components, utilities;
      @layer theme {
        :root, :host {
          --color-red-500: oklch(63.7% 0.237 25.331);
        }
      }
      @layer utilities {
        .text-red-500 {
          color: var(--color-red-500);
        }
      }

      /*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      .block {
        display: block;
      }
      "
    `);
  });

  it("should handle variants with unlayered utilities", async () => {
    const compiledCss = await compileCss(
      ["block", "md:block", "dark:block", "text-red-500"],
      "",
      { addPreflight: false, unlayeredUtilities: ["block"] },
    );

    expect(compiledCss).toMatchInlineSnapshot(`
      "/*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      @layer theme, base, components, utilities;
      @layer theme {
        :root, :host {
          --color-red-500: oklch(63.7% 0.237 25.331);
        }
      }
      @layer utilities {
        .text-red-500 {
          color: var(--color-red-500);
        }
      }

      /*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      .block {
        display: block;
      }
      .md\\:block {
        @media (width >= 48rem) {
          display: block;
        }
      }
      .dark\\:block {
        @media (prefers-color-scheme: dark) {
          display: block;
        }
      }
      "
    `);
  });

  it("should handle multiple unlayered utilities", async () => {
    const compiledCss = await compileCss(
      ["block", "flex", "text-red-500", "p-4"],
      "",
      { addPreflight: false, unlayeredUtilities: ["block", "flex"] },
    );

    expect(compiledCss).toMatchInlineSnapshot(`
      "/*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      @layer theme, base, components, utilities;
      @layer theme {
        :root, :host {
          --color-red-500: oklch(63.7% 0.237 25.331);
          --spacing: 0.25rem;
        }
      }
      @layer utilities {
        .p-4 {
          padding: calc(var(--spacing) * 4);
        }
        .text-red-500 {
          color: var(--color-red-500);
        }
      }

      /*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      .block {
        display: block;
      }
      .flex {
        display: flex;
      }
      "
    `);
  });

  it("should handle empty unlayeredUtilities (default behavior)", async () => {
    const compiledCss = await compileCss(["block", "text-red-500"], "", {
      addPreflight: false,
      unlayeredUtilities: [],
    });

    expect(compiledCss).toMatchInlineSnapshot(`
      "/*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      @layer theme, base, components, utilities;
      @layer theme {
        :root, :host {
          --color-red-500: oklch(63.7% 0.237 25.331);
        }
      }
      @layer utilities {
        .block {
          display: block;
        }
        .text-red-500 {
          color: var(--color-red-500);
        }
      }
      "
    `);
  });

  it("should handle arbitrary variants with unlayered utilities", async () => {
    const compiledCss = await compileCss(
      ["block", "[&>p]:block", "hover:block", "text-red-500"],
      "",
      { addPreflight: false, unlayeredUtilities: ["block"] },
    );

    expect(compiledCss).toMatchInlineSnapshot(`
      "/*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      @layer theme, base, components, utilities;
      @layer theme {
        :root, :host {
          --color-red-500: oklch(63.7% 0.237 25.331);
        }
      }
      @layer utilities {
        .text-red-500 {
          color: var(--color-red-500);
        }
      }

      /*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
      .block {
        display: block;
      }
      .hover\\:block {
        &:hover {
          @media (hover: hover) {
            display: block;
          }
        }
      }
      .\\[\\&\\>p\\]\\:block {
        &>p {
          display: block;
        }
      }
      "
    `);
  });
});

describe("compiled partial CSS", () => {
  it("should contain styles of classes from @apply rules", async () => {
    const css = `.test { @apply text-red-500; } .test2 { border-radius: 10px; }`;
    const configurationCss = ``; // No custom configuration.
    const compiledCss = await compilePartialCss(css, configurationCss)
      // Remove line breaks for easier testing.
      .then((css) => css.replace(/(\r\n|\n|\r)/gm, ""));
    expect(compiledCss).toContain(
      `.test {  color: var(--color-red-500, oklch(63.7% 0.237 25.331));}`,
    );
    expect(compiledCss).toContain(`.test2 {  border-radius: 10px;}`);
  });

  it("should be able to use values from customized configuration", async () => {
    const css = `.test { @apply text-coffee; }`;
    // Add custom color definition.
    const configurationCss = `@theme { --color-coffee: #6f4e37; }`;
    const compiledCss = await compilePartialCss(css, configurationCss)
      // Remove line breaks for easier testing.
      .then((css) => css.replace(/(\r\n|\n|\r)/gm, ""));
    expect(compiledCss).toContain(
      `.test {  color: var(--color-coffee, #6f4e37);}`,
    );
  });

  it("should only use theme variables from customized configuration", async () => {
    const css = `.test { @apply text-red-500; } .test2 { @apply text-coffee; }`;
    const configurationCss = `
    @theme { --color-coffee: #6f4e37; }
    body { overflow-y: hidden; }
  `;
    const compiledCss = await compilePartialCss(css, configurationCss)
      // Remove line breaks for easier testing.
      .then((css) => css.replace(/(\r\n|\n|\r)/gm, ""));
    expect(compiledCss).toContain(
      `.test {  color: var(--color-red-500, oklch(63.7% 0.237 25.331));}`,
    );
    expect(compiledCss).toContain(
      `.test2 {  color: var(--color-coffee, #6f4e37);}`,
    );
    expect(compiledCss).not.toContain("body");
  });
});

describe("splitting class name candidates", () => {
  it("should return layered and unlayered groups of candidates", () => {
    const result = splitClassNameCandidates(
      ["block", "md:block", "dark:block", "text-red-500", "p-4"],
      ["block"],
    );
    expect(result.layered).toEqual(["text-red-500", "p-4"]);
    expect(result.unlayered).toEqual(["block", "md:block", "dark:block"]);
  });

  it("should handle empty unlayeredUtilities", () => {
    const result = splitClassNameCandidates(
      ["block", "md:block", "text-red-500"],
      [],
    );
    expect(result.layered).toEqual(["block", "md:block", "text-red-500"]);
    expect(result.unlayered).toEqual([]);
  });

  it("should handle empty candidates", () => {
    const result = splitClassNameCandidates([], ["block"]);
    expect(result.layered).toEqual([]);
    expect(result.unlayered).toEqual([]);
  });

  it("should handle multiple unlayeredUtilities", () => {
    const result = splitClassNameCandidates(
      ["block", "md:block", "flex", "lg:flex", "text-red-500", "p-4"],
      ["block", "flex", "inline"],
    );
    expect(result.layered).toEqual(["text-red-500", "p-4"]);
    expect(result.unlayered).toEqual(["block", "md:block", "flex", "lg:flex"]);
  });

  it("should handle arbitrary variants", () => {
    const result = splitClassNameCandidates(
      ["block", "[&>p]:block", "hover:block", "text-red-500"],
      ["block"],
    );
    expect(result.layered).toEqual(["text-red-500"]);
    expect(result.unlayered).toEqual(["block", "[&>p]:block", "hover:block"]);
  });
});

describe("@plugin directive", () => {
  it("should load plugin from full URL", async () => {
    const configurationCss = `
      @plugin "https://esm.sh/@tailwindcss/typography@0.5.19";
    `;

    const compiledCss = await compileCss(
      ["prose", "lg:prose-xl"],
      configurationCss,
    );

    expect(compiledCss).toContain(".prose");
    expect(compiledCss).toContain(".lg\\:prose-xl");
  });

  it("should throw error when used with an invalid URL", async () => {
    const configurationCss = `
      @plugin "https://example.com/invalid/tailwind-plugin";
    `;
    await expect(compileCss([], configurationCss)).rejects.toThrow(
      "Failed to fetch dynamically imported module: https://example.com/invalid/tailwind-plugin",
    );
  });

  it("should load plugin using bare specifier with import map", async () => {
    // Entry for '@tailwindcss/typography' is provided in an import map defined in vitest.config.ts.
    const configurationCss = `
      @plugin "@tailwindcss/typography";
    `;
    const compiledCss = await compileCss(
      ["prose", "lg:prose-xl"],
      configurationCss,
    );
    expect(compiledCss).toContain(".prose");
    expect(compiledCss).toContain(".lg\\:prose-xl");
  });

  it("should throw error when import map entry for bare specifier is missing", async () => {
    // There is no entry for '@tailwindcss/forms' in the import map used during tests.
    const configurationCss = `
      @plugin "@tailwindcss/forms";
    `;
    await expect(compileCss(["form-input"], configurationCss)).rejects.toThrow(
      "Failed to resolve module specifier '@tailwindcss/forms'",
    );
  });
});
