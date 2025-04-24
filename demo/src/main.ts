import buildCss from "../tailwindcss-in-browser-dist/index.js";

const markup = `
        <div class="mx-auto flex md:grid mt-2 text-lg text-red-400 bg-yellow-500 text-shadow-lg hover:underline"></div>
      `;

const css = `
        @theme {
          --text-lg: 3rem;
          --text-lg--line-height: 1;
        }
      `;
buildCss(markup, css, {
  compileCssOptions: { addPreflight: false },
  transformCssOptions: { minify: false },
}).then(console.log); // eslint-disable-line no-console
