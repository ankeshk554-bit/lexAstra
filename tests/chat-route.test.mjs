import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

// Resolve the same @/ aliases Next uses, so these tests exercise the actual
// route and its upstream request, not a separate copy of the prompt builder.
register("./support/next-alias-loader.mjs", import.meta.url);
const { POST } = await import("../app/api/chat/route.js");

const excerpts = [{ page: 1, text: "An offer requires acceptance." }];
const request = (body) =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "test-key-not-real",
    },
    body: JSON.stringify(body),
  });
const conversation = [
  { role: "user", content: "Explain Article 21 and its exceptions." },
  { role: "assistant", content: "This is not in the PDF, so I cannot answer." },
  { role: "user", content: "Use your knowledge and explain it with examples." },
];
test("PDF + knowledge reaches the provider with current-mode and explanation instructions despite a prior PDF-only refusal", async (t) => {
  let payload;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    payload = JSON.parse(options.body);
    return new Response(
      'data: {"choices":[{"delta":{"content":"General legal context"}}]}\n\n',
      { headers: { "Content-Type": "text/event-stream" } },
    );
  });
  const result = await POST(
    request({
      messages: conversation,
      documentSources: excerpts,
      task: "document",
      answerMode: "extended",
      answerDepth: "detailed",
    }),
  );
  assert.equal(result.status, 200);
  assert.match(await result.text(), /General legal context/);
  const system = payload.messages[0].content;
  assert.match(system, /ACTIVE ANSWER MODE: PDF \+ knowledge/);
  assert.match(system, /Earlier assistant refusals/);
  assert.match(system, /including different topics/);
  assert.match(system, /If the excerpts are irrelevant, ignore them/);
  assert.match(system, /Address every part/);
  assert.match(system, /in-depth explanation/);
  assert.match(system, /Never use a PDF page citation for general knowledge/);
  assert.doesNotMatch(
    system,
    /Use ONLY facts|Answer ONLY about Indian law|400-800 words/,
  );
  assert.deepEqual(payload.messages.slice(1, -1), conversation.slice(0, -1));
  assert.match(
    payload.messages.at(-1).content,
    /Use your knowledge and explain it with examples/,
  );
  assert.match(payload.messages.at(-1).content, /An offer requires acceptance/);
  assert.equal(payload.max_tokens, 8192);
});
test("general questions work without excerpts while summaries remain PDF-grounded", async (t) => {
  const prompts = [];
  t.mock.method(globalThis, "fetch", async (_, options) => {
    prompts.push(JSON.parse(options.body).messages[0].content);
    return new Response("data: [DONE]\n\n");
  });
  for (const body of [
    { answerMode: "extended", documentSources: [], task: "document" },
    { answerMode: "document", documentSources: excerpts, task: "document" },
    {
      answerMode: "extended",
      documentSources: excerpts,
      task: "summary",
      answerDepth: "detailed",
    },
  ])
    assert.equal(
      (await POST(request({ messages: conversation, ...body }))).status,
      200,
    );
  assert.match(prompts[0], /Automatic depth/);
  assert.match(prompts[0], /no PDF text was used/);
  assert.match(prompts[1], /Use ONLY facts/);
  assert.match(prompts[2], /Use ONLY facts/);
  assert.doesNotMatch(prompts[2], /EXPLANATION QUALITY/);
});
test("invalid answer depth is rejected before contacting the provider", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("Must not call provider");
  });
  const result = await POST(
    request({
      messages: conversation,
      answerMode: "extended",
      documentSources: [],
      answerDepth: "invalid",
    }),
  );
  assert.equal(result.status, 400);
  assert.equal(fetch.mock.callCount(), 0);
});

test("a short explain request carries the new selection in the latest provider turn after an older topic", async (t) => {
  let payload;
  t.mock.method(globalThis, "fetch", async (_, options) => {
    payload = JSON.parse(options.body);
    return new Response("data: [DONE]\n\n");
  });
  const messages = [
    {
      role: "user",
      content: "Explain Indian Young Lawyers Association v. State of Kerala",
    },
    {
      role: "assistant",
      content:
        "The only excerpt is the case name on Page 8. I already explained this case.",
    },
    { role: "user", content: "explain" },
  ];
  const sources = [{ page: 13, text: "Socialism and Secularism" }];
  const result = await POST(
    request({
      messages,
      documentSources: sources,
      sourceScope: "selection",
      answerMode: "extended",
      task: "document",
    }),
  );
  assert.equal(result.status, 200);
  assert.equal(payload.messages.at(-1).role, "user");
  assert.match(payload.messages.at(-1).content, /Socialism and Secularism/);
  assert.match(payload.messages.at(-1).content, /13/);
  assert.doesNotMatch(payload.messages.at(-1).content, /Young Lawyers|Page 8/);
  assert.match(payload.messages.at(-1).content, /CURRENT QUESTION\nexplain/);
  assert.match(payload.messages.at(-1).content, /Selected text/);
  assert.match(
    payload.messages[0].content,
    /even a selected term, heading, or case name is enough/,
  );
  assert.match(
    payload.messages[0].content,
    /A new selection replaces older selections/,
  );
  assert.doesNotMatch(
    payload.messages[0].content,
    /"text":"Socialism and Secularism"/,
  );
});

test("current question context stays separate from history for every source scope", async (t) => {
  const payloads = [];
  t.mock.method(globalThis, "fetch", async (_, options) => {
    payloads.push(JSON.parse(options.body));
    return new Response("data: [DONE]\n\n");
  });
  for (const scope of ["selection", "page", "document", "none"]) {
    const sources =
      scope === "none"
        ? []
        : [{ page: 13, text: 'A heading with "quoted text"\nand a newline.' }];
    const result = await POST(
      request({
        messages: conversation,
        documentSources: sources,
        sourceScope: scope,
        answerMode: "extended",
      }),
    );
    assert.equal(result.status, 200);
    const last = payloads.at(-1).messages.at(-1).content;
    assert.ok(last.includes(JSON.stringify(sources)));
    assert.equal(last.split(JSON.stringify(sources)).length, 2);
    assert.deepEqual(
      payloads.at(-1).messages.slice(1, -1),
      conversation.slice(0, -1),
    );
  }
  assert.match(payloads.at(-1).messages.at(-1).content, /No PDF context/);
});

test("ambiguous or contradictory PDF request envelopes are rejected before the provider", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("Must not call provider");
  });
  for (const body of [
    { sourceScope: "invalid" },
    { sourceScope: "none" },
    {
      messages: [
        ...conversation,
        { role: "assistant", content: "An old answer" },
      ],
    },
  ]) {
    const result = await POST(
      request({
        messages: conversation,
        answerMode: "extended",
        documentSources: excerpts,
        ...body,
      }),
    );
    assert.equal(result.status, 400);
  }
  assert.equal(fetch.mock.callCount(), 0);
});
