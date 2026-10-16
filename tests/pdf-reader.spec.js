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
async function dragText(page, text = "An offer") {
  const span = page
    .locator('.page[data-page-number="1"] .textLayer span')
    .filter({ hasText: text })
    .first();
  await expect(span).toBeVisible();
  const box = await span.boundingBox();
  await page.mouse.move(box.x + 1, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 1, box.y + box.height / 2, {
    steps: 12,
  });
  return page.evaluate(() => window.getSelection().toString().trim());
}
async function mockAnswers(page, requests) {
  await page.route("**/api/chat", (route) => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({
      contentType: "text/event-stream",
      body:
        "data: " +
        JSON.stringify({
          choices: [{ delta: { content: "A helpful explanation." } }],
        }),
    });
  });
}

async function aiOptions(page) {
  const button = page.getByRole("button", {
    name: "AI context and answer options",
  });
  if ((await button.getAttribute("aria-expanded")) !== "true")
    await button.click();
}
async function studyTool(page, name) {
  const menu = page.locator(".reader-study-tools");
  if ((await menu.getAttribute("open")) === null)
    await menu.locator("summary").click();
  await menu.getByRole("button", { name, exact: true }).click();
}

test("highlighter waits for drag release, keeps its colour and supports undo and keyboard exit", async ({
  page,
}) => {
  await open(page);
  const tool = page.getByRole("button", {
    name: "Highlight as you select (H)",
    exact: true,
  });
  await tool.click();
  await page
    .getByRole("combobox", { name: "Highlighter color" })
    .selectOption("#86efac");
  const selected = await dragText(page);
  expect(selected).toContain("offer");
  // Holding a drag must never save a partial highlight from selectionchange.
  await page.waitForTimeout(350);
  await expect(page.locator(".reader-highlight")).toHaveCount(0);
  await page.mouse.up();
  await expect(page.locator(".reader-highlight")).toHaveCount(1);
  await expect(page.locator(".reader-highlight")).toHaveCSS(
    "background-color",
    "rgb(134, 239, 172)",
  );
  await expect(tool).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Undo highlight" }).click();
  await expect(page.locator(".reader-highlight")).toHaveCount(0);
  await dragText(page);
  await page.mouse.up();
  await expect(page.locator(".reader-highlight")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(tool).toHaveAttribute("aria-pressed", "false");
  await dragText(page, "Chapter 1");
  await page.mouse.up();
  await expect(
    page.getByRole("region", { name: "Selected text actions" }),
  ).toBeVisible();
  await page.keyboard.press("h");
  await expect(page.locator(".reader-highlight")).toHaveCount(2);
  await expect(
    page.getByRole("region", { name: "Selected text actions" }),
  ).toHaveCount(0);
});

test("a question beside real selected text sends its passage and retains it for follow-ups", async ({
  page,
}) => {
  const requests = [];
  await mockAnswers(page, requests);
  await open(page);
  const text = await dragText(page);
  await page.mouse.up();
  const popup = page.getByRole("region", { name: "Selected text actions" });
  await expect(popup).toBeInViewport();
  const box = await popup.boundingBox();
  const line = await page
    .locator('.page[data-page-number="1"] .textLayer span')
    .filter({ hasText: "An offer" })
    .first()
    .boundingBox();
  expect(Math.abs(box.y - line.y)).toBeLessThan(100);
  await page
    .getByRole("textbox", { name: "Ask about selected text", exact: true })
    .fill("How would this apply to an online offer?");
  await page
    .getByRole("button", { name: "Send selected text question" })
    .click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "helpful explanation",
  );
  expect(requests).toHaveLength(1);
  expect(requests[0].documentSources).toEqual([{ page: 1, text }]);
  expect(requests[0].answerMode).toBe("extended");
  expect(requests[0].messages.at(-1).content).toBe(
    "How would this apply to an online offer?",
  );
  await expect(popup).toHaveCount(0);
  await expect(page.locator(".reader-ai-attachment")).toContainText(text);
  await go(page, 4);
  await page
    .getByRole("textbox", { name: "Ask about this PDF" })
    .fill("Give a contrasting example");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect(page.locator(".reader-message--assistant")).toHaveCount(2);
  expect(requests[1].documentSources).toEqual(requests[0].documentSources);
  await page
    .getByRole("button", { name: "Remove selected text from question" })
    .click();
  await expect(
    page.getByRole("button", { name: "AI context and answer options" }),
  ).toContainText("Page 4");
});

