# LexAstra

An Indian law study workspace: searchable statutes and case summaries, exam
syllabus checklists, a local PDF library with annotations, and an AI assistant.

## Development

Use Node.js 22.13 or newer (Node 24 recommended), then:

```sh
npm ci
npm run dev
```

In this cloud environment, use `npm ci --cache /workspace/.npm-cache` if the
default npm cache is not writable. Use the existing checkout; a worktree is not
required. The PDF engine and worker are bundled locally and do not require a CDN.

## AI configuration

Set `DEEPSEEK_API_KEY` securely in the server environment or in an ignored
`.env.local`, then restart the server. You can also enter a personal key through
the assistant's API settings. Personal keys are stored on that browser; avoid
shared devices. Keys are excluded from workspace backups.

`DEEPSEEK_MODEL` optionally selects a model available to your account; the default
is the provider's `deepseek-chat` alias. The server needs HTTPS access to
`api.deepseek.com`. Statutes, cases, syllabus checklists and PDF reading work
without AI credentials. Live AI output requires a valid key and account credits.

## Checks

```sh
npm run lint
npm test
npm run build
node scripts/validateBareActs.js
```

Browser regressions cover search and case navigation, syllabus persistence,
chat stream completion and regeneration, PDF saving/rendering/search/highlights,
mobile navigation, and API input validation:

```sh
npx playwright install chromium
npm run test:e2e
```

If Chromium is already installed in the cloud machine:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

The browser tests start the development server when needed. AI responses are
mocked in those tests; they do not validate provider connectivity or answer
accuracy. `npm run start` serves a completed production build.

## Saved study work

Syllabus progress, conversations, and annotations are saved in this browser.
PDF documents are kept in IndexedDB. A local profile is an optional display name,
not authentication or cloud synchronisation. Browser storage can be cleared or
evicted. Workspace JSON backups include notes and progress, but not PDF binaries
or API credentials; keep copies of the original PDFs.

The library is a curated collection, not a complete or continuously updated legal
database. Use the displayed dates and verify legal text and citations against
official sources. Case detail pages contain study summaries, not full judgments.

## PDF workspace

The reader uses PDF.js's viewer, text/search, annotation, link, and rendering
components, with local worker, CMaps, standard fonts, image codecs, and colour
profiles. Rendering is bounded; thumbnails load near the visible sidebar area.
JavaScript embedded in PDFs is not executed. Files up to 150 MB can be opened.

Reader features include password prompts, precise search with next/previous
matches, outlines and internal links, thumbnails, rotation, zoom, a hand tool,
bookmarks, highlights, notes, and standard PDF form fields. Reading page, zoom,
rotation, form values, annotations, and document conversations are stored in
IndexedDB (including revision cards) under a SHA-256 content identifier. Different files with identical names
have separate study work. Legacy highlights and revision cards are migrated without deleting the
original copy. Storage failures are shown; the reader remains usable.

Select text to reveal actions beside the passage: Highlight, a choice of colours,
one-click Explain, and a field for asking a custom question. The optional note
field is under Add a note. For repeated highlights, enable Highlight in the
toolbar (or press H), then drag and release on each passage. H also highlights
an existing selection; Escape exits the tool. The latest highlight can be undone.
On touch screens, adjust native selection handles, then tap Highlight.
Selected-text questions automatically attach the passage and its pages; the
attachment remains available for follow-ups until removed or replaced.

Fullscreen in the toolbar (F) expands the whole reader, including AI and selection
controls. Browsers without the Fullscreen API use a full-window focus view;
Escape or Exit fullscreen restores the normal layout. The AI panel has a wider
default, a draggable/keyboard-adjustable divider on desktop, and an expand button.
Source options and study actions live in compact menus, selected-text previews
expand on demand, and answers do not pull you away from earlier content while
streaming. Use Latest answer to resume following the response.

Make revision card turns a selected passage into an editable question and answer
without an AI request. Cards can also be added manually from the Cards tab.
Review cards hides answers until revealed; Practice again returns a card to the
queue, while I remembered completes it. Ratings and review counts are saved
locally and included in document JSON backups. This is self-assessed recall
practice, not an automatic spaced-repetition schedule or a correctness check.

Use the reader's Export menu for a document-specific JSON backup or Markdown
notes. JSON backups can be imported into the same original PDF. This is separate
from the assistant's general workspace backup. The original PDF must be kept or
saved to the local library. Browser storage is not cloud sync and may be cleared.
The annotated-PDF export adds standard highlight annotations and preserves form
entries. It may be unavailable for encrypted documents. Exporting a modified PDF
does not preserve a digital signature's validity. The print action opens a PDF
in the browser's print-capable viewer; export an annotated copy to print notes.

Document AI can use selected text, the current page, or up to five relevant
excerpts retrieved from document text. It sends these excerpts and recent
conversation messages to the configured provider, not the PDF binary. Excerpts
are capped at 6,000 characters each and 22,000 characters total. Answers expose
the actual source excerpts and link citations to physical PDF page numbers.
The default PDF + knowledge mode allows broader legal explanations, with outside
knowledge labelled separately from PDF-supported claims. PDF only restricts
answers to the supplied excerpts. No PDF context can be selected for general
questions, including when reading a scanned document. AI summaries and generated
revision cards always require PDF text. These modes do not provide live web search or
verification of current law.
Document retrieval is keyword based, not exhaustive legal research. Image-only
pages need OCR in another tool before search or AI text analysis. This reader
does not provide OCR, signature verification, redaction, or PDF content editing.

`tests/pdf-reader.spec.js` covers encrypted/corrupt/image-only/rotated/120-page
PDFs, native search and links, persistence, exports, AI source/retry behavior,
mobile panels, and storage failure. Compact fixtures are checked in; regenerate
with `python tests/fixtures/generate.py` after installing `reportlab` and `pypdf`.
AI tests use mocked responses; production credentials and provider output must
be checked separately.
