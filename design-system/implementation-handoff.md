# Implementation Handoff — 实现交接

> 本文件是 **reference-design-contract** 产物：把 `DESIGN.md` / `design-contract.md` 的视觉决策，转化为开发可直接执行的具体动作。

## 1. 前置约束（不可破坏）

- ❌ 不改 `index.html` 中的 id / class / DOM 结构
- ❌ 不改 `src/main.js` 中的业务逻辑函数（`loadData` / `bootSystemSequence` / `showPoster` / 主循环）
- ❌ 不改 `public/Images/` 现有纹理与 `images.json` 映射
- ❌ 不引入新的运行时依赖（GSAP / Tailwind 已就绪，不增 npm 包）

## 2. 改动范围

仅修改：
- `src/styles.css`（5081 行 → 重构为 token + 组件类）
- 可选：在 `src/styles.css` 末尾新增「v2 token 块」作为过渡区

## 3. Token 引入顺序（建议 diff 路径）

### 步骤 1：抽出 v2 token 到 `:root`（不动旧变量）

在 `styles.css` 第 1–31 行 `:root` 块下方新增：

```css
/* ── v2 Design System Tokens (DESIGN.md §2–§4) ── */
:root {
  /* ── 背景 ── */
  --bg-deep:  #060814;
  --bg-base:  #0c0720;
  --bg-veil:  #071526;

  /* ── 5 教材主题色（语义化别名）── */
  --c-orb-1: hsl(185 75% 58%);  /* 必修一 · 青 · #2dd4e8 */
  --c-orb-2: hsl(42 88% 58%);   /* 必修二 · 金 · #f0b030 */
  --c-orb-3: hsl(280 65% 68%);  /* 选必一 · 紫 · #c070f0 */
  --c-orb-4: hsl(130 62% 55%);  /* 选必二 · 绿 · #50d080 */
  --c-orb-5: hsl(210 78% 62%);  /* 选必三 · 蓝 · #4090ff */

  /* ── 文字 / 边框 / 状态 ── */
  --text-hi:  rgba(255 255 255 / .92);
  --text-md:  rgba(255 255 255 / .78);
  --text-lo:  rgba(255 255 255 / .56);
  --text-dim: rgba(255 255 255 / .38);
  --border-hi: rgba(255 255 255 / .14);
  --border-md: rgba(255 255 255 / .08);
  --success: #50d080;
  --warning: #f0b030;
  --danger:  #ff7070;

  /* ── 玻璃 ── */
  --glass-bg:        rgba(8 12 28 / .72);
  --glass-bg-strong: rgba(4 9 22 / .88);
  --glass-border:    rgba(201 229 255 / .18);
  --glass-blur:      blur(20px) saturate(180%);

  /* ── 字号 ── */
  --fs-xs:      .6875rem;   /* 11 */
  --fs-sm:      .8125rem;   /* 13 */
  --fs-md:      .875rem;    /* 14 */
  --fs-base:    1rem;       /* 16 */
  --fs-lg:      1.125rem;   /* 18 */
  --fs-xl:      1.375rem;   /* 22 */
  --fs-2xl:     1.75rem;    /* 28 */
  --fs-3xl:     2.25rem;    /* 36 */
  --fs-display: clamp(2.5rem, 5vw, 4rem);

  /* ── 间距 ── */
  --sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;
  --sp-4: 16px;  --sp-5: 20px;  --sp-6: 24px;
  --sp-8: 32px;  --sp-10: 40px; --sp-14: 56px;
  --sp-20: 80px; --sp-30: 120px;

  /* ── 圆角 ── */
  --r-xs:   4px;
  --r-sm:   6px;
  --r-md:   10px;
  --r-lg:   16px;
  --r-pill: 999px;

  /* ── 阴影 ── */
  --shadow-card:  0 10px 40px rgba(0 0 0 / .45);
  --shadow-glow:  0 0 18px rgba(240 176 48 / .35);
  --shadow-pop:   0 18px 60px rgba(0 0 0 / .55);

  /* ── z-index ── */
  --z-canvas: 0;     --z-decor: 10;
  --z-nav: 50;       --z-panel: 100;
  --z-tip: 200;      --z-modal: 300;
}
```

