"use client";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Settings2,
  Sparkles,
  Square,
  X,
} from "lucide-react";
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
const ReaderAI = forwardRef(function ReaderAI(
  {
    document,
    page,
    selection,
    messages,
    onMessages,
    onCards,
    onSaveNote,
    onGo,
    onClose,
    onClearSelection,
    expanded,
    onExpand,
  },
  ref,
) {
  const [scope, setScope] = useState("page"),
    [answerMode, setAnswerMode] = useState("extended"),
    [answerDepth, setAnswerDepth] = useState("auto"),
    [attachedSelection, setAttachedSelection] = useState(null),
    [question, setQuestion] = useState(""),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(""),
    [error, setError] = useState(""),
    [settings, setSettings] = useState(false),
    [optionsOpen, setOptionsOpen] = useState(false),
    [showLatest, setShowLatest] = useState(false),
    [key, setKey] = useState(
      () => storage.getItem("lexastra_deepseek_api_key") || "",
    ),
    [retry, setRetry] = useState(null);
  const cache = useRef(new Map()),
    request = useRef(null),
    currentMessages = useRef(messages),
    latest = useRef({ onMessages, onCards }),
    conversation = useRef(null),
    followAnswer = useRef(true),
    optionsRoot = useRef(null),
    studyTools = useRef(null),
    composer = useRef(null);
  useEffect(() => {
    currentMessages.current = messages;
    latest.current = { onMessages, onCards };
  }, [messages, onMessages, onCards]);
  useEffect(() => () => request.current?.abort(), []);
  const [lastSelection, setLastSelection] = useState(selection);
  if (lastSelection !== selection) {
    setLastSelection(selection);
    if (selection) {
      setAttachedSelection(selection);
      setScope("selection");
    }
  }
  useLayoutEffect(() => {
    const el = conversation.current;
    if (followAnswer.current) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);
  useEffect(() => {
    const el = conversation.current;
    const resize = new ResizeObserver(() => {
      if (followAnswer.current) el.scrollTop = el.scrollHeight;
    });
    resize.observe(el);
    return () => resize.disconnect();
  }, []);
  useLayoutEffect(() => {
    const el = composer.current;
    el.style.height = "auto";
    el.style.height = `${Math.min(100, Math.max(40, el.scrollHeight))}px`;
  }, [question]);
  useEffect(() => {
    if (!optionsOpen) return;
    const dismiss = (e) => {
      if (!optionsRoot.current?.contains(e.target)) setOptionsOpen(false);
    };
    window.addEventListener("pointerdown", dismiss);
    return () => window.removeEventListener("pointerdown", dismiss);
  }, [optionsOpen]);
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
  async function sourcesFor(prompt, signal, selected, mode, task) {
    const activeSelection = selected || attachedSelection;
    const needsPDF =
      mode === "document" || ["summary", "flashcards", "note"].includes(task);
    if (scope === "none" && !selected) return [];
    if ((selected || scope === "selection") && activeSelection)
      return contextForPages(
        activeSelection.groups.map((g) => ({
          page: g.page,
          text: g.text || activeSelection.text,
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
    if (!ranked.length && needsPDF)
      throw new Error(
        pages.some((p) => p.text.trim())
          ? "No passages matched this question. Use words from the document, or select a passage directly."
          : "No selectable text was found. This PDF may be scanned; OCR is needed before AI can read its pages.",
      );
    return contextForPages(ranked);
  }
  async function ask(
    prompt,
    task = "document",
    previous = null,
    selected = null,
  ) {
    if (request.current || !prompt.trim()) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    followAnswer.current = true;
    setShowLatest(false);
    setOptionsOpen(false);
    if (studyTools.current) studyTools.current.open = false;
    setError("");
    setRetry(null);
    setProgress("Preparing your question…");
    const mode =
      previous?.mode ||
      (["summary", "flashcards", "note"].includes(task)
        ? "document"
        : answerMode);
    const depth = previous?.depth || answerDepth;
    let assistantId, base;
    try {
      const sources =
        previous?.sources ||
        (await sourcesFor(prompt, controller.signal, selected, mode, task));
      if (
        !sources.length &&
        (mode === "document" ||
          ["summary", "flashcards", "note"].includes(task))
      )
        throw new Error(
          "No selectable text was found on this page. This PDF may be scanned; OCR is needed before AI can read it.",
        );
      controller.signal.throwIfAborted();
      base = previous?.base || [
        ...currentMessages.current.slice(-30),
        { id: crypto.randomUUID(), role: "user", content: prompt },
      ];
      assistantId = crypto.randomUUID();
      const prepared = { prompt, task, sources, base, mode, depth };
      setRetry(prepared);
      commit([
        ...base,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          sources,
          answerMode: mode,
        },
      ]);
      setQuestion("");
      setProgress(
        mode === "document" ? "Writing from the PDF…" : "Writing your answer…",
      );
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
          answerMode: mode,
          answerDepth: depth,
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
          {
            id: assistantId,
            role: "assistant",
            content: text,
            sources,
            answerMode: mode,
          },
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
            answerMode: "document",
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
  useImperativeHandle(ref, () => ({
    askSelection(prompt, selected) {
      if (request.current) return false;
      setAttachedSelection(selected);
      setScope("selection");
      ask(prompt, "document", null, selected);
      requestAnimationFrame(() => composer.current?.focus());
      return true;
    },
  }));
  return (
    <aside className="reader-ai" aria-label="Document AI assistant">
      <div className="reader-panel-heading">
        <strong>
          <Sparkles size={17} />
          Study with AI
        </strong>
        <div>
          <button
            title={expanded ? "Restore AI panel width" : "Expand AI panel"}
            aria-label={expanded ? "Restore AI panel width" : "Expand AI panel"}
            onClick={onExpand}
            className="reader-ai-expand"
          >
            {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <button
            title="AI settings"
            aria-label="AI settings"
            onClick={() => {
              setSettings(!settings);
              setOptionsOpen(true);
            }}
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
      <div
        ref={optionsRoot}
        className="reader-ai-controls"
        onKeyDown={(e) => {
          if (e.key === "Escape" && optionsOpen) {
            e.stopPropagation();
            setOptionsOpen(false);
          }
        }}
      >
        <button
          className="reader-context-button"
          aria-label="AI context and answer options"
          aria-expanded={optionsOpen}
          onClick={() => {
            setOptionsOpen(!optionsOpen);
            if (studyTools.current) studyTools.current.open = false;
          }}
        >
          <span>
            {scope === "selection"
              ? "Selected text"
              : scope === "document"
                ? "Relevant pages"
                : scope === "none"
                  ? "No PDF context"
                  : `Page ${page}`}{" "}
            · {answerMode === "document" ? "PDF only" : "PDF + knowledge"}
          </span>
          <ChevronDown size={14} />
        </button>
        <details
          className="reader-study-tools"
          ref={studyTools}
          onKeyDown={(e) => {
            if (e.key === "Escape" && e.currentTarget.open) {
              e.stopPropagation();
              e.currentTarget.open = false;
            }
          }}
          onToggle={(e) => {
            if (e.currentTarget.open) setOptionsOpen(false);
          }}
        >
          <summary>
            Study tools <ChevronDown size={14} />
          </summary>
          <div>
            <button
              disabled={busy || scope === "none" || scope === "document"}
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
              disabled={busy || scope === "none" || scope === "document"}
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
              disabled={busy || scope === "none" || scope === "document"}
              onClick={() =>
                ask("Explain the supplied passage in plain language.")
              }
            >
              Explain
            </button>
            {(scope === "none" || scope === "document") && (
              <p>Select text or use the current page for these tools.</p>
            )}
          </div>
        </details>
        {optionsOpen && (
          <div className="reader-ai-options">
            <div className="reader-options-heading">
              <strong>Answer options</strong>
              <button
                aria-label="Close AI options"
                onClick={() => setOptionsOpen(false)}
              >
                <X size={16} />
              </button>
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
              <div
                className="reader-answer-modes"
                role="group"
                aria-label="Answer sources"
              >
                <button
                  aria-pressed={answerMode === "extended"}
                  onClick={() => setAnswerMode("extended")}
                >
                  PDF + knowledge
                </button>
                <button
                  aria-pressed={answerMode === "document"}
                  onClick={() => {
                    setAnswerMode("document");
                    if (scope === "none") setScope("page");
                  }}
                >
                  PDF only
                </button>
              </div>
              <p className="reader-answer-mode-help">
                {answerMode === "extended"
                  ? "Ask any study question, even about a different topic. Uses broader knowledge when the PDF does not answer it, labelled separately. No live web search."
                  : "Answers stay within the supplied PDF excerpts, with page citations."}
              </p>
              <label className="reader-answer-depth">
                Explanation
                <select
                  aria-label="Answer depth"
                  value={answerDepth}
                  onChange={(e) => setAnswerDepth(e.target.value)}
                >
                  <option value="auto">
                    Automatic · as much detail as needed
                  </option>
                  <option value="detailed">
                    In depth · reasoning and examples
                  </option>
                  <option value="brief">Brief · essential explanation</option>
                </select>
              </label>
              <label>
                PDF context
                <select
                  aria-label="AI source"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                >
                  <option value="page">Current page · {page}</option>
                  <option value="selection" disabled={!attachedSelection}>
                    Selected text
                    {attachedSelection
                      ? ` · ${attachedSelection.groups.length} page(s)`
                      : ""}
                  </option>
                  <option value="document">
                    Find relevant pages in document
                  </option>
                  {answerMode === "extended" && (
                    <option value="none">No PDF context</option>
                  )}
                </select>
              </label>
              <p>
                {scope === "document"
                  ? "Searches the document for excerpts relevant to your question."
                  : scope === "none"
                    ? "Your question and recent conversation are sent without PDF excerpts."
                    : "This text is sent with your question and recent conversation."}
              </p>
            </div>
            <button
              className="reader-options-done"
              onClick={() => setOptionsOpen(false)}
            >
              Done
            </button>
          </div>
        )}
      </div>
      <div className="reader-conversation-area">
        <div
          ref={conversation}
          className="reader-conversation"
          role="log"
          aria-label="AI conversation"
          onScroll={(e) => {
            const el = e.currentTarget;
            const nearEnd =
              el.scrollHeight - el.scrollTop - el.clientHeight < 48;
            followAnswer.current = nearEnd;
            setShowLatest(!nearEnd);
          }}
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
                Unpack a difficult provision, compare arguments, or turn a
                passage into revision notes.
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
              {message.role === "assistant" && (
                <span className="reader-answer-label">
                  {message.answerMode === "extended"
                    ? message.sources?.length
                      ? "PDF + general knowledge"
                      : "General knowledge · no PDF text used"
                    : "PDF only"}
                </span>
              )}
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
        </div>
        {showLatest && (
          <button
            className="reader-jump-latest"
            onClick={() => {
              followAnswer.current = true;
              setShowLatest(false);
              conversation.current.scrollTop =
                conversation.current.scrollHeight;
            }}
          >
            <ArrowDown size={14} /> Latest answer
          </button>
        )}
      </div>
      <div className="reader-ai-composer">
        {scope === "selection" && attachedSelection && (
          <div className="reader-ai-attachment">
            <details>
              <summary>
                Selected text · Page{" "}
                {attachedSelection.groups.map((g) => g.page).join(", ")}{" "}
                <ChevronDown size={13} />
              </summary>
              <blockquote>{attachedSelection.text}</blockquote>
            </details>
            <button
              aria-label="Remove selected text from question"
              onClick={() => {
                setAttachedSelection(null);
                setScope("page");
                onClearSelection?.();
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}
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
        {busy && (
          <div className="reader-ai-progress" role="status">
            <span>{progress}</span>
            <button onClick={() => request.current?.abort()}>
              <Square size={13} />
              Stop
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
            ref={composer}
            rows={1}
            aria-label="Ask about this PDF"
            placeholder={
              scope === "selection"
                ? "Ask about this selection…"
                : "Ask a question…"
            }
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
});
export default ReaderAI;
