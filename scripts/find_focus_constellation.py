import os

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "function focusConstellation" in line or "focusConstellation =" in line:
        print(f"focusConstellation definition found at line {idx+1}")
        for i in range(max(0, idx - 5), min(len(lines), idx + 80)):
            print(f"{i+1}: {lines[i]}", end="")
        print("\n" + "="*50)
