const fs = require('fs');
const path = require('path');

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
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace rounded-sm with rounded-full in className strings that have w-full (which inputs and buttons have)
  content = content.replace(/(className="[^"]*?)rounded-sm([^"]*")/g, (match, p1, p2) => {
    // Only apply rounded-full if it's an input or button (checking if it has px-4 or py-)
    if (match.includes('px-4') || match.includes('py-')) {
       return `${p1}rounded-full${p2}`;
    }
    return match;
  });

  // Reduce py-4 and py-5 to py-3 inside classNames with rounded-full
  content = content.replace(/(className="[^"]*?)py-[45]([^"]*rounded-full[^"]*")/g, '$1py-3$2');
  
  // Sometimes rounded-full comes before py-4/py-5
  content = content.replace(/(className="[^"]*?rounded-full[^"]*?)py-[45]([^"]*")/g, '$1py-3$2');

  fs.writeFileSync(filePath, content);
});
console.log('Fixed inputs and buttons');
