import os

filepath = r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\components\DashboardLayout.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the header tag
# Originally: <header className="h-16 bg-theme-sidebar-bg border-b border-theme-border-light flex items-center px-4 md:px-10 fixed top-0 w-full z-40 gap-3 font-sans text-theme-sidebar-text">
content = content.replace(
    'bg-theme-sidebar-bg border-b border-theme-border-light flex items-center px-4 md:px-10 fixed top-0 w-full z-40 gap-3 font-sans text-theme-sidebar-text',
    'bg-theme-navbar-bg border-b border-theme-border-light flex items-center px-4 md:px-10 fixed top-0 w-full z-40 gap-3 font-sans text-theme-navbar-text'
)

# Within the header, there are buttons using text-theme-sidebar-text and text-theme-sidebar-text-muted.
# And bg-theme-sidebar-hover
# Let's just find the section between <header and </header>
start_idx = content.find('<header')
end_idx = content.find('</header>') + len('</header>')

if start_idx != -1 and end_idx != -1:
    header_html = content[start_idx:end_idx]
    
    # Replace sidebar text classes with standard text classes for the navbar
    header_html = header_html.replace('text-theme-sidebar-text-muted', 'text-theme-text-muted')
    header_html = header_html.replace('text-theme-sidebar-text', 'text-theme-navbar-text')
    header_html = header_html.replace('bg-theme-sidebar-hover', 'bg-theme-input-bg')
    
    # Put it back
    content = content[:start_idx] + header_html + content[end_idx:]

# Now fix the aside tag (the sidebar)
# Originally: <aside className={`w-72 sidebar-theme bg-theme-surface flex flex-col pt-6 fixed md:top-16 top-0 h-[100dvh] md:h-[calc(100vh-64px)] z-[200] md:z-50 border-r border-theme-border-light transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
# I want to replace 'bg-theme-surface' with 'bg-theme-sidebar-bg text-theme-sidebar-text'
content = content.replace(
    '<aside className={`w-72 sidebar-theme bg-theme-surface flex',
    '<aside className={`w-72 sidebar-theme bg-theme-sidebar-bg text-theme-sidebar-text flex'
)

# In the sidebar, there are some hardcoded text-theme-text that should be text-theme-sidebar-text
aside_start = content.find('<aside')
aside_end = content.find('</aside>') + len('</aside>')

if aside_start != -1 and aside_end != -1:
    aside_html = content[aside_start:aside_end]
    
    aside_html = aside_html.replace('text-theme-text-muted', 'text-theme-sidebar-text-muted')
    aside_html = aside_html.replace('text-theme-text', 'text-theme-sidebar-text')
    aside_html = aside_html.replace('bg-theme-input-bg', 'bg-theme-sidebar-hover')
    
    content = content[:aside_start] + aside_html + content[aside_end:]

# Fix the SidebarGroup and SidebarLink components at the top of the file
# Since they are rendered inside the sidebar, they should use theme-sidebar-text instead of theme-text
content = content.replace("? 'text-theme-text'", "? 'text-theme-sidebar-text'")
content = content.replace("'text-theme-text-muted hover:text-theme-text'", "'text-theme-sidebar-text-muted hover:text-theme-sidebar-text'")
content = content.replace("group-hover:text-theme-text", "group-hover:text-theme-sidebar-text")
content = content.replace("text-theme-text uppercase tracking-widest hover:text-theme-text", "text-theme-sidebar-text uppercase tracking-widest hover:text-theme-sidebar-text")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("DashboardLayout.jsx updated.")
