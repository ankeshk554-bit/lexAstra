"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Palette, X } from "lucide-react";
import { storage } from "@/utils/storage";

const THEMES = [
  {
    id: "paper",
    name: "Paper",
    hint: "Clean and bright",
    pageTone: "original",
  },
  { id: "sepia", name: "Sepia", hint: "Warm and gentle", pageTone: "warm" },
  { id: "sage", name: "Sage", hint: "Soft green", pageTone: "original" },
  { id: "night", name: "Night", hint: "Low light reading", pageTone: "night" },
];
export const APPEARANCE_KEY = "lexastra_reader_appearance";
export function loadAppearance() {
  let value;
  try {
    value = JSON.parse(storage.getItem(APPEARANCE_KEY));
  } catch {}
  return {
    theme: THEMES.some((t) => t.id === value?.theme) ? value.theme : "paper",
    pageTone: ["original", "warm", "night"].includes(value?.pageTone)
      ? value.pageTone
      : "original",
    answerSize: [14, 16, 18].includes(value?.answerSize)
      ? value.answerSize
      : 14,
  };
}

export default function ReaderAppearance({ appearance, onChange, saved }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  useEffect(() => {
    if (open) dialog.current.showModal();
    else dialog.current.close();
  }, [open]);
  return (
    <>
      <button
        type="button"
        title="Reader appearance"
        aria-label="Reader appearance"
        onClick={() => setOpen(true)}
      >
        <Palette size={18} />
        <span className="reader-appearance-label">Appearance</span>
      </button>
      <dialog
        ref={dialog}
        className="reader-study-dialog reader-appearance-dialog"
        role="dialog"
        aria-labelledby="reader-appearance-title"
        onClose={() => setOpen(false)}
      >
        <header>
          <h2 id="reader-appearance-title">Make yourself comfortable</h2>
          <button
            type="button"
            aria-label="Close reader appearance"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </header>
        <div className="reader-appearance-body">
          <p>
            Choose a reading theme. Your preferences carry across documents.
          </p>
          <div
            className="reader-theme-grid"
            role="group"
            aria-label="Reader theme"
          >
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className="reader-theme-choice"
                data-preview-theme={theme.id}
                aria-pressed={appearance.theme === theme.id}
                onClick={() =>
                  onChange({
                    ...appearance,
                    theme: theme.id,
                    pageTone: theme.pageTone,
                  })
                }
              >
                <span className="reader-theme-preview" aria-hidden="true">
                  <span>Aa</span>
                  {appearance.theme === theme.id && <Check size={18} />}
                </span>
                <strong>{theme.name}</strong>
                <small>{theme.hint}</small>
              </button>
            ))}
          </div>
          <label>
            PDF page tone
            <select
              aria-label="PDF page tone"
              value={appearance.pageTone}
              onChange={(e) =>
                onChange({ ...appearance, pageTone: e.target.value })
              }
            >
              <option value="original">Original colours</option>
              <option value="warm">Warm paper</option>
              <option value="night">Night paper</option>
            </select>
          </label>
          <p>
            Page tones change colours on screen only. Choose Original colours
            for accurate diagrams and images. Downloads and printing keep the
            original colours.
          </p>
          <label>
            AI answer text size
            <select
              aria-label="AI answer text size"
              value={appearance.answerSize}
              onChange={(e) =>
                onChange({ ...appearance, answerSize: Number(e.target.value) })
              }
            >
              <option value={14}>Standard · 14 px</option>
              <option value={16}>Comfortable · 16 px</option>
              <option value={18}>Large · 18 px</option>
            </select>
          </label>
          <p
            className="reader-appearance-sample"
            style={{ fontSize: appearance.answerSize }}
          >
            A little more space to read, reflect, and understand.
          </p>
          {!saved && (
            <p role="status">
              These preferences work for this session. Browser storage is
              unavailable, so they cannot be remembered after reloading.
            </p>
          )}
          <button
            type="button"
            className="reader-primary"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      </dialog>
    </>
  );
}
