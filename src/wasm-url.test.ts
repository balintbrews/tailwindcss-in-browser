import { describe, expect, it } from "vitest";
import resolveWasmUrl from "./wasm-url.js";

const defaultUrl = "http://localhost/assets/lightningcss_node-1.30.1.wasm";

describe("resolveWasmUrl", () => {
  it("returns the default URL when no base URL is given", () => {
    expect(resolveWasmUrl(defaultUrl)).toBe(defaultUrl);
  });

  it("returns the default URL when the base URL is an empty string", () => {
    expect(resolveWasmUrl(defaultUrl, "")).toBe(defaultUrl);
  });

  it("appends the default file name to a base URL without a trailing slash", () => {
    expect(resolveWasmUrl(defaultUrl, "/modules/canvas/ui/dist/assets")).toBe(
      "/modules/canvas/ui/dist/assets/lightningcss_node-1.30.1.wasm",
    );
  });

  it.each(["/dist/assets/", "/dist/assets//"])(
    "joins %s with exactly one slash",
    (wasmBaseUrl) => {
      expect(resolveWasmUrl(defaultUrl, wasmBaseUrl)).toBe(
        "/dist/assets/lightningcss_node-1.30.1.wasm",
      );
    },
  );

  it("keeps an absolute base URL", () => {
    expect(resolveWasmUrl(defaultUrl, "https://cdn.example.com/x")).toBe(
      "https://cdn.example.com/x/lightningcss_node-1.30.1.wasm",
    );
  });

  it("accepts a URL object as the base URL", () => {
    expect(
      resolveWasmUrl(defaultUrl, new URL("https://cdn.example.com/x/")),
    ).toBe("https://cdn.example.com/x/lightningcss_node-1.30.1.wasm");
  });

  it("keeps a hash added to the file name by a bundler", () => {
    expect(
      resolveWasmUrl(
        "http://localhost/assets/lightningcss_node-1.30.1-AbC123.wasm",
        "/dist/assets",
      ),
    ).toBe("/dist/assets/lightningcss_node-1.30.1-AbC123.wasm");
  });

  it("drops the query string and fragment of the default URL", () => {
    expect(
      resolveWasmUrl(
        "http://localhost/assets/lightningcss_node-1.30.1.wasm?v=1#x",
        "/dist/assets",
      ),
    ).toBe("/dist/assets/lightningcss_node-1.30.1.wasm");
  });
});
