const fs = require('fs');

function fixTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Background colors
  content = content.replace(/bg-\[#1f1f1f\]/g, 'bg-theme-surface');
  content = content.replace(/bg-\[#282828\]/g, 'bg-theme-input-bg');
  content = content.replace(/hover:bg-\[#2c2c2c\]/g, 'hover:bg-theme-input-bg-hover');
  
  // Text colors
  content = content.replace(/text-\[#aaaaaa\]/g, 'text-theme-text-muted');
  content = content.replace(/text-\[#3ea6ff\]/g, 'text-theme-accent');
  
  // Create Event button specific fixes
  content = content.replace(/bg-\[#3ea6ff\]/g, 'bg-theme-accent');
  content = content.replace(/hover:bg-\[#3ea6ff\]\/90/g, 'hover:bg-theme-accent-hover');
  content = content.replace(/border-t-\[#3ea6ff\]/g, 'border-t-theme-accent');

  // In Events.jsx Create button uses text-black, let's change to text-theme-accent-text
  content = content.replace(
    /className="bg-theme-accent hover:bg-theme-accent-hover text-black px-4 py-2 text-\[13px\] font-bold rounded-sm flex items-center gap-2 transition-all shadow-md"/g,
    'className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-text px-4 py-2 text-[13px] font-bold rounded-sm flex items-center gap-2 transition-all shadow-md"'
  );

  fs.writeFileSync(filePath, content);
}

fixTheme('frontend/src/pages/Events.jsx');
fixTheme('frontend/src/pages/PublicEvents.jsx');
console.log('Fixed themes successfully!');
