import os
import re

files = [
    r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\Register.jsx',
    r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\ForgotPassword.jsx',
    r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\ResetPassword.jsx',
    r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\PublicEvents.jsx',
    r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\PublicProductionDetail.jsx',
    r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\PublicAttendanceCheckIn.jsx',
    r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\PartnerRegistration.jsx',
    r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\PublicVisitorDashboard.jsx'
]

replacements = [
    (r'text-theme-text-muted-dark', r'text-gray-500'),
    (r'text-theme-text-muted', r'text-gray-400'),
    (r'text-theme-text', r'text-white'),
    (r'bg-theme-surface', r'bg-[#111]'),
    (r'bg-theme-bg', r'bg-black'),
    (r'bg-theme-input-bg-hover', r'bg-white/10'),
    (r'bg-theme-input-bg', r'bg-white/5'),
    (r'border-theme-border-light', r'border-white/5'),
    (r'border-theme-border', r'border-white/10')
]

for file_path in files:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)
        
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file_path}')

