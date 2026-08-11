import os

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_path = r"E:\1\Biology_Starry_Vault\vue\scripts\camera_out.txt"

with open(output_path, 'w', encoding='utf-8') as out:
    for idx, line in enumerate(lines):
        if "let camera" in line or "const camera" in line or "camera = {" in line:
            out.write(f"Camera definition found at line {idx+1}\n")
            for i in range(max(0, idx - 5), min(len(lines), idx + 25)):
                out.write(f"{i+1}: {lines[i]}")
            out.write("\n" + "="*50 + "\n")
        if "camera.x += " in line or "camera.zoom += " in line or "camera.y += " in line:
            out.write(f"Camera interpolation found at line {idx+1}\n")
            for i in range(max(0, idx - 5), min(len(lines), idx + 20)):
                out.write(f"{i+1}: {lines[i]}")
            out.write("\n" + "="*50 + "\n")

print("Done")
