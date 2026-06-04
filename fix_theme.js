const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/PublicShowcase.jsx', 'utf8');

const replacements = {
    'bg-[#111]': 'bg-theme-bg',
    'bg-[#050505]': 'bg-theme-bg',
    'bg-[#1a1a1a]': 'bg-theme-surface',
    'text-white': 'text-theme-text',
    'border-white/5': 'border-theme-border-light',
    'border-white/10': 'border-theme-border',
    'border-white/20': 'border-theme-border',
    'bg-white/5': 'bg-theme-surface',
    'bg-white/10': 'bg-theme-input-bg',
    'bg-white/20': 'bg-theme-input-bg-hover',
    'text-gray-400': 'text-theme-text-muted',
    'text-gray-500': 'text-theme-text-muted-dark',
    'focus:border-white': 'focus:border-theme-accent',
    'placeholder:text-white/5': 'placeholder:text-theme-text-muted-dark',
    'hover:text-white': 'hover:text-theme-accent',
    'hover:bg-white/5': 'hover:bg-theme-input-bg',
    'hover:bg-white': 'hover:bg-theme-text',
    'hover:text-black': 'hover:text-theme-bg',
    'text-black': 'text-theme-bg',
    'selection:bg-white': 'selection:bg-theme-text',
    'selection:text-black': 'selection:text-theme-bg',
    'fill-white': 'fill-theme-text',
    'bg-white': 'bg-theme-text',
    'bg-black/60': 'bg-theme-surface',
    'bg-black/80': 'bg-theme-surface border border-theme-border-light',
    'text-blue-400': 'text-theme-accent'
};

for (const [key, value] of Object.entries(replacements)) {
    // Simple string replace all
    content = content.split(key).join(value);
}

fs.writeFileSync('frontend/src/pages/PublicShowcase.jsx', content, 'utf8');
console.log('Done');
