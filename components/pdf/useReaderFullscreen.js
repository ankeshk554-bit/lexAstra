"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

function subscribe(listener) {
  window.document.addEventListener("fullscreenchange", listener);
  return () =>
    window.document.removeEventListener("fullscreenchange", listener);
}
const snapshot = () =>
  !!window.document.fullscreenElement?.classList.contains("reader-app");

export default function useReaderFullscreen(session) {
  const native = useSyncExternalStore(subscribe, snapshot, () => false);
  const [focus, setFocus] = useState(false);
  const pending = useRef(false),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!focus) return;
    const root = session.current.closest(".reader-app");
    root.classList.add("reader-focus");
    window.document.body.classList.add("reader-focus-active");
    const escape = (e) => {
      if (e.key === "Escape" && !e.target.closest('[role="dialog"]'))
        setFocus(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      root.classList.remove("reader-focus");
      window.document.body.classList.remove("reader-focus-active");
      window.removeEventListener("keydown", escape);
    };
  }, [focus, session]);
  const exit = useCallback(async () => {
    setFocus(false);
    if (snapshot()) await window.document.exitFullscreen().catch(() => {});
  }, []);
  const toggle = useCallback(async () => {
    if (pending.current) return;
    if (native || focus) {
      await exit();
      return;
    }
    const root = session.current.closest(".reader-app");
    pending.current = true;
    try {
      if (!root.requestFullscreen || !window.document.fullscreenEnabled)
        throw new Error("Use focus view");
      await root.requestFullscreen();
    } catch {
      // Focus view gives unsupported browsers the full viewport without hiding controls.
      if (alive.current) setFocus(true);
    } finally {
      pending.current = false;
    }
  }, [exit, focus, native, session]);
  return { active: native || focus, toggle, exit };
}
