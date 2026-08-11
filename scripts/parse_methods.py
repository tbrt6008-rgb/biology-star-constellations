import os
import re
import json
import yaml
import sys
sys.stdout.reconfigure(encoding='utf-8')

METHODS_DIR = r"E:\1\Biology_Starry_Vault\04_Methods"
OUTPUT_FILE = r"E:\1\Biology_Starry_Vault\vue\public\methods.json"

def parse_frontmatter(content: str) -> dict:
    match = re.match(r'^---\r?\n(.*?)\r?\n---', content, re.DOTALL)
    if not match:
        return {}
    try:
        return yaml.safe_load(match.group(1)) or {}
    except Exception as e:
        return {}

def clean_wiki_links(links_list) -> list:
    if not links_list:
        return []
    result = []
    for item in links_list:
        clean = re.sub(r'\[\[(.+?)\]\]', r'\1', str(item)).strip().strip('"\'')
        if clean:
            result.append(clean)
    return result

methods = []
errors = []

for filename in sorted(os.listdir(METHODS_DIR)):
    if not filename.endswith('.md'):
        continue
    filepath = os.path.join(METHODS_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        errors.append(f"{filename}: {e}")
        continue

    fm = parse_frontmatter(content)
    file_id = filename[:-3] # filename without .md

    # Extract clean body (everything after frontmatter)
    body = content
    fm_match = re.match(r'^---\r?\n(.*?)\r?\n---\r?\n', content, re.DOTALL)
    if fm_match:
        body = content[fm_match.end():]

    # Extract title from first # header, e.g. "# 🛸 科学逻辑：假说-演绎法"
    title = file_id
    title_match = re.search(r'^#\s*(.+)', body, re.MULTILINE)
    if title_match:
        title_line = title_match.group(1).strip()
        # Remove emojis
        title = re.sub(r'[^\w\s：:-]', '', title_line).strip()
        # Remove # if any
        title = title.replace('#', '').strip()

    # Extract quote from > blockquote
    quote = ""
    quote_match = re.search(r'^>\s*(.+)', body, re.MULTILINE)
    if quote_match:
        quote = quote_match.group(1).strip()

    # Remove the title and quote from body to get core content
    core_body = body
    if title_match:
        core_body = core_body.replace(title_match.group(0), "")
    if quote_match:
        core_body = core_body.replace(quote_match.group(0), "")
    core_body = core_body.strip()

    tags = fm.get('tags', [])
    if isinstance(tags, str):
        tags = [t.lstrip('#').strip() for t in re.findall(r'#?(\S+)', tags)]
    elif isinstance(tags, list):
        tags = [str(t).lstrip('#').strip() for t in tags]

    methods.append({
        "id": file_id,
        "title": title,
        "quote": quote,
        "tags": tags,
        "magnitude": int(fm.get('magnitude', 3)),
        "stars": clean_wiki_links(fm.get('stars', [])),
        "body": core_body
    })

output = {
    "total": len(methods),
    "methods": methods
}

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"[OK] Done! {len(methods)} methods parsed -> {OUTPUT_FILE}")
if errors:
    print(f"Errors: {errors}")