### 步骤 2：别名兼容（过渡期，旧类不破坏）

```css
:root {
  --c1: var(--c-orb-1);
  --c2: var(--c-orb-2);
  --c3: var(--c-orb-3);
  --c4: var(--c-orb-4);
  --c5: var(--c-orb-5);
  --glass: var(--glass-bg);
  --border: var(--border-hi);
  --text: var(--text-hi);
  --dim: var(--text-dim);
}
```

> 这样新 token 与旧 token 双轨并存，旧选择器无需改动即可使用新值。

### 步骤 3：组件级应用（按 P1 → P4 顺序）

#### P1 · 顶栏 + HUD + Tooltip
```css
/* ── 顶栏（已有，强化 token 应用）── */
#topbar {
  height: 54px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border-md);
  box-shadow:
    inset 0 1px 0 rgba(255 255 255 / .04),
    0 4px 24px rgba(0 0 0 / .35);
}

/* ── 顶部按钮统一样式 ── */
.orb-btn, #core-btn, #sound-toggle {
  height: 32px;
  padding: 0 14px;
  border-radius: var(--r-pill);
  font-size: var(--fs-sm);
  font-weight: 500;
  letter-spacing: .03em;
  border: 1px solid var(--border-hi);
  background: rgba(255 255 255 / .04);
  color: var(--text-md);
  transition: all 180ms var(--ease-premium);
}

.orb-btn:hover, #core-btn:hover, #sound-toggle:hover {
  background: rgba(255 255 255 / .08);
  color: var(--text-hi);
  transform: translateY(-1px);
}

.orb-btn:active, #core-btn:active, #sound-toggle:active {
  transform: translateY(0) scale(.98);
  transition-duration: 80ms;
}

/* ── 筛选按钮选中态（按主题色）── */
.orb-btn[data-orbit="1"].active {
  background: color-mix(in oklch, var(--c-orb-1) 15%, transparent);
  border-color: color-mix(in oklch, var(--c-orb-1) 50%, transparent);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 0 12px color-mix(in oklch, var(--c-orb-1) 20%, transparent);
}
/* ... orb-2..5 同模式 */

/* ── HUD 遥测面板 ── */
#hud-telemetry {
  width: 360px;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--r-md);
  padding: 16px 18px;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  box-shadow: var(--shadow-card);
  position: fixed;
  top: 80px; right: 24px;
  z-index: var(--z-panel);
}

.hud-header {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: .12em;
  color: var(--c-orb-2);
  margin-bottom: 12px;
  text-transform: uppercase;
}

.hud-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-md);
}

.hud-label { font-size: var(--fs-xs); color: var(--text-dim); letter-spacing: .12em; }
.hud-val   { font-size: var(--fs-sm); color: var(--text-hi); font-weight: 500; }
```

#### P2 · 海报 + 方法 模态框

```css
#poster-card, #method-card {
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--r-lg);
  padding: 0;  /* 内部 grid 控制 */
  box-shadow: var(--shadow-pop);
  overflow: hidden;
}

/* L 形角标 */
.hud-corner {
  position: absolute;
  width: 18px; height: 18px;
  border: 2px solid var(--c-orb-2);
  pointer-events: none;
  animation: cornerIn 240ms var(--ease-premium) both;
}
.hud-corner.tl { top: 12px; left: 12px;     border-right: 0; border-bottom: 0; }
.hud-corner.tr { top: 12px; right: 12px;    border-left: 0;  border-bottom: 0; }
.hud-corner.bl { bottom: 12px; left: 12px;  border-right: 0; border-top: 0; }
.hud-corner.br { bottom: 12px; right: 12px; border-left: 0;  border-top: 0; }
.hud-corner.tl, .hud-corner.tr { animation-delay: 0ms; }
.hud-corner.bl, .hud-corner.br { animation-delay: 60ms; }

@keyframes cornerIn {
  from { transform: scale(.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* 顶部扫描线 */
.poster-scanline {
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg,
    transparent 0%, var(--c-orb-2) 50%, transparent 100%);
  animation: scanlineSweep 6s linear infinite;
}

@keyframes scanlineSweep {
  0%   { transform: translateY(0); opacity: .8; }
  50%  { opacity: 1; }
  100% { transform: translateY(720px); opacity: 0; }
}

/* 海报打开入场（从画布位置 fly-out 到中心）── */
#poster-overlay.open #poster-card {
  animation: posterIn 360ms var(--ease-out-expo);
}

@keyframes posterIn {
  from { transform: scale(.85) translateY(20px); opacity: 0; }
  to   { transform: scale(1)   translateY(0);    opacity: 1; }
}
```