test("mobile selection can be adjusted before highlighting and Explain sends it in one tap", async ({
  page,
}) => {
  const requests = [];
  await mockAnswers(page, requests);
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page
    .getByRole("button", { name: "Highlight as you select (H)", exact: true })
    .click();
  await page.locator(".reader-viewport").evaluate((el) => {
    el.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" }),
    );
  });
  await select(page);
  await expect(page.locator(".reader-highlight")).toHaveCount(0);
  const popup = page.getByRole("region", { name: "Selected text actions" });
  await expect(popup).toBeInViewport();
  await popup.getByRole("button", { name: "Highlight", exact: true }).click();
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Highlight as you select (H)", exact: true })
    .click();
  await select(page);
  await popup.getByRole("button", { name: "Explain", exact: true }).click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "helpful explanation",
  );
  expect(requests).toHaveLength(1);
  expect(requests[0].documentSources[0].text).toContain("An offer");
  expect(requests[0].messages.at(-1).content).toContain(
    "Explain this selected passage",
  );
  await expect(
    page.getByRole("textbox", { name: "Ask about this PDF" }),
  ).toBeInViewport();
  await expect(page.locator(".reader-ai-attachment")).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 500 });
  await expect(
    page.getByRole("textbox", { name: "Ask about this PDF" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Close AI panel" }),
  ).toBeInViewport();
});

test("AI can answer beyond scanned pages but PDF-only questions and summaries require text", async ({
  page,
}) => {
  const requests = [];
  await mockAnswers(page, requests);
  await open(page, "scanned.pdf");
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Ask about this PDF" })
    .fill("What is promissory estoppel?");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "helpful explanation",
  );
  expect(requests[0].documentSources).toEqual([]);
  expect(requests[0].answerMode).toBe("extended");
  await expect(page.locator(".reader-answer-label")).toHaveText(
    "General knowledge · no PDF text used",
  );
  await aiOptions(page);
  await page.getByRole("combobox", { name: "AI source" }).selectOption("none");
  await aiOptions(page);
  await page.getByRole("button", { name: "PDF only", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "AI source" })).toHaveValue(
    "page",
  );
  await page
    .getByRole("textbox", { name: "Ask about this PDF" })
    .fill("Quote the rule on this page");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect(page.locator(".reader-ai-error")).toContainText("OCR is needed");
  expect(requests).toHaveLength(1);
  await expect(
    page.getByRole("button", { name: "Retry last request" }),
  ).toHaveCount(0);
  await aiOptions(page);
  await page
    .getByRole("button", { name: "PDF + knowledge", exact: true })
    .click();
  await studyTool(page, "Summarize");
  await expect(page.locator(".reader-ai-error")).toContainText("OCR is needed");
  expect(requests).toHaveLength(1);
});

