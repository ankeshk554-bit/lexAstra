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
