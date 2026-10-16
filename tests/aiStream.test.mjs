import test from "node:test";
import assert from "node:assert/strict";
import { readAIStream } from "../utils/aiStream.mjs";
function response(parts) {
  return new Response(
    new ReadableStream({
      start(c) {
        parts.forEach((p) => c.enqueue(p));
        c.close();
      },
    }),
  );
}
const encode = (s) => new TextEncoder().encode(s);
const event = (text) =>
  "data: " + JSON.stringify({ choices: [{ delta: { content: text } }] });
test("preserves unicode and final tokens at arbitrary chunk boundaries", async () => {
  const bytes = encode(event("धारा ") + "\r\n\r\n" + event("21 — final"));
  let last = "";
  const actual = await readAIStream(
    response([...bytes].map((v) => new Uint8Array([v]))),
    (text) => {
      last = text;
    },
  );
  assert.equal(actual, "धारा 21 — final");
  assert.equal(last, actual);
});
test("flushes a short answer before DONE even without a final newline", async () => {
  assert.equal(
    await readAIStream(
      response([encode(event("Complete answer") + "\n\ndata: [DONE]")]),
    ),
    "Complete answer",
  );
});
test("reports provider error events and malformed frames", async () => {
  await assert.rejects(
    () =>
      readAIStream(response([encode('data: {"error":{"message":"busy"}}\n')])),
    /busy/,
  );
  await assert.rejects(() =>
    readAIStream(response([encode("data: malformed\n")])),
  );
});
test("rejects a missing or empty answer", async () => {
  await assert.rejects(() => readAIStream(new Response(null)), /stream/);
  await assert.rejects(
    () => readAIStream(response([encode("data: [DONE]\n")])),
    /empty/,
  );
});

test("marks a provider-truncated explanation as incomplete while preserving its text", async () => {
  let shown = "";
  await assert.rejects(
    () =>
      readAIStream(
        response([
          encode(
            event("Partial explanation") +
              '\n\ndata: {"choices":[{"delta":{},"finish_reason":"length"}]}\n\ndata: [DONE]',
          ),
        ]),
        (text) => {
          shown = text;
        },
      ),
    /length limit.*incomplete/,
  );
  assert.equal(shown, "Partial explanation");
});
