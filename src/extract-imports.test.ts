import { expect, it } from "vitest";
import extractImports from "./extract-imports.js";

it("should remove @import rules and return both CSS and imports", () => {
  const cssString = `
      @import url('https://rsms.me/inter/inter.css');
      @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
      
      @theme {
        --font-sans: Inter, sans-serif;
        --font-serif: Merriweather, serif;
      }
      
      .button {
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
      }
    `;

  const { cssWithoutImports, importRules } = extractImports(cssString);

  expect(cssWithoutImports).toMatchInlineSnapshot(
    `"@theme{--font-sans: Inter, sans-serif;--font-serif: Merriweather, serif}.button{background-color:#007bff;color:white;padding:10px 20px}"`,
  );

  expect(importRules).toMatchInlineSnapshot(`
    "@import url("https://rsms.me/inter/inter.css");
    @import url("https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap");"
  `);
});

it("should handle CSS with no @import rules", () => {
  const cssString = `
      @theme {
        --text-lg: 3rem;
        --text-lg--line-height: 1;
      }
      
      .button {
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
      }
    `;

  const { cssWithoutImports, importRules } = extractImports(cssString);

  expect(cssWithoutImports).toMatchInlineSnapshot(
    `"@theme{--text-lg: 3rem;--text-lg--line-height: 1}.button{background-color:#007bff;color:white;padding:10px 20px}"`,
  );
  expect(importRules).toBe("");
});

it("should handle CSS with only @import rules", () => {
  const cssString = `
      @import url('https://rsms.me/inter/inter.css');
      @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
    `;

  const { cssWithoutImports, importRules } = extractImports(cssString);

  expect(cssWithoutImports).toBe("");
  expect(importRules).toMatchInlineSnapshot(`
    "@import url("https://rsms.me/inter/inter.css");
    @import url("https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap");"
  `);
});

it("should handle empty CSS string", () => {
  const cssString = "";

  const { cssWithoutImports, importRules } = extractImports(cssString);

  expect(cssWithoutImports).toBe("");
  expect(importRules).toBe("");
});

it("should handle CSS with whitespace only", () => {
  const cssString = "   \n\t  ";

  const { cssWithoutImports, importRules } = extractImports(cssString);

  expect(cssWithoutImports).toBe("");
  expect(importRules).toBe("");
});

it("should handle @import rules with different syntax variations", () => {
  const cssString = `
      @import url('https://example.com/style.css');
      @import 'local-style.css';
      @import url("https://fonts.googleapis.com/css2?family=Open+Sans");
      @import 'components.css' screen and (max-width: 768px);
      
      .content {
        padding: 20px;
      }
    `;

  const { cssWithoutImports, importRules } = extractImports(cssString);

  expect(cssWithoutImports).toMatchInlineSnapshot(`".content{padding:20px}"`);
  expect(importRules).toMatchInlineSnapshot(`
    "@import url("https://example.com/style.css");
    @import "local-style.css";
    @import url("https://fonts.googleapis.com/css2?family=Open+Sans");
    @import "components.css"screen and (max-width:768px);"
  `);
});
