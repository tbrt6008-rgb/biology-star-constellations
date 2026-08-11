# Figma 可视化批注流程

## 当前 Figma 文件

Figma 文件：

```text
https://www.figma.com/design/38es5yL8gjkRfFHlTf0GPL
```

文件名：

```text
Biology Starry Vault - Visual Review
```

## 当前限制

已成功创建 Figma 文件，但捕获本地网页时遇到 Figma Starter 计划的 MCP 调用限制。

这不是项目代码问题。当前可以先用手动方式完成可视化批注。

## 手动批注方式

把下面截图拖进 Figma 文件：

```text
output/playwright/desktop-home.png
output/playwright/mobile-home-after.png
output/playwright/desktop-dossier-final.png
output/playwright/mobile-dossier-final.png
```

然后你可以在 Figma 里：

1. 用矩形框圈出不满意的地方。
2. 用文字标注编号。
3. 写清楚想改成什么。

示例：

```text
1 首页标题往上移一点
2 顶部栏透明度降低
3 手机端星球小一点
4 详情弹窗左侧文字区增加“教材联系”
```

## 发给 Codex 的话

批注完成后，把 Figma 链接发给 Codex，并说：

```text
请读取这个 Figma 批注稿，按编号理解我的修改意见。
先总结每个编号要改什么，再修改 Vue/CSS。
改完后运行 npm run build，并用 playwright-cli 截桌面端和手机端。
```

## 如果以后升级或额度恢复

可以让 Codex 直接做：

```text
把当前 localhost 页面捕获到 Figma 文件里，生成可编辑设计稿。
```

