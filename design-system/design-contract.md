# Design Contract — 决策记录

> 本文件是 **reference-design-contract** 产物：记录 DESIGN.md 背后的所有决策，包括证据、保留/改动边界、理由、风险与质量门。

## 1. 决策摘要

| # | 决策 | 选择 | 理由 |
|---|------|------|------|
| D1 | 视觉风格延续 | **深空生物档案馆 v1**（不切换风格） | 用户已投入大量设计资产；客户认可；切换成本高 |
| D2 | 设计方法论 | **Open Design `reference-design-contract` 九段式** | 与工具一致；可审计；可复用 |
| D3 | 设计系统参考 | **Open Design `cosmic`（太空主题）+ Linear/Stripe 工艺** | cosmic 主题契合；Linear/Stripe 工艺已存在 |
| D4 | Token 命名 | **语义化（`--c-orb-1`..`-5` / `--text-hi`..`-dim`）** | 与现有变量命名风格一致；避免 Hex 直接引用 |
| D5 | 字号阶梯 | **Major Third 1.25 + clamp 拉伸** | 投屏 / 桌面双兼顾；避免 14 级复杂阶梯 |
| D6 | 圆角阶梯 | **5 级（4/6/10/16/pill）** | 与现有约定一致；克制 HUD 严肃感 |
| D7 | 落地页 | **沿用本次会话新建的 `voyager-landing.html`（黑白极简）** | 已交付，作为项目入口 |
| D8 | 图片策略 | **现有 90 张纹理保留，新增资源按需** | 现有纹理已是真实天文摄影；UI 优化不需重做纹理 |
| D9 | 实施策略 | **CSS-only 重构 · 不改 DOM · 不改 JS 业务逻辑** | 严格符合用户"业务逻辑不变"要求 |
| D10 | 工具链 | **Open Design daemon + 设计系统文件 + Playwright 截图回归** | 已在 v0.11.0；本地有 `.playwright-cli/` 历史截图 |

## 2. 证据来源

| 来源 | 用途 |
|------|------|
| `vue/design-reference/style-guide.md` v1 | 保留色彩 / 字体 / 布局 / 组件 / 动效基线 |
| `vue/src/styles.css` 5081 行 | 提取现有 token、组件样式、动效曲线 |
| `vue/index.html` | 现有 DOM 结构与组件类名（不可改动） |
| `vue/src/main.js` 2000+ 行 | 业务逻辑与 Three.js 纹理加载流程 |
| `vue/public/Images/` 90 张纹理 | 现有星球纹理基线 |
| Open Design `design-systems/cosmic/DESIGN.md` | 九段式模板 + 太空主题 token 范例 |
| Open Design `skills/reference-design-contract/SKILL.md` | 决策与产出契约方法论 |
| Open Design `skills/color-expert/SKILL.md` | OKLCH / 对比度 / 调色板方法 |
| `.playwright-cli/*.png`（历史截图） | 视觉回归基线 |

## 3. 保留 / 改动 / 弃用 边界

### ✅ 保留（Keep）
- DOM 结构、id/class 命名（`#topbar` / `#hud-telemetry` / `#poster-card` / `.orb-btn[data-orbit]` …）
- 业务逻辑：`loadData()` / `bootSystemSequence()` / `showPoster()` / `requestAnimationFrame` 主循环
- Three.js 星球渲染流程、Canvas 2D 轨道绘制
- 90 张纹理 + `images.json` 映射
- 现有动画：`@keyframes blobFloat1..5` / `twinkle` / `bounce-wave`
- 缓动曲线：`--ease-premium` / `--ease-out-expo` / `--ease-in-out-soft`
- 焦点环、滚动条美化、文本选色

### 🔧 改动（Upgrade · 不破坏）
- **抽出新 token**：在 `:root` 增加 §2–§4 token，与旧 `--c1..5` / `--glass` / `--text` 长期并存（alias）
- **顶栏 / HUD / 海报 / 方法 / Tooltip** 应用规范 §6 的圆角、阴影、间距、动效
- **响应式**：补齐移动端 768 / 640 / 375 断点（目前 styles.css 有断点但不完整）
- **海报 fly-out 入场**：poster 打开时 360ms 从画布位置 fly-out（GSAP）— 增强，不破坏现有 `.open` 逻辑
- **角标 / 扫描线入场动效**：CSS 实现，不影响布局

### ❌ 弃用（Deprecate · 不立即删除）
- 硬编码 Hex 散落在样式表各处（统一替换为 token；过渡期允许双轨）
- 不一致的圆角（部分 4px、部分 8px、部分 14px） → 收敛到 5 级阶梯
- 部分冗余的 keyframes（保留 2 个版本过渡）

## 4. 风险登记

| 风险 | 等级 | 缓解 |
|------|------|------|
| CSS 5081 行重构引入回归 | 中 | 双轨 token；逐阶段 Playwright 截图回归；保留旧类名 |
| 新动效导致投屏眩晕 | 低 | 严守时长表（≤ 360ms 整屏）；运动曲线统一 |
| 移动端触摸交互缺失（hover态失效） | 中 | 补充 `:active` / 长按手势；tooltip 改底部抽屉 |
| 与现有 token 同名冲突 | 低 | 新 token 加前缀（`--c-orb-` / `--text-hi`），不覆盖 `--c1..5` |
| 用户对风格的"再调整"诉求 | 中 | 每阶段交付截图，邀请评审；及时回退 |
| 性能（动画多了导致掉帧） | 低 | 仅 transform / opacity；will-change 克制 |
| Open Design daemon 长时间运行影响 | 低 | 已确认 v0.11.0 @ 127.0.0.1:7456 健康 |

## 5. 质量门（Quality Gate · 每阶段必跑）

| 门 | 标准 |
|----|------|
| **构建** | `npm run build` 无错通过 |
| **回归** | Playwright 桌面 1280、平板 768、手机 375 截图与 v1 baseline 一致或更好 |
| **对比度** | axe / Lighthouse 无 contrast 错误 |
| **Lighthouse** | Performance ≥ 90 · Accessibility ≥ 95 |
| **包体积** | CSS 增量 ≤ 5%（替换型重构，不增体积） |
| **沟通** | 每阶段产出 PDF 截图 + 变更日志，邀请评审 |

## 6. 沟通机制（Communication Cadence）

| 节点 | 频率 | 内容 | 渠道 |
|------|------|------|------|
| **日同步** | 每日 1 次 | 进度 / 阻塞 / 当日变更 | 任务留言 |
| **阶段评审** | 每 P 阶段结束 | 截图 + 视频 + 决策请求 | 设计评审会 |
| **签字门** | 每 P 阶段前 | 用户确认方向后开工 | 显式确认 |
| **里程碑回顾** | 每 2 周 | 整体进度 / 偏差 / 调整 | 月度复盘 |

## 7. 联系方式与职责

| 角色 | 职责 |
|------|------|
| **产品经理（本代理）** | 方案 / 文档 / 评审组织 / 进度 |
| **用户（设计审稿 / 资源提供）** | 方向确认 / 截图反馈 / 提供新图片资源 |
| **开发协作** | CSS 实施 / 兼容性测试 / Playwright 截图回归 |
| **Open Design 工具** | 设计系统参考 / 自动化截图 / 评审 |