test("search-marked selections send the text once and PDF-only requests preserve their mode", async ({
  page,
}) => {
  const requests = [];
  await mockAnswers(page, requests);
  await open(page);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await aiOptions(page);
  await page.getByRole("button", { name: "PDF only", exact: true }).click();
  await page.getByRole("button", { name: "Close AI panel" }).click();
  await page.getByRole("button", { name: "Find in document (Ctrl+F)" }).click();
  await page
    .getByRole("searchbox", { name: "Search document" })
    .fill("acceptance");
  await expect(page.locator(".reader-find [role=status]")).toHaveText(
    "1 of 16",
  );
  await select(page);
  const text = await page.evaluate(() =>
    window.getSelection().toString().trim(),
  );
  await page
    .getByRole("region", { name: "Selected text actions" })
    .getByRole("button", { name: "Explain", exact: true })
    .click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "helpful explanation",
  );
  expect(requests[0].documentSources).toEqual([{ page: 1, text }]);
  expect(requests[0].answerMode).toBe("document");
  await expect(page.locator(".reader-answer-label")).toHaveText("PDF only");
  await page.getByRole("button", { name: "Close AI panel" }).click();
  await select(page);
  await page.getByRole("button", { name: "Highlight blue" }).click();
  const rectangles = await page
    .locator(".reader-highlight")
    .evaluateAll((els) => els.map((el) => el.style.cssText));
  expect(rectangles.length).toBeGreaterThan(0);
  expect(new Set(rectangles).size).toBe(rectangles.length);
});

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
  await page.locator(".reader-selection-note summary").click();
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
  await aiOptions(page);
  await page.getByRole("button", { name: "PDF only", exact: true }).click();
  await page.getByRole("button", { name: "Retry last request" }).click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "Acceptance forms agreement",
  );
  expect(requests).toHaveLength(2);
  expect(requests[1].answerMode).toBe("extended");
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
  await studyTool(page, "Summarize");
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
  for (const body of [
    { answerMode: "extended", answerDepth: "invalid", documentSources: [] },
    { answerMode: "invalid", documentSources: [] },
    { answerMode: "document", task: "document", documentSources: [] },
    { answerMode: "extended", task: "summary", documentSources: [] },
    { answerMode: "extended", task: "flashcards" },
    {
      answerMode: "extended",
      documentSources: [{ page: 0, text: "Bad page" }],
    },
  ]) {
    expect(
      (
        await request.post("/api/chat", { data: { messages, ...body } })
      ).status(),
    ).toBe(400);
  }
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
  await studyTool(page, "Revision cards");
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

test("AI gives most of the panel to reading and supports keyboard and pointer resizing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await mockAnswers(page, []);
  await open(page);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.locator(".reader-ai-options")).toHaveCount(0);
  const readingRatio = () =>
    page.evaluate(
      () =>
        document.querySelector(".reader-conversation").clientHeight /
        document.querySelector(".reader-ai").clientHeight,
    );
  expect(await readingRatio()).toBeGreaterThan(0.65);
  const pane = page.locator(".reader-ai-container"),
    divider = page.getByRole("separator", { name: "Resize AI panel" });
  const initial = (await pane.boundingBox()).width;
  await divider.focus();
  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(async () => (await pane.boundingBox()).width)
    .toBe(initial + 40);
  await expect(page.locator(".reader-status")).toContainText("Page 1 of");
  const grip = await divider.boundingBox();
  await page.mouse.move(grip.x + 4, grip.y + 80);
  await page.mouse.down();
  await page.mouse.move(grip.x - 96, grip.y + 80, { steps: 10 });
  await page.mouse.up();
  await expect
    .poll(async () => (await pane.boundingBox()).width)
    .toBe(initial + 140);
  await page
    .getByRole("button", { name: "Expand AI panel", exact: true })
    .click();
  await expect
    .poll(async () => (await pane.boundingBox()).width)
    .toBeGreaterThan(initial + 140);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.querySelector(".reader-viewport").clientWidth >= 320,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Restore AI panel width" }).click();
  await page.getByRole("button", { name: "Close AI panel" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await select(page);
  await page
    .getByRole("region", { name: "Selected text actions" })
    .getByRole("button", { name: "Explain", exact: true })
    .click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "helpful explanation",
  );
  expect(await readingRatio()).toBeGreaterThan(0.65);
  await expect(
    page.locator(".reader-ai-attachment details"),
  ).not.toHaveAttribute("open");
  await expect(
    page.getByRole("textbox", { name: "Ask about this PDF" }),
  ).toBeInViewport();
});

