import os
import glob

dirs = ['frontend/src/components/*.jsx', 'frontend/src/pages/*.jsx']
files = []
for d in dirs:
    files.extend(glob.glob(d))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace('className="bg-[#111111]"', 'className="bg-theme-surface"')
    new_content = new_content.replace('className="bg-black"', 'className="bg-theme-surface"')
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')
