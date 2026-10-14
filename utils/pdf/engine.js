let enginePromise;
export function loadPDFEngine() {
  if (!enginePromise)
    enginePromise = import("pdfjs-dist/build/pdf.mjs")
      .then(async (pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = `/api/pdf-worker?v=${pdfjs.version}`;
        const viewer = await import("pdfjs-dist/web/pdf_viewer.mjs");
        return { pdfjs, ...viewer };
      })
      .catch((error) => {
        enginePromise = null;
        throw error;
      });
  return enginePromise;
}
export const documentOptions = (data) => ({
  data: data.slice(0),
  cMapUrl: "/api/pdf-assets/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "/api/pdf-assets/standard_fonts/",
  wasmUrl: "/api/pdf-assets/wasm/",
  iccUrl: "/api/pdf-assets/iccs/",
  isEvalSupported: false,
  enableXfa: true,
});
export function downloadBlob(data, name, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