test("fullscreen keeps the PDF, AI and selection controls available and restores the page", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await go(page, 3);
  await page
    .getByRole("button", { name: "Fullscreen reading (F)", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement?.className))
    .toBe("reader-app");
  await expect(
    page.getByRole("button", { name: "Exit fullscreen (F)" }),
  ).toBeVisible();
  await expect(page.locator(".reader-app")).toHaveCSS("height", "720px");
  await expect(page.locator(".reader-status")).toContainText("Page 3 of");
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Ask about this PDF" }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Close AI panel" }).click();
  await go(page, 1);
  await select(page);
  await page
    .getByRole("button", { name: "Make revision card", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Create revision card" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(true);
  await page.getByRole("button", { name: "Exit fullscreen (F)" }).click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement))
    .toBe(null);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("fullscreen denial falls back to a full-window reader and Escape restores the site", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new DOMException("Unavailable", "NotAllowedError"));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page
    .getByRole("button", { name: "Fullscreen reading (F)", exact: true })
    .click();
  await expect(page.locator(".reader-app")).toHaveClass(/reader-focus/);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeHidden();
  expect((await page.locator(".reader-app").boundingBox()).y).toBe(0);
  await page.keyboard.press("Escape");
  await expect(page.locator(".reader-app")).not.toHaveClass(/reader-focus/);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.locator(".reader-viewport").focus();
  await page.keyboard.press("f");
  await expect(page.locator(".reader-app")).toHaveClass(/reader-focus/);
  await page.getByRole("button", { name: "Back to library" }).click();
  await expect(page.locator(".reader-app")).not.toHaveClass(/reader-focus/);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
});

test("selected text becomes an offline card and recall progress survives reopening", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/api/chat", (route) => {
    requests++;
    return route.abort();
  });
  await open(page);
  await select(page);
  await page
    .getByRole("button", { name: "Make revision card", exact: true })
    .click();
  const editor = page.getByRole("dialog", { name: "Create revision card" });
  await expect(
    editor.getByRole("textbox", { name: "Answer", exact: true }),
  ).toHaveValue(/An offer requires/);
  await editor
    .getByRole("textbox", { name: "Question", exact: true })
    .fill("What does acceptance create?");
  await editor.getByRole("button", { name: "Save card", exact: true }).click();
  await expect(editor).toHaveCount(0);
  await page.getByRole("button", { name: "Add card", exact: true }).click();
  await editor
    .getByRole("textbox", { name: "Question", exact: true })
    .fill("Which page covers this rule?");
  await editor
    .getByRole("textbox", { name: "Answer", exact: true })
    .fill("Page one.");
  await editor.getByRole("button", { name: "Save card", exact: true }).click();
  await page.getByRole("button", { name: "Review cards", exact: true }).click();
  const review = page.getByRole("dialog", { name: "Review revision cards" });
  await expect(
    review.getByRole("heading", { name: "What does acceptance create?" }),
  ).toBeVisible();
  await expect(review.locator(".reader-review-answer")).toHaveCount(0);
  await review
    .getByRole("button", { name: "Reveal answer", exact: true })
    .click();
  await expect(review.locator(".reader-review-answer")).toContainText(
    "An offer requires",
  );
  await review
    .getByRole("button", { name: "Practice again", exact: true })
    .click();
  await expect(review.getByRole("heading")).toHaveText(
    "Which page covers this rule?",
  );
  await review
    .getByRole("button", { name: "Reveal answer", exact: true })
    .click();
  await review
    .getByRole("button", { name: "I remembered", exact: true })
    .click();
  await expect(review.getByRole("heading")).toHaveText(
    "What does acceptance create?",
  );
  await review
    .getByRole("button", { name: "Reveal answer", exact: true })
    .click();
  await review
    .getByRole("button", { name: "I remembered", exact: true })
    .click();
  await expect(review.getByRole("heading")).toHaveText("Review complete");
  await review
    .getByRole("button", { name: "Done reviewing", exact: true })
    .click();
  await expect(page.locator(".reader-card small")).toHaveText([
    "Recalled",
    "Recalled",
  ]);
  await expect(page.locator(".reader-document-name [role=status]")).toHaveText(
    "Notes saved on this device",
  );
  await open(page);
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await expect(page.locator(".reader-card small")).toHaveText([
    "Recalled",
    "Recalled",
  ]);
  expect(requests).toBe(0);
});

