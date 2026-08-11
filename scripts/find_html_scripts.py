filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
output_path = r"E:\1\Biology_Starry_Vault\vue\scripts\html_start_out.txt"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(output_path, 'w', encoding='utf-8') as out:
    for idx, line in enumerate(lines[:100]):
        out.write(f"{idx+1}: {line}")

print("Done")
