import os

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "_textureImg" in line or "texture" in line.lower() or "planet_textures" in line.lower() or "planetTexture" in line:
        print(f"Texture reference at line {idx+1}: {line.strip()[:120]}")
