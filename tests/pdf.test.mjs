import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeStudy,
  readStudyBackup,
  rankPassages,
  contextForPages,
  validatePDFFile,
  clampPage,
} from "../utils/pdf/document.mjs";
import {
  documentPrompt,
  validateDocumentSources,
} from "../utils/pdf/aiContext.mjs";
test("saved state rejects invalid pages and coordinates while retaining valid work", () => {
  const annotation = {
    id: "note",
    text: "Offer",
    page: 2,
    rects: [[1, 2, 3, 4]],
  };
  const state = normalizeStudy(
    {
      page: 99,
      rotation: 17,
      scale: 900,
      bookmarks: [2, 2, 0, 7],
      annotations: [
        annotation,
        { ...annotation, page: 0 },
        { ...annotation, rects: [[NaN, 1, 2, 3]] },
      ],
    },
    5,
  );
  assert.equal(state.page, 5);
  assert.equal(state.rotation, 0);
  assert.equal(state.scale, "page-width");
  assert.deepEqual(state.bookmarks, [2]);
  assert.equal(state.annotations.length, 1);
  assert.equal(state.annotations[0].note, "");
  assert.equal(normalizeStudy(null).page, 1);
  assert.equal(clampPage("-2", 8), 1);
});
test("notes backups are tied to document contents", () => {
  const backup = JSON.stringify({
    format: "lexastra-document-notes",
    version: 1,
    documentId: "one",
    study: { annotations: [], bookmarks: [1] },
  });
  assert.equal(readStudyBackup(backup, "one", 8).bookmarks[0], 1);
  assert.throws(() => readStudyBackup(backup, "two", 8), /another document/);
  assert.throws(() => readStudyBackup("{}", "one", 8));
});
test("AI context ranks relevant excerpts and enforces a text budget", () => {
  const ranked = rankPassages(
    [
      { page: 1, text: "Procedural jurisdiction." },
      { page: 2, text: "Offer and acceptance. Acceptance requires assent." },
    ],
    "acceptance",
  );
  assert.equal(ranked[0].page, 2);
  assert.equal(ranked.length, 1);
  const sources = contextForPages(
    [
      { page: 1, text: "a".repeat(9000) },
      { page: 2, text: "b".repeat(9000) },
    ],
    7000,
  );
  assert.equal(sources[0].text.length, 6000);
  assert.equal(sources[1].text.length, 1000);
  assert.ok(validateDocumentSources(sources));
  assert.equal(validateDocumentSources([{ page: -1, text: "law" }]), false);
  assert.equal(
    validateDocumentSources([{ page: 1, text: "a".repeat(6001) }]),
    false,
  );
  assert.match(documentPrompt(sources, "summary"), /untrusted reference data/);
  assert.match(
    documentPrompt(sources, "summary"),
    /Do not claim to have read the entire PDF/,
  );
});
test("invalid and oversized local files are rejected before parsing", () => {
  assert.throws(() => validatePDFFile({ name: "empty.pdf", size: 0 }), /empty/);
  assert.throws(
    () => validatePDFFile({ name: "huge.pdf", size: 151 * 1024 * 1024 }),
    /150 MB/,
  );
  assert.throws(
    () => validatePDFFile({ name: "x.txt", size: 20 }),
    /Choose a PDF/,
  );
  assert.doesNotThrow(() => validatePDFFile({ name: "book.PDF", size: 10 }));
});

test("revision cards require valid content and supplied page sources", async () => {
  const { parseFlashcards } = await import("../utils/pdf/document.mjs");
  const card = {
    question: "What is assent?",
    answer: "Acceptance [Page 2]",
    page: 2,
  };
  assert.equal(parseFlashcards(JSON.stringify([card]), [2]).length, 1);
  assert.throws(
    () => parseFlashcards(JSON.stringify([card]), [1]),
    /invalid revision cards/,
  );
  assert.throws(() => parseFlashcards("[]", [1]));
  assert.throws(() =>
    parseFlashcards(JSON.stringify([{ ...card, answer: 9 }]), [2]),
  );
});
