import os

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Let's find lines containing cv.addEventListener('click'
for idx, line in enumerate(lines):
    if "cv.addEventListener('click'" in line or 'cv.addEventListener("click"' in line:
        print(f"Canvas click listener at line {idx+1}")
        for i in range(max(0, idx - 5), min(len(lines), idx + 80)):
            print(f"{i+1}: {lines[i]}", end="")
        print("\n" + "="*50)
