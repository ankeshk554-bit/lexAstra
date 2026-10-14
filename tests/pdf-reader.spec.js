import { test, expect } from "@playwright/test";
import path from "node:path";
const fixture = (name) => path.resolve("tests/fixtures", name);
async function open(page, name = "study.pdf") {
  await page.goto("/pdf-reader");
  await page
    .getByRole("button", { name: "Open a PDF", exact: false })
    .waitFor();
  await page.locator('input[accept=".pdf"]').setInputFiles(fixture(name));
  if (name !== "locked.pdf" && name !== "broken.pdf")
    await expect(page.locator(".reader-status")).toContainText("Page 1", {
      timeout: 30000,
    });
}
async function select(page, text = "An offer") {
  const span = page
    .locator('.page[data-page-number="1"] .textLayer span')
    .filter({ hasText: text })
    .first();
  await expect(span).toBeVisible();
  await span.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });
}
async function go(page, number) {
  await page
    .getByRole("textbox", { name: "Page number", exact: true })
    .fill(String(number));
  await page
    .getByRole("textbox", { name: "Page number", exact: true })
    .press("Enter");
  await expect(page.locator(".reader-status")).toContainText(
    `Page ${number} of`,
  );
}

test("native navigation, individual search matches, rotation and internal links work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await expect(
    page.locator('.page[data-page-number="1"] .textLayer'),
  ).toContainText("offer requires");
  await page.locator('.page[data-page-number="1"] .annotationLayer a').click();
  await expect(page.locator(".reader-status")).toContainText("Page 3 of 8");
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: "Chapter 5", exact: true }).click();
  await expect(page.locator(".reader-status")).toContainText("Page 5 of 8");
  await page.getByRole("button", { name: "Close document sidebar" }).click();
  await go(page, 1);
  await page.getByRole("button", { name: "Find in document (Ctrl+F)" }).click();
  await page
    .getByRole("searchbox", { name: "Search document" })
    .fill("acceptance");
  await expect(page.locator(".reader-find [role=status]")).toHaveText(
    "1 of 16",
  );
  await page.getByRole("button", { name: "Next match", exact: true }).click();
  await expect(page.locator(".reader-find [role=status]")).toHaveText(
    "2 of 16",
  );
  await page.getByRole("button", { name: "Next match", exact: true }).click();
  await expect(page.locator(".reader-find [role=status]")).toHaveText(
    "3 of 16",
  );
  await expect(page.locator(".reader-status")).toContainText("Page 2 of");
  await page.getByRole("button", { name: "Close search" }).click();
  await page.getByRole("button", { name: "Rotate clockwise" }).click();
  await expect(page.locator(".reader-status")).toContainText("90°");
  await page
    .getByRole("combobox", { name: "Zoom", exact: true })
    .selectOption("page-fit");
  await expect(
    page.locator('.page[data-page-number="2"] canvas').first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("notes, form entries, bookmarks and position survive reload; annotated export is valid", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Save PDF", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "PDF saved", exact: true }),
  ).toBeVisible();
  await page.locator('.annotationLayer input[name="student"]').fill("Asha");
  await select(page);
  await page
    .getByRole("textbox", { name: "Note for selection" })
    .fill("Offer + assent");
  await page.getByRole("button", { name: "Highlight yellow" }).click();
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
  const alignment = await page.evaluate(() => {
    const span = [
      ...document.querySelectorAll(
        '.page[data-page-number="1"] .textLayer span',
      ),
    ].find((el) => el.textContent.startsWith("An offer"));
    const text = span.getBoundingClientRect();
    const highlight = document
      .querySelector(".reader-highlight")
      .getBoundingClientRect();
    return Math.max(
      Math.abs(text.x - highlight.x),
      Math.abs(text.y - highlight.y),
      Math.abs(text.width - highlight.width),
      Math.abs(text.height - highlight.height),
    );
  });
  expect(alignment).toBeLessThan(3);
  await page.getByRole("button", { name: "Rotate clockwise" }).click();
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
  await page
    .getByRole("combobox", { name: "Zoom", exact: true })
    .selectOption("1");
  await go(page, 4);
  await page
    .getByRole("button", { name: "Bookmark this page", exact: true })
    .click();
  await expect(page.locator(".reader-document-name [role=status]")).toHaveText(
    "Notes saved on this device",
  );
  await page.reload();
  await page.locator(".reader-book").getByRole("button").first().click();
  await expect(page.locator(".reader-status")).toContainText("Page 4 of 8");
  await expect(page.locator(".reader-status")).toContainText("100%");
  await expect(page.locator(".reader-status")).toContainText("90°");
  await expect(
    page.getByRole("button", { name: "Remove bookmark", exact: true }),
  ).toBeVisible();
  await go(page, 1);
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
  await expect(
    page.locator('.annotationLayer input[name="student"]'),
  ).toHaveValue("Asha");
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: "Notes 1", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Note on page 1" }),
  ).toHaveValue("Offer + assent");
  await page.locator(".reader-export summary").click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download annotated PDF", exact: true })
    .click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("study-annotated.pdf");
  const { PDFDocument, PDFName } = await import("pdf-lib");
  const fs = await import("node:fs/promises");
  const exported = await PDFDocument.load(await fs.readFile(await file.path()));
  const annots = exported.getPage(0).node.lookup(PDFName.of("Annots"));
  expect(annots.size()).toBeGreaterThan(2);
});

