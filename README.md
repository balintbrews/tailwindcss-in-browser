<h1><code style="font-weight: bold; font-size: 2rem;">tailwindcss-in-browser</code></h1>
<p>
  <a href="https://github.com/balintbrews/tailwindcss-in-browser/actions">
    <img src="https://github.com/balintbrews/tailwindcss-in-browser/actions/workflows/tests.yml/badge.svg" alt="Build status">
  </a>
</p>

A JavaScript library that enables you to build CSS directly in the browser using
[Tailwind CSS 4](https://tailwindcss.com/docs/v4-beta).

## Installation

```bash
npm install tailwindcss-in-browser
```

## Usage

```javascript
import buildCss from "tailwindcss-in-browser";

const markup =
  '<div class="text-2xl text-teal-600 font-semibold">Hello, world!</div>';

// Tailwind CSS 4 configuration via CSS.
const configurationCss = `
  @theme {
    --font-size-2xl: 1.75rem;
    --font-size-2xl--line-height: 2.25rem;
  }
`;

buildCss(markup, configurationCss, {
  compileCssOptions: { addPreflight: false }, // Optional. Defaults to `true`.
  transformCssOptions: { minify: false }, // Optional. Defaults to `true`.
}).then((css) => {
  // `css` contains the generated Tailwind CSS styles.
});
```

This library is available as an ES module and works with both module bundlers
and directly in browsers:

```html
<script type="module">
  import buildCss from "https://unpkg.com/tailwindcss-in-browser";

  // ...
</script>
```

## How it works

1. A function from Tailwind CSS 3 is used to extract class names from the
   markup. In Tailwind CSS 4, this is done by the Oxide engine, which is written
   in Rust, and requires a Node.js runtime.

2. Compiling the CSS using the extracted class names happens with Tailwind CSS
   4, supporting its
   [CSS-first configuration](https://tailwindcss.com/docs/v4-beta#css-first-configuration).

3. [Lightning CSS](https://lightningcss.dev) is used to transform the compiled
   CSS for browser compatibility, matching the implementation of Tailwind CSS 4,
   but using
   [`lightningcss-wasm`](https://www.npmjs.com/package/lightningcss-wasm), so it
   can run in the browser.

## API reference

### Main function

#### `buildCss()`

The primary function for generating Tailwind CSS styles. It extracts class names
from the markup, compiles them using Tailwind CSS 4, and transforms them with
Lightning CSS for browser compatibility.

| Parameter                     | Type                                          | Description                                                                                               |
| ----------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `markup`                      | `string`                                      | The HTML markup containing Tailwind classes.                                                              |
| `configurationCss`            | `string`                                      | CSS configuration for Tailwind CSS 4 (see [Tailwind CSS 4 configuration](#tailwind-css-4-configuration)). |
| `options`                     | `object`                                      | Optional configuration object.                                                                            |
| `options.compileCssOptions`   | [`CompileCssOptions`](#compileCssoptions)     | Options for CSS compilation.                                                                              |
| `options.transformCssOptions` | [`TransformCssOptions`](#transformCssoptions) | Options for CSS transformation.                                                                           |

**Returns**: `Promise<string>` - The compiled and transformed CSS.

By default,
[Tailwind CSS Preflight styles](https://tailwindcss.com/docs/preflight) are
included, and the output CSS is minified. You can customize these behaviors via
options. In case you need more granular control, you can use the utility
functions below. Calling them separately in the order below
(`extractClassNameCandidates()` → `compileCss()` → `transformCss()`) is
equivalent to calling `buildCss()`.

### Tailwind CSS 4 configuration

Tailwind CSS 4 uses a
[CSS-based configuration format](https://tailwindcss.com/docs/v4-beta#css-first-configuration).
Normally in this CSS file you would add `@import "tailwindcss"`, which imports
the following:

- the [`base`/`preflight` layer](https://tailwindcss.com/docs/preflight),
- the
  [default Tailwind CSS 4 theme](https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0-beta.1/packages/tailwindcss/theme.css);
- the `components` layer —yet to be implemented in Tailwind CSS 4—, and
- the `utilities` layer where the actual Tailwind CSS classes are defined.

When working with this library, all of the above is taken care of, so all you
need to do is add your theme customizations with a `@theme` directive. E.g.:

```css
@theme {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;

  /* Typography */
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* Spacing */
  --spacing-4: 1rem;
  --spacing-8: 2rem;
}
```

### Utility functions

#### `extractClassNameCandidates()`

Extracts Tailwind class names from markup.

| Parameter | Type     | Description             |
| --------- | -------- | ----------------------- |
| `markup`  | `string` | HTML markup to analyze. |

**Returns**: `string[]` - Array of extracted class names.

#### `compileCss()`

Compiles CSS using Tailwind CSS 4.

| Parameter             | Type                                      | Description                      |
| --------------------- | ----------------------------------------- | -------------------------------- |
| `classNameCandidates` | `string[]`                                | Array of class names to process. |
| `configurationCss`    | `string`                                  | Tailwind v4 configuration CSS.   |
| `options`             | [`CompileCssOptions`](#compileCssoptions) | Compilation options.             |

**Returns**: `Promise<string>` - Compiled CSS

#### `transformCss()`

Transforms CSS for browser compatibility.

| Parameter | Type                                          | Description             |
| --------- | --------------------------------------------- | ----------------------- |
| `css`     | `string`                                      | CSS to transform.       |
| `options` | [`TransformCssOptions`](#transformCssoptions) | Transformation options. |

**Returns**: `Promise<string>` - Transformed CSS

### Configuration options

#### `CompileCssOptions`

| Option         | Type      | Default | Description                                                                               |
| -------------- | --------- | ------- | ----------------------------------------------------------------------------------------- |
| `addPreflight` | `boolean` | `true`  | Whether to include [Tailwind's Preflight styles](https://tailwindcss.com/docs/preflight). |

#### `TransformCssOptions`

| Option   | Type      | Default | Description                       |
| -------- | --------- | ------- | --------------------------------- |
| `minify` | `boolean` | `true`  | Whether to minify the output CSS. |

## Credits

- The technical foundation for running Tailwind CSS 4 in the browser was
  demonstrated by [@dtinth](https://github.com/dtinth) in a
  [blog post](https://notes.dt.in.th/TailwindCSS4Alpha14Notes), which served as
  the basis for this implementation.
- This package was created with sponsorship from
  [Acquia](https://www.acquia.com/) through work on Drupal's
  [Experience Builder](https://www.drupal.org/project/experience_builder).
