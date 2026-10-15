"use client";
import { useEffect, useRef, useState } from "react";
import { BookOpenCheck, Plus, X } from "lucide-react";

function CardEditor({ draft, onSave, onClose }) {
  const dialog = useRef(null);
  const [question, setQuestion] = useState(draft.question || ""),
    [answer, setAnswer] = useState(draft.answer || "");
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="reader-study-dialog"
      role="dialog"
      aria-label="Create revision card"
      onCancel={onClose}
    >
      <header>
        <strong>Create revision card</strong>
        <button aria-label="Close card editor" onClick={onClose}>
          <X size={18} />
        </button>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim() && answer.trim())
            onSave({
              id: crypto.randomUUID(),
              question: question.trim(),
              answer: answer.trim(),
              page: draft.page,
              reviewState: "new",
            });
        }}
      >
        <p>
          Write a question you can answer from memory.{" "}
          {draft.page ? `Source starts on page ${draft.page}.` : ""}
        </p>
        <label>
          Question
          <input
            autoFocus
            value={question}
            maxLength={1000}
            required
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        <label>
          Answer
          <textarea
            value={answer}
            rows={5}
            maxLength={6000}
            required
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
        <footer>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="reader-primary"
            disabled={!question.trim() || !answer.trim()}
          >
            Save card
          </button>
        </footer>
      </form>
    </dialog>
  );
}

function CardReview({ cards, onRate, onGo, onClose }) {
  const dialog = useRef(null);
  const [queue, setQueue] = useState(() => cards.map((c) => c.id)),
    [revealed, setRevealed] = useState(false),
    [completed, setCompleted] = useState(0);
  const card = cards.find((c) => c.id === queue[0]);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  function rate(result) {
    onRate(card.id, result);
    setRevealed(false);
    setQueue((items) =>
      result === "again" ? [...items.slice(1), items[0]] : items.slice(1),
    );
    if (result === "known") setCompleted((n) => n + 1);
  }
  return (
    <dialog
      ref={dialog}
      className="reader-study-dialog reader-review-dialog"
      role="dialog"
      aria-label="Review revision cards"
      onCancel={onClose}
    >
      <header>
        <strong>
          <BookOpenCheck size={18} /> Recall practice
        </strong>
        <button aria-label="Close card review" onClick={onClose}>
          <X size={18} />
        </button>
      </header>
      {card ? (
        <div className="reader-review-content">
          <div className="reader-review-progress">
            <span>
              {completed} recalled · {queue.length} remaining
            </span>
            <progress
              aria-label="Cards recalled"
              value={completed}
              max={cards.length}
            />
          </div>
          <p className="reader-muted">
            Try answering before revealing the answer.
          </p>
          <h2>{card.question}</h2>
          {revealed ? (
            <>
              <div className="reader-review-answer">{card.answer}</div>
              <div className="reader-review-grades">
                <button onClick={() => rate("again")}>Practice again</button>
                <button
                  className="reader-primary"
                  onClick={() => rate("known")}
                >
                  I remembered
                </button>
              </div>
            </>
          ) : (
            <button
              className="reader-primary"
              onClick={() => setRevealed(true)}
            >
              Reveal answer
            </button>
          )}
          {card.page && (
            <button
              className="reader-page-link"
              onClick={() => {
                onClose();
                onGo(card.page);
              }}
            >
              View source · Page {card.page}
            </button>
          )}
        </div>
      ) : (
        <div className="reader-review-content">
          <h2>Review complete</h2>
          <p>
            You recalled {completed} {completed === 1 ? "card" : "cards"}. Your
            progress is saved with this PDF.
          </p>
          <button className="reader-primary" onClick={onClose}>
            Done reviewing
          </button>
        </div>
      )}
    </dialog>
  );
}

export default function StudyCards({
  cards,
  onCards,
  onGo,
  page,
  draft,
  onDraft,
  onDraftClose,
}) {
  const [review, setReview] = useState(null);
  const needsPractice = cards.filter((c) => c.reviewState !== "known");
  return (
    <>
      <div className="reader-cards-heading">
        <p>
          {cards.length} cards · {needsPractice.length} to practice
        </p>
        <div>
          <button
            className="reader-primary"
            disabled={!cards.length}
            onClick={() => setReview(cards.map((c) => c.id))}
          >
            <BookOpenCheck size={16} />
            Review cards
          </button>
          <button onClick={() => onDraft({ question: "", answer: "", page })}>
            <Plus size={15} />
            Add card
          </button>
        </div>
        {needsPractice.length > 0 && needsPractice.length < cards.length && (
          <button onClick={() => setReview(needsPractice.map((c) => c.id))}>
            Practice unfinished cards
          </button>
        )}
      </div>
      {!cards.length && (
        <p className="reader-muted">
          Make a card from selected text, add your own, or use AI → Study tools
          → Revision cards. Cards work offline once saved.
        </p>
      )}
      {cards.map((card) => (
        <article key={card.id} className="reader-card">
          <small>
            {card.reviewState === "known"
              ? "Recalled"
              : card.reviewState === "again"
                ? "Needs practice"
                : "Not reviewed"}
          </small>
          <strong>{card.question}</strong>
          <details>
            <summary>Reveal answer</summary>
            <p>{card.answer}</p>
          </details>
          {card.page && (
            <button
              className="reader-page-link"
              onClick={() => onGo(card.page)}
            >
              Page {card.page}
            </button>
          )}
          <button
            className="reader-delete-note"
            onClick={() => onCards(cards.filter((c) => c.id !== card.id))}
          >
            Remove card
          </button>
        </article>
      ))}
      {draft && (
        <CardEditor
          draft={draft}
          onClose={onDraftClose}
          onSave={(card) => {
            onCards([...cards, card]);
            onDraftClose();
          }}
        />
      )}
      {review && (
        <CardReview
          cards={review
            .map((id) => cards.find((c) => c.id === id))
            .filter(Boolean)}
          onClose={() => setReview(null)}
          onGo={onGo}
          onRate={(id, reviewState) =>
            onCards(
              cards.map((c) =>
                c.id === id
                  ? {
                      ...c,
                      reviewState,
                      reviewedAt: Date.now(),
                      reviewCount: (c.reviewCount || 0) + 1,
                    }
                  : c,
              ),
            )
          }
        />
      )}
    </>
  );
}
