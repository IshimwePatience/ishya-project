import os
import re

directory = r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src'

replacements = [
    (r"localStorage\.getItem\('token'\)", r"sessionStorage.getItem('token')"),
    (r"localStorage\.setItem\('token'", r"sessionStorage.setItem('token'"),
    (r"localStorage\.removeItem\('token'\)", r"sessionStorage.removeItem('token')"),
    (r"localStorage\.getItem\('user'\)", r"sessionStorage.getItem('user')"),
    (r"localStorage\.setItem\('user'", r"sessionStorage.setItem('user'"),
    (r"localStorage\.removeItem\('user'\)", r"sessionStorage.removeItem('user')"),
    (r"localStorage\.getItem\('refreshToken'\)", r"sessionStorage.getItem('refreshToken')"),
    (r"localStorage\.setItem\('refreshToken'", r"sessionStorage.setItem('refreshToken'"),
    (r"localStorage\.removeItem\('refreshToken'\)", r"sessionStorage.removeItem('refreshToken')")
]

count = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx') or file.endswith('.ts') or file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements:
                new_content = re.sub(old, new, new_content)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {filepath}')
                count += 1

print(f'Total files updated: {count}')
