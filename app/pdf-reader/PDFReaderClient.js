"use client";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  FileUp,
  Trash2,
  FolderOpen,
  ShieldCheck,
  Search,
  Sparkles,
} from "lucide-react";
import { deleteBook, getAllBooks, getBook, getStudy } from "@/utils/libraryDb";
import { storage } from "@/utils/storage";
import { loadPDFEngine, documentOptions } from "@/utils/pdf/engine";
import { normalizeStudy, validatePDFFile } from "@/utils/pdf/document.mjs";
import ReaderSession from "@/components/pdf/ReaderSession";
import "./reader.css";

async function migrateNotes(pdf, name) {
  for (const key of [pdf.fingerprints?.[0], name.replace(/\s+/g, "_")]) {
    try {
      const old = JSON.parse(
        storage.getItem(`lexastra_pdf_${key}_anns`) || "null",
      );
      const legacyCards = JSON.parse(
        storage.getItem(`lexastra_pdf_${key}_flashcards`) || "[]",
      );
      const cards = Array.isArray(legacyCards)
        ? legacyCards.map((c, i) => ({ ...c, id: `legacy-card-${i}` }))
        : [];
      if ((!Array.isArray(old) || !old.length) && !cards.length) continue;
      const annotations = [];
      for (const note of Array.isArray(old) ? old : []) {
        if (
          !Number.isInteger(note.page) ||
          note.page < 1 ||
          note.page > pdf.numPages
        )
          continue;
        const viewport = (await pdf.getPage(note.page)).getViewport({
          scale: 1,
        });
        const rects = (note.rects || []).map((r) => {
          const a = viewport.convertToPdfPoint(r.left, r.top),
            b = viewport.convertToPdfPoint(r.left + r.width, r.top + r.height);
          return [
            Math.min(a[0], b[0]),
            Math.min(a[1], b[1]),
            Math.max(a[0], b[0]),
            Math.max(a[1], b[1]),
          ];
        });
        annotations.push({
          ...note,
          id: String(note.id),
          note: note.comment || "",
          rects,
        });
      }
      return { annotations, cards };
    } catch {
      /* Keep the legacy copy intact if it cannot be migrated. */
    }
  }
  return {};
}
export default function PDFReaderClient() {
  const [engine, setEngine] = useState(null),
    [document, setDocument] = useState(null),
    [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(""),
    [error, setError] = useState(""),
    [password, setPassword] = useState(null),
    [passwordText, setPasswordText] = useState("");
  const [filter, setFilter] = useState(""),
    [dragging, setDragging] = useState(false);
  const input = useRef(null),
    session = useRef(null),
    active = useRef(null),
    pending = useRef(null),
    generation = useRef(0);
  async function refresh() {
    try {
      setBooks(await getAllBooks());
    } catch {
      setError(
        "Local library storage is unavailable. You can still open PDFs and export your notes.",
      );
    }
  }
  useEffect(() => {
    window.document.body.classList.add("full-screen-page");
    loadPDFEngine()
      .then(setEngine)
      .catch(() =>
        setError("The PDF engine could not load. Open a PDF to retry."),
      );
    getAllBooks()
      .then(setBooks)
      .catch(() =>
        setError(
          "Local library storage is unavailable. You can still open PDFs and export your notes.",
        ),
      );
    // Cancel whichever task is active when this workspace actually unmounts.
    return () => {
      window.document.body.classList.remove("full-screen-page");
      // Read the live task generation, not a render-time snapshot.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      pending.current?.destroy();
      active.current?.task.destroy();
    };
  }, []);
  function cancelOpen() {
    generation.current++;
    pending.current?.destroy();
    pending.current = null;
    setPassword(null);
    setPasswordText("");
    setLoading("");
  }
  async function open(file, saved = false) {
    const ticket = ++generation.current;
    pending.current?.destroy();
    pending.current = null;
    setPassword(null);
    setPasswordText("");
    setError("");
    try {
      validatePDFFile(file);
      setLoading(`Opening ${file.name}…`);
      if (
        (await session.current?.flush()) === false &&
        !window.confirm(
          "Your latest notes could not be saved. Open another document without saving? Export a notes backup first to keep them.",
        )
      ) {
        setLoading("");
        return;
      }
      const loadedEngine = engine || (await loadPDFEngine());
      setEngine(loadedEngine);
      const bytes = await file.arrayBuffer();
      const hash = await crypto.subtle.digest("SHA-256", bytes);
      const id = Array.from(new Uint8Array(hash), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      if (ticket !== generation.current) return;
      if (active.current?.id === id) {
        setLoading("");
        return;
      }
      const task = loadedEngine.pdfjs.getDocument(documentOptions(bytes));
      pending.current = task;
      task.onPassword = (submit, reason) => {
        if (ticket !== generation.current) return;
        setPasswordText("");
        setPassword({
          submit,
          incorrect:
            reason === loadedEngine.pdfjs.PasswordResponses.INCORRECT_PASSWORD,
        });
      };
      const pdf = await task.promise;
      if (ticket !== generation.current) {
        await task.destroy();
        return;
      }
      setPassword(null);
      setPasswordText("");
      let study,
        storageError = "";
      try {
        study = await getStudy(id);
      } catch {
        storageError =
          "Notes cannot be saved in this browser. Export a backup before closing.";
      }
      if (!study) study = await migrateNotes(pdf, file.name);
      study = normalizeStudy(study, pdf.numPages);
      for (const [key, value] of Object.entries(study.forms))
        pdf.annotationStorage.setValue(key, value);
      if (ticket !== generation.current) {
        await task.destroy();
        return;
      }
      const next = {
        id,
        name: file.name,
        pdf,
        task,
        bytes,
        study,
        saved,
        storageError,
      };
      const previous = active.current;
      active.current = next;
      pending.current = null;
      setDocument(next);
      setLoading("");
      if (previous) setTimeout(() => previous.task.destroy(), 0);
    } catch (err) {
      if (ticket !== generation.current) return;
      pending.current?.destroy();
      pending.current = null;
      setPassword(null);
      setLoading("");
      setError(
        err.name === "InvalidPDFException"
          ? "This PDF is damaged or is not a valid PDF. Try another copy."
          : err.message || "This PDF could not be opened. Try another file.",
      );
    }
  }
  async function openSaved(id) {
    try {
      const book = await getBook(id);
      if (!book)
        throw new Error(
          "This PDF is no longer in local storage. Open the original file again.",
        );
      await open(
        new File([book.fileData], book.title, { type: "application/pdf" }),
        true,
      );
    } catch (err) {
      setError(err.message);
    }
  }
  async function close() {
    if (
      (await session.current?.flush()) === false &&
      !window.confirm(
        "Your latest notes could not be saved. Close without saving? Export a notes backup first to keep them.",
      )
    )
      return;
    const previous = active.current;
    active.current = null;
    setDocument(null);
    setError("");
    await refresh();
    setTimeout(() => previous?.task.destroy(), 0);
  }
  return (
    <div
      className="reader-app"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) open(file);
      }}
    >
      <input
        ref={input}
        type="file"
        accept=".pdf"
        hidden
        aria-label="Open PDF file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) open(file);
        }}
      />
      {error && (
        <div className="reader-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}
      {document ? (
        <ReaderSession
          key={document.id + document.task.docId}
          ref={session}
          document={document}
          engine={engine}
          onOpen={() => input.current.click()}
          onClose={close}
        />
      ) : (
        <div className="reader-library">
          <div className="reader-library-heading">
            <span className="reader-eyebrow">YOUR READING ROOM</span>
            <h1>
              Read closely.
              <br />
              <em>Understand deeply.</em>
            </h1>
            <p>
              A focused workspace for your judgments, bare acts, and textbooks.
              Keep your notes beside the source.
            </p>
          </div>
          <button
            className="reader-import"
            onClick={() => input.current.click()}
          >
            <FileUp size={32} />
            <strong>Open a PDF</strong>
            <span>Choose a file or drop it here · up to 150 MB</span>
          </button>
          <div className="reader-features">
            <span>
              <Search size={18} />
              Precise text search
            </span>
            <span>
              <BookOpen size={18} />
              Highlights & saved notes
            </span>
            <span>
              <Sparkles size={18} />
              AI with page sources
            </span>
          </div>
          <section className="reader-shelf">
            <div className="reader-shelf-title">
              <div>
                <h2>Your library</h2>
                <p>Files saved on this device</p>
              </div>
              <input
                type="search"
                aria-label="Filter library"
                placeholder="Find a document…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {books.length ? (
              <div className="reader-books">
                {books
                  .filter((b) =>
                    b.title.toLowerCase().includes(filter.toLowerCase()),
                  )
                  .map((book) => (
                    <article className="reader-book" key={book.id}>
                      <button onClick={() => openSaved(book.id)}>
                        <BookOpen size={24} />
                        <strong>{book.title}</strong>
                        <span>
                          {(book.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                          {new Date(book.addedAt).toLocaleDateString()}
                        </span>
                      </button>
                      <button
                        aria-label={`Remove ${book.title} from library`}
                        title="Remove saved file (notes are kept)"
                        onClick={async () => {
                          try {
                            await deleteBook(book.id);
                            await refresh();
                          } catch {
                            setError(
                              "The file could not be removed. Try again.",
                            );
                          }
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="reader-empty">
                <FolderOpen size={30} />
                <p>Build a library that stays with your study.</p>
                <span>
                  Open a PDF, then choose “Save PDF” to keep a local copy.
                </span>
              </div>
            )}
          </section>
          <p className="reader-local">
            <ShieldCheck size={16} /> PDFs stay on your device. Only the
            excerpts you ask about are sent to AI. Export notes to keep a backup
            outside this browser.
          </p>
        </div>
      )}
      {dragging && (
        <div className="reader-drop">
          <FileUp size={40} />
          <h2>Drop your PDF to open it</h2>
        </div>
      )}
      {loading && (
        <div className="reader-modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-open-title"
            className="reader-dialog"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                cancelOpen();
              }
              if (event.key === "Tab") {
                const controls = [
                  ...event.currentTarget.querySelectorAll("input,button"),
                ].filter((el) => !el.disabled);
                const first = controls[0],
                  last = controls.at(-1);
                if (event.shiftKey && window.document.activeElement === first) {
                  event.preventDefault();
                  last?.focus();
                } else if (
                  !event.shiftKey &&
                  window.document.activeElement === last
                ) {
                  event.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <h2 id="reader-open-title">
              {password ? "Unlock PDF" : "Opening document"}
            </h2>
            {password ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  password.submit(passwordText);
                  setPassword(null);
                  setPasswordText("");
                }}
              >
                <p>
                  {password.incorrect
                    ? "That password was incorrect. Try again."
                    : "This document is password protected."}
                </p>
                <label>
                  Password
                  <input
                    autoFocus
                    type="password"
                    value={passwordText}
                    onChange={(e) => setPasswordText(e.target.value)}
                    required
                  />
                </label>
                <div className="reader-actions">
                  <button type="button" onClick={cancelOpen}>
                    Cancel
                  </button>
                  <button className="reader-primary" type="submit">
                    Unlock
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p role="status">{loading}</p>
                <progress />
                <button autoFocus onClick={cancelOpen}>
                  Cancel
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
