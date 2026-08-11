import os
import re

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for CSS rules
css_matches = []
for m in re.finditer(r'#poster-canvas|#poster-card|\.poster-sidebar|#poster-overlay', content):
    start = max(0, m.start() - 100)
    end = min(len(content), m.end() + 250)
    css_matches.append(content[start:end])

print(f"Found {len(css_matches)} CSS references:")
for idx, cm in enumerate(css_matches[:15]):
    print(f"Ref {idx+1}:\n{cm}\n{'-'*40}")
