# 第四步：第一轮 UI 改造复盘

本轮开始真正动代码，但只做安全范围内的 UI 改造。

## 本轮目标

先改最安全、最明显的两块：

1. 顶部任务控制台
2. 首页深空主视觉

没有改：

- 数据结构
- 科学家数据
- Canvas 交互逻辑
- 详情弹窗逻辑
- Vue 架构

## 改了哪些文件

### `src/styles.css`

主要追加了一段：

```css
/* Step 04 UI pass: visible mission controls + Pinterest-inspired deep-space hero. */
```

这段样式做了：

- 重新显示顶部控制台。
- 把顶部栏改成半透明任务控制条。
- 统一搜索框、筛选按钮、核心必考按钮的科技面板风格。
- 强化首页标题的深空档案感。
- 恢复并调整左下任务控制台、右下星体档案提示和遥测面板。
- 优化手机端顶部栏，隐藏计数，避免文字挤压。

### `index.html`

补充了：

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
```

用于消除浏览器请求 `favicon.ico` 的 404 错误。

## 为什么先改 CSS

当前项目主要是：

- `index.html` 固定 DOM
- `src/styles.css` 控制视觉
- `src/main.js` 控制交互和 Canvas

所以第一轮最好先改 CSS。这样风险低，能快速看到效果，也不容易破坏功能。

## 验证结果

已运行：

```bash
npm run build
```

结果：通过。

已用 Playwright 检查：

- 桌面端：`1440 x 900`
- 手机端：`390 x 844`
- 控制台错误：0

截图位置：

- `output/playwright/desktop-home.png`
- `output/playwright/mobile-home-after.png`

## 本轮学到的方法

以后你看到参考图，不要直接说“照着做”。

要拆成：

```text
参考图里的控制台感 -> 我的顶部栏 -> 改 #topbar、#search、.orb-btn
参考图里的深空首屏 -> 我的首页 -> 改 #canvas-section、#home-intro
参考图里的档案卡 -> 我的详情弹窗 -> 下一轮再改 #poster-card
```

这样 Codex 才知道该改哪里、先改哪里、怎么验证。

