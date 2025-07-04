import { generate, parse, walk } from "css-tree";

export default function extractImports(cssString: string): {
  cssWithoutImports: string;
  importRules: string;
} {
  const ast = parse(cssString);
  const importRules: string[] = [];

  walk(ast, (node, item, list) => {
    if (node.type === "Atrule" && node.name === "import") {
      let importRule = generate(node);
      // Add quotes to URLs. `css-tree` normalizes the CSS it generates, and
      // omits the quotes as that's still valid CSS. However, Tailwind's CSS
      // parser would try to interpret the unquoted URL, so we need to add them
      // back.
      importRule = importRule.replace(/url\(([^)'"]+)\)/g, 'url("$1")');
      importRules.push(importRule);
      list.remove(item);
    }
  });

  return {
    cssWithoutImports: generate(ast),
    importRules: importRules.join("\n"),
  };
}
