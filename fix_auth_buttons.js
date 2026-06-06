const fs = require('fs');
const path = require('path');

// 1. Fix PublicShowcase.jsx "Get Started" button
const showcasePath = 'frontend/src/pages/PublicShowcase.jsx';
let showcaseContent = fs.readFileSync(showcasePath, 'utf8');
showcaseContent = showcaseContent.replace(
  /className="px-12 py-5 bg-theme-text text-theme-bg font-semibold text-sm hover:bg-gray-200 transition-all shadow-2xl"/,
  'className="px-8 py-3 bg-theme-text text-theme-bg font-semibold text-sm hover:bg-gray-200 transition-all shadow-2xl rounded-full"'
);
fs.writeFileSync(showcasePath, showcaseContent);
console.log('Fixed PublicShowcase.jsx');

// 2. Fix Auth Pages buttons
const authPages = [
  'Login.jsx',
  'Register.jsx',
  'ForgotPassword.jsx',
  'ResetPassword.jsx',
  'VerifyEmail.jsx',
  'TwoFactorAuth.jsx'
];

authPages.forEach(page => {
  const filePath = path.join('frontend/src/pages', page);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${page}, file not found.`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // A simple regex to find button tags and their classNames, then replace within them
  // We look for `<button ... className="...py-4...rounded-sm..." ...>` or similar
  
  // Let's do a more generic replacement:
  // Replace 'py-4 px-6 border border-white/10 rounded-sm' with 'py-3 px-6 border border-white/10 rounded-full'
  content = content.replace(/py-4 px-6 border border-white\/10 rounded-sm/g, 'py-3 px-6 border border-white/10 rounded-full');
  
  // Replace 'py-4 px-6 rounded-sm' with 'py-3 px-6 rounded-full' (Google button)
  content = content.replace(/py-4 px-6 rounded-sm/g, 'py-3 px-6 rounded-full');
  
  // Replace 'py-4 bg-primary text-black font-medium rounded-sm' with 'py-3 bg-primary text-black font-medium rounded-full' (Submit buttons)
  content = content.replace(/py-4 bg-primary text-black font-medium rounded-sm/g, 'py-3 bg-primary text-black font-medium rounded-full');
  
  // In VerifyEmail / TwoFactorAuth, they might have slightly different classes.
  // E.g., VerifyEmail might just have 'w-full py-4 bg-primary text-black font-bold rounded-sm'
  content = content.replace(/py-4 bg-primary text-black font-bold rounded-sm/g, 'py-3 bg-primary text-black font-bold rounded-full');
  
  // 'w-full py-4 bg-primary text-black font-medium rounded-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-primary\/20'
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${page}`);
});
