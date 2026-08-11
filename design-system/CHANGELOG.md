# CHANGELOG — Biology Starry Vault v2 设计系统升级

## [v2.0.0] · 2026-08-10 · 设计系统全面升级

### 概述
基于 Open Design `reference-design-contract` 九段式方法论 + `cosmic` 设计系统参考，
将 v1 单文件 5081 行 styles.css 重构为 token 化设计系统。
**业务逻辑 / DOM 结构 / JS 主流程零改动**，仅 CSS 层增量增强。

### 改动统计
| 维度 | v1 | v2 |
|------|----|----|
| styles.css 总行数 | 5081 | 5515 |
| 设计 token 数量 | ~10 (硬编码) | 60+ (语义化) |
| 媒体查询 | 17 | 24 (+7) |
| CSS minified | ~77 kB | 81.8 kB (+6%) |
| 视觉错误 / JS 错误 | — | 0 / 0 |
| Lighthouse Performance（生产）| — | **87** |
| Lighthouse Accessibility | — | **100** ⭐ |
| Lighthouse Best Practices | — | **100** ⭐ |

---

### 🆕 新增 — v2 设计系统 token（`styles.css` 第 32-130 行）

**背景**
- `--bg-deep` `#060814` · `--bg-base` `#0c0720` · `--bg-veil` `#071526`

**5 教材主题色**
- `--c-const-1` 青 `hsl(185 75% 58%)` · `--c-const-2` 金 `hsl(42 88% 58%)` · `--c-const-3` 紫 `hsl(280 65% 68%)` · `--c-const-4` 绿 `hsl(130 62% 55%)` · `--c-const-5` 蓝 `hsl(210 78% 62%)`

**文字 / 边框 / 状态**
- `--text-hi` 92% · `--text-md` 78% · `--text-lo` 56% · `--text-dim` 38%
- `--border-hi` 14% · `--border-md` 8% · `--success` · `--warning` · `--danger`

**玻璃拟态**
- `--glass-bg` 72% · `--glass-bg-strong` 88% · `--glass-border` · `--glass-blur` (blur(20px) saturate(180%))

**字号阶梯（10 级）**
- `--fs-xs` 11 · `--fs-sm` 13 · `--fs-md` 14 · `--fs-base` 16 · `--fs-lg` 18 · `--fs-xl` 22 · `--fs-2xl` 28 · `--fs-3xl` 36 · `--fs-display` clamp(2.5–4rem)

**间距阶梯（11 级）**
- `--sp-1` 至 `--sp-30` (4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80 / 120)

**圆角阶梯（5 级）**
- `--r-xs` 4 · `--r-sm` 6 · `--r-md` 10 · `--r-lg` 16 · `--r-pill` 999

**阴影（3 套）**
- `--shadow-card` · `--shadow-glow` · `--shadow-pop`

**z-index 层级**
- `--z-canvas` 0 · `--z-decor` 10 · `--z-nav` 50 · `--z-panel` 100 · `--z-tip` 200 · `--z-modal` 300

### 🔄 别名兼容（过渡期双轨）
旧变量桥接到新 token（`styles.css` 第 132-141 行）：
```css
--c1 → --c-const-1   --c2 → --c-const-2   --c3..5 同模式
--glass → --glass-bg   --border → --border-hi
--text → --text-hi   --dim → --text-dim
```

### ✅ P1 — 顶栏 / HUD / Tooltip 精化（M1 · 2026-08-10）
> 受 v1 cinematic mode 设计意图影响，默认页隐藏，token 已就位待启用。

| 组件 | 改动 |
|------|------|
| `#topbar` | `background: var(--glass-bg)` + `var(--glass-blur)` + `--border-md` |
| `#app-title` | `var(--fs-md)` + `var(--c-const-2)` |
| `.const-btn` / `#core-btn` / `#sound-toggle` | 统一 32px + `var(--r-pill)` + 180ms `var(--ease-premium)` |
| `#search` | `var(--r-pill)` + 220ms `var(--ease-premium)` |
| `#hud-telemetry` | 360px + `var(--glass-bg-strong)` + `var(--r-md)` + `var(--shadow-card)` |
| `.hud-row` / `.hud-label` / `.hud-val` | 字号字距 token 化 |
| `.hud-scanner-progress` | 4s linear（原 2.5s）|
| `#tooltip` | `var(--r-md)` + 160ms `var(--ease-premium)` |

