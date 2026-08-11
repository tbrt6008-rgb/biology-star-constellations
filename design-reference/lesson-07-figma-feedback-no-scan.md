# 第七步：根据 Figma 批注删除扫描层

本轮来自 Figma 批注反馈。

## 用户反馈

扫描功能没有真实用途，属于干扰视觉的鸡肋功能。

具体问题：

- 扫描层和星球本体之间关系不明确。
- 扫描颜色和星球颜色不一致，看起来像误加了一层遮罩。
- 右下角小扫描盘没有实际价值。

## 处理原则

不把无意义装饰硬解释成功能。

如果一个视觉元素不能服务：

- 教学理解
- 信息表达
- 明确交互
- 视觉层级

就删除。

## 改动

### `index.html`

删除：

- `poster-hud-canvas`
- `mini-orbit-wrap`
- `mini-orbit-canvas`
- `Constellation Sectors` 小面板

### `src/main.js`

删除详情弹窗渲染路径里的：

- `drawHUDOverlay(hudcv, s)`
- `drawMiniOrbit(s.orbit)`

保留：

- 主星球 Three.js 渲染
- 四角元数据
- 科学家档案内容

### `src/styles.css`

隐藏/禁用：

- `.poster-planet-container::before`
- `.poster-planet-container::after`
- `.mini-orbit-wrap`

## 验证

已运行：

```bash
npm run build
```

结果：通过。

已用 Playwright 检查：

- 桌面详情：`output/playwright/desktop-dossier-no-scan.png`
- 手机详情：`output/playwright/mobile-dossier-no-scan.png`
- 控制台错误：0

## 学到的设计判断

可视化批注不是只告诉 Codex “哪里不好看”，更重要的是告诉 Codex：

```text
这个东西是不是有用？
如果没有用，就删掉，不要继续装饰。
```

