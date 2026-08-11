"""
解析 01_Scientists/ 下所有 .md 文件的 YAML frontmatter
输出为 scientists.json 供前端使用
"""
import os
import re
import json
import yaml
import sys
sys.stdout.reconfigure(encoding='utf-8')

SCIENTISTS_DIR = r"E:\1\Biology_Starry_Vault\01_Scientists"
OUTPUT_FILE    = r"E:\1\Biology_Starry_Vault\vue\public\scientists.json"

def parse_frontmatter(content: str) -> dict:
    match = re.match(r'^---\r?\n(.*?)\r?\n---', content, re.DOTALL)
    if not match:
        return {}
    try:
        return yaml.safe_load(match.group(1)) or {}
    except Exception as e:
        return {}

def extract_identity_from_body(content: str) -> str:
    match = re.search(r'^>\s*(.+)', content, re.MULTILINE)
    return match.group(1).strip() if match else ""

# ── 书本 → 轨道映射（穷举所有变体）──────────────────────
BOOK_TO_ORBIT = {
    "必修一": 1, "必修1": 1, "必修 一": 1,
    "必修二": 2, "必修2": 2, "必修 二": 2,
    "选必一": 3, "选必1": 3, "选择性必修一": 3, "选必 一": 3,
    "选必二": 4, "选必2": 4, "选择性必修二": 4, "选必 二": 4,
    "选必三": 5, "选必3": 5, "选择性必修三": 5, "选必 三": 5,
}

# ── 通过 tags 字符串推断轨道 ─────────────────────────────
TAG_TO_ORBIT = {
    "必修1": 1, "必修一": 1, "细胞": 1, "分子": 1,
    "必修2": 2, "必修二": 2, "遗传": 2, "进化": 2,
    "选必1": 3, "稳态": 3, "调节": 3,
    "选必2": 4, "生态": 4, "环境": 4,
    "选必3": 5, "生物技术": 5, "工程": 5,
}

# ── 按科学家名字的领域手动补充轨道 ──────────────────────
# 对于既无 book 又无 tags 的，根据历史知识分配
MANUAL_ORBIT = {
    "丹尼利和戴维森": 1,  # 细胞膜的流动镶嵌模型相关
    "内格里":         2,  # 遗传学，与孟德尔同时代
    "切尔马克":       2,  # 重新发现孟德尔定律
    "切赫":           2,  # RNA催化（核酶），分子生物学
    "华莱士":         2,  # 进化论，与达尔文共同提出
    "博耶":           5,  # 基因工程，重组DNA技术
    "哈伯兰特":       1,  # 细胞全能性（植物组培）
    "坦斯利":         4,  # 生态系统（ecosystem命名者）
    "威尔穆特":       5,  # 克隆多莉羊，细胞工程
    "威尔金斯":       2,  # DNA结构，与沃森克里克合作
    "尼伦伯格和马太": 2,  # 破译遗传密码
    "希尔":           1,  # 光合作用（希尔反应）
    "康拉特":         2,  # TMV病毒重建实验，RNA是遗传物质
    "沃泰默":         3,  # 促胰液素实验，激素调节
}

def get_orbit_from_tags(tags_str: str) -> int:
    if not tags_str:
        return 0
    for key, orbit in TAG_TO_ORBIT.items():
        if key in str(tags_str):
            return orbit
    return 0

def normalize_book(book_val) -> list:
    if not book_val:
        return []
    if isinstance(book_val, list):
        return [str(b).strip() for b in book_val]
    parts = re.split(r'[/、,，]', str(book_val))
    return [p.strip() for p in parts if p.strip()]

def get_orbit(books: list, file_id: str, tags_str: str) -> int:
    # 1. 优先从 book 字段映射
    if books:
        orbits = [BOOK_TO_ORBIT.get(b, 0) for b in books]
        valid = [o for o in orbits if o > 0]
        if valid:
            return min(valid)
    # 2. 从 tags 推断
    tag_orbit = get_orbit_from_tags(tags_str)
    if tag_orbit > 0:
        return tag_orbit
    # 3. 手动补充表
    if file_id in MANUAL_ORBIT:
        return MANUAL_ORBIT[file_id]
    # 4. 实在未知，放到轨道 3（居中轨道，不孤立）
    return 3