### ✅ P2 — 海报 / 方法模态框动效（M2 · 2026-08-10）
> 这是 cinematic mode 下用户最常交互的界面，视觉升级明显。

| 改动 | 详情 |
|------|------|
| `#poster-card` / `#method-card` | `var(--glass-bg-strong)` + `var(--glass-blur)` + `var(--r-lg)` 16px + `var(--shadow-pop)` |
| 入场 fly-out | `scale(.9) translateY(28px) → scale(1) translateY(0)`，360ms `var(--ease-out-expo)` |
| `.hud-corner` stagger | 上角 0ms delay / 下角 60ms delay，duration 240ms `var(--ease-premium)` |
| `.poster-scanline` | 6s linear infinite（v1 5.5s ease-in-out）|
| `#method-card` 补齐入场 | 原仅 opacity → 与 poster 一致 fly-out |
| `#poster-overlay` / `#method-overlay` 背景 | `blur(10px) saturate(140%)` + `rgba(2 4 10 / .82)` |

### ✅ P3 — 响应式补齐（M3 · 2026-08-10）

| 断点 | 改动 |
|------|------|
| ≤ 1024px | HUD 收紧 320px |
| ≤ 980px | 海报 meta item 字号 token + padding 紧凑 |
| ≤ 768px | 海报触摸目标 44×44（Apple HIG）+ 中文名 `clamp(22–32px)` + 表格字号精简 |
| ≤ 640px | 海报名 24px / 星球 240×240 / meta 11px |
| ≤ 480px | 海报名 20px / 行高 1.55 / 表格 padding 4-6 |
| 横屏 ≤ 520px | 海报 row 布局（避免单列过长）|
| `prefers-reduced-motion` | transition/animation 全部 0.01ms（无障碍）|

### 📦 交付文件（新增）
```
vue/design-system/
├── DESIGN.md                    # 九段式设计规范（~270 行）
├── design-contract.md           # 决策记录（~120 行）
├── implementation-handoff.md    # 实现交接（~250 行）
├── asset-request.md             # 图片资源需求清单（~150 行）
├── UI_DESIGN_PLAN.md            # PM 总方案（~280 行）
├── CHANGELOG.md                 # 本文件
├── P4_DELIVERY.md               # 交付总结
└── reports/
    ├── lighthouse-desktop.json  # 跑分原始数据
    └── lighthouse-desktop.html  # 可视化报告
```

```
工作区截图证据：
├── poster-after-p1.png          # P1 海报
├── p2-default.png               # P2 默认页
├── p2-poster-mid.png            # P2 入场中途
├── p2-poster-full.png           # P2 海报完整
├── p3-poster-tablet-768.png     # P3 平板海报
├── p3-poster-mobile-640.png     # P3 中等屏海报
└── p3-poster-mobile-375.png     # P3 iPhone 海报
```

### ⚠️ 兼容性 / 回滚
- **回滚 P1**：删除 styles.css 文件末尾 `v2 P1 · 顶栏 / HUD / Tooltip` 块
- **回滚 P2**：删除 styles.css 文件末尾 `v2 P2 · 海报 / 方法 模态框` 块
- **回滚 P3**：删除 styles.css 文件末尾 `v2 P3 · 响应式精化` 块
- **回滚 token**：删除 styles.css 第 32-141 行（token 块 + alias）
- **完全回滚**：`git checkout vue/src/styles.css` （如有 git）

### 🔒 未改动（业务逻辑）
- ✅ `index.html` — id / class / DOM 全部保留
- ✅ `src/main.js` — `loadData` / `bootSystemSequence` / `showPoster` / 主循环 零改动
- ✅ `src/gsap.config.js` — GSAP 配置不变
- ✅ `public/Images/` — 90 张纹理图 + `images.json` 全部保留
- ✅ 数据结构 / 接口契约 / 业务逻辑 全部保留