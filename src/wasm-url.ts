/**
 * Returns the last path segment of a URL, without query string or fragment.
 */
function getFileName(url: string): string {
  return new URL(url).pathname.split("/").pop() ?? "";
}

/**
 * Joins a base URL and a file name with exactly one slash between them.
 */
function joinUrl(baseUrl: string, fileName: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${fileName}`;
}

/**
 * Resolves the URL to load the Lightning CSS WASM binary from.
 *
 * @param defaultUrl - The default URL, as resolved (and possibly rewritten by
 *   a bundler) from `new URL(..., import.meta.url)`.
 * @param wasmBaseUrl - Optional base URL of the directory the binary is served
 *   from. Only the directory is replaced: the file name of `defaultUrl`
 *   (including any version or bundler hash) is kept.
 *
 * @returns The URL to load the WASM binary from.
 */
export default function resolveWasmUrl(
  defaultUrl: string,
  wasmBaseUrl?: string | URL,
): string {
  return wasmBaseUrl
    ? joinUrl(wasmBaseUrl.toString(), getFileName(defaultUrl))
    : defaultUrl;
}
