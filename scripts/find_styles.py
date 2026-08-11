import os
import re

filepath = r"E:\1\Biology_Starry_Vault\vue\public\scientist-orbit.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

output_path = r"E:\1\Biology_Starry_Vault\vue\scripts\styles_out.txt"

with open(output_path, 'w', encoding='utf-8') as out:
    # Find CSS block
    style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL | re.IGNORECASE)
    if style_match:
        css = style_match.group(1)
        # Find all rules containing poster
        rules = re.findall(r'([^{}]*poster[^{}]*\{[^{}]*\})', css, re.DOTALL | re.IGNORECASE)
        for r in rules:
            out.write(r.strip() + "\n\n")
    else:
        out.write("No <style> block found.")

print("Done")
