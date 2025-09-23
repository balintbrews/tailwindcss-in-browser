import { expect, it } from "vitest";
import compileCss, { compilePartialCss } from "./compile-css.js";

it("compiled css should contain standard tailwindcss layers", async () => {
  const compiledCss = await compileCss([], "", { addPreflight: true });
  const standardLayers = ["theme", "base", "utilities"];
  standardLayers.forEach((layer) => {
    expect(compiledCss).toContain(`@layer ${layer}`);
  });
});

it("compiled css should contain standard tailwindcss layers order declaration", async () => {
  const compiledCss = await compileCss([], "", { addPreflight: true });
  expect(compiledCss).toContain("@layer theme, base, components, utilities;");
});

it("compiled partial css should contain styles of classes from @apply rules", async () => {
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

it("compiled partial css should be able to use values from customized configuration", async () => {
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

it("compiled partial css should only use theme variables from customized configuration", async () => {
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
