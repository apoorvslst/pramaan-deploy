import re
import os

files = [
    'frontend/src/components/OfficerDashboard.jsx',
    'frontend/src/components/BidderPortal.jsx',
    'frontend/src/components/AuthPage.jsx',
    'frontend/src/components/Header.jsx',
    'frontend/src/App.jsx'
]

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove emoji characters
    for char in ['⚡', '✓', '✕', '⚠', '🔗', '📄', '🛡', '🔒', '📊', '📈', '🚀', '⭐', '💡', '🤖']:
        content = content.replace(char, '')

    # 2. Transform bubble rounded classes to rectangular (rounded-sm or rounded)
    content = re.sub(r'\brounded-3xl\b', 'rounded', content)
    content = re.sub(r'\brounded-2xl\b', 'rounded', content)
    content = re.sub(r'\brounded-xl\b', 'rounded', content)
    content = re.sub(r'\brounded-lg\b', 'rounded', content)
    content = re.sub(r'\brounded-full\b', 'rounded', content)

    # 3. Clean decorative AI slop gradients
    content = re.sub(r'<div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br[^>]*></div>', '', content)
    content = re.sub(r'<div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br[^>]*/>', '', content)
    content = re.sub(r'\bblur-3xl\b', '', content)
    content = re.sub(r'\bblur-2xl\b', '', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Batch UI cleanup completed successfully.")
