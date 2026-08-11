import os

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = re.findall(r'<script.*?>', content, re.IGNORECASE)
for m in matches:
    print(f"Script tag: {m}")
if "three" in content.lower():
    print("Found 'three' in file (case-insensitive)!")
else:
    print("No 'three' found in file.")
