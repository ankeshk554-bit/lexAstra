import { downloadBlob } from "./engine";
export async function exportAnnotatedPDF(document, annotations) {
  const { PDFDocument, PDFName, PDFArray, PDFHexString } =
    await import("pdf-lib");
  const bytes = await document.pdf.saveDocument();
  const pdf = await PDFDocument.load(bytes);
  for (const note of annotations) {
    const page = pdf.getPage(note.page - 1);
    if (!page || !note.rects.length) continue;
    const color = /^#[0-9a-f]{6}$/i.test(note.color) ? note.color : "#fde047";
    const components = [1, 3, 5].map(
      (i) => parseInt(color.slice(i, i + 2), 16) / 255,
    );
    for (const [x1, y1, x2, y2] of note.rects) {
      const annotation = pdf.context.obj({
        Type: "Annot",
        Subtype: "Highlight",
        Rect: [x1, y1, x2, y2],
        QuadPoints: [x1, y2, x2, y2, x1, y1, x2, y1],
        C: components,
        CA: 0.4,
        F: 4,
        Contents: PDFHexString.fromText(note.note || note.text),
        T: PDFHexString.fromText("LexAstra"),
      });
      const reference = pdf.context.register(annotation);
      let annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
      if (!annots) {
        annots = pdf.context.obj([]);
        page.node.set(PDFName.of("Annots"), annots);
      }
      annots.push(reference);
    }
  }
  downloadBlob(
    await pdf.save(),
    document.name.replace(/\.pdf$/i, "") + "-annotated.pdf",
    "application/pdf",
  );
}
export function exportNotes(document, study) {
  const body = {
    format: "lexastra-document-notes",
    version: 1,
    documentId: document.id,
    name: document.name,
    exportedAt: new Date().toISOString(),
    study,
  };
  downloadBlob(
    JSON.stringify(body, null, 2),
    document.name.replace(/\.pdf$/i, "") + "-notes.json",
    "application/json",
  );
}
export function exportMarkdown(document, study) {
  const text =
    `# Notes — ${document.name}\n\n` +
    study.annotations
      .map(
        (a) =>
          `## Page ${a.page}\n\n> ${a.text.replaceAll("\n", "\n> ")}\n\n${a.note || ""}\n`,
      )
      .join("\n");
  downloadBlob(
    text,
    document.name.replace(/\.pdf$/i, "") + "-notes.md",
    "text/markdown",
  );
}
