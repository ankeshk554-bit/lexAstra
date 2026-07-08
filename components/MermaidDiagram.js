'use client';

import React, { useEffect, useState, useId, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, X, Code } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// PASS 0 — Minimal cleanup (strip markdown fences, ensure declaration)
// ═══════════════════════════════════════════════════════════════
const minimalClean = (code) => {
  if (!code) return '';
  let s = code.replace(/```mermaid\s*/gi, '').replace(/```/g, '').trim();
  
  // Ensure valid declaration
  const fl = s.split('\n').find(l => l.trim())?.trim().toLowerCase() || '';
  const kws = ['flowchart','graph','sequencediagram','gantt','classdiagram',
    'statediagram','erdiagram','journey','gitgraph','pie','mindmap','timeline'];
  if (!kws.some(k => fl.startsWith(k))) {
    s = 'flowchart TD\n' + s;
  }
  return s;
};

// ═══════════════════════════════════════════════════════════════
// PASS 1 — Conservative sanitization (only fix known-broken patterns)
// ═══════════════════════════════════════════════════════════════
const conservativeSanitize = (code) => {
  if (!code) return '';
  let s = code.replace(/```mermaid\s*/gi, '').replace(/```/g, '').trim();

  // Process line-by-line for safety
  const lines = s.split('\n');
  const out = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // Pass through empty lines, declarations, comments
    if (!trimmed || trimmed.startsWith('%%')) {
      out.push(line);
      continue;
    }

    // Fix "end" used as node ID (but NOT the subgraph-closing "end")
    // Only rename if end is followed by a shape or arrow on the SAME line
    if (/^end$/i.test(trimmed)) {
      out.push(line); // subgraph closer — keep as-is
      continue;
    }

    // Rename 'end' when used as a node ID with a shape
    let processed = line;
    processed = processed.replace(/\bend\s*(?=\[|\(|\{)/g, 'nd_end');
    processed = processed.replace(/(-->|-.->|==>)\s*end\b(?!\s*$)/g, '$1 nd_end');

    // Fix subgraph titles with spaces: "subgraph My Title" → subgraph sg_id ["My Title"]
    if (/^\s*subgraph\s+/i.test(processed)) {
      const match = processed.match(/^(\s*subgraph)\s+(.+)$/i);
      if (match) {
        const title = match[2].trim();
        // Already has bracket syntax or is a single word — leave it
        if (!title.includes('[') && title.includes(' ')) {
          const id = 'sg_' + title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
          processed = `${match[1]} ${id} ["${title}"]`;
        }
      }
    }

    out.push(processed);
  }

  s = out.join('\n');

  // Ensure valid declaration
  const fl = s.split('\n').find(l => l.trim())?.trim().toLowerCase() || '';
  const kws = ['flowchart','graph','sequencediagram','gantt','classdiagram',
    'statediagram','erdiagram','journey','gitgraph','pie','mindmap','timeline'];
  if (!kws.some(k => fl.startsWith(k))) {
    s = 'flowchart TD\n' + s;
  }
  return s;
};

// ═══════════════════════════════════════════════════════════════
// PASS 2 — Bare-bones: extract ONLY node IDs and arrows
// ═══════════════════════════════════════════════════════════════
const stripToBareBones = (code) => {
  if (!code) return '';
  let s = code.replace(/```mermaid\s*/gi, '').replace(/```/g, '').trim();

  const outLines = ['flowchart TD'];
  const seenEdges = new Set();

  for (const line of s.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip declarations, style directives, comments
    if (/^(flowchart|graph|%%|style |classDef |class |linkStyle |click |direction )/i.test(trimmed)) continue;
    // Skip subgraph/end — we'll flatten the graph
    if (/^(subgraph|end$)/i.test(trimmed)) continue;

    // Extract all node IDs from the line (strip shape content)
    let simplified = trimmed;
    // Remove all shape content greedily
    simplified = simplified.replace(/\(\("[^"]*"\)\)/g, ''); // (("label"))
    simplified = simplified.replace(/\(\(.*?\)\)/g, '');     // ((label))
    simplified = simplified.replace(/\{\{"[^"]*"\}\}/g, ''); // {{"label"}}
    simplified = simplified.replace(/\{\{.*?\}\}/g, '');     // {{label}}
    simplified = simplified.replace(/\["[^"]*"\]/g, '');     // ["label"]
    simplified = simplified.replace(/\[[^\]]*\]/g, '');      // [label]
    simplified = simplified.replace(/\("(?:[^"\\]|\\.)*"\)/g, '');  // ("label")
    simplified = simplified.replace(/\([^)]*\)/g, '');       // (label)
    simplified = simplified.replace(/\{"[^"]*"\}/g, '');     // {"label"}
    simplified = simplified.replace(/\{[^}]*\}/g, '');       // {label}

    // Remove connection labels:  -- "label" -->  →  -->
    simplified = simplified.replace(/\s+--\s+"[^"]*"\s+-->/g, ' -->');
    simplified = simplified.replace(/\s+--\s+\S+\s+-->/g, ' -->');
    simplified = simplified.replace(/\s+==\s+"[^"]*"\s+==>/g, ' ==>');
    simplified = simplified.replace(/\s+==\s+\S+\s+==>/g, ' ==>');
    simplified = simplified.replace(/-\.\s+"[^"]*"\s+\.->/g, ' -.->');
    simplified = simplified.replace(/-\.\s+\S+\s+\.->/g, ' -.->');

    // Remove pipe labels:  -->|label|  →  -->
    simplified = simplified.replace(/(-->|-.->|==>)\s*\|[^|]*\|/g, '$1');

    // Now extract node IDs connected by arrows
    // Split by arrow patterns
    const parts = simplified.split(/(-->|-.->|==>)/).map(p => p.trim()).filter(Boolean);
    
    for (let i = 0; i < parts.length - 2; i += 2) {
      const src = parts[i].replace(/[^A-Za-z0-9_-]/g, '').trim();
      const arrow = parts[i + 1];
      const dst = parts[i + 2]?.replace(/[^A-Za-z0-9_-]/g, '').trim();
      
      if (src && dst && arrow) {
        // Skip reserved keywords
        const safeSrc = /^(end|subgraph|style|class)$/i.test(src) ? 'nd_' + src : src;
        const safeDst = /^(end|subgraph|style|class)$/i.test(dst) ? 'nd_' + dst : dst;
        const edge = `${safeSrc} --> ${safeDst}`;
        if (!seenEdges.has(edge)) {
          seenEdges.add(edge);
          outLines.push('  ' + edge);
        }
      }
    }
  }

  // Must have at least one edge
  if (outLines.length <= 1) {
    outLines.push('  A["No diagram data"] --> B["Please regenerate"]');
  }

  return outLines.join('\n');
};


// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function MermaidDiagram({ chart }) {
  const [svg, setSvg] = useState('');
  const [showRawCode, setShowRawCode] = useState(false);
  const [renderPass, setRenderPass] = useState(0); // which pass succeeded (for debug)
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const id = useId();
  const mermaidId = `mermaid-${id.replace(/:/g, '')}`;

  const cleanupLeakedElements = (idToClean) => {
    if (!idToClean) return;
    ['', 'd', 'bind-pool-'].forEach(prefix => {
      const el = document.getElementById(`${prefix}${idToClean}`);
      if (el) el.remove();
    });
  };

  useEffect(() => {
    let isMounted = true;
    let mermaidInstance = null;

    const attemptRender = async (chartCode, renderId) => {
      // Re-initialize mermaid fresh for each attempt
      const mod = await import('mermaid');
      mermaidInstance = mod.default || mod;
      
      mermaidInstance.initialize({
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

      const { svg: result } = await mermaidInstance.render(renderId, chartCode);
      
      // Check for error markers in the SVG
      if (result && (result.includes('Syntax error') || 
          result.includes('error-icon') || 
          result.includes('parser-error'))) {
        throw new Error('Error markers found in SVG output');
      }
      
      return result;
    };

    const run = async () => {
      if (!chart) return;

      const passes = [
        { name: 'Raw', fn: () => minimalClean(chart) },
        { name: 'Sanitized', fn: () => conservativeSanitize(chart) },
        { name: 'Bare-bones', fn: () => stripToBareBones(chart) },
      ];

      for (let i = 0; i < passes.length; i++) {
        const pass = passes[i];
        const rid = `${mermaidId}_p${i}_${Math.random().toString(36).slice(2, 8)}`;
        let chartCode = '';

        try {
          chartCode = pass.fn();
          console.log(`[MermaidDiagram] Pass ${i} (${pass.name}):\n`, chartCode);

          const result = await attemptRender(chartCode, rid);
          
          if (isMounted && result) {
            setSvg(result);
            setRenderPass(i);
            setShowRawCode(false);
            console.log(`[MermaidDiagram] ✅ Pass ${i} (${pass.name}) succeeded`);
            return; // Success!
          }
        } catch (err) {
          console.warn(`[MermaidDiagram] ❌ Pass ${i} (${pass.name}) failed:`, err.message);
          cleanupLeakedElements(rid);
          // Continue to next pass
        }
      }

      // All passes failed — show raw code
      if (isMounted) {
        console.warn('[MermaidDiagram] All passes failed. Showing raw code.');
        setShowRawCode(true);
      }
    };

    run();

    return () => {
      isMounted = false;
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
    link.href = url; link.download = `flowchart-${mermaidId}.svg`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    if (!svg) return;
    const svgEl = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 2;
    const width = parseInt(svgEl.getAttribute('width') || '800') * scale;
    const height = parseInt(svgEl.getAttribute('height') || '600') * scale;
    canvas.width = width; canvas.height = height;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `flowchart-${mermaidId}.png`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  };

  // ── Raw code fallback ────────────────────────────────────────
  if (showRawCode && !svg) {
    const rawCode = (chart || '').replace(/```mermaid\s*/gi, '').replace(/```/g, '').trim();
    return (
      <div style={{
        border: '1px solid rgba(201, 168, 76, 0.25)', borderRadius: '12px',
        overflow: 'hidden', margin: '20px 0', background: '#0B1F3A',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px', borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
          background: 'rgba(201, 168, 76, 0.08)',
        }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code size={14} /> Flowchart Structure
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(201, 168, 76, 0.6)' }}>
            Rendered as text (diagram had complex syntax)
          </span>
        </div>
        <pre style={{
          margin: 0, padding: '16px 20px', fontSize: '12.5px', lineHeight: '1.6',
          color: '#e2e8f0', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>{rawCode}</pre>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────
  if (!svg && !showRawCode) {
    return (
      <div style={{
        border: '1px dashed rgba(201, 168, 76, 0.3)', borderRadius: '12px',
        padding: '24px', textAlign: 'center', background: 'rgba(201, 168, 76, 0.02)',
        color: '#C9A84C', margin: '20px 0', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '24px', height: '24px', border: '2px solid rgba(201, 168, 76, 0.2)',
          borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'merm-spin 1s linear infinite',
        }} />
        <style>{`@keyframes merm-spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }`}</style>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>Visualizing legal flowchart...</span>
      </div>
    );
  }

  // ── Rendered SVG ─────────────────────────────────────────────
  const cardStyle = {
    border: '1px solid rgba(201, 168, 76, 0.15)', borderRadius: '12px',
    overflow: 'hidden', background: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', margin: '20px 0'
  };
  const toolbarStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc',
  };
  const buttonStyle = {
    background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px',
    padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#475569', transition: 'all 0.2s',
  };
  const primaryButtonStyle = {
    ...buttonStyle, background: '#C9A84C', borderColor: '#C9A84C', color: '#fff',
    padding: '6px 12px', fontWeight: '600', fontSize: '11px', gap: '4px'
  };
  const modalBtnStyle = {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    color: '#fff', transition: 'all 0.2s', fontWeight: '500'
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
            <span style={{ fontSize: '11px', width: '36px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={zoomIn} style={buttonStyle} title="Zoom In"><ZoomIn size={14} /></button>
            <button onClick={resetZoom} style={buttonStyle} title="Reset"><RotateCcw size={14} /></button>
            <button onClick={downloadSVG} style={primaryButtonStyle}><Download size={12} /> SVG</button>
            <button onClick={downloadPNG} style={primaryButtonStyle}><Download size={12} /> PNG</button>
            <button onClick={toggleFullscreen} style={buttonStyle} title="Fullscreen"><Maximize2 size={14} /></button>
          </div>
        </div>
        <div style={{ overflow: 'auto', padding: '24px', maxHeight: '400px', background: '#fff' }}>
          <div style={{ width: `${zoom * 100}%`, margin: '0 auto', transition: 'width 0.15s ease-out' }}
            dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      </div>

      {isFullscreen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(11,31,58,0.96)', backdropFilter: 'blur(12px)',
          zIndex: 99999, display: 'flex', flexDirection: 'column', color: '#fff'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 32px', borderBottom: '1px solid rgba(201,168,76,0.2)'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#C9A84C', fontWeight: '600' }}>⚖️ Interactive Flowchart Visualizer</h3>
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
              width: `${zoom * 100}%`, background: '#fff', padding: '40px', borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', transition: 'width 0.15s ease-out'
            }} dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      )}
    </>
  );
}
