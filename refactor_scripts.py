import os
import re

filepath = r'c:\Users\PC\.gemini\antigravity\scratch\ishya-pms\frontend\src\pages\Scripts.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useNavigate to import
content = content.replace("import { useLocation } from 'react-router-dom';", "import { useLocation, useNavigate } from 'react-router-dom';")

# 2. Add const navigate = useNavigate();
content = content.replace("const location = useLocation();", "const location = useLocation();\n  const navigate = useNavigate();")

# 3. Replace the onClick handler for the AI Insights button
content = content.replace("setAiReviewScript(script);", "navigate(`/dashboard/scripts/${script.id}/insights`);")

# 4. Remove the handleGenerateAiReview function completely
# Let's find it and remove it. It's from "const handleGenerateAiReview = async" to "setAiGenerating(false);\n    }\n  };"
start_idx = content.find("const handleGenerateAiReview")
if start_idx != -1:
    end_idx = content.find("};\n\n  useEffect(() => {", start_idx)
    if end_idx != -1:
        content = content[:start_idx] + content[end_idx+3:]

# 5. Remove the modal JSX
# The modal starts with "{/* AI Insights Modal */}" and ends before "    </div>\n  );\n};\n\nexport default Scripts;"
modal_start = content.find("{/* AI Insights Modal */}")
if modal_start != -1:
    # Find the closing tag of the main div: "    </div>\n  );\n};"
    modal_end = content.find("    </div>\n  );\n};\n\nexport default Scripts;")
    if modal_end != -1:
        content = content[:modal_start] + content[modal_end:]

# 6. Remove aiReviewScript and aiGenerating state vars, keep userRole
content = content.replace("  const [aiReviewScript, setAiReviewScript] = useState(null);\n  const [aiGenerating, setAiGenerating] = useState(false);\n  const [aiError, setAiError] = useState('');\n", "")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Scripts.jsx updated.")
