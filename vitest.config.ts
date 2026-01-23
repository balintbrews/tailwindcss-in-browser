import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "inject-import-map-for-plugin-directive-tests",
      transformIndexHtml: {
        order: "pre",
        handler() {
          return [
            {
              tag: "script",
              attrs: { type: "importmap" },
              children: JSON.stringify({
                imports: {
                  "@tailwindcss/typography":
                    "https://esm.sh/@tailwindcss/typography",
                },
              }),
              injectTo: "head-prepend",
            },
          ];
        },
      },
    },
  ],
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
});
