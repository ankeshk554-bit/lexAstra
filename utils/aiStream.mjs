// Read SSE independently of network chunk boundaries and always flush EOF.
export async function readAIStream(response, onText = () => {}) {
  if (!response.body) throw new Error("The response did not contain a stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "",
    text = "";
  const consume = (line) => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    const event = JSON.parse(payload);
    if (event.error)
      throw new Error(event.error.message || "AI stream failed.");
    const delta = event.choices?.[0]?.delta?.content;
    if (typeof delta === "string") text += delta;
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) consume(line.trim());
      if (done && buffer.trim()) consume(buffer.trim());
      onText(text);
      if (done) break;
    }
    if (!text.trim())
      throw new Error("The AI service returned an empty answer. Try again.");
    return text;
  } finally {
    reader.releaseLock();
  }
}
