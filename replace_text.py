import os
import re

directory = r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src'

# Files to ignore (Auth/Landing pages that should stay yellow/dark mode)
ignore_files = [
    'PublicShowcase.jsx',
    'PublicEvents.jsx',
    'PublicProductionDetail.jsx',
    'PublicNavbar.jsx',
    'Login.jsx',
    'Register.jsx',
    'ForgotPassword.jsx',
    'ResetPassword.jsx',
    'TwoFactorAuth.jsx',
    'VerifyEmail.jsx',
    'PartnerRegistration.jsx',
    'PublicAttendanceCheckIn.jsx',
    'App.jsx',
    'index.css'
]

# We want to match className="..." or className={`...`} and replace text-black IF it has bg-theme-accent
def replace_class(match):
    full_class = match.group(0)
    if 'bg-theme-accent' in full_class and 'text-black' in full_class:
        # replace exact text-black with text-theme-accent-text
        full_class = re.sub(r'\btext-black\b', 'text-theme-accent-text', full_class)
    return full_class

updated_count = 0

class_pattern = re.compile(r'className\s*=\s*(["\'])(.*?)\1|className\s*=\s*\{`([^`]*?)`\}')

def replace_in_content(content):
    def replacer(match):
        full_str = match.group(0)
        if 'bg-theme-accent' in full_str and 'text-black' in full_str:
            return re.sub(r'\btext-black\b', 'text-theme-accent-text', full_str)
        return full_str
    
    # Simple replacement if text-black and bg-theme-accent are within a short distance, 
    # but since className can span multiple lines, let's just do a simpler search and replace line by line or block by block.
    # Actually, the safest way is to just look for text-black and replace it IF it's in the same file as bg-theme-accent and we manually verify, 
    # OR we can just replace text-black with text-theme-accent-text if bg-theme-accent is in the same tag.
    pass

# Alternative approach: simple regex that looks for bg-theme-accent.*text-black or text-black.*bg-theme-accent
# Since they can be in any order, let's just read the file, and do regex substitution on the whole file using a function

def file_replacer(match):
    text = match.group(0)
    if 'bg-theme-accent' in text and 'text-black' in text:
        return re.sub(r'\btext-black\b', 'text-theme-accent-text', text)
    return text

for root, _, files in os.walk(directory):
    for file in files:
        if not (file.endswith('.jsx') or file.endswith('.js')):
            continue
            
        if file in ignore_files:
            continue
            
        filepath = os.path.join(root, file)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Match className="..." or className={"..."} or className={`...`}
        # This regex handles single quotes, double quotes, and backticks.
        new_content = re.sub(r'className\s*=\s*([\'"`])(.*?)\1', file_replacer, content, flags=re.DOTALL)
        
        # also handle className={ `...` } 
        new_content = re.sub(r'className\s*=\s*\{\s*`([^`]*)`\s*\}', file_replacer, new_content, flags=re.DOTALL)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
            updated_count += 1

print(f"Done! Updated {updated_count} files.")