test("reading earlier AI content is not interrupted by later streaming tokens", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = window.fetch;
    window.fetch = (url, init) => {
      if (url !== "/api/chat") return original(url, init);
      const stream = new ReadableStream({
        start(controller) {
          window.sendAIChunk = (content, done = false) => {
            controller.enqueue(
              new TextEncoder().encode(
                "data: " +
                  JSON.stringify({ choices: [{ delta: { content } }] }) +
                  "\n\n",
              ),
            );
            if (done) controller.close();
          };
        },
      });
      return Promise.resolve(
        new Response(stream, {
          headers: { "Content-Type": "text/event-stream" },
        }),
      );
    };
  });
  await open(page);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Ask about this PDF" })
    .fill("Explain in detail");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect
    .poll(() => page.evaluate(() => typeof window.sendAIChunk))
    .toBe("function");
  await page.evaluate(() =>
    window.sendAIChunk(
      "A detailed explanation of the rule and its exceptions.\n\n".repeat(70),
    ),
  );
  const conversation = page.getByRole("log", { name: "AI conversation" });
  await expect
    .poll(() =>
      conversation.evaluate((el) => el.scrollHeight > el.clientHeight * 3),
    )
    .toBe(true);
  await conversation.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
  });
  await expect(
    page.getByRole("button", { name: "Latest answer", exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    window.sendAIChunk("The final example is now complete.", true),
  );
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "The final example is now complete.",
  );
  expect(await conversation.evaluate((el) => el.scrollTop)).toBe(0);
  await page
    .getByRole("button", { name: "Latest answer", exact: true })
    .click();
  await expect
    .poll(() =>
      conversation.evaluate(
        (el) => el.scrollHeight - el.scrollTop - el.clientHeight,
      ),
    )
    .toBeLessThan(50);
});

test("PDF + knowledge switches away from a previous refusal and retains the requested depth on retry", async ({
  page,
}) => {
  const requests = [];
  await page.route("**/api/chat", (route) => {
    const body = route.request().postDataJSON();
    requests.push(body);
    if (requests.length === 2)
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: '{"error":"Provider unavailable"}',
      });
    return route.fulfill({
      contentType: "text/event-stream",
      body:
        "data: " +
        JSON.stringify({
          choices: [
            {
              delta: {
                content:
                  body.answerMode === "document"
                    ? "This topic is not in the supplied PDF."
                    : "General legal context: Article 21 protects life and personal liberty.",
              },
            },
          ],
        }),
    });
  });
  await open(page);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await aiOptions(page);
  await page.getByRole("button", { name: "PDF only", exact: true }).click();
  const composer = page.getByRole("textbox", { name: "Ask about this PDF" });
  await composer.fill("Explain Article 21 and its exceptions");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "not in the supplied PDF",
  );
  await aiOptions(page);
  await page
    .getByRole("button", { name: "PDF + knowledge", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Answer depth" })
    .selectOption("detailed");
  await composer.fill("Use your knowledge and explain with examples");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect(page.locator(".reader-ai-error")).toContainText(
    "Provider unavailable",
  );
  await aiOptions(page);
  await page
    .getByRole("combobox", { name: "Answer depth" })
    .selectOption("brief");
  await page.getByRole("button", { name: "Close AI options" }).click();
  await page.getByRole("button", { name: "Retry last request" }).click();
  await expect(page.locator(".reader-message--assistant").last()).toContainText(
    "Article 21",
  );
  expect(requests).toHaveLength(3);
  expect(requests[1].messages).toContainEqual({
    role: "assistant",
    content: "This topic is not in the supplied PDF.",
  });
  expect(requests[1].answerMode).toBe("extended");
  expect(requests[1].answerDepth).toBe("detailed");
  expect(requests[2]).toEqual(requests[1]);
  // Unrelated document search results must not block a knowledge question.
  await aiOptions(page);
  await page
    .getByRole("combobox", { name: "AI source" })
    .selectOption("document");
  await composer.fill("photosynthesis chlorophyll");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect.poll(() => requests.length).toBe(4);
  expect(requests[3].documentSources).toEqual([]);
  expect(requests[3].answerMode).toBe("extended");
});

