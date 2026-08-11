# UI 设计落地工作区

这个文件夹用来帮助 Codex 理解你的 UI 意图。以后做任何 Web 页面，都先走这里的流程，再改代码。

## 你每次要做的 5 步

1. 把 Pinterest 或其他来源下载的图片、视频放进项目的 `素材库`。
2. 更新 `asset-inventory.md`，写清楚每个素材想参考什么。
3. 更新 `brief.md`，写清楚这次要做什么页面、给谁用、必须有哪些功能。
4. 让 Codex 根据素材生成或更新 `style-guide.md`。
5. 让 Codex 按 `implementation-checklist.md` 改 Vue 页面、启动服务、截图检查。

## 学习顺序

如果你是小白，按这个顺序看：

1. `lesson-02-how-to-describe-reference.md`：怎么描述参考图。
2. `lesson-03-reference-to-ui-tasks.md`：怎么把参考图翻译成代码任务。
3. `lesson-04-first-ui-pass.md`：第一次改首页和顶部栏。
4. `lesson-05-dossier-modal.md`：改科学家详情弹窗。
5. `lesson-06-complete-ui-workflow.md`：完整流程。
6. `new-project-starter-template.md`：以后新项目直接复制的提示词。
7. `acceptance-checklist.md`：验收清单。
8. `playwright-global-setup.md`：全局 Playwright 使用说明。

## 给 Codex 的固定说法

```text
请先读取 design-reference 里的 brief.md、asset-inventory.md、style-guide.md，
再结合 素材库 里的图片和视频，提炼原创 UI 方向。
不要直接照抄参考图，只学习它的色彩、构图、层级、动效和组件气质。
确认方向后，再按 implementation-checklist.md 落地到当前 Vue 项目。
```

## 这次项目的判断

当前项目是“高中生物科学家星空轨道”，参考素材是深空探索风格。适合走：

- 暗色沉浸背景
- 大面积星空和宇宙视觉
- 科技仪表盘式信息层
- 发光边框和玻璃质感
- 卡片内容像任务档案，而不是普通网页卡片
