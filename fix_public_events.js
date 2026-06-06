const fs = require('fs');

function fixPublicEvents(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix "Book Ticket" buttons
  content = content.replace(/bg-white text-theme-bg/g, 'bg-theme-text text-theme-bg');
  
  // Fix "Verify" and "Confirm" buttons in the form
  content = content.replace(/bg-\[white\] text-theme-bg/g, 'bg-theme-text text-theme-bg');
  
  // Fix Modal Backgrounds
  content = content.replace(/bg-\[#0c0c0c\]/g, 'bg-theme-surface');
  content = content.replace(/bg-\[#070707\]/g, 'bg-theme-surface');
  content = content.replace(/bg-\[#0d0d0d\]/g, 'bg-theme-input-bg');
  
  // Fix hardcoded white text
  content = content.replace(/text-\[white\]/g, 'text-theme-text');
  
  // Also check for any remaining hover:bg-gray-200 with text-theme-bg
  content = content.replace(/hover:bg-gray-200/g, 'hover:opacity-90');
  
  // Fix ticket stub modal ticket text
  content = content.replace(/bg-\[white\] text-theme-bg px-4/g, 'bg-theme-text text-theme-bg px-4');

  fs.writeFileSync(filePath, content);
}

fixPublicEvents('frontend/src/pages/PublicEvents.jsx');
console.log('Fixed PublicEvents.jsx themes successfully!');
