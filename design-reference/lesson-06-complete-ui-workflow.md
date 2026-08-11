# 第六步：完整 UI 落地流程

这一课是总流程。以后你做任何 Web/UI 项目，都按这个顺序走。

## 总原则

不要一上来就说：

```text
帮我做一个好看的页面。
```

要说：

```text
我已经准备了素材库。请先理解素材和项目目标，再提炼风格规范，最后落地到代码，并用 Playwright 检查。
```

## 完整流程

### 1. 准备素材

把参考图、视频放进项目里的：

```text
素材库/
```

素材可以来自 Pinterest、网页截图、视频、你自己生成的图。

注意：

- 素材是灵感，不是复制源。
- 重点看氛围、布局、组件、颜色、动效。
- 不直接搬运别人图片到正式项目里。

### 2. 描述素材

更新：

```text
design-reference/asset-inventory.md
```

你可以这样写：

```text
文件名：
我喜欢它的地方：
我想用到项目里的地方：
不能照抄的地方：
优先级：
```

### 3. 写项目目标

更新：

```text
design-reference/brief.md
```

必须说清楚：

- 这个项目是什么？
- 谁来用？
- 主要功能是什么？
- 第一轮只做什么？
- 哪些东西不能动？

### 4. 提炼风格规范

让 Codex 更新：

```text
design-reference/style-guide.md
```

风格规范必须能指导代码，而不是空话。

应该包括：

- 视觉方向
- 主色和辅助色
- 字体气质
- 布局规则
- 组件规则
- 动效规则
- 移动端规则

### 5. 翻译成 UI 任务

让 Codex 更新：

```text
design-reference/ui-implementation-plan.md
```

核心公式：

```text
参考图里的感觉 -> 我的项目里的对象 -> 具体代码位置
```

例子：

```text
行星信息页 -> 科学家任务档案 -> #poster-card、.poster-col-left、.poster-planet-wrapper
```

### 6. 开始改代码

改代码顺序：

1. 先改 CSS。
2. 再少量改 HTML。
3. 最后才考虑 JS。
4. 不要一上来大重构。

为什么：

- CSS 风险最低。
- HTML 中等风险。
- JS 最容易破坏功能。

### 7. 构建检查

每轮改完必须运行：

```bash
npm run build
```

构建不通过，不算完成。

### 8. 浏览器截图检查

用全局 Playwright：

```bash
playwright-cli open http://127.0.0.1:5173
playwright-cli resize 1440 900
playwright-cli screenshot --filename output/playwright/desktop-check.png
playwright-cli resize 390 844
playwright-cli screenshot --filename output/playwright/mobile-check.png
playwright-cli console error
```

必须检查：

- 桌面端有没有遮挡。
- 手机端有没有挤压。
- 文字有没有溢出。
- 按钮是否能点。
- 弹窗是否能关闭。
- 控制台有没有错误。

### 9. 复盘记录

每一轮改完，写一个复盘：

```text
design-reference/lesson-xx-xxx.md
```

内容包括：

- 本轮目标
- 改了哪些文件
- 为什么这样改
- 怎么验证
- 下一步做什么

这一步很重要。它会让以后新对话也能快速接上。

## 什么叫完成

一个 UI 阶段完成，至少要满足：

- 风格符合 `style-guide.md`
- 功能没有坏
- `npm run build` 通过
- 桌面截图通过
- 手机截图通过
- `console error` 为 0
- 有复盘文档

少一个都只能算“暂时能看”，不能算真正完成。

