import lightningCssInit from "lightningcss-wasm";
import lightningCssWasm from "lightningcss-wasm/lightningcss_node.wasm?url";
import { beforeAll, describe, expect, it } from "vitest";
import transformCss from "./transform-css.ts";

describe("transform CSS", () => {
  beforeAll(async () => {
    await lightningCssInit(new URL(lightningCssWasm, import.meta.url));
  });

  it("CSS is minified", () => {
    const css = transformCss(`
/* A comment... */
.rule {
  font-weight: bold;
}  
`);
    expect(css).toMatchSnapshot();
  });

  it("invalid media queries are fixed", () => {
    const css = transformCss(`
@media not (min-width: 640px) {
  .rule {
    font-weight: bold;
  }  
}
`);
    expect(css).toMatchSnapshot();
  })
});