import os

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "renderPosterPlanet" in line:
        print(f"renderPosterPlanet found at line {idx+1}: {line.strip()}")
    if "THREE" in line or "Three.js" in line or "three" in line.lower():
        print(f"Three.js reference at line {idx+1}: {line.strip()[:100]}")
    if "function showPoster" in line or "showPoster =" in line or "showPoster(" in line:
        print(f"showPoster found at line {idx+1}: {line.strip()[:100]}")
