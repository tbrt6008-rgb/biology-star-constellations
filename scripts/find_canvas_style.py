import os
import re

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

output_path = r"E:\1\Biology_Starry_Vault\vue\scripts\canvas_style_out.txt"

with open(output_path, 'w', encoding='utf-8') as out:
    matches = [m.start() for m in re.finditer(r'#poster-canvas\s*\{', content)]
    for m in matches:
        start = max(0, m - 100)
        end = min(len(content), m + 300)
        out.write(f"Match found:\n{content[start:end]}\n{'-'*40}\n")

print("Done")
