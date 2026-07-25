const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

// Remove all existing .pdf-floating-menu blocks
css = css.replace(/\.pdf-floating-menu[\s\S]*?(?=\n\n|\n[a-z.#*-])/gi, (match) => {
  // Try to be careful not to delete too much if the regex matches greedily. 
  // It's better to match blocks individually
  return '';
});

// To safely strip out .pdf-floating-menu related blocks:
const stripSelectors = [
  '.pdf-floating-menu',
  '.pdf-floating-menu .menu-colors',
  '.pdf-floating-menu .color-btn',
  '.pdf-floating-menu .action-btn',
  '.pdf-floating-menu .action-btn:hover',
  '.pdf-floating-menu .menu-divider'
];

stripSelectors.forEach(selector => {
  const regex = new RegExp(selector.replace(/\./g, '\\.') + '\\s*\\{[^}]*\\}', 'gi');
  css = css.replace(regex, '');
});

// Also fix .textLayer
css = css.replace(/\.textLayer\s*\{[^}]*\}/g, '');
css = css.replace(/\.textLayer\s*span\s*\{[^}]*\}/g, '');
css = css.replace(/\.textLayer\s*::selection\s*\{[^}]*\}/g, '');
css = css.replace(/\.textLayer\s*br\s*\{[^}]*\}/g, '');

const newTextLayer = `
/* PDF.js Text Layer Fix */
.textLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 1;
  z-index: 2;
}

.textLayer span {
  color: transparent !important;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
  line-height: 1 !important; /* Fixes text selection overlapping extra lines */
}

.textLayer br {
  display: none !important; /* Fixes random line breaks breaking selection bounds */
}

.textLayer ::selection {
  background: rgba(201, 168, 76, 0.35); /* LexAstra Gold */
}
`;

const newFloatingMenu = `
/* Sleek PDF Floating Context Menu */
.pdf-floating-menu {
  position: absolute;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0,0,0,0.2) !important;
  display: flex;
  align-items: center;
  gap: 12px !important;
  z-index: 9999;
}

.pdf-floating-menu .menu-colors {
  display: flex;
  gap: 6px !important;
}

.pdf-floating-menu .color-btn {
  width: 18px !important;
  height: 18px !important;
  border-radius: 50% !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  box-shadow: none !important;
  transition: transform 0.2s;
  cursor: pointer;
}
.pdf-floating-menu .color-btn:hover {
  transform: scale(1.15);
}

.pdf-floating-menu .menu-divider {
  width: 1px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
}

.pdf-floating-menu .action-btn {
  padding: 4px 8px !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
  color: #4a4a4a !important;
  font-family: var(--font-ui, sans-serif);
  font-weight: 500;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.pdf-floating-menu .action-btn:hover {
  background: rgba(0, 0, 0, 0.04) !important;
  color: #0B1F3A !important;
}
`;

fs.writeFileSync('app/globals.css', css.trim() + '\n\n' + newTextLayer + '\n' + newFloatingMenu + '\n');
console.log('Fixed CSS');
