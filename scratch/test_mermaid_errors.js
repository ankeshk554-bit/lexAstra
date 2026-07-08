const sanitizeMermaidChart = (code) => {
  if (!code) return '';
  
  let sanitized = code;
  
  // 1. Remove markdown backticks if they are accidentally included inside the chart string
  sanitized = sanitized.replace(/```mermaid/g, '').replace(/```/g, '');
  
  // 2. Fix unquoted node labels for different shapes
  const quotedOrAny = '"[^"\\\\]*(?:\\\\.[^"\\\\]*)*"';
  
  // Double rounded: ((label))
  const doubleRoundRegex = new RegExp(`([A-Za-z0-9_-]+)\\(\\(\\s*(${quotedOrAny}|(?:(?!\\)\\)).)*)\\s*\\)\\)`, 'g');
  sanitized = sanitized.replace(doubleRoundRegex, (match, id, label) => {
    const trimmed = label.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
    const cleanLabel = trimmed.replace(/"/g, '\\"');
    return `${id}(("${cleanLabel}"))`;
  });
  
  // Square: [label]
  const squareRegex = new RegExp(`([A-Za-z0-9_-]+)\\[\\s*(${quotedOrAny}|[^\\]\\n]*)\\s*\\]`, 'g');
  sanitized = sanitized.replace(squareRegex, (match, id, label) => {
    const trimmed = label.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
    const cleanLabel = trimmed.replace(/"/g, '\\"');
    return `${id}["${cleanLabel}"]`;
  });
  
  // Single round: (label)
  const roundRegex = new RegExp(`([A-Za-z0-9_-]+)\\(\\s*(${quotedOrAny}|[^)\\n]*)\\s*\\)`, 'g');
  sanitized = sanitized.replace(roundRegex, (match, id, label) => {
    const trimmed = label.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
    const cleanLabel = trimmed.replace(/"/g, '\\"');
    return `${id}("${cleanLabel}")`;
  });
  
  // Double curly: {{label}}
  const doubleCurlyRegex = new RegExp(`([A-Za-z0-9_-]+)\\{\\{\\s*(${quotedOrAny}|(?:(?!\\}\\}\\}).)*)\\s*\\}\\}`, 'g');
  sanitized = sanitized.replace(doubleCurlyRegex, (match, id, label) => {
    const trimmed = label.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
    const cleanLabel = trimmed.replace(/"/g, '\\"');
    return `${id}{{"${cleanLabel}"}}`;
  });
  
  // Single curly: {label}
  const curlyRegex = new RegExp(`([A-Za-z0-9_-]+)\\{\\s*(${quotedOrAny}|[^}\\n]*)\\s*\\}`, 'g');
  sanitized = sanitized.replace(curlyRegex, (match, id, label) => {
    const trimmed = label.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
    const cleanLabel = trimmed.replace(/"/g, '\\"');
    return `${id}{"${cleanLabel}"}`;
  });
  
  // 3. Fix unquoted text in arrow labels, e.g. -->|label|
  const arrowLabelRegex = /(-->|-.->|==>)\s*\|([^|\n]+)\|/g;
  sanitized = sanitized.replace(arrowLabelRegex, (match, arrow, label) => {
    const trimmed = label.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return match;
    }
    const cleanLabel = trimmed.replace(/"/g, '\\"');
    return `${arrow}|"${cleanLabel}"|`;
  });
  
  // 4. Fix connection labels with potentially complex node shapes: A["Label"] -- Yes --> B["Label"]
  // Node pattern matches simple ID or ID with brackets/parens/braces (quoted or unquoted label)
  const nodePatternStr = `(?:[A-Za-z0-9_-]+(?:\\(\\(\\s*(?:${quotedOrAny}|(?:(?!\\)\\)).)*)\\s*\\)\\)|\\(\\s*(?:${quotedOrAny}|[^)\\n]*)\\s*\\)|\\[\\s*(?:${quotedOrAny}|[^\\]\\n]*)\\s*\\]|\\{\\{\\s*(?:${quotedOrAny}|(?:(?!\\}\\}\\}).)*)\\s*\\}\\}|\\{\\s*(?:${quotedOrAny}|[^}\\n]*)\\s*\\})?)`;
  const connRegex = new RegExp(`(${nodePatternStr})\\s+--\\s+((?:"[^"\\n]*")|(?:[^"\\-\\n\\s>][^\\-\\n>]*))\\s+-->\\s+(${nodePatternStr})`, 'g');
  
  sanitized = sanitized.replace(connRegex, (match, node1, label, node2) => {
    let cleanLabel = label.trim();
    if (cleanLabel.startsWith('"') && cleanLabel.endsWith('"')) {
      cleanLabel = cleanLabel.substring(1, cleanLabel.length - 1);
    }
    const escapedLabel = cleanLabel.replace(/"/g, '\\"');
    return `${node1} -->|"${escapedLabel}"| ${node2}`;
  });

  // 5. Ensure the chart starts with a valid diagram declaration keyword
  const lines = sanitized.split('\n');
  const firstLineIndex = lines.findIndex(line => line.trim().length > 0);
  
  if (firstLineIndex !== -1) {
    const firstLine = lines[firstLineIndex].trim().toLowerCase();
    const validKeywords = [
      'flowchart', 'graph', 'sequencediagram', 'gantt', 'classdiagram', 
      'statediagram', 'erdiagram', 'journey', 'gitgraph', 'pie', 
      'mindmap', 'timeline', 'kanban', 'architecture', 'sankey'
    ];
    
    const startsWithKeyword = validKeywords.some(keyword => firstLine.startsWith(keyword));
    if (!startsWithKeyword) {
      sanitized = "flowchart TD\n" + sanitized;
    }
  } else {
    sanitized = "flowchart TD\n" + sanitized;
  }

  return sanitized;
};

// Test with various inputs
const testInputs = [
  `flowchart TD
  A["First Step"] -- Yes --> B["Second Step"]`,
  
  `flowchart TD
  A("First (with parens)") -- Yes --> B{"Decision?"}`,

  `flowchart TD
  A -- Yes --> B["Step"]`,

  `flowchart TD
  A["Step"] -- Yes --> B`,
  
  `flowchart TD
  A[Section 103 (Murder)] --> B`
];

testInputs.forEach((input, index) => {
  console.log(`\n=== TEST ${index + 1} ===`);
  console.log("INPUT:");
  console.log(input);
  console.log("OUTPUT:");
  console.log(sanitizeMermaidChart(input));
});
