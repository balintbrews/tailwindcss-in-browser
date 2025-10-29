// @ts-ignore
import buildCss from "../tailwindcss-in-browser-dist/index.js";

const markup = `
        <div class="mx-auto hidden md:flex md:grid mt-2 font-serif text-lg text-red-400 bg-yellow-500 text-shadow-lg hover:underline"></div>
      `;

const css = `
        @import url("https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap");
        @theme {
          --font-serif: "Merriweather", serif;
          --text-lg: 3rem;
          --text-lg--line-height: 1;
        }
      `;
void buildCss(markup, css, {
  compileCssOptions: {
    addPreflight: false,
    unlayeredUtilities: ["block", "flex"],
  },
  transformCssOptions: { minify: false },
}).then(console.log);
