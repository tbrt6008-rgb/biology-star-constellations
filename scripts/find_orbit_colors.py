import os

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "const ORBIT_COLORS" in line or "let ORBIT_COLORS" in line or "ORBIT_COLORS = {" in line:
        print(f"ORBIT_COLORS found at line {idx+1}")
        for i in range(max(0, idx - 2), min(len(lines), idx + 25)):
            print(f"{i+1}: {lines[i]}", end="")
        print("\n" + "="*50)