test("password errors, cancellation and corrupt imports recover without losing the open PDF", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page, "locked.pdf");
  await expect(page.getByRole("heading", { name: "Unlock PDF" })).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(
    page.getByText("That password was incorrect. Try again."),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("reader-test");
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(page.locator(".textLayer").first()).toContainText("Chapter 1");
  await page
    .locator('input[accept=".pdf"]')
    .setInputFiles(fixture("broken.pdf"));
  await expect(page.locator(".reader-app [role=alert]")).toContainText(
    "damaged",
  );
  await expect(page.locator(".reader-document-name strong")).toHaveText(
    "locked.pdf",
  );
  await page
    .locator('input[accept=".pdf"]')
    .setInputFiles(fixture("locked-other.pdf"));
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await go(page, 3);
  expect(errors).toEqual([]);
});

test("AI uses explicit sources, supports retry without duplicate questions and page citations", async ({
  page,
}) => {
  const requests = [];
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1)
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Service temporarily unavailable." }),
      });
    return route.fulfill({
      contentType: "text/event-stream",
      body:
        "data: " +
        JSON.stringify({
          choices: [
            { delta: { content: "Acceptance forms agreement [Page 2]." } },
          ],
        }),
    });
  });
  await open(page);
  await go(page, 2);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .querySelector('.page[data-page-number="2"]')
            .getBoundingClientRect().width <=
          document.querySelector(".reader-viewport").clientWidth,
      ),
    )
    .toBe(true);
  await page
    .getByRole("textbox", { name: "Ask about this PDF" })
    .fill("Explain acceptance");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect(page.locator(".reader-ai-error")).toContainText(
    "temporarily unavailable",
  );
  await page.getByRole("button", { name: "Retry last request" }).click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "Acceptance forms agreement",
  );
  expect(requests).toHaveLength(2);
  expect(requests[1].messages.filter((m) => m.role === "user")).toHaveLength(1);
  expect(requests[1].documentSources).toHaveLength(1);
  expect(requests[1].documentSources[0].page).toBe(2);
  expect(requests[1].documentSources[0].text).toContain("consideration");
  await go(page, 5);
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(page.locator(".reader-status")).toContainText("Page 2 of");
});

test("image-only PDFs stay readable and do not send invented AI context", async ({
  page,
}) => {
  let calls = 0;
  await page.route("**/api/chat", (route) => {
    calls++;
    return route.abort();
  });
  await open(page, "scanned.pdf");
  await expect(page.locator(".page canvas").first()).toBeVisible();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await page.getByRole("button", { name: "Summarize", exact: true }).click();
  await expect(page.locator(".reader-ai-error")).toContainText("OCR is needed");
  expect(calls).toBe(0);
});

test("long and rotated PDFs navigate without retaining a canvas for every page", async ({
  page,
}) => {
  await open(page, "long.pdf");
  await go(page, 120);
  await expect(
    page.locator('.page[data-page-number="120"] .textLayer'),
  ).toContainText("Long document page 120");
  expect(await page.locator(".page canvas").count()).toBeLessThan(15);
  await page
    .locator('input[accept=".pdf"]')
    .setInputFiles(fixture("mixed.pdf"));
  await go(page, 2);
  await expect(
    page.locator('.page[data-page-number="2"] .textLayer'),
  ).toContainText("Chapter 2");
  const size = await page.locator('.page[data-page-number="2"]').boundingBox();
  expect(size.width).toBeGreaterThan(size.height);
});

