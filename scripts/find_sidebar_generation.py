import os
import re

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for "sidebar-node" or where sidebar nodes are built.
matches = [m.start() for m in re.finditer(r'sidebar-node|poster-sidebar-list', content)]
for m in matches:
    start = max(0, m - 100)
    end = min(len(content), m + 200)
    print(f"Match found:\n{content[start:end]}\n{'-'*40}")
