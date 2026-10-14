"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Settings2, Sparkles, Square, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  extractText,
  contextForPages,
  rankPassages,
  parseFlashcards,
} from "@/utils/pdf/document.mjs";
import { readAIStream } from "@/utils/aiStream.mjs";
import { storage } from "@/utils/storage";

function Answer({ message, onGo }) {
  const allowed = new Set((message.sources || []).map((s) => s.page));
  const text = message.content.replace(/\[Page\s+(\d+)\]/gi, (match, n) =>
    allowed.has(Number(n)) ? `[Page ${n}](#pdf-page-${n})` : match,
  );
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          const page = Number(href?.match(/^#pdf-page-(\d+)$/)?.[1]);
          return page && allowed.has(page) ? (
            <button className="reader-citation" onClick={() => onGo(page)}>
              {children}
            </button>
          ) : (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
export default function ReaderAI({
  document,
  page,
  selection,
  messages,
  onMessages,
  onCards,
  onSaveNote,
  onGo,
  onClose,
}) {
  const [scope, setScope] = useState("page"),
    [question, setQuestion] = useState(""),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(""),
    [error, setError] = useState(""),
    [settings, setSettings] = useState(false),
    [key, setKey] = useState(
      () => storage.getItem("lexastra_deepseek_api_key") || "",
    ),
    [retry, setRetry] = useState(null);
  const cache = useRef(new Map()),
    request = useRef(null),
    currentMessages = useRef(messages),
    latest = useRef({ onMessages, onCards }),
    bottom = useRef(null);
  useEffect(() => {
    currentMessages.current = messages;
    latest.current = { onMessages, onCards };
  }, [messages, onMessages, onCards]);
  useEffect(() => () => request.current?.abort(), []);
  const [lastSelection, setLastSelection] = useState(selection);
  if (lastSelection !== selection) {
    setLastSelection(selection);
    setScope(selection ? "selection" : "page");
  }
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy]);
  function commit(next) {
    currentMessages.current = next;
    latest.current.onMessages(next);
  }
  async function pageText(number, signal) {
    signal.throwIfAborted();
    if (!cache.current.has(number)) {
      const pdfPage = await document.pdf.getPage(number);
      signal.throwIfAborted();
      const text = extractText((await pdfPage.getTextContent()).items).slice(
        0,
        40000,
      );
      signal.throwIfAborted();
      cache.current.set(number, text);
    }
    return { page: number, text: cache.current.get(number) };
  }
  async function sourcesFor(prompt, signal) {
    if (scope === "selection" && selection)
      return contextForPages(
        selection.groups.map((g) => ({
          page: g.page,
          text: g.text || selection.text,
        })),
      );
    if (scope !== "document")
      return contextForPages([await pageText(page, signal)]);
    const pages = [];
    let size = 0;
    for (let number = 1; number <= document.pdf.numPages; number++) {
      if (number % 10 === 1)
        setProgress(
          `Finding relevant pages · ${number} of ${document.pdf.numPages}`,
        );
      const item = await pageText(number, signal);
      pages.push(item);
      size += item.text.length;
      if (size > 12000000)
        throw new Error(
          "This document is too large to search for AI context. Select a passage or use the current page.",
        );
      if (number % 20 === 0)
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const ranked = rankPassages(pages, prompt);
    if (!ranked.length)
      throw new Error(
        pages.some((p) => p.text.trim())
          ? "No passages matched this question. Use words from the document, or select a passage directly."
          : "No selectable text was found. This PDF may be scanned; OCR is needed before AI can read its pages.",
      );
    return contextForPages(ranked);
  }
  async function ask(prompt, task = "document", previous = null) {
    if (request.current || !prompt.trim()) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setProgress("Reading source text…");
    let assistantId, base;
    try {
      const sources =
        previous?.sources || (await sourcesFor(prompt, controller.signal));
      if (!sources.length)
        throw new Error(
          "No selectable text was found on this page. This PDF may be scanned; OCR is needed before AI can read it.",
        );
      controller.signal.throwIfAborted();
      base = previous?.base || [
        ...currentMessages.current.slice(-30),
        { id: crypto.randomUUID(), role: "user", content: prompt },
      ];
      assistantId = crypto.randomUUID();
      const prepared = { prompt, task, sources, base };
      setRetry(prepared);
      commit([
        ...base,
        { id: assistantId, role: "assistant", content: "", sources },
      ]);
      setQuestion("");
      setProgress("Writing from the selected sources…");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key.trim() ? { "x-api-key": key.trim() } : {}),
        },
        body: JSON.stringify({
          messages: base.map(({ role, content }) => ({ role, content })),
          fileName: document.name,
          documentSources: sources,
          task: task === "document" ? "document" : task,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.error || `AI request failed (${response.status}).`,
        );
      }
      const answer = await readAIStream(response, (text) => {
        if (controller.signal.aborted || task === "flashcards") return;
        commit([
          ...base,
          { id: assistantId, role: "assistant", content: text, sources },
        ]);
      });
      controller.signal.throwIfAborted();
      if (task === "flashcards") {
        const cards = parseFlashcards(
          answer,
          sources.map((s) => s.page),
        ).map((c) => ({ ...c, id: crypto.randomUUID() }));
        latest.current.onCards(cards);
        commit([
          ...base,
          {
            id: assistantId,
            role: "assistant",
            content: `Created ${cards.length} revision cards. Open Cards in the document sidebar to practice.`,
            sources,
          },
        ]);
      }
      setProgress("");
    } catch (err) {
      if (controller.signal.aborted) {
        if (assistantId)
          commit(
            currentMessages.current.map((m) =>
              m.id === assistantId ? { ...m, incomplete: true } : m,
            ),
          );
        setError("Generation stopped. Any partial answer is marked below.");
      } else {
        setError(err.message || "The AI request failed. Please retry.");
        if (assistantId)
          commit(
            currentMessages.current.map((m) =>
              m.id === assistantId ? { ...m, incomplete: true } : m,
            ),
          );
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  return (
    <aside className="reader-ai" aria-label="Document AI assistant">
      <div className="reader-panel-heading">
        <strong>
          <Sparkles size={17} />
          Study with AI
        </strong>
        <div>
          <button
            title="AI settings"
            aria-label="AI settings"
            onClick={() => setSettings(!settings)}
          >
            <Settings2 size={17} />
          </button>
          <button
            title="Close AI panel"
            aria-label="Close AI panel"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
      </div>
      {settings && (
        <div className="reader-ai-settings">
          <label>
            DeepSeek API key
            <input
              type="password"
              autoComplete="off"
              value={key}
              placeholder="Use server key, or enter your own"
              onChange={(e) => setKey(e.target.value)}
            />
          </label>
          <p>
            This key is used for this session. The server key is used when
            empty.
          </p>
        </div>
      )}
      <div className="reader-ai-scope">
        <label>
          Source
          <select
            aria-label="AI source"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="page">Current page · {page}</option>
            <option value="selection" disabled={!selection}>
              Selected text
              {selection ? ` · ${selection.groups.length} page(s)` : ""}
            </option>
            <option value="document">Find relevant pages in document</option>
          </select>
        </label>
        <p>
          {scope === "document"
            ? "Searches the document for excerpts relevant to your question."
            : "Only text from this source is sent with your question."}
        </p>
      </div>
      <div
        className="reader-conversation"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {!messages.length && (
          <div className="reader-ai-intro">
            <span className="reader-ai-orb">
              <Sparkles size={25} />
            </span>
            <h2>
              Keep the source
              <br />
              in the conversation.
            </h2>
            <p>
              Unpack a difficult provision, compare arguments, or turn a passage
              into revision notes.
            </p>
            <p>
              Answers link back to the pages used. Check the source before
              relying on a legal interpretation.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <article
            key={message.id}
            className={`reader-message reader-message--${message.role}`}
          >
            <strong>{message.role === "user" ? "You" : "LexAstra"}</strong>
            {message.content ? (
              <Answer message={message} onGo={onGo} />
            ) : (
              <p>{busy ? "Preparing answer…" : "No answer received."}</p>
            )}
            {message.incomplete && (
              <small className="reader-incomplete">Incomplete answer</small>
            )}
            {message.role === "assistant" &&
              message.content &&
              !message.incomplete &&
              !busy && (
                <button
                  className="reader-save-answer"
                  onClick={() => onSaveNote(message)}
                >
                  Save answer to notes
                </button>
              )}
            {message.sources?.length > 0 && (
              <details className="reader-sources">
                <summary>Source excerpts · {message.sources.length}</summary>
                {message.sources.map((s, i) => (
                  <div key={i}>
                    <button onClick={() => onGo(s.page)}>
                      Go to page {s.page}
                    </button>
                    <blockquote>{s.text}</blockquote>
                  </div>
                ))}
              </details>
            )}
          </article>
        ))}
        <div ref={bottom} />
      </div>
      <div className="reader-ai-composer">
        {error && (
          <div className="reader-ai-error" role="alert">
            {error}
            {retry && !busy && (
              <button onClick={() => ask(retry.prompt, retry.task, retry)}>
                Retry last request
              </button>
            )}
          </div>
        )}
        {busy ? (
          <div className="reader-ai-progress" role="status">
            <span>{progress}</span>
            <button onClick={() => request.current?.abort()}>
              <Square size={13} />
              Stop
            </button>
          </div>
        ) : scope === "document" ? (
          <p className="reader-ai-retrieval-hint">
            Ask a specific question to find relevant passages.
          </p>
        ) : (
          <div className="reader-ai-quick">
            <button
              onClick={() =>
                ask(
                  "Summarize the supplied excerpts, distinguishing rules, exceptions, and cases.",
                  "summary",
                )
              }
            >
              Summarize
            </button>
            <button
              onClick={() =>
                ask(
                  "Create five question-and-answer revision cards from the supplied excerpts. Include a page citation in every answer.",
                  "flashcards",
                )
              }
            >
              Revision cards
            </button>
            <button
              onClick={() =>
                ask(
                  "Explain the supplied passage in plain language.",
                  "document",
                )
              }
            >
              Explain
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <textarea
            aria-label="Ask about this PDF"
            placeholder="Ask about this PDF…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={8000}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                ask(question);
              }
            }}
          />
          <button
            className="reader-primary"
            type="submit"
            aria-label="Send PDF question"
            disabled={busy || !question.trim()}
          >
            <ArrowUp size={18} />
          </button>
        </form>
      </div>
    </aside>
  );
}
