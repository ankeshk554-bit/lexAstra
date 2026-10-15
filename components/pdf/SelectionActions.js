"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, BookOpenCheck, Highlighter, Sparkles, X } from "lucide-react";
export const HIGHLIGHT_COLORS = [
  ["Yellow", "#fde047"],
  ["Green", "#86efac"],
  ["Blue", "#93c5fd"],
  ["Pink", "#f9a8d4"],
];

export default function SelectionActions({
  selection,
  color,
  onHighlight,
  onAsk,
  onCard,
  onDismiss,
}) {
  const root = useRef(null);
  const [question, setQuestion] = useState(""),
    [note, setNote] = useState("");
  useLayoutEffect(() => {
    const el = root.current,
      parent = el.parentElement;
    function place() {
      const bounds = parent.getBoundingClientRect();
      const rects = selection.range?.startContainer?.isConnected
        ? Array.from(selection.range.getClientRects()).filter(
            (r) => r.width > 0 && r.height > 0,
          )
        : [];
      const anchor = rects.at(-1) || selection.anchor;
      if (!anchor) return;
      const width = el.offsetWidth,
        height = el.offsetHeight;
      const left = Math.max(
        12,
        Math.min(bounds.width - width - 12, anchor.left - bounds.left),
      );
      const below = anchor.bottom - bounds.top + 10,
        above = anchor.top - bounds.top - height - 10;
      const top = Math.max(
        12,
        Math.min(
          bounds.height - height - 12,
          below + height <= bounds.height - 12 ? below : above,
        ),
      );
      el.style.setProperty("--selection-left", `${left}px`);
      el.style.setProperty("--selection-top", `${top}px`);
    }
    place();
    const observer = new ResizeObserver(place);
    observer.observe(el);
    observer.observe(parent);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [selection]);
  return (
    <div
      ref={root}
      className="reader-selection"
      role="region"
      aria-label="Selected text actions"
      onPointerDown={(e) => {
        if (e.target.closest("button")) e.preventDefault();
      }}
    >
      <div className="reader-selection-heading">
        <span>
          Page {selection.groups.map((g) => g.page).join(", ")} · Selected text
        </span>
        <button aria-label="Dismiss selection" onClick={onDismiss}>
          <X size={16} />
        </button>
      </div>
      <div className="reader-selection-tools">
        <button
          className="reader-highlight-action"
          onClick={() => onHighlight(color, note)}
        >
          <Highlighter size={16} />
          Highlight
        </button>
        {HIGHLIGHT_COLORS.map(([name, value]) => (
          <button
            key={value}
            className="reader-swatch"
            style={{ background: value }}
            title={name}
            aria-label={`Highlight ${name.toLowerCase()}`}
            onClick={() => onHighlight(value, note)}
          />
        ))}
        <button
          onClick={() =>
            onAsk("Explain this selected passage in plain language.")
          }
        >
          <Sparkles size={16} />
          Explain
        </button>
      </div>
      <form
        className="reader-selection-question"
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) onAsk(question.trim());
        }}
      >
        <input
          aria-label="Ask about selected text"
          placeholder="Ask about this text…"
          value={question}
          maxLength={8000}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          className="reader-primary"
          aria-label="Send selected text question"
          disabled={!question.trim()}
        >
          <ArrowUp size={17} />
        </button>
      </form>
      <button className="reader-selection-card" onClick={onCard}>
        <BookOpenCheck size={14} />
        Make revision card
      </button>
      <details className="reader-selection-note">
        <summary>Add a note</summary>
        <input
          aria-label="Note for selection"
          placeholder="Your note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </details>
    </div>
  );
}
