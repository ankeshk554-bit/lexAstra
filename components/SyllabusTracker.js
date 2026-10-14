"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { storage } from "@/utils/storage";
export default function SyllabusTracker({ exam }) {
  const key = `lexastra_syllabus_${exam.slug}`;
  const [completed, setCompleted] = useState([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const value = JSON.parse(storage.getItem(key) || "[]");
        setCompleted(
          Array.isArray(value)
            ? value.filter((v) => typeof v === "string")
            : [],
        );
      } catch {
        setCompleted([]);
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [key]);
  const topics = exam.syllabus.flatMap((paper, pi) =>
    paper.subjects.flatMap((subject, si) =>
      subject.topics.map((topic, ti) => ({ id: `${pi}-${si}-${ti}`, topic })),
    ),
  );
  const count = topics.filter((t) => completed.includes(t.id)).length;
  function toggle(id) {
    const next = completed.includes(id)
      ? completed.filter((t) => t !== id)
      : [...completed, id];
    setCompleted(next);
    if (!storage.setItem(key, JSON.stringify(next)))
      setNotice(
        "Progress could not be saved on this browser. Keep this page open to retain this session.",
      );
  }
  return (
    <section className="syllabus-progress" aria-label="Syllabus progress">
      <h3>Your syllabus checklist</h3>
      <p>
        {count} of {topics.length} topics completed · saved on this browser
      </p>
      <progress
        value={count}
        max={topics.length || 1}
        aria-label="Completed syllabus topics"
      />
      {notice && <p role="status">{notice}</p>}
      {exam.syllabus.map((paper, pi) => (
        <details key={pi}>
          <summary>{paper.paper}</summary>
          {paper.subjects.map((subject, si) => (
            <div key={si}>
              <h4>{subject.name}</h4>
              {subject.topics.map((topic, ti) => {
                const id = `${pi}-${si}-${ti}`;
                return (
                  <label key={id}>
                    <input
                      type="checkbox"
                      checked={completed.includes(id)}
                      disabled={!ready}
                      onChange={() => toggle(id)}
                    />
                    <span>{topic}</span>
                  </label>
                );
              })}
              <div className="syllabus-resources">
                {subject.relatedActs?.map((slug) => (
                  <Link key={slug} href={`/bare-acts/${slug}`}>
                    {slug.replaceAll("-", " ")} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </details>
      ))}
    </section>
  );
}
