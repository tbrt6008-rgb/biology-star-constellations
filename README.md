# 高中生物科学家星空轨道

一个面向高中生物课堂展示的交互式星空知识图谱。页面用 2D Canvas 展示科学家星座轨道，用 Three.js 渲染科学家详情中的星球纹理，并通过筛选、搜索、核心考点和方法弹窗辅助课堂浏览。

## 启动

```bash
npm install
npm run dev
```

默认开发地址由 Vite 输出。指定本机端口可运行：

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## 构建

```bash
npm run build
npm run preview
```

## 工程结构

- `index.html`：页面 DOM 骨架、字体链接和 Vite 入口。
- `src/styles.css`：星空界面、详情卡、仪表盘和移动端响应式样式。
- `src/main.js`：数据加载、Canvas 星图、Three.js 星球、筛选搜索、详情弹窗和音频交互逻辑。
- `public/scientists.json`：科学家条目数据。
- `public/methods.json`：科学方法条目数据。
- `public/images.json` 与 `public/Images/`：星球纹理图片清单和资源。

## 当前约束

第一阶段只做工程边界整理和移动端可用性修复，暂不进行完整 Vue 组件化，不调整数据结构，不重新生成图片资源。
