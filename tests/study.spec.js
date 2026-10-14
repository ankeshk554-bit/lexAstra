import { test, expect } from "@playwright/test";
function pdf() {
  const content =
    "BT /F1 18 Tf 50 750 Td (Contract law: offer and acceptance.) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let text = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(text));
    text += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const start = Buffer.byteLength(text);
  text +=
    `xref\n0 6\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
      .join("") +
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(text);
}
test("unified search opens a readable case detail and library filters work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("kesavananda");
  await page.locator(".study-search__results a").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Kesavananda",
  );
  await expect(page.locator(".case-holding")).toContainText("basic structure");
  await page.goto("/bare-acts");
  await page.getByRole("searchbox").fill("contract");
  await expect(page.locator(".card-grid .card")).toHaveCount(1);
  await page.getByRole("link", { name: "Read Act", exact: true }).click();
  await expect(page.locator("h1")).toContainText("Contract");
});
test("syllabus topic progress survives a reload", async ({ page }) => {
  await page.goto("/exams/judiciary");
  await page.locator(".syllabus-progress summary").first().click();
  const box = page.locator(".syllabus-progress input").first();
  await box.check();
  await expect(page.locator(".syllabus-progress progress")).toHaveAttribute(
    "value",
    "1",
  );
  await page.reload();
  await page.locator(".syllabus-progress summary").first().click();
  await expect(page.locator(".syllabus-progress input").first()).toBeChecked();
});
test("chat flushes the final answer and regeneration does not duplicate the question", async ({
  page,
}) => {
  const requests = [];
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "text/event-stream",
      body:
        "data: " +
        JSON.stringify({
          choices: [
            {
              delta: { content: "A complete legal answer with a final token." },
            },
          ],
        }),
    });
  });
  await page.goto(
    "/ai-assistant?exam=judiciary&prompt=Explain%20res%20judicata",
  );
  await expect(page.locator(".chat-input")).toHaveValue("Explain res judicata");
  expect(requests).toHaveLength(0);
  await page.locator("#ai-send-btn").click();
  await expect(page.locator(".chat-message-wrapper--ai")).toContainText(
    "final token.",
  );
  await page.getByRole("button", { name: "Regenerate", exact: true }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1].messages.filter((m) => m.role === "user")).toHaveLength(1);
  expect(requests[1].examMode).toBe("Judiciary");
  await page.reload();
  await expect(page.locator(".chat-message-wrapper--ai")).toContainText(
    "final token.",
  );
});
test("PDF saves, renders selectable text, searches, and reopens from the library", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/pdf-reader");
  await expect(
    page.getByText("Import Textbook / Bare Act", { exact: true }),
  ).toBeVisible();
  await page.locator('input[type=file][accept=".pdf"]').first().setInputFiles({
    name: "contract.pdf",
    mimeType: "application/pdf",
    buffer: pdf(),
  });
  await page.getByRole("button", { name: "Save to Permanent Library" }).click();
  await expect(page.locator(".textLayer")).toContainText(
    "offer and acceptance",
  );
  await expect(page.locator("canvas").first()).toBeVisible();
  await page
    .locator(".textLayer span")
    .first()
    .evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    });
  await page
    .locator(".pdf-floating-menu")
    .getByTitle("Yellow", { exact: true })
    .click();
  await expect(page.locator(".highlight-rect").first()).toBeVisible();
  await page.getByPlaceholder("Search in PDF...").fill("acceptance");
  await expect(page.locator(".pdf-search-count")).toContainText("1");
  await page.reload();
  await page.locator(".book-card").filter({ hasText: "contract.pdf" }).click();
  await expect(page.locator(".textLayer")).toContainText(
    "offer and acceptance",
  );
  await expect(page.locator(".highlight-rect").first()).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile navigation and PDF workspace remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: "PDF workspace" })
    .click();
  await expect(
    page.getByText("Import Textbook / Bare Act", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Quick Read Temporary Document" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Quick Read Temporary Document" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("API rejects malformed input without invoking a provider", async ({
  request,
}) => {
  expect(
    (await request.post("/api/chat", { data: { messages: [] } })).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/chat", {
        data: "{",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/chat", {
        data: { messages: [{ role: "user", content: 7 }] },
      })
    ).status(),
  ).toBe(400);
});

test("study tools still open when browser storage is unavailable", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage denied", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage denied", "QuotaExceededError");
    };
  });
  await page.goto("/ai-assistant");
  await expect(page.locator(".chat-input")).toBeVisible();
  await page.goto("/exams/judiciary");
  await page.locator(".syllabus-progress summary").first().click();
  await page.locator(".syllabus-progress input").first().check();
  await expect(page.getByRole("status")).toContainText("could not be saved");
  expect(errors).toEqual([]);
});
