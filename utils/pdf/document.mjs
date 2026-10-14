export const MAX_FILE_SIZE = 150 * 1024 * 1024;
export function validatePDFFile(file) {
  if (!file || (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf"))
    throw new Error("Choose a PDF file.");
  if (!file.size) throw new Error("This file is empty. Choose another PDF.");
  if (file.size > MAX_FILE_SIZE)
    throw new Error(
      "This PDF exceeds the 150 MB limit. Split or compress it before opening.",
    );
}
export const clampPage = (page, count) =>
  Math.max(1, Math.min(count, Math.trunc(Number(page)) || 1));
export function normalizeStudy(value = {}, count = Infinity) {
  value = value && typeof value === "object" ? value : {};
  return {
    version: 1,
    annotations: Array.isArray(value.annotations)
      ? value.annotations
          .filter(
            (a) =>
              a &&
              typeof a.id === "string" &&
              typeof a.text === "string" &&
              Number.isInteger(a.page) &&
              a.page > 0 &&
              a.page <= count &&
              Array.isArray(a.rects) &&
              a.rects.every(
                (r) =>
                  Array.isArray(r) &&
                  r.length === 4 &&
                  r.every(Number.isFinite),
              ),
          )
          .map((a) => ({
            ...a,
            color: /^#[0-9a-f]{6}$/i.test(a.color) ? a.color : "#fde047",
            note: typeof a.note === "string" ? a.note : "",
          }))
      : [],
    bookmarks: Array.isArray(value.bookmarks)
      ? [
          ...new Set(
            value.bookmarks.filter(
              (p) => Number.isInteger(p) && p > 0 && p <= count,
            ),
          ),
        ].sort((a, b) => a - b)
      : [],
    messages: Array.isArray(value.messages)
      ? value.messages
          .filter(
            (m) =>
              m &&
              typeof m.id === "string" &&
              ["user", "assistant"].includes(m.role) &&
              typeof m.content === "string",
          )
          .slice(-80)
      : [],
    cards: Array.isArray(value.cards)
      ? value.cards
          .filter(
            (c) =>
              c &&
              typeof c.id === "string" &&
              typeof c.question === "string" &&
              typeof c.answer === "string",
          )
          .map((c) => ({
            ...c,
            page:
              Number.isInteger(c.page) && c.page > 0 && c.page <= count
                ? c.page
                : null,
          }))
      : [],
    page: clampPage(value.page, count),
    rotation: [0, 90, 180, 270].includes(value.rotation) ? value.rotation : 0,
    scale:
      typeof value.scale === "number" && value.scale >= 0.25 && value.scale <= 4
        ? value.scale
        : ["page-width", "page-fit", "auto"].includes(value.scale)
          ? value.scale
          : "page-width",
    forms:
      value.forms &&
      typeof value.forms === "object" &&
      !Array.isArray(value.forms)
        ? value.forms
        : {},
  };
}
export function readStudyBackup(text, documentId, count) {
  const value = JSON.parse(text);
  if (
    !value ||
    value.format !== "lexastra-document-notes" ||
    value.version !== 1 ||
    value.documentId !== documentId
  )
    throw new Error(
      "This backup belongs to another document or uses an unsupported format.",
    );
  if (
    !value.study ||
    !Array.isArray(value.study.annotations) ||
    !Array.isArray(value.study.bookmarks)
  )
    throw new Error("The notes backup is incomplete.");
  return normalizeStudy(value.study, count);
}
export function extractText(items) {
  return items
    .map((item) =>
      typeof item.str === "string" ? item.str + (item.hasEOL ? "\n" : " ") : "",
    )
    .join("")
    .trim();
}
const words = (text) =>
  (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(
    (word) => word.length > 2,
  );
export function rankPassages(pages, query, limit = 5) {
  const stopWords = new Set(
    "the and that this with from what which where when how explain summarize please does about are was were for can could would should".split(
      " ",
    ),
  );
  const terms = [
    ...new Set(words(query).filter((word) => !stopWords.has(word))),
  ].slice(0, 64);
  return pages
    .filter((p) => p.text.trim())
    .map((p) => {
      const lower = p.text.toLowerCase();
      let score = 0;
      const counts = new Map();
      for (const word of words(p.text))
        counts.set(word, (counts.get(word) || 0) + 1);
      for (const term of terms) {
        const hits = counts.get(term) || 0;
        score += Math.min(hits, 8);
      }
      if (query.trim() && lower.includes(query.trim().toLowerCase()))
        score += 15;
      const firstTerm = terms.find((term) => lower.includes(term));
      const start = firstTerm ? Math.max(0, lower.indexOf(firstTerm) - 700) : 0;
      return { page: p.page, text: p.text.slice(start, start + 6000), score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || a.page - b.page)
    .slice(0, limit);
}
export function contextForPages(pages, budget = 22000) {
  const result = [];
  let remaining = budget;
  for (const p of pages) {
    if (remaining <= 0) break;
    const text = p.text.trim().slice(0, Math.min(6000, remaining));
    if (text) {
      result.push({ page: p.page, text });
      remaining -= text.length;
    }
  }
  return result;
}

export function parseFlashcards(text, pages) {
  const cards = JSON.parse(
    text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, ""),
  );
  if (
    !Array.isArray(cards) ||
    cards.length < 1 ||
    cards.length > 20 ||
    !cards.every(
      (c) =>
        c &&
        typeof c.question === "string" &&
        c.question.trim() &&
        c.question.length <= 2000 &&
        typeof c.answer === "string" &&
        c.answer.trim() &&
        c.answer.length <= 4000 &&
        pages.includes(c.page),
    )
  )
    throw new Error(
      "The AI returned invalid revision cards. Retry to generate cards with valid page sources.",
    );
  return cards;
}
