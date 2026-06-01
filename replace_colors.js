const fs = require('fs');
const path = require('path');

const directoriesToScan = [
  path.join(__dirname, 'frontend/src/pages'),
  path.join(__dirname, 'frontend/src/components')
];

const fileExtensions = ['.jsx', '.js'];

const replacements = [
  // Backgrounds
  { search: /bg-\[#1c1c1c\]/g, replace: 'bg-theme-input-bg' },
  { search: /bg-\[#161616\]/g, replace: 'bg-theme-input-bg' },
  { search: /bg-\[#1a1a1a\]/g, replace: 'bg-theme-input-bg' },
  { search: /bg-\[#0c0c0c\]/g, replace: 'bg-theme-surface' },
  { search: /bg-\[#050505\]/g, replace: 'bg-theme-bg' },
  { search: /bg-\[#333333\]/g, replace: 'bg-theme-input-bg' },
  { search: /bg-black(?=[\s'"])/g, replace: 'bg-theme-bg' },
  
  // Text
  { search: /text-white(?=[\s'"])/g, replace: 'text-theme-text' },
  { search: /text-\[white\](?=[\s'"])/g, replace: 'text-theme-text' },
  
  // Borders
  { search: /border-\[white\](?=[\s'"])/g, replace: 'border-theme-text' },
  { search: /border-brown-light(?=[\s'"])/g, replace: 'border-theme-border' },
  
  // Placeholders
  { search: /placeholder-gray-700/g, replace: 'placeholder:text-theme-text-muted-dark' },
  { search: /placeholder-gray-800/g, replace: 'placeholder:text-theme-text-muted-dark' }
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(rule => {
    content = content.replace(rule.search, rule.replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

directoriesToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
});

console.log("Replacement complete.");
