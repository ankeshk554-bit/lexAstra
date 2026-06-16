'use client';

import React, { useEffect, useState, useId, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, X } from 'lucide-react';

export default function MermaidDiagram({ chart }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const id = useId();
  const mermaidId = `mermaid-${id.replace(/:/g, '')}`;

  useEffect(() => {
    let isMounted = true;
    
    const initAndRender = async () => {
      const mermaid = (await import('mermaid')).default;
      
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#0B1F3A',
          primaryBorderColor: '#C9A84C',
          lineColor: '#C9A84C',
          secondaryColor: '#173A6B',
          tertiaryColor: '#0B1F3A',
          edgeLabelBackground: '#0B1F3A', // Navy background for edge labels so the native white text contrasts perfectly
          primaryTextColor: '#ffffff',
          nodeTextColor: '#ffffff',
          textColor: '#ffffff',
          mainBkg: '#0B1F3A',
          nodeBorder: '#C9A84C',
        },
        flowchart: {
          htmlLabels: true,
          useMaxWidth: true,
        }
      });

      try {
        if (!chart) return;
        const { svg: generatedSvg } = await mermaid.render(mermaidId, chart);
        if (isMounted) {
          setSvg(generatedSvg);
          setError('');
        }
      } catch (err) {
        // Silently swallow errors because during AI streaming, the Mermaid syntax 
        // is naturally incomplete character-by-character, which constantly throws syntax errors.
        if (isMounted) setError('Generating legal diagram...');
      }
    };

    initAndRender();
    
    return () => { isMounted = false; };
  }, [chart, mermaidId]);

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setZoom(1.0);
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setZoom(1.0);
  };

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
    
    // Parse dimensions from SVG
    const svgEl = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    const svgWidth = svgEl.getAttribute('width') || '800';
    const svgHeight = svgEl.getAttribute('height') || '600';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Scale canvas for high quality double resolution PNG
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
        // Render white background sheet
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

  if (error) {
    return <div style={{ color: 'var(--alert-red)', padding: '8px', border: '1px solid var(--alert-red)', borderRadius: '4px', fontSize: '12px' }}>{error}</div>;
  }

  const cardStyle = {
    border: '1px solid rgba(201, 168, 76, 0.15)',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    margin: '20px 0'
  };

  const toolbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    borderBottom: '1px solid #f1f5f9',
    background: '#f8fafc',
  };

  const buttonStyle = {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569',
    transition: 'all 0.2s',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: '#C9A84C',
    borderColor: '#C9A84C',
    color: '#ffffff',
    padding: '6px 12px',
    fontWeight: '600',
    fontSize: '11px',
    gap: '4px'
  };

  const modalBtnStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: '#ffffff',
    transition: 'all 0.2s',
    fontWeight: '500'
  };

  const modalBtnStyleGold = {
    ...modalBtnStyle,
    background: '#C9A84C',
    borderColor: '#C9A84C'
  };

  return (
    <>
      <div className="mermaid-wrapper" style={cardStyle}>
        {/* Card Toolbar */}
        <div className="mermaid-toolbar" style={toolbarStyle}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0B1F3A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚖️ Legal Process Flowchart
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={zoomOut} style={buttonStyle} title="Zoom Out"><ZoomOut size={14} /></button>
            <span style={{ fontSize: '11px', alignSelf: 'center', width: '36px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={zoomIn} style={buttonStyle} title="Zoom In"><ZoomIn size={14} /></button>
            <button onClick={resetZoom} style={buttonStyle} title="Reset"><RotateCcw size={14} /></button>
            <button onClick={downloadSVG} style={primaryButtonStyle} title="Download SVG">
              <Download size={12} /> SVG
            </button>
            <button onClick={downloadPNG} style={primaryButtonStyle} title="Download PNG">
              <Download size={12} /> PNG
            </button>
            <button onClick={toggleFullscreen} style={buttonStyle} title="Fullscreen view">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Card Canvas Container */}
        <div 
          className="mermaid-container" 
          style={{ 
            overflow: 'auto', 
            padding: '24px', 
            maxHeight: '400px', 
            background: '#ffffff',
            display: 'block'
          }}
        >
          <div 
            className="mermaid-svg-wrapper"
            style={{ 
              width: `${zoom * 100}%`, 
              margin: '0 auto',
              transition: 'width 0.15s ease-out',
              display: 'block'
            }}
            dangerouslySetInnerHTML={{ __html: svg }} 
          />
        </div>
      </div>

      {/* Fullscreen Overlay Visualizer */}
      {isFullscreen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(11, 31, 58, 0.96)', // Premium deep navy background
            backdropFilter: 'blur(12px)', // High-end glassmorphism blur
            zIndex: 99999, 
            display: 'flex', 
            flexDirection: 'column',
            color: '#ffffff'
          }}
        >
          {/* Visualizer Header */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 32px', 
              borderBottom: '1px solid rgba(201, 168, 76, 0.2)' 
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', color: '#C9A84C', fontWeight: '600', letterSpacing: '0.5px' }}>
              ⚖️ Interactive Flowchart Visualizer
            </h3>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={zoomOut} style={modalBtnStyle}><ZoomOut size={16} /> Zoom Out</button>
              <span style={{ fontSize: '14px', alignSelf: 'center', minWidth: '48px', textAlign: 'center', fontWeight: '600' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={zoomIn} style={modalBtnStyle}><ZoomIn size={16} /> Zoom In</button>
              <button onClick={resetZoom} style={modalBtnStyle}><RotateCcw size={16} /> Reset</button>
              <button onClick={downloadSVG} style={modalBtnStyleGold}><Download size={16} /> SVG</button>
              <button onClick={downloadPNG} style={modalBtnStyleGold}><Download size={16} /> PNG</button>
              <button onClick={toggleFullscreen} style={{ ...modalBtnStyle, background: '#ef4444', borderColor: '#ef4444' }}>
                <X size={16} /> Close
              </button>
            </div>
          </div>
          
          {/* Visualizer Canvas Body */}
          <div 
            style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '48px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}
          >
            <div 
              style={{ 
                width: `${zoom * 100}%`, 
                maxWidth: 'none',
                background: '#ffffff', // High contrast white background sheet
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
                transition: 'width 0.15s ease-out',
                display: 'block'
              }}
              dangerouslySetInnerHTML={{ __html: svg }} 
            />
          </div>
        </div>
      )}
    </>
  );
}