test("highlights finish outside the viewport and selecting the same passage does not stack duplicate marks", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("button", { name: "Highlight as you select (H)", exact: true })
    .click();
  await dragText(page);
  const viewport = await page.locator(".reader-viewport").boundingBox();
  await page.mouse.move(viewport.x + 40, viewport.y - 10, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
  await page.getByRole("button", { name: "Undo highlight" }).click();
  await expect(page.locator(".reader-highlight")).toHaveCount(0);
  await dragText(page);
  await page.mouse.up();
  await expect(page.locator(".reader-highlight")).toHaveCount(1);
  await dragText(page);
  await page.mouse.up();
  await expect(page.locator(".reader-notice")).toContainText(
    "already highlighted",
  );
  await expect(page.locator(".reader-highlight")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await select(page, "Chapter 1");
  await expect(
    page.getByRole("region", { name: "Selected text actions" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Selected text actions" }),
  ).toHaveCount(0);
  await expect(page.locator(".reader-highlight")).toHaveCount(1);
});

test("search-split highlights cover each text fragment once and retain exact partial text", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("combobox", { name: "Zoom", exact: true })
    .selectOption("1");
  await page.getByRole("button", { name: "Find in document (Ctrl+F)" }).click();
  await page
    .getByRole("searchbox", { name: "Search document" })
    .fill("acceptance");
  await expect(page.locator(".reader-find [role=status]")).toHaveText(
    "1 of 16",
  );
  await select(page);
  const native = await page.evaluate(() => {
    const range = window.getSelection().getRangeAt(0);
    const r = range.getBoundingClientRect();
    return { text: range.toString(), width: r.width };
  });
  await page.getByRole("button", { name: "Highlight yellow" }).click();
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
  const totalWidth = await page
    .locator('.page[data-page-number="1"] .reader-highlight')
    .evaluateAll((els) =>
      els.reduce((total, el) => total + el.getBoundingClientRect().width, 0),
    );
  // Nested search markup used to add a whole-line box on top of its fragments.
  expect(Math.abs(totalWidth - native.width)).toBeLessThan(3);
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: /^Notes/ }).click();
  await expect(page.locator(".reader-note blockquote")).toHaveText(native.text);
  await page.getByRole("button", { name: "Close document sidebar" }).click();
  const partial = await page
    .locator('.page[data-page-number="1"] .textLayer .highlight')
    .first()
    .evaluate((el) => {
      const node = el.firstChild;
      const r = document.createRange();
      r.setStart(node, 2);
      r.setEnd(node, 6);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      return r.toString();
    });
  await page.getByRole("button", { name: "Highlight pink" }).click();
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: /^Notes/ }).click();
  await expect(page.locator(".reader-note blockquote").last()).toHaveText(
    partial,
  );
});