def normalize_intersection(val) -> list:
    if not val:
        return []
    items = val if isinstance(val, list) else [val]
    result = []
    for item in items:
        clean = re.sub(r'\[\[(.+?)\]\]', r'\1', str(item)).strip().strip('"\'')
        if clean:
            result.append(clean)
    return result

def normalize_tags(val) -> list:
    if not val:
        return []
    if isinstance(val, list):
        return [str(t).lstrip('#').strip() for t in val]
    parts = re.findall(r'#?(\S+)', str(val))
    return [p.lstrip('#') for p in parts if p]

def normalize_list(val) -> list:
    if not val:
        return []
    if isinstance(val, list):
        return [re.sub(r'\[\[(.+?)\]\]', r'\1', str(v)).strip() for v in val]
    return [str(val).strip()]

# ── 主解析 ────────────────────────────────────────────────
scientists = []
errors = []

for filename in sorted(os.listdir(SCIENTISTS_DIR)):
    if not filename.endswith('.md'):
        continue
    filepath = os.path.join(SCIENTISTS_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            content = f.read()
    except Exception as e:
        errors.append(f"{filename}: {e}")
        continue

    fm = parse_frontmatter(content)
    file_id = filename[:-3]

    name       = fm.get('name') or file_id
    magnitude  = max(1, min(5, int(fm.get('magnitude', 2))))
    books      = normalize_book(fm.get('book'))
    tags_raw   = fm.get('tags', '')
    tags       = normalize_tags(tags_raw)
    orbit      = get_orbit(books, file_id, str(tags_raw))
    identity   = fm.get('identity') or extract_identity_from_body(content)
    nationality= fm.get('nationality', '未知')
    era        = fm.get('era', '未知')
    priority   = str(fm.get('priority', ''))
    quick_recall = fm.get('quick_recall', '')
    common_trap  = fm.get('common_trap', '')
    focus        = normalize_list(fm.get('focus'))
    core_method  = normalize_list(fm.get('core_method'))
    intersection = normalize_intersection(fm.get('intersection'))
    cognitive_type = fm.get('cognitive_type', '')
    gaokao     = fm.get('starry_gaokao', {}) or {}
    knowledge_module  = gaokao.get('knowledge_module', '')
    gaokao_dimension  = normalize_list(gaokao.get('gaokao_dimension'))

    # priority 级别数字化，方便前端排序
    priority_level = 3 if '核心' in priority else (2 if '重要' in priority else 1)

    scientists.append({
        "id": file_id,
        "name": name,
        "magnitude": magnitude,
        "orbit": orbit,
        "books": books,
        "nationality": nationality,
        "era": era,
        "identity": identity,
        "priority": priority,
        "priority_level": priority_level,
        "quick_recall": quick_recall,
        "common_trap": common_trap,
        "focus": focus,
        "core_method": core_method,
        "intersection": intersection,
        "tags": tags,
        "cognitive_type": cognitive_type,
        "knowledge_module": knowledge_module,
        "gaokao_dimension": gaokao_dimension,
    })

scientists.sort(key=lambda s: (s['orbit'], -s['magnitude'], s['id']))

output = {
    "total": len(scientists),
    "generated_at": "2026-05-20",
    "orbit_labels": {
        "1": "必修一 · 分子与细胞",
        "2": "必修二 · 遗传与进化",
        "3": "选必一 · 稳态与调节",
        "4": "选必二 · 生物与环境",
        "5": "选必三 · 生物技术与工程",
    },
    "scientists": scientists
}

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"[OK] Done! {len(scientists)} scientists parsed → {OUTPUT_FILE}")

orbit_counts = {}
for s in scientists:
    orbit_counts[s['orbit']] = orbit_counts.get(s['orbit'], 0) + 1

print("\n[STATS] Orbit distribution:")
orbit_names = output['orbit_labels']
for orbit_id, count in sorted(orbit_counts.items()):
    label = orbit_names.get(str(orbit_id), "跨模块")
    print(f"  Orbit {orbit_id} ({label}): {count} scientists")

mag_counts = {}
for s in scientists:
    mag_counts[s['magnitude']] = mag_counts.get(s['magnitude'], 0) + 1
print("\n[STATS] Magnitude distribution:")
for mag, count in sorted(mag_counts.items(), reverse=True):
    stars = '★' * mag + '☆' * (5-mag)
    print(f"  mag {mag} {stars}: {count}")

print(f"\n[WARN] Parse errors: {len(errors)}")
for e in errors:
    print(f"  {e}")
