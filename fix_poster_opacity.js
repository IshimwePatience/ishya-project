const fs = require('fs');

function fixOpacity(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/opacity-85 group-hover\/card:opacity-100 /g, '');
  content = content.replace(/opacity-60 group-hover:opacity-100 /g, '');
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

fixOpacity('frontend/src/pages/MyLibrary.jsx');
fixOpacity('frontend/src/pages/MediaLibrary.jsx');
