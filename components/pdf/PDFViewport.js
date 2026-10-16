"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "pdfjs-dist/web/pdf_viewer.css";
const PDFViewport = forwardRef(function PDFViewport(
  {
    document,
    engine,
    initialView,
    annotations,
    hand,
    highlightMode,
    onChange,
    onSelection,
    onError,
  },
  ref,
) {
  const containerRef = useRef(null),
    viewerRef = useRef(null),
    instanceRef = useRef(null),
    selecting = useRef(false),
    pointerType = useRef("mouse"),
    selectedRange = useRef(null);
  const latest = useRef({ annotations, hand, onChange, onSelection, onError });
  useEffect(() => {
    latest.current = { annotations, hand, onChange, onSelection, onError };
  });
  function drawAnnotations() {
    const instance = instanceRef.current;
    if (!instance) return;
    const { viewer } = instance;
    const byPage = new Map();
    for (const note of latest.current.annotations) {
      if (!byPage.has(note.page)) byPage.set(note.page, []);
      byPage.get(note.page).push(note);
    }
    for (let i = 0; i < viewer.pagesCount; i++) {
      const pv = viewer.getPageView(i);
      if (!pv?.div || !pv.viewport) continue;
      pv.div
        .querySelectorAll(".reader-highlight-layer")
        .forEach((n) => n.remove());
      const notes = byPage.get(i + 1);
      if (!notes?.length || !pv.div.querySelector("canvas")) continue;
      const layer = window.document.createElement("div");
      layer.className = "reader-highlight-layer";
      layer.setAttribute("aria-hidden", "true");
      for (const note of notes)
        for (const rect of note.rects) {
          const [x1, y1] = pv.viewport.convertToViewportPoint(rect[0], rect[1]);
          const [x2, y2] = pv.viewport.convertToViewportPoint(rect[2], rect[3]);
          const mark = window.document.createElement("span");
          mark.className = "reader-highlight";
          Object.assign(mark.style, {
            left: `${Math.min(x1, x2)}px`,
            top: `${Math.min(y1, y2)}px`,
            width: `${Math.abs(x2 - x1)}px`,
            height: `${Math.abs(y2 - y1)}px`,
            background: note.color || "#fde047",
          });
          layer.appendChild(mark);
        }
      pv.div.appendChild(layer);
    }
  }
  useEffect(() => {
    const abort = new AbortController();
    let ready = false,
      resizeFrame;
    const eventBus = new engine.EventBus();
    const linkService = new engine.PDFLinkService({
      eventBus,
      externalLinkTarget: 2,
      externalLinkRel: "noopener noreferrer nofollow",
    });
    const findController = new engine.PDFFindController({
      eventBus,
      linkService,
    });
    const viewer = new engine.PDFViewer({
      container: containerRef.current,
      viewer: viewerRef.current,
      eventBus,
      linkService,
      findController,
      downloadManager: new engine.DownloadManager(),
      annotationMode: engine.pdfjs.AnnotationMode.ENABLE_FORMS,
      annotationEditorMode: engine.pdfjs.AnnotationEditorType.DISABLE,
      maxCanvasPixels: 12 * 1024 * 1024,
      maxCanvasDim: 8192,
      enableDetailCanvas: true,
      enableSelectionRendering: false,
      enableScripting: false,
      enablePermissions: true,
      imageResourcesPath: "/api/pdf-assets/images/",
      abortSignal: abort.signal,
    });
    instanceRef.current = { viewer, eventBus, linkService, findController };
    linkService.setViewer(viewer);
    linkService.setDocument(document.pdf);
    const on = (name, handler) =>
      eventBus.on(name, handler, { signal: abort.signal });
    on("pagesinit", () => {
      ready = true;
      viewer.pagesRotation = initialView.rotation || 0;
      viewer.currentScaleValue = initialView.scale || "page-width";
      viewer.currentPageNumber = Math.min(
        document.pdf.numPages,
        initialView.page || 1,
      );
      latest.current.onChange({
        ready: true,
        page: viewer.currentPageNumber,
        scale: viewer.currentScale,
        scaleValue: ["auto", "page-width", "page-fit"].includes(
          viewer.currentScaleValue,
        )
          ? viewer.currentScaleValue
          : viewer.currentScale,
      });
    });
    on("pagechanging", ({ pageNumber }) =>
      latest.current.onChange({ page: pageNumber }),
    );
    const clearSelection = () => {
      if (selectedRange.current || selecting.current) {
        selectedRange.current = null;
        selecting.current = false;
        window.getSelection()?.removeAllRanges();
        latest.current.onSelection(null);
      }
    };
    on("scalechanging", ({ scale, presetValue }) => {
      clearSelection();
      latest.current.onChange({ scale, scaleValue: presetValue || scale });
      drawAnnotations();
    });
    on("rotationchanging", ({ pagesRotation }) => {
      clearSelection();
      latest.current.onChange({ rotation: pagesRotation });
      drawAnnotations();
    });
    on("textlayerrendered", () => {
      // Search and rerendering can replace the nodes backing a native range.
      if (
        selectedRange.current &&
        (!selectedRange.current.toString().trim() ||
          !selectedRange.current.startContainer.isConnected)
      )
        clearSelection();
    });
    on("pagerendered", ({ error }) => {
      if (error)
        latest.current.onError(
          "A page could not render. Try reopening this document.",
        );
      drawAnnotations();
    });
    on("updatefindmatchescount", ({ matchesCount }) =>
      latest.current.onChange({ matches: matchesCount }),
    );
    on("updatefindcontrolstate", ({ state, matchesCount }) =>
      latest.current.onChange({ findState: state, matches: matchesCount }),
    );
    // PDFViewer tracks rendering, but its host must reapply responsive zoom presets.
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const preset = viewer.currentScaleValue;
        if (ready && ["auto", "page-width", "page-fit"].includes(preset)) {
          viewer.currentScaleValue = preset;
        }
      });
    });
    resize.observe(containerRef.current);
    viewer.setDocument(document.pdf);
    // Native mobile selection handles emit selectionchange without mouseup.
    let selectionTimer;
    const release = (event) => {
      if (selecting.current || containerRef.current?.contains(event.target)) {
        selecting.current = false;
        pan.current = null;
        clearTimeout(selectionTimer);
        selectText(
          pointerType.current === "mouse" &&
            event.button === 0 &&
            !event.sourceCapabilities?.firesTouchEvents,
        );
      }
    };
    // A native selection drag can end outside the viewport. Listening only on
    // the viewport leaves the reader stuck in a drag and misses the highlight.
    window.addEventListener("mouseup", release, { signal: abort.signal });
    window.addEventListener(
      "blur",
      () => {
        selecting.current = false;
        pan.current = null;
      },
      { signal: abort.signal },
    );
    window.document.addEventListener(
      "selectionchange",
      () => {
        clearTimeout(selectionTimer);
        selectionTimer = setTimeout(() => {
          if (
            !/INPUT|TEXTAREA/.test(window.document.activeElement?.tagName || "")
          )
            if (!selecting.current) selectText();
        }, 160);
      },
      { signal: abort.signal },
    );
    const onKey = (event) => {
      if (event.key === "Escape") latest.current.onSelection(null);
    };
    containerRef.current.addEventListener("keydown", onKey, {
      signal: abort.signal,
    });
    return () => {
      clearTimeout(selectionTimer);
      resize.disconnect();
      cancelAnimationFrame(resizeFrame);
      abort.abort();
      viewer.setDocument(null);
      linkService.setDocument(null);
      instanceRef.current = null;
    };
    // The keyed reader remounts for each document; initial view is only applied once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, engine]);
  useEffect(() => {
    drawAnnotations();
  }, [annotations]);
  useImperativeHandle(
    ref,
    () => ({
      goTo(page) {
        instanceRef.current?.viewer.scrollPageIntoView({ pageNumber: page });
      },
      destination(dest) {
        instanceRef.current?.linkService
          .goToDestination(dest)
          .catch(() =>
            latest.current.onError(
              "This outline destination could not be opened.",
            ),
          );
      },
      scale(value) {
        if (instanceRef.current)
          instanceRef.current.viewer.currentScaleValue = value;
      },
      zoom(direction) {
        const viewer = instanceRef.current?.viewer;
        if (viewer)
          viewer.currentScale = Math.max(
            0.25,
            Math.min(4, viewer.currentScale * (direction > 0 ? 1.2 : 1 / 1.2)),
          );
      },
      rotate() {
        const viewer = instanceRef.current?.viewer;
        if (viewer) viewer.pagesRotation = (viewer.pagesRotation + 90) % 360;
      },
      search(query, options = {}, again = false, previous = false) {
        instanceRef.current?.eventBus.dispatch("find", {
          source: containerRef.current,
          type: again ? "again" : "",
          query,
          caseSensitive: !!options.caseSensitive,
          entireWord: !!options.wholeWord,
          highlightAll: true,
          findPrevious: previous,
          matchDiacritics: false,
        });
      },
      focus() {
        containerRef.current?.focus();
      },
    }),
    [],
  );
  function selectText(complete = false) {
    if (latest.current.hand) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.toString().trim()) {
      if (
        !window.document.activeElement?.closest(".reader-selection, .reader-ai")
      ) {
        selectedRange.current = null;
        latest.current.onSelection(null);
      }
      return;
    }
    const range = selection.getRangeAt(0),
      container = containerRef.current;
    if (
      !container.contains(range.startContainer) &&
      !container.contains(range.endContainer)
    )
      return;
    const groups = [];
    container.querySelectorAll(".page").forEach((page) => {
      const number = Number(page.dataset.pageNumber),
        pv = instanceRef.current?.viewer.getPageView(number - 1);
      if (!pv?.viewport) return;
      const bounds = page.getBoundingClientRect(),
        rects = [],
        seenRects = new Set(),
        texts = [];
      const textLayer = page.querySelector(".textLayer");
      if (!textLayer || !range.intersectsNode(textLayer)) return;
      // Walk text nodes, not span boxes: search inserts nested spans whose
      // full element rectangles can extend beyond a partial text selection.
      const walker = window.document.createTreeWalker(
        textLayer,
        NodeFilter.SHOW_TEXT,
      );
      let node, lastSpan;
      while ((node = walker.nextNode())) {
        if (!node.textContent || !range.intersectsNode(node)) continue;
        const part = window.document.createRange();
        part.selectNodeContents(node);
        if (part.compareBoundaryPoints(Range.START_TO_START, range) < 0)
          part.setStart(range.startContainer, range.startOffset);
        if (part.compareBoundaryPoints(Range.END_TO_END, range) > 0)
          part.setEnd(range.endContainer, range.endOffset);
        if (!part.toString()) continue;
        const span =
          node.parentElement.closest("span[role=presentation]") ||
          node.parentElement;
        if (lastSpan && span !== lastSpan) texts.push(" ");
        texts.push(part.toString());
        lastSpan = span;
        for (const rect of part.getClientRects()) {
          if (rect.width < 1 || rect.height < 1) continue;
          // Nested search spans can report the same rectangle for element and text.
          const key = [rect.left, rect.top, rect.right, rect.bottom].join(",");
          if (seenRects.has(key)) continue;
          seenRects.add(key);
          const a = pv.viewport.convertToPdfPoint(
            rect.left - bounds.left - page.clientLeft,
            rect.top - bounds.top - page.clientTop,
          );
          const b = pv.viewport.convertToPdfPoint(
            rect.right - bounds.left - page.clientLeft,
            rect.bottom - bounds.top - page.clientTop,
          );
          rects.push([
            Math.min(a[0], b[0]),
            Math.min(a[1], b[1]),
            Math.max(a[0], b[0]),
            Math.max(a[1], b[1]),
          ]);
        }
      }
      if (rects.length)
        groups.push({
          page: number,
          rects: rects.slice(0, 1000),
          text: texts.join("").trim(),
        });
    });
    if (groups.length) {
      selectedRange.current = range.cloneRange();
      latest.current.onSelection(
        {
          range: range.cloneRange(),
          anchor: range.getBoundingClientRect(),
          signature: JSON.stringify(groups.map((g) => [g.page, g.rects])),
          text: groups
            .map((g) => g.text)
            .join("\n")
            .slice(0, 20000),
          groups,
        },
        { complete },
      );
    }
  }
  const pan = useRef(null);
  return (
    <div
      className={
        "reader-viewport" +
        (hand ? " reader-viewport--hand" : "") +
        (highlightMode ? " reader-viewport--highlight" : "")
      }
      ref={containerRef}
      tabIndex={0}
      aria-label="PDF pages"
      onKeyUp={() => selectText()}
      onPointerDown={(e) => {
        pointerType.current = e.pointerType;
        selecting.current = e.pointerType === "mouse" && e.button === 0;
        if (e.button === 0) latest.current.onSelection(null);
        if (hand && e.button === 0) {
          pan.current = {
            x: e.clientX,
            y: e.clientY,
            left: e.currentTarget.scrollLeft,
            top: e.currentTarget.scrollTop,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      }}
      onPointerMove={(e) => {
        if (pan.current) {
          e.currentTarget.scrollLeft =
            pan.current.left + pan.current.x - e.clientX;
          e.currentTarget.scrollTop =
            pan.current.top + pan.current.y - e.clientY;
        }
      }}
      onPointerUp={() => {
        pan.current = null;
      }}
      onPointerCancel={() => {
        selecting.current = false;
        pan.current = null;
      }}
    >
      <div ref={viewerRef} className="pdfViewer" />
    </div>
  );
});
export default PDFViewport;
