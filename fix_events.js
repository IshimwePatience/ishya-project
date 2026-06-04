const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/PublicEvents.jsx', 'utf8');

const replacements = {
    'bg-[#111]': 'bg-theme-surface',
    'bg-[#050505]': 'bg-theme-bg',
    'bg-[#1a1a1a]': 'bg-theme-input-bg',
    'bg-[#1c1c1c]': 'bg-theme-input-bg-hover',
    'bg-[#161616]': 'bg-theme-input-bg',
    'text-white': 'text-theme-text',
    'border-white/5': 'border-theme-border-light',
    'border-white/10': 'border-theme-border',
    'border-[white]': 'border-theme-accent',
    'bg-white/5': 'bg-theme-surface',
    'bg-white/10': 'bg-theme-input-bg',
    'text-gray-400': 'text-theme-text-muted',
    'text-gray-500': 'text-theme-text-muted-dark',
    'text-[#aaaaaa]': 'text-theme-text-muted-dark',
    'bg-[white]/5': 'bg-theme-accent/5',
    'hover:bg-white/10': 'hover:bg-theme-input-bg-hover',
    'hover:text-white': 'hover:text-theme-accent',
    'selection:bg-white': 'selection:bg-theme-text',
    'selection:text-black': 'selection:text-theme-bg',
    'text-black': 'text-theme-bg'
};

for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
}

fs.writeFileSync('frontend/src/pages/PublicEvents.jsx', content, 'utf8');
console.log('Done');
