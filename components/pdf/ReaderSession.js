"use client";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  Hand,
  Highlighter,
  Maximize,
  Minimize,
  Minus,
  PanelLeft,
  Plus,
  Printer,
  RotateCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { saveBook, saveStudy } from "@/utils/libraryDb";
import { clampPage, readStudyBackup } from "@/utils/pdf/document.mjs";
import { downloadBlob } from "@/utils/pdf/engine";
import {
  exportAnnotatedPDF,
  exportMarkdown,
  exportNotes,
} from "@/utils/pdf/exports";
import PDFViewport from "./PDFViewport";
import ReaderAI from "./ReaderAI";
import SelectionActions, { HIGHLIGHT_COLORS } from "./SelectionActions";
import StudyCards from "./StudyCards";
import useReaderFullscreen from "./useReaderFullscreen";
import ReaderAppearance from "./ReaderAppearance";

function Tool({ label, children, ...props }) {
  return (
    <button type="button" title={label} aria-label={label} {...props}>
      {children}
    </button>
  );
}
function Outline({ items, onGo, level = 0 }) {
  return (
    <ul className="reader-outline">
      {items.map((item, index) => (
        <li key={index}>
          <button
            style={{ paddingLeft: 12 + level * 12 }}
            disabled={!item.dest}
            onClick={() => onGo(item.dest)}
          >
            {item.title || "Untitled section"}
          </button>
          {item.items?.length > 0 && (
            <Outline items={item.items} onGo={onGo} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
function Thumbnail({ pdf, page, active, onGo }) {
  const root = useRef(null),
    canvas = useRef(null);
  useEffect(() => {
    let stopped = false,
      task;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        try {
          const source = await pdf.getPage(page);
          if (stopped) return;
          const viewport = source.getViewport({
            scale: 100 / source.getViewport({ scale: 1 }).width,
          });
          const el = canvas.current;
          el.width = viewport.width * 2;
          el.height = viewport.height * 2;
          el.style.width = viewport.width + "px";
          el.style.height = viewport.height + "px";
          task = source.render({
            canvasContext: el.getContext("2d"),
            viewport,
            transform: [2, 0, 0, 2, 0, 0],
          });
          await task.promise;
        } catch {
          /* Main viewer reports rendering failures. */
        }
      },
      { rootMargin: "180px" },
    );
    observer.observe(root.current);
    return () => {
      stopped = true;
      observer.disconnect();
      task?.cancel();
    };
  }, [pdf, page]);
  return (
    <button
      ref={root}
      className={"reader-thumbnail" + (active ? " is-active" : "")}
      onClick={() => onGo(page)}
      aria-label={`Go to page ${page}`}
      aria-current={active ? "page" : undefined}
    >
      <canvas ref={canvas} />
      <span>{page}</span>
    </button>
  );
}
const ReaderSession = forwardRef(function ReaderSession(
  {
    document,
    engine,
    onOpen,
    onClose,
    appearance,
    onAppearance,
    appearanceSaved,
  },
  ref,
) {
  const [study, setStudy] = useState(document.study),
    [view, setView] = useState({
      page: document.study.page,
      scale: 1,
      scaleValue: document.study.scale,
      rotation: document.study.rotation,
      ready: false,
      matches: { current: 0, total: 0 },
    });
  const [saved, setSaved] = useState(document.saved),
    [saveState, setSaveState] = useState(
      document.storageError ? "failed" : "saved",
    ),
    [error, setError] = useState(document.storageError),
    [notice, setNotice] = useState("");
  const [sidebar, setSidebar] = useState(""),
    [aiOpen, setAiOpen] = useState(false),
    [outline, setOutline] = useState(null),
    [selection, setSelection] = useState(null),
    [hand, setHand] = useState(false),
    [highlightMode, setHighlightMode] = useState(false),
    [highlightColor, setHighlightColor] = useState("#fde047"),
    [recentHighlights, setRecentHighlights] = useState([]);
  const [aiWidth, setAiWidth] = useState(420),
    [aiExpanded, setAiExpanded] = useState(false),
    [cardDraft, setCardDraft] = useState(null);
  const [findOpen, setFindOpen] = useState(false),
    [query, setQuery] = useState(""),
    [caseSensitive, setCaseSensitive] = useState(false),
    [wholeWord, setWholeWord] = useState(false),
    [pageInput, setPageInput] = useState(String(document.study.page)),
    [busy, setBusy] = useState(false),
    [undo, setUndo] = useState(null);
  const viewer = useRef(null),
    sessionRoot = useRef(null),
    aiContainer = useRef(null),
    resizing = useRef(null),
    fullscreenAction = useRef(null),
    ai = useRef(null),
    selectionTools = useRef(null),
    findInput = useRef(null),
    backupInput = useRef(null),
    snapshot = useRef(study),
    timer = useRef(null),
    queue = useRef(Promise.resolve()),
    revision = useRef(0),
    written = useRef(0),
    alive = useRef(true);
  const fullscreen = useReaderFullscreen(sessionRoot);
  useEffect(() => {
    fullscreenAction.current = fullscreen.toggle;
  }, [fullscreen.toggle]);
  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (written.current === revision.current) return queue.current;
    const value = snapshot.current,
      version = revision.current;
    const operation = queue.current
      .catch(() => {})
      .then(() => saveStudy(document.id, value));
    queue.current = operation.then(
      () => {
        written.current = Math.max(written.current, version);
        if (alive.current && revision.current === version)
          setSaveState("saved");
        return true;
      },
      () => {
        if (alive.current) setSaveState("failed");
        return false;
      },
    );
    return queue.current;
  }, [document.id]);
  useImperativeHandle(ref, () => ({ flush }), [flush]);
  const update = useCallback(
    (change) => {
      const next =
        typeof change === "function"
          ? change(snapshot.current)
          : { ...snapshot.current, ...change };
      snapshot.current = next;
      revision.current++;
      setStudy(next);
      setSaveState("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 350);
    },
    [flush],
  );
  useEffect(() => {
    alive.current = true;
    const onHide = () => flush();
    const onLeave = (e) => {
      if (written.current < revision.current) {
        flush();
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onLeave);
    document.pdf
      .getOutline()
      .then((items) => {
        if (alive.current) setOutline(items || []);
      })
      .catch(() => {
        if (alive.current) setOutline([]);
      });
    return () => {
      alive.current = false;
      flush();
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [document, flush]);
  useEffect(() => {
    selectionTools.current = {
      selection,
      highlightMode,
      highlightColor,
      addHighlight,
    };
  });
  useEffect(() => {
    const key = (e) => {
      if (e.target.closest('[role="dialog"]')) return;
      const typing =
        /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) ||
        e.target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindOpen(true);
        setTimeout(() => findInput.current?.focus(), 0);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        onOpen();
      } else if (e.key === "Escape") {
        setSelection(null);
        setHighlightMode(false);
        setHand(false);
        window.getSelection()?.removeAllRanges();
        setFindOpen(false);
        viewer.current?.search("");
        setSidebar("");
        setAiOpen(false);
      } else if (
        !typing &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.shiftKey
      ) {
        if (e.key.toLowerCase() === "h") {
          e.preventDefault();
          const state = selectionTools.current;
          if (state.selection) state.addHighlight(state.highlightColor);
          else {
            setHighlightMode(!state.highlightMode);
            setHand(false);
          }
        }
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          fullscreenAction.current?.();
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          viewer.current?.goTo(
            clampPage(snapshot.current.page + 1, document.pdf.numPages),
          );
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          viewer.current?.goTo(
            clampPage(snapshot.current.page - 1, document.pdf.numPages),
          );
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [document.pdf.numPages, onOpen]);
  useEffect(() => {
    if (!findOpen) return;
    const timeout = setTimeout(
      () => viewer.current?.search(query, { caseSensitive, wholeWord }),
      200,
    );
    return () => clearTimeout(timeout);
  }, [query, caseSensitive, wholeWord, findOpen]);
  function changeView(change) {
    setView((v) => ({ ...v, ...change }));
    const savedChange = {};
    if (change.page) {
      savedChange.page = change.page;
      setPageInput(String(change.page));
    }
    if (change.scaleValue) savedChange.scale = change.scaleValue;
    if (change.rotation !== undefined) savedChange.rotation = change.rotation;
    if (Object.entries(savedChange).some(([k, v]) => snapshot.current[k] !== v))
      update(savedChange);
  }
  function goTo(page) {
    viewer.current?.goTo(clampPage(page, document.pdf.numPages));
    if (window.innerWidth < 900) setSidebar("");
  }
  function addHighlight(color, note = "", selected = selection) {
    if (!selected) return;
    // Auto-highlight clears the native selection without mounting selection
    // actions. Keep the AI attachment in step with the passage just marked.
    ai.current?.attachSelection(selected);
    const notes = [],
      changedNotes = new Map();
    for (const group of selected.groups) {
      const candidate = {
        id: crypto.randomUUID(),
        page: group.page,
        rects: group.rects,
        color,
        text: group.text || selected.text,
        note: note.trim(),
        createdAt: Date.now(),
      };
      const existing = snapshot.current.annotations.find(
        (existing) =>
          existing.page === candidate.page &&
          existing.color === candidate.color &&
          existing.rects.length === candidate.rects.length &&
          existing.rects.every((rect, i) =>
            rect.every(
              (coordinate, j) =>
                Math.abs(coordinate - candidate.rects[i][j]) < 0.5,
            ),
          ),
      );
      if (!existing) notes.push(candidate);
      else if (
        candidate.note &&
        !existing.note.split("\n\n").includes(candidate.note)
      ) {
        changedNotes.set(existing.id, {
          ...existing,
          note: existing.note
            ? `${existing.note}\n\n${candidate.note}`
            : candidate.note,
        });
      }
    }
    if (!notes.length && !changedNotes.size) {
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      setNotice("This passage is already highlighted in that colour.");
      return;
    }
    update((s) => ({
      ...s,
      annotations: [
        ...s.annotations.map(
          (existing) => changedNotes.get(existing.id) || existing,
        ),
        ...notes,
      ],
    }));
    setHighlightColor(color);
    setRecentHighlights(notes.map((n) => n.id));
    setSelection(null);
    window.getSelection()?.removeAllRanges();
    setNotice(
      changedNotes.size && !notes.length
        ? "Note added to the existing highlight."
        : highlightMode
          ? "Highlighted. Select another passage to keep highlighting."
          : "Highlight saved to your notes.",
    );
  }
  function selectPassage(value, { complete = false } = {}) {
    if (value && complete && highlightMode) {
      addHighlight(highlightColor, "", value);
      return;
    }
    setSelection((previous) =>
      previous?.signature === value?.signature ? previous : value,
    );
  }
  function askSelection(prompt) {
    if (!selection) return;
    setAiOpen(true);
    if (window.innerWidth < 1100) setSidebar("");
    if (ai.current?.askSelection(prompt, selection)) {
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    } else
      setNotice(
        "AI is finishing an answer. Stop it or wait, then send your selected-text question.",
      );
  }
  function makeCard() {
    if (!selection) return;
    setCardDraft({
      question: "",
      answer: selection.text.slice(0, 6000),
      page: selection.groups[0].page,
    });
    setSidebar("cards");
    setAiOpen(false);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }
  function resizeAI(width) {
    const parent = aiContainer.current?.parentElement;
    const available =
      (parent?.clientWidth || window.innerWidth) -
      (parent?.querySelector(".reader-sidebar")?.clientWidth || 0);
    setAiWidth(
      Math.round(Math.max(320, Math.min(width, 760, available - 320))),
    );
    setAiExpanded(false);
  }
  function captureForms() {
    setTimeout(() => {
      if (!alive.current) return;
      const map = document.pdf.annotationStorage.serializable.map;
      const forms = map ? Object.fromEntries(map) : {};
      if (JSON.stringify(forms) !== JSON.stringify(snapshot.current.forms))
        update({ forms });
    }, 0);
  }
  async function saveFile() {
    setBusy(true);
    try {
      await saveBook(
        document.id,
        document.name,
        "",
        document.bytes,
        document.bytes.byteLength,
      );
      setSaved(true);
      setNotice("PDF saved to this device.");
    } catch {
      setError(
        "The browser could not store this PDF. Free some space or keep the original file; export your notes as a backup.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function download(annotated = false) {
    setBusy(true);
    setError("");
    try {
      if (annotated)
        await exportAnnotatedPDF(document, snapshot.current.annotations);
      else
        downloadBlob(
          await document.pdf.saveDocument(),
          document.name,
          "application/pdf",
        );
    } catch {
      setError(
        annotated
          ? "An annotated copy could not be created. Encrypted or signed documents may not support this export. Download the PDF and export notes separately."
          : "The PDF could not be downloaded. Try reopening the original.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function print() {
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setError(
        "Allow this site to open a tab for printing, or download the PDF and print it.",
      );
      return;
    }
    tab.opener = null;
    tab.document.title = "Preparing PDF for printing";
    tab.document.body.textContent = "Preparing PDF…";
    try {
      const bytes = await document.pdf.saveDocument();
      const url = URL.createObjectURL(
        new Blob([bytes], { type: "application/pdf" }),
      );
      tab.location.href = url;
      setNotice(
        "Use the print button in the browser PDF tab. Export an annotated copy first to print your highlights.",
      );
      setTimeout(() => URL.revokeObjectURL(url), 300000);
    } catch {
      tab.close();
      setError(
        "The PDF could not be prepared for printing. Download and print the original file.",
      );
    }
  }
  async function importNotes(file) {
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Notes backups must be smaller than 10 MB.");
      const imported = readStudyBackup(
        await file.text(),
        document.id,
        document.pdf.numPages,
      );
      update((s) => ({
        ...s,
        annotations: [
          ...new Map(
            [...s.annotations, ...imported.annotations].map((a) => [a.id, a]),
          ).values(),
        ],
        cards: [
          ...new Map(
            [...s.cards, ...imported.cards].map((c) => [c.id, c]),
          ).values(),
        ],
        bookmarks: [...new Set([...s.bookmarks, ...imported.bookmarks])].sort(
          (a, b) => a - b,
        ),
      }));
      setNotice("Notes and bookmarks imported.");
    } catch (err) {
      setError(err.message || "This backup could not be read.");
    }
  }
  function togglePanel(panel) {
    setSidebar(sidebar === panel ? "" : panel);
    setAiExpanded(false);
    setAiWidth((width) => Math.min(width, 420));
    if (window.innerWidth < 1100) setAiOpen(false);
  }
  const bookmark = study.bookmarks.includes(view.page);
  return (
    <div
      className="reader-session"
      ref={sessionRoot}
      onInputCapture={captureForms}
      onChangeCapture={captureForms}
    >
      <header className="reader-document-bar">
        <Tool
          label="Back to library"
          onClick={async () => {
            await fullscreen.exit();
            onClose();
          }}
        >
          <ArrowLeft size={19} />
        </Tool>
        <div className="reader-document-name">
          <strong title={document.name}>{document.name}</strong>
          <span role="status">
            {saveState === "failed"
              ? "Not saved · export a backup"
              : saveState === "saving"
                ? "Saving notes…"
                : "Notes saved on this device"}
          </span>
        </div>
        <button onClick={onOpen}>
          <FileUp size={16} />
          <span>Open</span>
        </button>
        <button onClick={saveFile} disabled={saved || busy}>
          {saved ? "PDF saved" : "Save PDF"}
        </button>
        <button
          className={aiOpen ? "reader-primary" : ""}
          aria-expanded={aiOpen}
          onClick={() => {
            setAiOpen(!aiOpen);
            if (window.innerWidth < 1100) setSidebar("");
          }}
        >
          <Sparkles size={17} />
          <span>Ask AI</span>
        </button>
      </header>
      <div className="reader-toolbar" role="toolbar" aria-label="PDF controls">
        <Tool
          label="Toggle document sidebar"
          aria-expanded={!!sidebar}
          onClick={() => togglePanel("outline")}
        >
          <PanelLeft size={18} />
        </Tool>
        <Tool
          label="Find in document (Ctrl+F)"
          onClick={() => {
            setFindOpen(!findOpen);
            setTimeout(() => findInput.current?.focus(), 0);
          }}
        >
          <Search size={18} />
        </Tool>
        <span className="reader-divider" />
        <Tool
          label="Previous page"
          disabled={view.page <= 1 || !view.ready}
          onClick={() => goTo(view.page - 1)}
        >
          <ChevronLeft size={18} />
        </Tool>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goTo(pageInput);
            setPageInput(String(clampPage(pageInput, document.pdf.numPages)));
          }}
        >
          <input
            aria-label="Page number"
            inputMode="numeric"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => {
              goTo(pageInput);
              setPageInput(String(clampPage(pageInput, document.pdf.numPages)));
            }}
          />
          <span> / {document.pdf.numPages}</span>
        </form>
        <Tool
          label="Next page"
          disabled={view.page >= document.pdf.numPages || !view.ready}
          onClick={() => goTo(view.page + 1)}
        >
          <ChevronRight size={18} />
        </Tool>
        <span className="reader-divider" />
        <Tool
          label="Zoom out"
          disabled={!view.ready || view.scale <= 0.25}
          onClick={() => viewer.current?.zoom(-1)}
        >
          <Minus size={17} />
        </Tool>
        <select
          aria-label="Zoom"
          value={
            typeof view.scaleValue === "number" ? "custom" : view.scaleValue
          }
          onChange={(e) =>
            viewer.current?.scale(
              /^[0-9]/.test(e.target.value)
                ? Number(e.target.value)
                : e.target.value,
            )
          }
        >
          <option value="custom" disabled>
            {Math.round(view.scale * 100)}%
          </option>
          <option value="page-width">Fit width</option>
          <option value="page-fit">Fit page</option>
          {[0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4].map((n) => (
            <option value={n} key={n}>
              {n * 100}%
            </option>
          ))}
        </select>
        <Tool
          label="Zoom in"
          disabled={!view.ready || view.scale >= 4}
          onClick={() => viewer.current?.zoom(1)}
        >
          <Plus size={17} />
        </Tool>
        <Tool label="Rotate clockwise" onClick={() => viewer.current?.rotate()}>
          <RotateCw size={17} />
        </Tool>
        <Tool
          label={hand ? "Use text selection" : "Use hand tool"}
          aria-pressed={hand}
          onClick={() => {
            setHand(!hand);
            setHighlightMode(false);
            setSelection(null);
          }}
        >
          <Hand size={17} />
        </Tool>
        <button
          className="reader-highlighter-tool"
          title="Highlight as you select (H)"
          aria-label="Highlight as you select (H)"
          aria-pressed={highlightMode}
          onClick={() => {
            setHighlightMode(!highlightMode);
            setHand(false);
            if (!highlightMode && selection) addHighlight(highlightColor);
          }}
        >
          <Highlighter size={17} />
          <span>Highlight</span>
        </button>
        {highlightMode && (
          <select
            aria-label="Highlighter color"
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value)}
          >
            {HIGHLIGHT_COLORS.map(([name, color]) => (
              <option key={color} value={color}>
                {name}
              </option>
            ))}
          </select>
        )}
        <Tool
          label={bookmark ? "Remove bookmark" : "Bookmark this page"}
          aria-pressed={bookmark}
          onClick={() =>
            update({
              bookmarks: bookmark
                ? study.bookmarks.filter((p) => p !== view.page)
                : [...study.bookmarks, view.page].sort((a, b) => a - b),
            })
          }
        >
          <Bookmark size={17} fill={bookmark ? "currentColor" : "none"} />
        </Tool>
        <span className="reader-toolbar-spacer" />
        <ReaderAppearance
          appearance={appearance}
          onChange={onAppearance}
          saved={appearanceSaved}
        />
        <Tool
          label={
            fullscreen.active ? "Exit fullscreen (F)" : "Fullscreen reading (F)"
          }
          aria-pressed={fullscreen.active}
          onClick={fullscreen.toggle}
        >
          {fullscreen.active ? <Minimize size={17} /> : <Maximize size={17} />}
          <span className="reader-fullscreen-label">
            {fullscreen.active ? "Exit fullscreen" : "Fullscreen"}
          </span>
        </Tool>
        <details className="reader-export">
          <summary>
            <Download size={17} />
            <span>Export</span>
          </summary>
          <div>
            <button onClick={() => download(false)} disabled={busy}>
              Download PDF with form entries
            </button>
            <button onClick={() => download(true)} disabled={busy}>
              Download annotated PDF
            </button>
            <button onClick={() => exportNotes(document, snapshot.current)}>
              Back up notes & bookmarks (.json)
            </button>
            <button onClick={() => exportMarkdown(document, snapshot.current)}>
              Export notes as Markdown
            </button>
            <button onClick={() => backupInput.current.click()}>
              Import notes backup
            </button>
          </div>
        </details>
        <Tool label="Open PDF for printing" onClick={print}>
          <Printer size={18} />
        </Tool>
      </div>
      <input
        hidden
        ref={backupInput}
        type="file"
        accept=".json"
        aria-label="Import notes backup file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) importNotes(file);
        }}
      />
      {findOpen && (
        <div className="reader-find">
          <Search size={17} />
          <input
            ref={findInput}
            type="search"
            aria-label="Search document"
            placeholder="Find a word or phrase…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                viewer.current?.search(
                  query,
                  { caseSensitive, wholeWord },
                  true,
                  e.shiftKey,
                );
              }
            }}
          />
          <span role="status">
            {!query
              ? ""
              : view.findState === 3
                ? "Searching…"
                : `${view.matches?.current || 0} of ${view.matches?.total || 0}`}
          </span>
          <Tool
            label="Previous match"
            onClick={() =>
              viewer.current?.search(
                query,
                { caseSensitive, wholeWord },
                true,
                true,
              )
            }
          >
            <ChevronLeft size={17} />
          </Tool>
          <Tool
            label="Next match"
            onClick={() =>
              viewer.current?.search(query, { caseSensitive, wholeWord }, true)
            }
          >
            <ChevronRight size={17} />
          </Tool>
          <label>
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            Match case
          </label>
          <label>
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={(e) => setWholeWord(e.target.checked)}
            />
            Whole word
          </label>
          <Tool
            label="Close search"
            onClick={() => {
              setFindOpen(false);
              viewer.current?.search("");
            }}
          >
            <X size={17} />
          </Tool>
        </div>
      )}
      {(error || saveState === "failed") && (
        <div className="reader-error" role="alert">
          <span>
            {error ||
              "Your latest notes could not be saved. Export a backup before closing this document."}
          </span>
          {saveState === "failed" && (
            <button onClick={flush}>Retry saving</button>
          )}
          <button
            onClick={() => {
              exportNotes(document, snapshot.current);
              setNotice("Notes backup downloaded.");
            }}
          >
            Export backup
          </button>
          {error && (
            <Tool label="Dismiss reader error" onClick={() => setError("")}>
              <X size={16} />
            </Tool>
          )}
        </div>
      )}
      {notice && (
        <div className="reader-notice" role="status">
          <span>{notice}</span>
          {recentHighlights.length > 0 && notice.startsWith("Highlight") && (
            <button
              onClick={() => {
                update((s) => ({
                  ...s,
                  annotations: s.annotations.filter(
                    (a) => !recentHighlights.includes(a.id),
                  ),
                }));
                setRecentHighlights([]);
                setNotice("");
              }}
            >
              Undo highlight
            </button>
          )}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
      <div className="reader-workspace">
        {sidebar && (
          <aside className="reader-sidebar" aria-label="Document sidebar">
            <div className="reader-panel-heading">
              <strong>Document</strong>
              <Tool
                label="Close document sidebar"
                onClick={() => setSidebar("")}
              >
                <X size={18} />
              </Tool>
            </div>
            <div className="reader-tabs">
              {[
                ["outline", "Contents"],
                ["pages", "Pages"],
                ["bookmarks", "Saved"],
                ["notes", "Notes"],
                ["cards", "Cards"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={sidebar === id}
                  onClick={() => setSidebar(id)}
                >
                  {label}
                  {id === "notes" && study.annotations.length
                    ? ` ${study.annotations.length}`
                    : ""}
                </button>
              ))}
            </div>
            <div className="reader-sidebar-content">
              {sidebar === "outline" &&
                (outline === null ? (
                  <p>Loading contents…</p>
                ) : outline.length ? (
                  <Outline
                    items={outline}
                    onGo={(dest) => {
                      viewer.current?.destination(dest);
                      if (window.innerWidth < 900) setSidebar("");
                    }}
                  />
                ) : (
                  <p className="reader-muted">
                    This PDF has no contents outline. Use Pages, search, or
                    bookmarks to navigate.
                  </p>
                ))}
              {sidebar === "pages" && (
                <div className="reader-thumbnails">
                  {Array.from({ length: document.pdf.numPages }, (_, i) => (
                    <Thumbnail
                      key={i}
                      pdf={document.pdf}
                      page={i + 1}
                      active={view.page === i + 1}
                      onGo={goTo}
                    />
                  ))}
                </div>
              )}
              {sidebar === "bookmarks" &&
                (study.bookmarks.length ? (
                  study.bookmarks.map((page) => (
                    <div className="reader-bookmark" key={page}>
                      <button onClick={() => goTo(page)}>
                        <Bookmark size={16} />
                        Page {page}
                      </button>
                      <Tool
                        label={`Remove bookmark on page ${page}`}
                        onClick={() =>
                          update({
                            bookmarks: study.bookmarks.filter(
                              (p) => p !== page,
                            ),
                          })
                        }
                      >
                        <X size={15} />
                      </Tool>
                    </div>
                  ))
                ) : (
                  <p className="reader-muted">
                    Bookmark a page from the toolbar to find it here.
                  </p>
                ))}
              {sidebar === "cards" && (
                <StudyCards
                  cards={study.cards}
                  onCards={(cards) => update({ cards })}
                  onGo={goTo}
                  page={view.page}
                  draft={cardDraft}
                  onDraft={setCardDraft}
                  onDraftClose={() => setCardDraft(null)}
                />
              )}
              {sidebar === "notes" && (
                <>
                  {study.annotations.length ? (
                    study.annotations.map((note) => (
                      <article
                        className="reader-note"
                        key={note.id}
                        style={{ borderLeftColor: note.color }}
                      >
                        <button
                          className="reader-page-link"
                          onClick={() => goTo(note.page)}
                        >
                          Page {note.page}
                        </button>
                        <blockquote>{note.text}</blockquote>
                        <textarea
                          aria-label={`Note on page ${note.page}`}
                          placeholder="Add your own note…"
                          value={note.note}
                          onChange={(e) =>
                            update((s) => ({
                              ...s,
                              annotations: s.annotations.map((a) =>
                                a.id === note.id
                                  ? { ...a, note: e.target.value }
                                  : a,
                              ),
                            }))
                          }
                        />
                        <button
                          className="reader-delete-note"
                          onClick={() => {
                            setUndo(note);
                            update((s) => ({
                              ...s,
                              annotations: s.annotations.filter(
                                (a) => a.id !== note.id,
                              ),
                            }));
                          }}
                        >
                          Delete highlight
                        </button>
                      </article>
                    ))
                  ) : (
                    <p className="reader-muted">
                      Select text on a page to highlight it, add a note, or
                      discuss it with AI.
                    </p>
                  )}
                  {undo && (
                    <button
                      onClick={() => {
                        update((s) => ({
                          ...s,
                          annotations: [...s.annotations, undo],
                        }));
                        setUndo(null);
                      }}
                    >
                      Undo deleted highlight
                    </button>
                  )}
                </>
              )}
            </div>
          </aside>
        )}
        <section className="reader-canvas-area" aria-label="Document viewer">
          <PDFViewport
            ref={viewer}
            document={document}
            engine={engine}
            initialView={document.study}
            annotations={study.annotations}
            hand={hand}
            highlightMode={highlightMode}
            onChange={changeView}
            onSelection={selectPassage}
            onError={setError}
          />
          {highlightMode && !selection && (
            <div className="reader-tool-hint">
              <span className="reader-mouse-hint">
                Drag across text to highlight · H or Esc to exit
              </span>
              <span className="reader-touch-hint">
                Select text, adjust the handles, then tap Highlight
              </span>
            </div>
          )}
          {selection && (
            <SelectionActions
              key={selection.signature}
              selection={selection}
              color={highlightColor}
              onHighlight={addHighlight}
              onAsk={askSelection}
              onCard={makeCard}
              onDismiss={() => {
                setSelection(null);
                window.getSelection()?.removeAllRanges();
              }}
            />
          )}
        </section>
        <div
          ref={aiContainer}
          className={
            "reader-ai-container" +
            (aiOpen ? " is-open" : "") +
            (aiExpanded ? " is-expanded" : "")
          }
          style={{ "--ai-width": `${aiWidth}px` }}
          aria-hidden={!aiOpen}
          inert={!aiOpen}
        >
          <div
            className="reader-ai-resizer"
            role="separator"
            tabIndex={0}
            aria-label="Resize AI panel"
            aria-orientation="vertical"
            aria-valuemin={320}
            aria-valuemax={760}
            aria-valuenow={aiExpanded ? 760 : aiWidth}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              resizing.current = {
                x: e.clientX,
                width: aiContainer.current.getBoundingClientRect().width,
              };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (resizing.current)
                resizeAI(
                  resizing.current.width + resizing.current.x - e.clientX,
                );
            }}
            onPointerUp={() => {
              resizing.current = null;
            }}
            onPointerCancel={() => {
              resizing.current = null;
            }}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                const width = aiContainer.current.getBoundingClientRect().width;
                resizeAI(
                  e.key === "Home"
                    ? 320
                    : e.key === "End"
                      ? 760
                      : width + (e.key === "ArrowLeft" ? 40 : -40),
                );
              }
            }}
          />
          <ReaderAI
            ref={ai}
            onClearSelection={() => setSelection(null)}
            expanded={aiExpanded}
            onExpand={() => {
              setAiExpanded(!aiExpanded);
              setSidebar("");
            }}
            document={document}
            page={view.page}
            selection={selection}
            messages={study.messages}
            onMessages={(messages) => update({ messages })}
            onCards={(cards) => {
              update((s) => ({ ...s, cards: [...s.cards, ...cards] }));
              setNotice(
                `${cards.length} revision cards saved. Open Cards in the document sidebar.`,
              );
            }}
            onSaveNote={(message) => {
              update((s) => ({
                ...s,
                annotations: [
                  ...s.annotations,
                  {
                    id: crypto.randomUUID(),
                    page: message.sources?.[0]?.page || view.page,
                    rects: [],
                    color: "#93c5fd",
                    text: "AI study note — verify against the source",
                    note: message.content,
                  },
                ],
              }));
              setNotice("AI answer saved to your notes.");
            }}
            onGo={goTo}
            onClose={() => setAiOpen(false)}
          />
        </div>
      </div>
      <footer className="reader-status">
        <span>
          Page {view.page} of {document.pdf.numPages}
        </span>
        <span>
          {Math.round(view.scale * 100)}% · {view.rotation}°
        </span>
        <span>← → pages · Ctrl/⌘ F search</span>
      </footer>
    </div>
  );
});
export default ReaderSession;