test("reader themes, independent page tones and AI text size persist and work in fullscreen on mobile", async ({
  page,
}) => {
  const requests = [];
  await mockAnswers(page, requests);
  await open(page);
  await page.getByRole("button", { name: "Save PDF", exact: true }).click();
  await select(page);
  await page.getByRole("button", { name: "Highlight yellow" }).click();
  await page.getByRole("button", { name: "Reader appearance" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Make yourself comfortable",
  });
  await dialog.getByRole("button", { name: /Night/ }).click();
  await expect(page.locator(".reader-app")).toHaveAttribute(
    "data-reader-theme",
    "night",
  );
  await expect(page.locator(".canvasWrapper").first()).not.toHaveCSS(
    "filter",
    "none",
  );
  await expect(page.locator(".reader-highlight-layer").first()).toHaveCSS(
    "mix-blend-mode",
    "screen",
  );
  await dialog
    .getByRole("combobox", { name: "PDF page tone" })
    .selectOption("original");
  await expect(page.locator(".canvasWrapper").first()).toHaveCSS(
    "filter",
    "none",
  );
  await expect(page.locator(".reader-highlight-layer").first()).toHaveCSS(
    "mix-blend-mode",
    "multiply",
  );
  await dialog
    .getByRole("combobox", { name: "AI answer text size" })
    .selectOption("18");
  await dialog.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Ask about this PDF" })
    .fill("Explain acceptance");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "helpful explanation",
  );
  await expect(page.locator(".reader-message--assistant")).toHaveCSS(
    "font-size",
    "18px",
  );
  const contrast = await page
    .locator(".reader-message--assistant p")
    .first()
    .evaluate((el) => {
      const luminance = (colour) => {
        const rgb = colour
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number)
          .map((n) => {
            const s = n / 255;
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          });
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      const foreground = luminance(getComputedStyle(el).color);
      const background = luminance(
        getComputedStyle(el.closest(".reader-ai-container")).backgroundColor,
      );
      return (
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05)
      );
    });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.getByRole("button", { name: "Back to library" }).click();
  await page.reload();
  await expect(page.locator(".reader-app")).toHaveAttribute(
    "data-reader-theme",
    "night",
  );
  await page.locator(".reader-book > button").first().click();
  await expect(page.locator(".reader-highlight").first()).toBeVisible();
  await expect(page.locator(".canvasWrapper").first()).toHaveCSS(
    "filter",
    "none",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Fullscreen reading (F)" }).click();
  await page.getByRole("button", { name: "Reader appearance" }).click();
  await expect(dialog).toBeInViewport();
  await dialog.getByRole("button", { name: /Sepia/ }).click();
  await expect(page.locator(".reader-app")).toHaveAttribute(
    "data-page-tone",
    "warm",
  );
  await dialog.getByRole("button", { name: /Sage/ }).click();
  await expect(page.locator(".reader-app")).toHaveAttribute(
    "data-reader-theme",
    "sage",
  );
  await dialog.getByRole("button", { name: /Paper/ }).click();
  await expect(page.locator(".reader-app")).toHaveAttribute(
    "data-reader-theme",
    "paper",
  );
  await dialog.getByRole("button", { name: "Close reader appearance" }).click();
  await page.getByRole("button", { name: "Exit fullscreen (F)" }).click();
});

test("adding a note to an existing highlight preserves both notes without another mark", async ({
  page,
}) => {
  await open(page);
  for (const note of ["Remember the rule", "Compare with counteroffer"]) {
    await select(page);
    await page.locator(".reader-selection-note summary").click();
    await page.getByRole("textbox", { name: "Note for selection" }).fill(note);
    await page.getByRole("button", { name: "Highlight yellow" }).click();
    await expect(page.locator(".reader-highlight")).toHaveCount(1);
  }
  await expect(page.locator(".reader-notice")).toContainText(
    "Note added to the existing highlight",
  );
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: /^Notes/ }).click();
  await expect(page.locator(".reader-note")).toHaveCount(1);
  await expect(page.locator(".reader-note textarea")).toHaveValue(
    "Remember the rule\n\nCompare with counteroffer",
  );
  await page.getByRole("button", { name: "Back to library" }).click();
  await page
    .locator('input[accept=".pdf"]')
    .setInputFiles(fixture("study.pdf"));
  await expect(page.locator(".reader-highlight")).toHaveCount(1);
  await page.getByRole("button", { name: "Toggle document sidebar" }).click();
  await page.getByRole("button", { name: /^Notes/ }).click();
  await expect(page.locator(".reader-note textarea")).toHaveValue(
    "Remember the rule\n\nCompare with counteroffer",
  );
});

