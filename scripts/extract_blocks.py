filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
output_path = r"E:\1\Biology_Starry_Vault\vue\scripts\extracted_code.js"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

extracted = lines[4200:4600]

with open(output_path, 'w', encoding='utf-8') as out:
    for idx, line in enumerate(extracted):
        line_num = 4201 + idx
        out.write(f"{line_num}: {line}")

print(f"Extracted {len(extracted)} lines to {output_path}")
