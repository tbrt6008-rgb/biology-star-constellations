import os

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "sidebar-node" in line and ("return `" in lines[idx-1] or "return `" in lines[idx-2] or "return `" in lines[idx-3] or "return `" in lines[idx-4]):
        print(f"Sidebar node HTML generation found at line {idx+1}")
        for i in range(max(0, idx - 10), min(len(lines), idx + 25)):
            print(f"{i+1}: {lines[i]}", end="")
        print("\n" + "="*50)
