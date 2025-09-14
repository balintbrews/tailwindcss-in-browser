import { expect, it } from "vitest";
import compileCss from "./compile-css.js";

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
