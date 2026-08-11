# 第五步：科学家任务档案弹窗

本轮把科学家详情弹窗从“普通详情卡”推进到“科学家任务档案”。

## 本轮目标

- 左侧是科学家档案摘要。
- 右侧是星球主视觉。
- 角落元数据像任务系统参数。
- 手机端变成竖向档案，先看视觉，再读内容。

## 改了哪些文件

### `src/styles.css`

新增一段：

```css
/* Step 05 UI pass: scientist dossier modal, desktop and mobile. */
```

主要做了：

- 重做 `#poster-overlay` 的深空遮罩。
- 重做 `#poster-card` 的左右分栏和边框。
- 强化 `#poster-name-cn`、`#poster-name-en` 的层级。
- 把 `p-card-brief` 做成课堂可读摘要。
- 把 `p-recall-hero` 做成高亮记忆区。
- 优化 `.poster-planet-wrapper` 的星球展示。
- 优化 `.poster-meta-item` 的四角参数卡。
- 手机端把弹窗改成纵向浏览。
- 手机端把关联科学家栏改成文字胶囊。

## 为什么还是主要改 CSS

`src/main.js` 已经把详情内容整理成了：

- `p-card-brief`
- `p-identity-line`
- `p-focus-chip`
- `p-recall-hero`
- `p-method-mini`
- `p-detail-toggle`

所以这轮不需要重写 JS。我们只用 CSS 把这些内容“设计成档案”。

## 验证结果

已运行：

```bash
npm run build
```

结果：通过。

已用 Playwright 检查：

- 桌面端详情弹窗：`1440 x 900`
- 手机端详情弹窗：`390 x 844`
- 控制台错误：0

截图位置：

- `output/playwright/desktop-dossier-final.png`
- `output/playwright/mobile-dossier-final.png`

## 这一步你要学会什么

参考图里的“行星信息页”不能直接复制。

正确翻译是：

```text
行星大图 -> 科学家星球主视觉
空间参数 -> 年代、国籍、优先级、教材星区
英文标题 -> 科学家档案编号气质
移动端竖卡 -> 手机端科学家档案
```

这样才是把参考图变成你的项目，而不是照搬别人的页面。

