const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/PublicVisitorDashboard.jsx', 'utf8');

// 1. Remove Shorts SVG icon
content = content.replace(
  `{isShortsStyle && (
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-red-600 mr-1">
                <path d="M17.77,10.32l-1.2-.5L18,9.06a3.74,3.74,0,0,0-3.5-6.62L6,6.94a3.74,3.74,0,0,0,.23,6.74l1.2.49L6,14.93a3.75,3.75,0,0,0,3.5,6.63l8.5-4.5a3.74,3.74,0,0,0-.23-6.74Z" fill="currentColor"/>
                <polygon points="10 14.65 15 12 10 9.35 10 14.65" fill="#fff"/>
              </svg>
            )}`,
  ``
);

// 2. Remove fake views and restore prod.genre
content = content.replace(
  `{isShortsStyle ? \`\${Math.floor(Math.random() * 900 + 10)}K views\` : prod.genre}`,
  `{prod.genre}`
);

fs.writeFileSync('frontend/src/pages/PublicVisitorDashboard.jsx', content);
console.log('Fixed icon and views');
