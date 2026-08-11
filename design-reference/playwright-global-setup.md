# 全局 Playwright 使用说明

这台机器已经安装了全局 Playwright 工具，以后任何项目都可以直接用，不需要每个项目单独安装。

## 已安装命令

```bash
playwright-cli --version
playwright --version
```

当前验证结果：

- `playwright-cli`: `0.1.13`
- `playwright`: `1.60.0`

## 常用检查命令

打开本地项目：

```bash
playwright-cli open http://127.0.0.1:5173
```

切换桌面尺寸：

```bash
playwright-cli resize 1440 900
```

切换手机尺寸：

```bash
playwright-cli resize 390 844
```

截图：

```bash
playwright-cli screenshot --filename output/playwright/check.png
```

查看控制台错误：

```bash
playwright-cli console error
```

关闭测试浏览器：

```bash
playwright-cli close-all
```

## 以后你可以这样要求 Codex

```text
请启动项目，用全局 playwright-cli 打开本地页面，
分别检查桌面端和手机端截图，并查看 console error。
如果发现遮挡、文字溢出、按钮不可点，请直接修复。
```

