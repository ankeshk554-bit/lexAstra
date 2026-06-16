const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const appDir = path.join(projectRoot, 'app');
const componentsDir = path.join(projectRoot, 'components');
const utilsDir = path.join(projectRoot, 'utils');

// Helper to check if a file exists with EXACT case
function fileExistsWithCaseSync(filepath) {
  const dir = path.dirname(filepath);
  if (dir === '/' || dir === '.' || /^[A-Z]:\\?$/i.test(dir)) {
    return true; // Root directory
  }
  
  // Recursively check parent directory first
  if (!fileExistsWithCaseSync(dir)) {
    return false;
  }
  
  const base = path.basename(filepath);
  try {
    const files = fs.readdirSync(dir);
    return files.includes(base);
  } catch (e) {
    return false;
  }
}

// Find all js/jsx files recursively
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const filesToCheck = [
  ...getFiles(appDir),
  ...(fs.existsSync(componentsDir) ? getFiles(componentsDir) : []),
  ...(fs.existsSync(utilsDir) ? getFiles(utilsDir) : [])
];

console.log(`Checking ${filesToCheck.length} files for case-sensitive import issues...\n`);

let issuesFound = 0;

filesToCheck.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  // Simple regex for imports
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Only check relative or alias imports
    if (importPath.startsWith('.') || importPath.startsWith('@/')) {
      let resolvedPath = '';
      
      if (importPath.startsWith('@/')) {
        resolvedPath = path.join(projectRoot, importPath.slice(2));
      } else {
        resolvedPath = path.resolve(path.dirname(file), importPath);
      }
      
      // Check if it's a directory or a file
      let exactPath = '';
      const extensions = ['.js', '.jsx', '.json', '/index.js', '/index.jsx'];
      
      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
        // Directory import, usually looks for index.js
        for (const ext of extensions) {
          const testPath = resolvedPath + (ext.startsWith('/') ? ext : '/' + ext);
          if (fs.existsSync(testPath)) {
            exactPath = testPath;
            break;
          }
        }
      } else {
        // File import
        if (fs.existsSync(resolvedPath)) {
          exactPath = resolvedPath;
        } else {
          for (const ext of ['.js', '.jsx', '.json']) {
            if (fs.existsSync(resolvedPath + ext)) {
              exactPath = resolvedPath + ext;
              break;
            }
          }
        }
      }
      
      if (exactPath) {
        const isCaseCorrect = fileExistsWithCaseSync(exactPath);
        if (!isCaseCorrect) {
          issuesFound++;
          const relativeFile = path.relative(projectRoot, file);
          console.log(`❌ Issue in ${relativeFile}:`);
          console.log(`   Import: "${importPath}"`);
          console.log(`   Resolves to (case-insensitive): ${exactPath}`);
          console.log(`   Reason: File/Directory case on disk does not match the import casing!\n`);
        }
      } else {
        // Unresolved relative import (might be a build error itself)
        issuesFound++;
        const relativeFile = path.relative(projectRoot, file);
        console.log(`❌ Unresolved relative import in ${relativeFile}:`);
        console.log(`   Import: "${importPath}"`);
        console.log(`   Expected resolved path: ${resolvedPath}\n`);
      }
    }
  }
});

console.log(`Check complete. Found ${issuesFound} issues.`);
