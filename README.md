<h1><code style="font-weight: bold; font-size: 2rem;">tailwind-browser</code></h1>
<p>
  <a href="https://github.com/balintbrews/tailwind-browser/actions">
    <img src="https://github.com/balintbrews/tailwind-browser/actions/workflows/tests.yml/badge.svg" alt="Build status">
  </a>
</p>

A lightweight JavaScript library that enables Tailwind CSS 4 to run directly in
the browser.

## Usage

```javascript
import generateCss from "tailwind-browser";

const markup =
  '<div class="text-2xl font-semibold text-teal-600">Hello, world!</div>';

// The CSS that acts as the Tailwind CSS 4 configuration.
// @see https://github.com/tailwindlabs/tailwindcss/blob/next/packages/tailwindcss/theme.css
const css =
  "@theme { --font-size-2xl: 1.75rem; --font-size-2xl--line-height: 2.25rem; }";

generateCss({ markup, css }).then((generatedCss) => {
  // `generatedCss` is a string of CSS produced by Tailwind CSS 4 on-the-fly.
});
```

## Remaining work

- [ ] Transpile the generated CSS;
- [ ] Add base/preflight CSS;
- [ ] Improve README;
- [ ] Create and deploy basic demo page;
- [ ] Publish to npm.
