'use client';

import React, { useEffect, useState, useId, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, X, Code } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// SANITIZER — Fixes common AI-generated Mermaid syntax issues
// ═══════════════════════════════════════════════════════════════
const sanitizeMermaidChart = (code) => {
  if (!code) return '';
  let s = code;

  // Strip markdown fences
  s = s.replace(/```mermaid\s*/gi, '').replace(/```/g, '');

  // ── Reserved-word node IDs ──────────────────────────────────
  // Mermaid treats these as keywords; rename them when used as node IDs
  const reserved = ['end', 'subgraph', 'click', 'style', 'classDef',
                     'class', 'linkStyle', 'direction', 'callback'];
  reserved.forEach(kw => {
    // kw followed by shape opener: end[...] end(...) end{...}
    s = s.replace(new RegExp('\\b' + kw + '(?=\\s*[\\(\\[\\{])', 'g'), 'nd_' + kw);
    // kw as arrow target:  --> end
    s = s.replace(new RegExp('(-->|-.->|==>)\\s*' + kw + '\\b', 'g'), '$1 nd_' + kw);
    // kw as arrow source:  end -->
    s = s.replace(new RegExp('\\b' + kw + '(?=\\s*(?:-->|-.->|==>|--\\s))', 'g'), 'nd_' + kw);
  });

  // ── Subgraph titles with spaces ─────────────────────────────
  // "subgraph Foo Bar" → subgraph sg_foo_bar ["Foo Bar"]
  s = s.replace(
    /^(\s*subgraph)\s+([^[\r\n"]+?)\s*$/gm,
    (m, prefix, title) => {
      const t = title.trim();
      // Already has an id + bracket title, or is a single-word id: leave it
      if (!t.includes(' ') || t.includes('[')) return m;
      const id = 'sg_' + t.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      return `${prefix} ${id} ["${t}"]`;
    }
  );

  // ── Quote all node labels ───────────────────────────────────
  // Process line-by-line to avoid cross-line regex disasters
  const lines = s.split('\n');
  const processed = lines.map(line => {
    const trimmed = line.trim();
    // Skip directive lines, subgraph/end lines, blank, comments, style lines
    if (!trimmed || trimmed.startsWith('%%') ||
        /^(flowchart|graph|sequencediagram|gantt|classDef|class |style |linkStyle|direction|subgraph|end$)/i.test(trimmed)) {
      return line;
    }

    // Quote node labels: ID[label] ID(label) ID{label} ID((label)) ID{{label}}
    // Match ID followed by shape delimiters, quote the label inside
    let processed = line;

    // Double round ((label))
    processed = processed.replace(/([A-Za-z0-9_-]+)\(\(\s*("(?:[^"\\]|\\.)*"|[^)]*?)\s*\)\)/g,
      (m, id, lbl) => `${id}(("${cleanLabel(lbl)}"))`);

    // Double curly {{label}}
    processed = processed.replace(/([A-Za-z0-9_-]+)\{\{\s*("(?:[^"\\]|\\.)*"|[^}]*?)\s*\}\}/g,
      (m, id, lbl) => `${id}{{"${cleanLabel(lbl)}"}}`);

    // Single round (label) — but not part of (( ))
    processed = processed.replace(/([A-Za-z0-9_-]+)\((?!\()\s*("(?:[^"\\]|\\.)*"|[^()]*?)\s*\)(?!\))/g,
      (m, id, lbl) => `${id}("${cleanLabel(lbl)}")`);

    // Single curly {label} — but not part of {{ }}
    processed = processed.replace(/([A-Za-z0-9_-]+)\{(?!\{)\s*("(?:[^"\\]|\\.)*"|[^{}]*?)\s*\}(?!\})/g,
      (m, id, lbl) => `${id}{"${cleanLabel(lbl)}"}`);

    // Square [label]
    processed = processed.replace(/([A-Za-z0-9_-]+)\[\s*("(?:[^"\\]|\\.)*"|[^\]]*?)\s*\]/g,
      (m, id, lbl) => `${id}["${cleanLabel(lbl)}"]`);

    // ── Arrow labels ──────────────────────────────────────────
    // -->|label| — strip any quotes inside pipes (Mermaid doesn't want them)
    processed = processed.replace(/(-->|-.->|==>)\s*\|([^|\n]+)\|/g,
      (m, arrow, lbl) => {
        let c = lbl.trim().replace(/^"|"$/g, '').replace(/"/g, "'");
        return `${arrow}|${c}|`;
      });

    // -- label --> or == label ==> or -. label .->
    // Quote unquoted inline labels on connections
    processed = processed.replace(
      /(\s)(--|==|-\.)\s+([^">\n][^>\n]*?)\s+(-->|==>|\.->\s)/g,
      (m, sp, aStart, lbl, aEnd) => `${sp}${aStart} "${cleanLabel(lbl)}" ${aEnd}`
    );

    return processed;
  });

  s = processed.join('\n');

  // ── Ensure valid declaration ────────────────────────────────
  const firstNonEmpty = s.split('\n').find(l => l.trim().length > 0);
  if (firstNonEmpty) {
    const fl = firstNonEmpty.trim().toLowerCase();
    const keywords = ['flowchart', 'graph', 'sequencediagram', 'gantt', 'classdiagram',
                      'statediagram', 'erdiagram', 'journey', 'gitgraph', 'pie',
                      'mindmap', 'timeline', 'kanban', 'architecture', 'sankey'];
    if (!keywords.some(k => fl.startsWith(k))) {
      s = 'flowchart TD\n' + s;
    }
  } else {
    s = 'flowchart TD\n' + s;
  }

  return s;
};

// Strip outer quotes and escape inner quotes for a label
function cleanLabel(lbl) {
  let c = lbl.trim();
  // Remove outer quotes if present
  if (c.startsWith('"') && c.endsWith('"')) c = c.slice(1, -1);
  // Un-escape then re-escape to prevent double-escaping
  c = c.replace(/\\"/g, '"');
  c = c.replace(/"/g, '\\"');
  return c;
}

// ═══════════════════════════════════════════════════════════════
// NUCLEAR FALLBACK — Strips chart to absolute bare bones
// Removes all shapes, all labels — only keeps node IDs and arrows
// ═══════════════════════════════════════════════════════════════
const stripToBareBones = (code) => {
  if (!code) return '';
  let s = code;
  s = s.replace(/```mermaid\s*/gi, '').replace(/```/g, '');

  const outLines = [];
  const lines = s.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Keep flowchart/graph declarations and subgraph/end
    if (/^(flowchart|graph)\s/i.test(trimmed)) {
      outLines.push(trimmed);
      continue;
    }
    if (/^subgraph\s/i.test(trimmed)) {
      // Simplify: subgraph <single_id>
      const words = trimmed.split(/\s+/);
      outLines.push(`subgraph ${words[1] || 'sg'}`);
      continue;
    }
    if (/^end$/i.test(trimmed)) {
      outLines.push('end');
      continue;
    }

    // Skip style/classDef/linkStyle/click/direction lines
    if (/^(style|classDef|class |linkStyle|click |direction |%%)/i.test(trimmed)) continue;

    // Extract node IDs and arrows from the line
    // Replace all shapes with just the ID
    let simplified = trimmed;
    // Remove shape content: ID[...] → ID, ID(...) → ID, ID{...} → ID, ID((...)) → ID, ID{{...}} → ID
    simplified = simplified.replace(/([A-Za-z0-9_-]+)\(\([^)]*\)\)/g, '$1');
    simplified = simplified.replace(/([A-Za-z0-9_-]+)\{\{[^}]*\}\}/g, '$1');
    simplified = simplified.replace(/([A-Za-z0-9_-]+)\[[^\]]*\]/g, '$1');
    simplified = simplified.replace(/([A-Za-z0-9_-]+)\([^)]*\)/g, '$1');
    simplified = simplified.replace(/([A-Za-z0-9_-]+)\{[^}]*\}/g, '$1');

    // Remove inline connection labels: -- "label" --> becomes -->
    simplified = simplified.replace(/\s+--\s+"[^"]*"\s+-->/g, ' -->');
    simplified = simplified.replace(/\s+--\s+[^->"\s][^->]*\s+-->/g, ' -->');
    simplified = simplified.replace(/\s+==\s+"[^"]*"\s+==>/g, ' ==>');
    simplified = simplified.replace(/\s+==\s+[^=>"\s][^=>]*\s+==>/g, ' ==>');
    simplified = simplified.replace(/\s+-\.\s+"[^"]*"\s+\.->/g, ' -.->');
    simplified = simplified.replace(/\s+-\.\s+[^.>"\s][^.>]*\s+\.->/g, ' -.->');

    // Remove pipe labels: -->|label| becomes -->
    simplified = simplified.replace(/(-->|-.->|==>)\s*\|[^|]*\|/g, '$1');

    // Rename reserved keywords used as IDs
    const reserved = ['end', 'subgraph', 'click', 'style', 'classDef', 'class', 'linkStyle', 'direction'];
    reserved.forEach(kw => {
      simplified = simplified.replace(new RegExp('\\b' + kw + '\\b', 'g'), 'nd_' + kw);
    });

    // Only keep lines that have arrows
    if (/-->|-.->|==>/.test(simplified)) {
      outLines.push(simplified.trim());
    }
  }

  // Add declaration if missing
  if (outLines.length === 0 || !/^(flowchart|graph)\s/i.test(outLines[0])) {
    outLines.unshift('flowchart TD');
  }

  return outLines.join('\n');
};


// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function MermaidDiagram({ chart }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [showRawCode, setShowRawCode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const id = useId();
  const mermaidId = `mermaid-${id.replace(/:/g, '')}`;
  const activeRenderIdRef = useRef('');
  const timeoutRef = useRef(null);

  const cleanupLeakedElements = (idToClean) => {
    if (!idToClean) return;
    ['', 'd', 'bind-pool-'].forEach(prefix => {
      const el = document.getElementById(`${prefix}${idToClean}`);
      if (el) el.remove();
    });
  };

  // Attempt to render a Mermaid chart string. Returns { svg } or throws.
  const tryRender = async (mermaid, chartCode, renderId) => {
    const { svg: generatedSvg } = await mermaid.render(renderId, chartCode);
    // Mermaid sometimes "succeeds" but returns an SVG containing an error message
    if (generatedSvg.includes('Syntax error') ||
        generatedSvg.includes('error-icon') ||
        generatedSvg.includes('parser-error')) {
      throw new Error('Syntax error detected in generated SVG');
    }
    return generatedSvg;
  };

  useEffect(() => {
    let isMounted = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const initAndRender = async () => {
      if (!chart) return;

      const baseRenderId = `${mermaidId}-${Math.random().toString(36).substring(2, 9)}`;
      activeRenderIdRef.current = baseRenderId;

      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default || mermaidModule;

        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          securityLevel: 'loose',
          theme: 'base',
          themeVariables: {
            primaryColor: '#0B1F3A',
            primaryBorderColor: '#C9A84C',
            lineColor: '#C9A84C',
            secondaryColor: '#173A6B',
            tertiaryColor: '#0B1F3A',
            edgeLabelBackground: '#0B1F3A',
            primaryTextColor: '#ffffff',
            nodeTextColor: '#ffffff',
            textColor: '#ffffff',
            mainBkg: '#0B1F3A',
            nodeBorder: '#C9A84C',
          },
          flowchart: { htmlLabels: true, useMaxWidth: true },
        });

        // ── Pass 1: Sanitized chart ──────────────────────────
        const sanitized = sanitizeMermaidChart(chart);
        const rid1 = baseRenderId + '_p1';

        try {
          const result = await tryRender(mermaid, sanitized, rid1);
          if (isMounted) { setSvg(result); setError(''); }
          return;
        } catch (e1) {
          console.warn('[MermaidDiagram] Pass 1 failed. Sanitized code:\n', sanitized, '\nError:', e1.message);
          cleanupLeakedElements(rid1);
        }

        // ── Pass 2: Bare-bones stripped chart ────────────────
        const stripped = stripToBareBones(chart);
        const rid2 = baseRenderId + '_p2';

        try {
          const result = await tryRender(mermaid, stripped, rid2);
          if (isMounted) { setSvg(result); setError(''); }
          return;
        } catch (e2) {
          console.warn('[MermaidDiagram] Pass 2 (bare-bones) also failed:\n', stripped, '\nError:', e2.message);
          cleanupLeakedElements(rid2);
        }

        // ── Pass 3: Show the raw code as fallback ────────────
        if (isMounted) {
          setShowRawCode(true);
          setError('');
        }

      } catch (err) {
        if (isMounted) {
          console.error('[MermaidDiagram] Fatal error:', err);
          setShowRawCode(true);
          setError('');
        }
      }
    };

    initAndRender();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cleanupLeakedElements(activeRenderIdRef.current);
    };
  }, [chart, mermaidId]);

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setZoom(1.0);
  const toggleFullscreen = () => { setIsFullscreen(!isFullscreen); setZoom(1.0); };

  const downloadSVG = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flowchart-${mermaidId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    if (!svg) return;
    const svgEl = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    const svgWidth = svgEl.getAttribute('width') || '800';
    const svgHeight = svgEl.getAttribute('height') || '600';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 2;
    const width = parseInt(svgWidth) * scale;
    const height = parseInt(svgHeight) * scale;
    canvas.width = width;
    canvas.height = height;
    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `flowchart-${mermaidId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(svgBlob);
  };

  // ── Raw code fallback UI ─────────────────────────────────────
  if (showRawCode && !svg) {
    // Extract clean raw code for display
    const rawCode = (chart || '').replace(/```mermaid\s*/gi, '').replace(/```/g, '').trim();
    return (
      <div style={{
        border: '1px solid rgba(201, 168, 76, 0.25)',
        borderRadius: '12px',
        overflow: 'hidden',
        margin: '20px 0',
        background: '#0B1F3A',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
          background: 'rgba(201, 168, 76, 0.08)',
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#C9A84C',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Code size={14} /> Flowchart Structure
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(201, 168, 76, 0.6)' }}>
            Rendered as text (diagram had complex syntax)
          </span>
        </div>
        <pre style={{
          margin: 0,
          padding: '16px 20px',
          fontSize: '12.5px',
          lineHeight: '1.6',
          color: '#e2e8f0',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {rawCode}
        </pre>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────
  if (!svg && !error) {
    return (
      <div style={{
        border: '1px dashed rgba(201, 168, 76, 0.3)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        background: 'rgba(201, 168, 76, 0.02)',
        color: '#C9A84C',
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '24px', height: '24px',
          border: '2px solid rgba(201, 168, 76, 0.2)',
          borderTopColor: '#C9A84C',
          borderRadius: '50%',
          animation: 'merm-spin 1s linear infinite',
        }} />
        <style>{`@keyframes merm-spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }`}</style>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>Visualizing legal flowchart...</span>
      </div>
    );
  }

  // ── Error state (shouldn't reach here with new fallback, but just in case) ──
  if (error) {
    return (
      <div style={{
        color: 'var(--alert-red)',
        padding: '12px 16px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '8px',
        fontSize: '13px',
        background: 'rgba(239, 68, 68, 0.02)',
        margin: '20px 0'
      }}>
        ⚠️ {error}
      </div>
    );
  }

  // ── Normal SVG render ────────────────────────────────────────
  const cardStyle = {
    border: '1px solid rgba(201, 168, 76, 0.15)',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    margin: '20px 0'
  };

  const toolbarStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc',
  };

  const buttonStyle = {
    background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px',
    padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#475569', transition: 'all 0.2s',
  };

  const primaryButtonStyle = {
    ...buttonStyle, background: '#C9A84C', borderColor: '#C9A84C', color: '#ffffff',
    padding: '6px 12px', fontWeight: '600', fontSize: '11px', gap: '4px'
  };

  const modalBtnStyle = {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    color: '#ffffff', transition: 'all 0.2s', fontWeight: '500'
  };

  const modalBtnStyleGold = { ...modalBtnStyle, background: '#C9A84C', borderColor: '#C9A84C' };

  return (
    <>
      <div className="mermaid-wrapper" style={cardStyle}>
        <div className="mermaid-toolbar" style={toolbarStyle}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0B1F3A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚖️ Legal Process Flowchart
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={zoomOut} style={buttonStyle} title="Zoom Out"><ZoomOut size={14} /></button>
            <span style={{ fontSize: '11px', width: '36px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={zoomIn} style={buttonStyle} title="Zoom In"><ZoomIn size={14} /></button>
            <button onClick={resetZoom} style={buttonStyle} title="Reset"><RotateCcw size={14} /></button>
            <button onClick={downloadSVG} style={primaryButtonStyle} title="Download SVG"><Download size={12} /> SVG</button>
            <button onClick={downloadPNG} style={primaryButtonStyle} title="Download PNG"><Download size={12} /> PNG</button>
            <button onClick={toggleFullscreen} style={buttonStyle} title="Fullscreen view"><Maximize2 size={14} /></button>
          </div>
        </div>
        <div className="mermaid-container" style={{ overflow: 'auto', padding: '24px', maxHeight: '400px', background: '#ffffff', display: 'block' }}>
          <div className="mermaid-svg-wrapper"
            style={{ width: `${zoom * 100}%`, margin: '0 auto', transition: 'width 0.15s ease-out', display: 'block' }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>

      {isFullscreen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(11, 31, 58, 0.96)', backdropFilter: 'blur(12px)',
          zIndex: 99999, display: 'flex', flexDirection: 'column', color: '#ffffff'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 32px', borderBottom: '1px solid rgba(201, 168, 76, 0.2)'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#C9A84C', fontWeight: '600', letterSpacing: '0.5px' }}>
              ⚖️ Interactive Flowchart Visualizer
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={zoomOut} style={modalBtnStyle}><ZoomOut size={16} /> Zoom Out</button>
              <span style={{ fontSize: '14px', alignSelf: 'center', minWidth: '48px', textAlign: 'center', fontWeight: '600' }}>{Math.round(zoom * 100)}%</span>
              <button onClick={zoomIn} style={modalBtnStyle}><ZoomIn size={16} /> Zoom In</button>
              <button onClick={resetZoom} style={modalBtnStyle}><RotateCcw size={16} /> Reset</button>
              <button onClick={downloadSVG} style={modalBtnStyleGold}><Download size={16} /> SVG</button>
              <button onClick={downloadPNG} style={modalBtnStyleGold}><Download size={16} /> PNG</button>
              <button onClick={toggleFullscreen} style={{ ...modalBtnStyle, background: '#ef4444', borderColor: '#ef4444' }}><X size={16} /> Close</button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: `${zoom * 100}%`, maxWidth: 'none', background: '#ffffff',
              padding: '40px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
              transition: 'width 0.15s ease-out', display: 'block'
            }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </>
  );
}
