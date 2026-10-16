// Keep Node's route tests compatible with the repository's Node 22.13 minimum.
export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const file =
      specifier.slice(2) + (/\.(js|mjs)$/.test(specifier) ? "" : ".js");
    return next(new URL(`../../${file}`, import.meta.url).href, context);
  }
  return next(specifier, context);
}
