import os
import re

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for click listener on the canvas or click handlers
matches = [m.start() for m in re.finditer(r'click|canvas|scale|zoom', content, re.IGNORECASE)]
# We want to find the click handler on the star map canvas
# Let's search for "addEventListener" on the canvas
canvas_listeners = []
for m in re.finditer(r'\.addEventListener\(\s*[\'"]click[\'"]', content):
    start = max(0, m.start() - 150)
    end = min(len(content), m.end() + 200)
    canvas_listeners.append(content[start:end])

print(f"Found {len(canvas_listeners)} click listeners:")
for idx, cl in enumerate(canvas_listeners):
    print(f"Listener {idx+1}:\n{cl}\n{'-'*40}")
