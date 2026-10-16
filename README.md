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
Mouse drags can finish outside the viewport. Repeating the same highlight in the
same colour does not stack another mark; zoom and rotation clear pending text
selections to prevent misplaced highlights. Search-result markup is excluded
from saved highlight geometry.
Selected-text questions automatically attach the passage and its pages; the
attachment remains available for follow-ups until removed or replaced.
Automatic highlighting also updates this attachment. Each sent question keeps
its own expandable Question context, so a new selection is not confused with
the excerpts used for an older answer. Selections changed during generation are
labelled for the next question; they do not alter the answer already in progress.

Fullscreen in the toolbar (F) expands the whole reader, including AI and selection
controls. Browsers without the Fullscreen API use a full-window focus view;
Escape or Exit fullscreen restores the normal layout. The AI panel has a wider
default, a draggable/keyboard-adjustable divider on desktop, and an expand button.
Source options and study actions live in compact menus, selected-text previews
expand on demand, and answers do not pull you away from earlier content while
streaming. Use Latest answer to resume following the response.

Appearance in the toolbar offers Paper, Sepia, Sage and Night themes for the
reader, notes and AI panels. PDF page tone can be set independently to Original
colours, Warm paper or Night paper; use Original colours for colour-sensitive
images and diagrams. These display filters never change downloaded or printed
PDFs. AI answer text can be enlarged to 16 or 18 px. Appearance preferences are
remembered locally across documents and reloads, including fullscreen reading.

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
The default PDF + knowledge mode answers questions beyond the document, including
unrelated study topics, with outside knowledge labelled separately from
PDF-supported claims. The current mode takes precedence over earlier PDF-only
refusals in the conversation. PDF only restricts
answers to the supplied excerpts. No PDF context can be selected for general
questions, including when reading a scanned document. AI summaries and generated
revision cards always require PDF text. These modes do not provide live web search or
verification of current law.
The current question and its PDF attachment are delivered together in the final
user turn, after conversation history. Short requests such as "explain" refer
to that attachment. In PDF + knowledge mode, selecting just a concept, heading,
or case name is sufficient to request a broader explanation of that topic.
Answer depth defaults to Automatic: direct answers with reasoning, definitions,
examples and qualifications as needed. In depth and Brief options are available
in AI context and answer options. Retry retains the original mode, sources and
depth. PDF answers have a larger output allowance; provider length-limit endings
are marked incomplete so a truncated explanation is not presented as finished.
Document retrieval is keyword based, not exhaustive legal research. Image-only
pages need OCR in another tool before search or AI text analysis. This reader
does not provide OCR, signature verification, redaction, or PDF content editing.

`tests/pdf-reader.spec.js` covers encrypted/corrupt/image-only/rotated/120-page
PDFs, native search and links, persistence, exports, AI source/retry behavior,
mobile panels, and storage failure. Compact fixtures are checked in; regenerate
with `python tests/fixtures/generate.py` after installing `reportlab` and `pypdf`.
AI tests use mocked responses; production credentials and provider output must
be checked separately.
Route tests also inspect the actual upstream payload for source modes and
explanation instructions, using a mocked provider rather than a live API key.