test("automatic highlighting replaces an older AI attachment before a short explain question", async ({
  page,
}) => {
  const requests = [];
  await mockAnswers(page, requests);
  await open(page);
  await page
    .getByRole("combobox", { name: "Zoom", exact: true })
    .selectOption("1");
  await select(page);
  await page
    .getByRole("region", { name: "Selected text actions" })
    .getByRole("button", { name: "Explain", exact: true })
    .click();
  await expect(page.locator(".reader-message--assistant")).toContainText(
    "helpful explanation",
  );
  await page.getByRole("button", { name: "Close AI panel" }).click();
  await go(page, 4);
  await page
    .getByRole("button", { name: "Highlight as you select (H)", exact: true })
    .click();
  const selected = page
    .locator('.page[data-page-number="4"] .textLayer span')
    .filter({ hasText: "Page 4 discusses" })
    .first();
  await expect(selected).toBeVisible();
  const text = await selected.textContent();
  await selected.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });
  await expect(
    page.locator('.page[data-page-number="4"] .reader-highlight'),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.locator(".reader-ai-attachment")).toContainText(text);
  await page
    .getByRole("textbox", { name: "Ask about this PDF" })
    .fill("explain");
  await page.getByRole("button", { name: "Send PDF question" }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1].documentSources).toEqual([{ page: 4, text }]);
  expect(requests[1].sourceScope).toBe("selection");
  await expect(page.locator(".reader-message--user").last()).toContainText(
    "Question context",
  );
  await expect(
    page.locator(".reader-message--user").last().locator("blockquote"),
  ).toHaveText(text);
});

test("changing selection during an answer only changes the next question's attachment", async ({
  page,
}) => {
  const requests = [];
  let finishFirst;
  const pending = new Promise((resolve) => {
    finishFirst = resolve;
  });
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) await pending;
    await route.fulfill({
      contentType: "text/event-stream",
      body: 'data: {"choices":[{"delta":{"content":"An explanation."}}]}\n\n',
    });
  });
  try {
    await open(page);
    await page
      .getByRole("combobox", { name: "Zoom", exact: true })
      .selectOption("1");
    await select(page);
    await page
      .getByRole("region", { name: "Selected text actions" })
      .getByRole("button", { name: "Explain", exact: true })
      .click();
    await expect.poll(() => requests.length).toBe(1);
    const firstSources = requests[0].documentSources;
    await go(page, 4);
    const span = page
      .locator('.page[data-page-number="4"] .textLayer span')
      .filter({ hasText: "Page 4 discusses" })
      .first();
    await expect(span).toBeVisible();
    const text = await span.textContent();
    await span.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selected = window.getSelection();
      selected.removeAllRanges();
      selected.addRange(range);
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    });
    await expect(page.locator(".reader-ai-attachment")).toContainText(
      "Next question",
    );
    await expect(page.locator(".reader-ai-attachment")).toContainText(text);
    await expect(page.locator(".reader-ai-progress")).toContainText("Page 1");
    await expect(
      page.locator(".reader-message--user").first().locator("blockquote"),
    ).toHaveText(firstSources[0].text);
    finishFirst();
    await expect(page.locator(".reader-message--assistant")).toContainText(
      "An explanation",
    );
    await page
      .getByRole("textbox", { name: "Ask about this PDF" })
      .fill("explain");
    await page.getByRole("button", { name: "Send PDF question" }).click();
    await expect.poll(() => requests.length).toBe(2);
    expect(requests[1].documentSources).toEqual([{ page: 4, text }]);
    await expect(
      page.locator(".reader-message--user").first().locator("blockquote"),
    ).toHaveText(firstSources[0].text);
    await expect(
      page.locator(".reader-message--user").last().locator("blockquote"),
    ).toHaveText(text);
    await page.getByRole("button", { name: "Back to library" }).click();
    await page
      .locator('input[accept=".pdf"]')
      .setInputFiles(fixture("study.pdf"));
    await page.getByRole("button", { name: "Ask AI", exact: true }).click();
    await expect(
      page.locator(".reader-message--user").first().locator("blockquote"),
    ).toHaveText(firstSources[0].text);
    await expect(
      page.locator(".reader-message--user").last().locator("blockquote"),
    ).toHaveText(text);
  } finally {
    finishFirst();
  }
});
