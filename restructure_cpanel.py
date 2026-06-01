import re

filepath = r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\components\DashboardLayout.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update <header> to be width adjusted
header_old = 'className="h-16 bg-theme-navbar-bg border-b border-theme-border-light flex items-center px-4 md:px-10 fixed top-0 w-full z-40 gap-3 font-sans text-theme-navbar-text"'
header_new = 'className={`h-16 bg-theme-navbar-bg border-b border-theme-border-light flex items-center px-4 md:px-10 fixed top-0 right-0 z-40 gap-3 font-sans text-theme-navbar-text ${isPublic ? \'w-full\' : \'w-full md:w-[calc(100%-18rem)]\'}`}'
content = content.replace(header_old, header_new)

# 2. Make the logo in the header hidden on desktop if !isPublic
logo_header_old = '''<Link to="/dashboard" className="flex items-center gap-1.5 no-underline">
            <img src={logoImg} alt="Ishya" className="h-20 md:h-24 w-auto object-contain" />
          </Link>'''
logo_header_new = '''<Link to="/dashboard" className={`flex items-center gap-1.5 no-underline ${!isPublic ? 'md:hidden' : ''}`}>
            <img src={logoImg} alt="Ishya" className="h-16 md:h-20 w-auto object-contain" />
          </Link>'''
content = content.replace(logo_header_old, logo_header_new)

# 3. Update <aside> to be full height on desktop
aside_old = 'className={`w-72 sidebar-theme bg-theme-sidebar-bg text-theme-sidebar-text flex flex-col pt-6 fixed md:top-16 top-0 h-[100dvh] md:h-[calc(100vh-64px)] z-[200] md:z-50 border-r border-theme-border-light transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? \'translate-x-0\' : \'-translate-x-full\'}`}'
aside_new = 'className={`w-72 sidebar-theme bg-theme-sidebar-bg text-theme-sidebar-text flex flex-col pt-6 md:pt-0 fixed top-0 h-[100dvh] md:h-screen z-[200] md:z-50 border-r border-theme-border-light transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? \'translate-x-0\' : \'-translate-x-full\'}`}'
content = content.replace(aside_old, aside_new)

# 4. Insert the Logo into the <aside>
logo_aside = '''<div className="hidden md:flex items-center justify-center h-20 mb-4 mt-2">
              <Link to="/dashboard" className="flex items-center gap-1.5 no-underline">
                <img src={logoImg} alt="Ishya" className="h-16 w-auto object-contain" />
              </Link>
            </div>'''

# Find the start of <aside> contents
aside_content_start = content.find('<div className="flex items-center justify-between px-6 pb-4 md:hidden')
if aside_content_start != -1:
    content = content[:aside_content_start] + logo_aside + '\n            ' + content[aside_content_start:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("DashboardLayout restructured for cPanel style.")