#### P3 · 响应式补齐

```css
@media (max-width: 900px) {
  #hud-telemetry {
    top: auto;
    bottom: 12px;
    right: 12px;
    left: 12px;
    width: auto;
    padding: 10px 14px;
    font-size: var(--fs-xs);
  }
  .hud-header { margin-bottom: 6px; }
}

@media (max-width: 768px) {
  #topbar {
    padding: 0 12px;
    gap: 6px;
  }
  #app-title { font-size: 13px; }
  .orb-btn { padding: 0 10px; font-size: 11px; }

  #poster-overlay.open #poster-card {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  .poster-main-content {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
  .poster-col-right { padding: 16px; }
  .poster-planet-wrapper { width: 240px; height: 240px; }
}

@media (max-width: 480px) {
  #search { width: 140px; }
  #search:focus { width: 170px; }
  .filter-group { display: none; }  /* 折叠到汉堡菜单 */
}
```

### 步骤 4：动效统一审计

扫 `styles.css` 中所有 `transition` / `animation`，按 §7 表替换为：
- 时长从 150 / 200 / 220 / 240 / 300 / 360 / 400 中收敛到 180 / 220 / 240 / 360
- 缓动从 `ease` / `ease-out` / `cubic-bezier(...)` 中收敛到 3 类预设变量

## 4. 验收脚本（Playwright）

```js
// e2e/design-regression.spec.js
import { test, expect } from '@playwright/test';

const breakpoints = [
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768',   width: 768,  height: 1024 },
  { name: 'mobile-375',   width: 375,  height: 812 },
];

for (const bp of breakpoints) {
  test(`design regression @ ${bp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('http://localhost:5173/');
    await page.screenshot({ path: `screenshots/${bp.name}.png`, fullPage: false });

    // 顶栏可见
    await expect(page.locator('#topbar')).toBeVisible();
    // HUD 存在
    await expect(page.locator('#hud-telemetry')).toBeAttached();
    // 5 个轨道按钮
    await expect(page.locator('.orb-btn[data-orbit]')).toHaveCount(6);
  });
}

test('poster open animation', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  // 点击某个科学家节点（使用现有交互）
  await page.evaluate(() => window.__debug_vault.showPoster(window.__debug_vault.getScientists()[0]));
  await page.waitForTimeout(400);
  await expect(page.locator('#poster-card')).toBeVisible();
  await page.screenshot({ path: 'screenshots/poster-open.png' });
});
```

## 5. 上线清单（Definition of Done · DoD）

- [ ] DESIGN.md / design-contract.md / implementation-handoff.md / asset-request.md 完成
- [ ] CSS v2 token 块已加入，alias 双轨运行
- [ ] P1 顶栏 / HUD / Tooltip 应用完成
- [ ] P2 海报 / 方法模态框应用完成（含角标 / 扫描线入场动效）
- [ ] P3 响应式 768 / 480 / 375 断点补齐
- [ ] Playwright 桌面 / 平板 / 手机 截图通过
- [ ] `npm run build` 无错
- [ ] Lighthouse Performance ≥ 90 / A11y ≥ 95
- [ ] 与用户评审签字

## 6. 不做的事（Non-goals）

- ❌ 不重做星球纹理（已高品质，保留）
- ❌ 不新增 3D 模型 / 模型动画
- ❌ 不做账号系统 / 多人协作
- ❌ 不改主画布渲染逻辑（Three.js）
- ❌ 不改 `loadData()` 数据加载流程
- ❌ 不引入新字体（不下载 / 不打包）