declare module "tailwindcss-v3/lib/lib/defaultExtractor.js" {
  export interface DefaultExtractorOptions {
    tailwindConfig: {
      separator: string;
    };
  }

  export function defaultExtractor(
    options: DefaultExtractorOptions,
  ): (content: string) => string[];
}
