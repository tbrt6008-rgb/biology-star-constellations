# 高中生物科学家星空 · STARRY VAULT 🌌

> **Mission Control for Biology** — 把高中生物科学史变成一座可交互的深空任务控制台。

90+ 位科学家被点亮为深空星图上的星球，按 5 本教材分入 5 个星座，用「星图 + 星球档案」的方式呈现科学史、实验方法与高考考点。

## ✨ 功能特性

- **星图总览**：Canvas 2D 渲染 5 大星座（白羊·分子与细胞 / 巨蟹·遗传与进化 / 金牛·稳态与调节 / 双子·生物与环境 / 狮子·生物技术与工程）
- **科学家档案**：点击星球打开赛博 HUD 海报模态框（时代 / 国籍 / 星等 / 教材模块 / 核心考点）
- **真实纹理星球**：Three.js 渲染 90+ 位科学家的 3D 星球（真实天文摄影纹理，缺失时自动降级为 Canvas 程序化纹理）
- **科学方法库**：假说演绎 / 同位素标记 / 密度梯度离心等 20+ 研究方法详情弹窗
- **搜索与筛选**：按星座筛选 + 关键词搜索
- **开机序列**：BIOSPHERE ARCHIVE 科幻启动动画 + 打字机 + 宇宙声场（可静音）
- **课堂投屏友好**：深色高对比设计、大字号、`prefers-reduced-motion` 无障碍降级、全端响应式

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 构建 | Vite 8 · pnpm |
| 前端 | Vue 3 · 原生 ES Module |
| 3D | Three.js（星球纹理 / WebGL） |
| 2D | Canvas 2D（星图星座） |
| 动效 | GSAP + ScrollTrigger |
| 样式 | CSS 自定义属性（设计 token 系统） |

## 🚀 快速开始

```bash
# 安装依赖
pnpm install        # 或 npm install

# 开发调试
pnpm dev            # http://localhost:5173

# 生产构建
pnpm build
pnpm preview
```

> 提示：星球纹理由 Git LFS 管理。克隆后如需纹理，执行 `git lfs pull`；缺失纹理不影响运行（自动降级）。

## 📁 工程结构

```
vue/
├── index.html              # 页面入口（开机序列 / 星图画布 / 模态框 / HUD）
├── src/
│   ├── main.js             # 核心逻辑：数据加载 / 星图渲染 / 星球 / 详情 / 音频
│   ├── styles.css          # 全站样式（含 v2 设计 token 系统）
│   └── gsap.config.js      # GSAP 配置（缓动 / 降级）
├── public/
│   ├── Images/             # 90+ 星球纹理（Git LFS）
│   ├── design-assets/      # 设计素材（徽章 / 参考图 / 首页图）
│   ├── scientists.json     # 科学家数据
│   ├── methods.json        # 科学方法数据
│   ├── stories.json        # 科学史故事数据
│   ├── images.json         # 纹理映射
│   └── favicon.svg         # 图标
├── design-system/          # 设计系统文档（DESIGN.md / 交付报告 / Lighthouse）
├── package.json
└── vite.config.js
```

## 🎨 设计系统

遵循 Open Design `reference-design-contract` 九段式方法论，完整规范见 [`design-system/DESIGN.md`](design-system/DESIGN.md)：

- **主题**：深空生物档案馆（Dark Sci-Fi · Mission Control）
- **5 教材主题色**：青 `#2dd4e8` / 金 `#f0b030` / 紫 `#c070f0` / 绿 `#50d080` / 蓝 `#4090ff`
- **60+ 语义化设计 token**（色彩 / 字号 / 间距 / 圆角 / 阴影 / 动效）
- **无障碍**：A11y Lighthouse 100 分 · 全组件焦点环 · 动效降级

## 📄 数据

- 科学家：90+ 位（`public/scientists.json`）
- 科学方法：20+ 种（`public/methods.json`）
- 科学史故事：30+ 篇（`public/stories.json`）
- 纹理映射：`public/images.json`

数据对应的高中生物教材：**必修一、必修二、选择性必修一、选择性必修二、选择性必修三**（共 5 本）。

## 🤝 贡献

欢迎补充新的科学家、实验方法或故事条目（编辑对应 JSON 即可），或优化前端视觉与动效。

## 📄 许可证

[MIT License](LICENSE) © 2026 tbrt6008-rgb
