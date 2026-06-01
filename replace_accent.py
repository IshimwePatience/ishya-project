import os
import re

directory = r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src'

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

replacements = [
    (re.compile(r'\[#[eE]5[aA]00[dD]\]'), 'theme-accent'),
    (re.compile(r'\[#[fF][fF][bB]414\]'), 'theme-accent-hover'),
    (re.compile(r'\[#[cC][cC]8[eE]0[bB]\]'), 'theme-accent-hover'),
    (re.compile(r'"#[eE]5[aA]00[dD]"'), '"var(--theme-accent)"'),
    (re.compile(r"'#[eE]5[aA]00[dD]'"), "'var(--theme-accent)'"),
    (re.compile(r'"#[fF][fF][bB]414"'), '"var(--theme-accent-hover)"'),
    (re.compile(r"'#[fF][fF][bB]414'"), "'var(--theme-accent-hover)'"),
    (re.compile(r'"#[cC][cC]8[eE]0[bB]"'), '"var(--theme-accent-hover)"'),
    (re.compile(r"'#[cC][cC]8[eE]0[bB]'"), "'var(--theme-accent-hover)'"),
]

updated_count = 0

for root, _, files in os.walk(directory):
    for file in files:
        if not (file.endswith('.jsx') or file.endswith('.js')):
            continue
            
        if file in ignore_files:
            continue
            
        filepath = os.path.join(root, file)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for pattern, replacement in replacements:
            new_content = pattern.sub(replacement, new_content)
            
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
            updated_count += 1

print(f"Done! Updated {updated_count} files.")
