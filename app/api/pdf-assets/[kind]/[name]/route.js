import { readFile } from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
const allowed = {
  cmaps: ".bcmap",
  standard_fonts: ".pfb|.ttf",
  wasm: ".wasm|.js",
  iccs: ".icc",
  images: ".svg|.png",
};
export async function GET(request, { params }) {
  const { kind, name } = await params;
  if (
    !Object.hasOwn(allowed, kind) ||
    !/^[a-zA-Z0-9_.-]+$/.test(name) ||
    !allowed[kind].split("|").some((ext) => name.endsWith(ext))
  )
    return new Response("Not found", { status: 404 });
  try {
    const folder = kind === "images" ? "web/images" : kind;
    const bytes = await readFile(
      path.join(process.cwd(), "node_modules/pdfjs-dist", folder, name),
    );
    const type = name.endsWith(".wasm")
      ? "application/wasm"
      : name.endsWith(".svg")
        ? "image/svg+xml"
        : name.endsWith(".js")
          ? "text/javascript"
          : "application/octet-stream";
    return new Response(bytes, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
