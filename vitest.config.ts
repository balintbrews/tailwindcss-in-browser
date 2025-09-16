import { defineConfig } from "vitest/config";

export default defineConfig({
  // Load CSS files as text during tests.
  plugins: [
    {
      name: "css-as-text",
      enforce: "pre",
      resolveId(id) {
        return id.endsWith(".css") ? `${id}?raw` : null;
      },
    },
  ],
  test: {
    css: { include: /.+/ },
  },
});
