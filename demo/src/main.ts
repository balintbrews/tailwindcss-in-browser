import buildCss from "../tailwindcss-in-browser-dist/index.js";

const markup = `
        <div class="mx-auto flex md:grid mt-2 text-lg text-shadow-lg hover:underline dark:bg-black"></div>
      `;

const css = `
        @theme {
          --color-*: initial;
          --color-black: #000;
          --breakpoint-md: 768px;
          --font-size-lg: 24px;
        }
      `;
buildCss(markup, css, {
  compileCssOptions: { addPreflight: false },
  transformCssOptions: { minify: false },
}).then(console.log);
