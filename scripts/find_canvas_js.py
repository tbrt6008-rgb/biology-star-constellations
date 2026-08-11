filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(6800, 6950):
    print(f"{i+1}: {lines[i]}", end="")
