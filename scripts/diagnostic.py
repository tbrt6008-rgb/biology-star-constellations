import os
import yaml
import re
import json

SCIENTISTS_DIR = r"E:\1\Biology_Starry_Vault\01_Scientists"
REPORT_FILE = r"E:\1\Biology_Starry_Vault\vue\scripts\diagnostic_report.json"

results = []

for filename in sorted(os.listdir(SCIENTISTS_DIR)):
    if not filename.endswith('.md'):
        continue
    filepath = os.path.join(SCIENTISTS_DIR, filename)
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    
    match = re.match(r'^---\r?\n(.*?)\r?\n---', content, re.DOTALL)
    if not match:
        results.append({
            "filename": filename,
            "error": "No frontmatter found"
        })
        continue
        
    try:
        fm = yaml.safe_load(match.group(1)) or {}
    except Exception as e:
        results.append({
            "filename": filename,
            "error": f"YAML parse error: {str(e)}"
        })
        continue
        
    nationality = fm.get('nationality', '未知')
    era = fm.get('era', '未知')
    quick_recall = fm.get('quick_recall', '')
    common_trap = fm.get('common_trap', '')
    focus = fm.get('focus', [])
    core_method = fm.get('core_method', [])
    cognitive_type = fm.get('cognitive_type', '')
    gaokao = fm.get('starry_gaokao', {}) or {}
    gaokao_dimension = gaokao.get('gaokao_dimension', [])
    
    missing_fields = []
    if nationality in ['未知', '', None]:
        missing_fields.append('nationality')
    if era in ['未知', '', None]:
        missing_fields.append('era')
    if not quick_recall:
        missing_fields.append('quick_recall')
    if not common_trap:
        missing_fields.append('common_trap')
    if not focus:
        missing_fields.append('focus')
    if not core_method:
        missing_fields.append('core_method')
    if not gaokao_dimension:
        missing_fields.append('gaokao_dimension')
    if not cognitive_type:
        missing_fields.append('cognitive_type')
        
    results.append({
        "filename": filename,
        "name": fm.get('name', filename[:-3]),
        "nationality": nationality,
        "era": era,
        "missing_fields": missing_fields,
        "fm": fm
    })

with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"Report written to {REPORT_FILE}")
