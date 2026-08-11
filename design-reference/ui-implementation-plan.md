# 第一轮 UI 改造计划

本计划用于把 `style-guide.md` 的风格规范落到当前 Vue 项目。

## 当前代码判断

项目不是标准的 Vue 组件拆分结构。当前主要结构是：

- `index.html`：页面 DOM 骨架。
- `src/styles.css`：绝大部分视觉样式和响应式规则。
- `src/main.js`：canvas、数据加载、详情弹窗、交互逻辑。

所以第一轮 UI 改造的策略是：

```text
优先改 CSS，其次少量改 index.html，尽量不动 main.js。
```

## 优先级 1：统一控制台视觉

目标：

- 顶部栏、搜索、筛选按钮、声音按钮看起来像同一个任务控制台。
- 桌面端不要遮挡首屏主视觉。
- 手机端按钮可以横向滑动，不能挤爆。

涉及位置：

- `#topbar`
- `#app-title`
- `#search-wrap`
- `#search`
- `.filter-group`
- `.orb-btn`
- `#core-btn`
- `#sound-toggle`

验收标准：

- 桌面端第一眼能看到“生物科学家星际档案”。
- 搜索和筛选都能正常使用。
- 手机端顶部不出现文字重叠。

## 优先级 2：强化首页主视觉

目标：

- 保留深空沉浸感。
- 首屏主题明确，不像普通网页。
- 首页标题和星空画布不互相打架。

涉及位置：

- `#canvas-section`
- `#astronaut-bg`
- `#home-intro`
- `.home-kicker`
- `.home-subtitle`
- `#mission-brief`
- `#orbit-dossier`
- `#hud-telemetry`

验收标准：

- 背景有氛围，但星点仍清楚。
- 标题不遮挡核心交互。
- 任务控制台信息不喧宾夺主。

## 优先级 3：科学家详情变成任务档案

目标：

- 详情弹窗像“科学家任务档案”，而不是普通弹窗。
- 中文内容层级清楚。
- 星球视觉是辅助记忆，不遮挡信息。

涉及位置：

- `#poster-overlay`
- `#poster-card`
- `.poster-sidebar`
- `.poster-main-content`
- `.poster-col-left`
- `.poster-col-right`
- `.poster-planet-wrapper`
- `.poster-info-scroll`
- `.poster-meta-item`
- `.retro-table`

验收标准：

- 打开详情时第一眼知道人物是谁。
- 教材模块、核心程度、科学方法容易找到。
- 内容滚动顺畅。
- 关闭按钮明显。

## 优先级 4：手机端竖向档案

目标：

- 借鉴参考图的移动端竖卡比例。
- 手机端不是桌面端硬挤压。
- 详情弹窗可以舒服阅读。

涉及位置：

- `@media (max-width: 760px)`
- `#poster-overlay`
- `#poster-card`
- `.poster-main-content`
- `.poster-col-left`
- `.poster-col-right`
- `.poster-planet-wrapper`
- `.poster-info-scroll`

验收标准：

- 375px 宽度下不横向溢出。
- 关闭按钮可点。
- 文字不被星球或按钮遮挡。
- 筛选按钮可滑动。

## 优先级 5：验证

每一轮改完都必须做：

```bash
npm run build
```

如果启动页面检查：

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

检查页面：

- 桌面端：首屏、搜索、筛选、详情弹窗。
- 手机端：首屏、顶部栏、详情弹窗、关闭按钮。

## 暂时不做

- 不做完整 Vue 组件化。
- 不重写 `src/main.js` 的大段逻辑。
- 不引入新的 UI 组件库。
- 不把 Pinterest 图直接放进正式页面。