test("mobile reader controls and AI fit the screen with usable document scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await expect(page.locator(".reader-viewport")).toBeVisible();
  await go(page, 8);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Ask about this PDF" }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Close AI panel" }).click();
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: "Pages", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Go to page 1", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Go to page 1", exact: true }).click();
  await expect(page.locator(".reader-sidebar")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("blocked storage reports unsaved notes and still allows PDF reading", async ({
  page,
}) => {
  await page.addInitScript(() => {
    IDBFactory.prototype.open = () => {
      throw new DOMException("Denied", "SecurityError");
    };
  });
  await open(page);
  await select(page);
  await page.getByRole("button", { name: "Highlight yellow" }).click();
  await expect(page.locator(".reader-document-name [role=status]")).toHaveText(
    "Not saved · export a backup",
  );
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
});

test("same filenames keep separate notes and backups cannot be applied to another document", async ({
  page,
}) => {
  const fs = await import("node:fs/promises");
  await open(page);
  await select(page);
  await page.getByRole("button", { name: "Highlight yellow" }).click();
  await page.locator(".reader-export summary").click();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Back up notes & bookmarks (.json)",
      exact: true,
    })
    .click();
  const backup = await downloaded;
  await page.locator('input[accept=".pdf"]').setInputFiles({
    name: "study.pdf",
    mimeType: "application/pdf",
    buffer: await fs.readFile(fixture("mixed.pdf")),
  });
  await expect(page.locator(".reader-highlight")).toHaveCount(0);
  await page
    .locator('input[accept=".json"]')
    .setInputFiles(await backup.path());
  await expect(page.locator(".reader-app [role=alert]")).toContainText(
    "another document",
  );
  await page
    .locator('input[accept=".pdf"]')
    .setInputFiles(fixture("study.pdf"));
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
});

test("source payloads and PDF asset paths are validated on the server", async ({
  request,
}) => {
  const messages = [{ role: "user", content: "Explain this" }];
  expect(
    (
      await request.post("/api/chat", { data: { messages, task: "document" } })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/chat", {
        data: { messages, documentSources: [{ page: 0, text: "Bad page" }] },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/chat", {
        data: {
          messages,
          documentSources: [{ page: 1, text: "a".repeat(6001) }],
        },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.get("/api/pdf-assets/standard_fonts/FoxitSerif.pfb")
    ).status(),
  ).toBe(200);
  expect(
    (await request.get("/api/pdf-assets/wasm/openjpeg.wasm")).status(),
  ).toBe(200);
  expect(
    (await request.get("/api/pdf-assets/invalid/anything.js")).status(),
  ).toBe(404);
});

test("AI revision cards are validated, saved, and available for practice", async ({
  page,
}) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      contentType: "text/event-stream",
      body:
        "data: " +
        JSON.stringify({
          choices: [
            {
              delta: {
                content: JSON.stringify([
                  {
                    question: "What completes an agreement?",
                    answer: "Acceptance of an offer. [Page 1]",
                    page: 1,
                  },
                ]),
              },
            },
          ],
        }),
    }),
  );
  await open(page);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await page
    .getByRole("button", { name: "Revision cards", exact: true })
    .click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "Created 1 revision cards",
  );
  await page.getByRole("button", { name: "Close AI panel" }).click();
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await page.locator(".reader-card summary").click();
  await expect(page.locator(".reader-card")).toContainText(
    "Acceptance of an offer",
  );
  await page.getByRole("button", { name: "Back to library" }).click();
  await page
    .locator('input[accept=".pdf"]')
    .setInputFiles(fixture("study.pdf"));
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await expect(page.locator(".reader-card")).toContainText(
    "What completes an agreement?",
  );
});

test("AI generation can be stopped and the next document starts with its own conversation", async ({
  page,
}) => {
  let release,
    requested = false;
  await page.route("**/api/chat", async (route) => {
    requested = true;
    await new Promise((resolve) => {
      release = resolve;
    });
    await route
      .fulfill({
        contentType: "text/event-stream",
        body:
          "data: " +
          JSON.stringify({ choices: [{ delta: { content: "Late answer" } }] }),
      })
      .catch(() => {});
  });
  await open(page);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Ask about this PDF" })
    .fill("Explain acceptance");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect.poll(() => requested).toBe(true);
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.locator(".reader-ai-error")).toContainText(
    "Generation stopped",
  );
  release();
  await page
    .locator('input[accept=".pdf"]')
    .setInputFiles(fixture("mixed.pdf"));
  await expect(page.locator(".reader-document-name strong")).toHaveText(
    "mixed.pdf",
  );
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.locator(".reader-message")).toHaveCount(0);
  await expect(page.locator(".reader-ai-intro")).toBeVisible();
});
