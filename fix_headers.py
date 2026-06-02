import glob

files = glob.glob('frontend/src/pages/*.jsx') + glob.glob('frontend/src/components/*.jsx')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace('mb-10 pb-6 border-b border-theme-border-light', 'mb-10')
    new_content = new_content.replace('border-b border-theme-border-light pb-6 mb-10', 'mb-10')
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')
