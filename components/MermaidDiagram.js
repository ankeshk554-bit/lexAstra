'use client';

import React, { useEffect, useState, useId } from 'react';

export default function MermaidDiagram({ chart }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
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

  if (error) {
    return <div style={{ color: 'var(--alert-red)', padding: '8px', border: '1px solid var(--alert-red)', borderRadius: '4px', fontSize: '12px' }}>{error}</div>;
  }

  return (
    <div 
      className="mermaid-container" 
      style={{ 
        background: '#fff', 
        padding: '16px', 
        borderRadius: '8px', 
        overflowX: 'auto',
        margin: '16px 0'
      }}
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
