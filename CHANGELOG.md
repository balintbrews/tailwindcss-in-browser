# Changelog

## [0.5.0](https://github.com/balintbrews/tailwindcss-in-browser/compare/tailwindcss-in-browser-v0.4.0...tailwindcss-in-browser-v0.5.0) (2025-10-31)


### Features

* **compile-css:** add option for unlayered utilities ([#20](https://github.com/balintbrews/tailwindcss-in-browser/issues/20)) ([11839de](https://github.com/balintbrews/tailwindcss-in-browser/commit/11839de0c9dff4a5e488302b276edeae6f94e6f7))

## [0.4.0](https://github.com/balintbrews/tailwindcss-in-browser/compare/tailwindcss-in-browser-v0.3.0...tailwindcss-in-browser-v0.4.0) (2025-09-23)


### Features

* add compilePartialCss function ([#18](https://github.com/balintbrews/tailwindcss-in-browser/issues/18)) ([05cb64b](https://github.com/balintbrews/tailwindcss-in-browser/commit/05cb64b70e14e168f88af6297c5d3a6df5caa8f9))
* **compileCss:** use standard css layers for base tailwind styles  ([#17](https://github.com/balintbrews/tailwindcss-in-browser/issues/17)) ([ba0c5eb](https://github.com/balintbrews/tailwindcss-in-browser/commit/ba0c5eb1cc273c81c376663709ffbcfcf76e2018))
* **packages:** update all; Tailwind 4.1.13, ESLint 9 ([d8b9e3f](https://github.com/balintbrews/tailwindcss-in-browser/commit/d8b9e3fe7d090fd574b6e57e6da9e98866c930ac))


### Bug Fixes

* **eslint:** ignore demo ([465a0f2](https://github.com/balintbrews/tailwindcss-in-browser/commit/465a0f295289070a1d802dd996c25a88f3e1b3c9))

## [0.3.0](https://github.com/balintbrews/tailwindcss-in-browser/compare/tailwindcss-in-browser-v0.2.0...tailwindcss-in-browser-v0.3.0) (2025-07-04)


### Features

* **compileCss:** support [@import](https://github.com/import) at-rules ([#14](https://github.com/balintbrews/tailwindcss-in-browser/issues/14)) ([38120fc](https://github.com/balintbrews/tailwindcss-in-browser/commit/38120fce10540e39957edcea81376b8031638e71))

## [0.2.0](https://github.com/balintbrews/tailwindcss-in-browser/compare/tailwindcss-in-browser-v0.1.3...tailwindcss-in-browser-v0.2.0) (2025-04-24)


### Features

* update to Tailwind 4.0.0 ([a4cdb2f](https://github.com/balintbrews/tailwindcss-in-browser/commit/a4cdb2f663b224aecda0e2ace4c9923e81635b54))
* update to Tailwind 4.1.4 ([d8bbb6d](https://github.com/balintbrews/tailwindcss-in-browser/commit/d8bbb6d44dc035bd48ae14527c69432ffb8149d1))


### Bug Fixes

* **demo:** add simple app with Vite ([d1de698](https://github.com/balintbrews/tailwindcss-in-browser/commit/d1de698ed2a344feb44721ec648e023f0b670c90))

## [0.1.3](https://github.com/balintbrews/tailwindcss-in-browser/compare/tailwindcss-in-browser-v0.1.2...tailwindcss-in-browser-v0.1.3) (2024-11-22)


### Bug Fixes

* correct esbuildOptions config for proper WASM file naming ([#11](https://github.com/balintbrews/tailwindcss-in-browser/issues/11)) ([5bbd953](https://github.com/balintbrews/tailwindcss-in-browser/commit/5bbd953bade8f6db6927abd086d04e1db9de3895))

## [0.1.2](https://github.com/balintbrews/tailwindcss-in-browser/compare/tailwindcss-in-browser-v0.1.1...tailwindcss-in-browser-v0.1.2) (2024-11-22)


### Bug Fixes

* ensure file from lightningcss-wasm is included in consumer bundles ([#9](https://github.com/balintbrews/tailwindcss-in-browser/issues/9)) ([217487c](https://github.com/balintbrews/tailwindcss-in-browser/commit/217487c1b20c741ef0f3d4ed12d2067c471b6f24))

## [0.1.1](https://github.com/balintbrews/tailwindcss-in-browser/compare/tailwindcss-in-browser-v0.1.0...tailwindcss-in-browser-v0.1.1) (2024-10-31)


### Bug Fixes

* optimize dependencies ([93a4539](https://github.com/balintbrews/tailwindcss-in-browser/commit/93a45391bdf0fa81bfd8c930c60d8bc0e6b3d82a))

## [0.1.0](https://github.com/balintbrews/tailwindcss-in-browser/compare/tailwindcss-in-browser-v0.0.1...tailwindcss-in-browser-v0.1.0) (2024-10-31)


### Features

* add base/preflight, improve APIs ([27b8e5c](https://github.com/balintbrews/tailwindcss-in-browser/commit/27b8e5c03bf0af6f0cdfed9517944d363a892c99))
* extract class names from markup, compile with css customizations ([ec26cec](https://github.com/balintbrews/tailwindcss-in-browser/commit/ec26cecc9617fa1381c60376a1fe8c7dcbb7000f))
* transform CSS with Lightning CSS ([38de718](https://github.com/balintbrews/tailwindcss-in-browser/commit/38de718fdb2f834d3d94a42801c3c6fb70a9ed9a))
