import json

REPORT_FILE = r"E:\1\Biology_Starry_Vault\vue\scripts\diagnostic_report.json"
OUTPUT_SUMMARY = r"E:\1\Biology_Starry_Vault\vue\scripts\diagnostic_summary.txt"

with open(REPORT_FILE, 'r', encoding='utf-8') as f:
    report = json.load(f)

errors = [r for r in report if "error" in r]
incomplete = [r for r in report if "error" not in r and r["missing_fields"]]
complete = [r for r in report if "error" not in r and not r["missing_fields"]]

with open(OUTPUT_SUMMARY, 'w', encoding='utf-8') as out:
    out.write(f"Total: {len(report)}\n")
    out.write(f"Errors (No frontmatter/YAML error): {len(errors)}\n")
    for e in errors:
        out.write(f"  - {e['filename']}: {e['error']}\n")

    out.write(f"\nIncomplete (has frontmatter but missing fields): {len(incomplete)}\n")
    for inc in incomplete:
        out.write(f"  - {inc['filename']} (name: {inc['name']}): missing {inc['missing_fields']}\n")

    out.write(f"\nComplete: {len(complete)}\n")
    for c in complete:
        out.write(f"  - {c['filename']}\n")

print(f"Summary written to {OUTPUT_SUMMARY}")
