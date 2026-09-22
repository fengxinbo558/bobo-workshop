---
name: bobo.ai
description: 奶油白与橙色的小怪兽创作伙伴
colors:
  primary: "#b94e20"
  primary-soft: "#f9e4d5"
  primary-ink: "#fffaf5"
  studio-accent: "#bf5122"
  canvas: "#f6f1e8"
  surface: "#fffaf3"
  surface-raised: "#fffdf9"
  surface-hover: "#f4e8d9"
  border: "#e6d9c9"
  border-strong: "#c9b9a5"
  text: "#392e27"
  text-soft: "#67574b"
  muted: "#79695c"
  success: "#4d735b"
  success-soft: "#eaf1e7"
  error: "#b54436"
  error-soft: "#fae7e1"
typography:
  display:
    fontFamily: "'Avenir Next', 'PingFang SC', -apple-system, sans-serif"
    fontSize: "clamp(28px, 3.3vw, 44px)"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-1.5px"
  title:
    fontFamily: "'Avenir Next', 'PingFang SC', -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "'Avenir Next', 'PingFang SC', -apple-system, sans-serif"
    fontSize: "15px"
    lineHeight: 1.8
  label:
    fontFamily: "'Avenir Next', 'PingFang SC', -apple-system, sans-serif"
    fontSize: "12px"
    lineHeight: 1.5
rounded:
  control: "12px"
  card: "14px"
  companion: "16px"
  panel: "18px"
  pill: "100px"
spacing:
  compact: "8px"
  control: "12px"
  panel: "16px"
  roomy: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    padding: "8px 12px"
  input-shell:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
  navigation-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "0 13px"
  idea-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-soft}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
  companion-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.companion}"
    padding: "6px 12px 6px 4px"
---

# Design System: bobo.ai

## Overview

**Creative North Star: "暖暖的波波创作工坊"**

奶油白界面承托橙色潮玩小怪兽，像与一个有耐心的创作伙伴坐在同一张工作桌前。圆润角色、木质工坊与柔和植物来自现有插画资产；界面控件保持清楚、克制，承载实际项目和制作进度。

本规范记录 Electron 应用当前实现。实现依据为 `src/renderer/bobo.css`、基础 `styles.css`、`boboAssets.ts` 与 `components/BoboStudio.tsx`；截图参考 `.noobi-smoke/bobo-home.png`、`bobo-workbench.png`、`bobo-two.png`、`bobo-solo.png`。它记录视觉系统，不证明完整游戏生成流程已通过端到端验证。

**Key Characteristics:**
- 奶油白分层表面、暖棕正文、橙色操作与选中态。
- 潮玩角色承担身份，文字明确表达角色和运行状态。
- 首页留白充足，工作台紧凑而可扫描。

## Colors

橙色提供创作活力，暖中性色负责大部分阅读面积。前置 token 是浅色默认值，运行时由 CSS 变量控制。

### Primary
- **陶橙 / primary**：新建操作、活动导航、焦点轮廓；`studio-accent` 是现有工作台强调色。
- **杏奶 / primary-soft**：选中或悬停的轻量底色；强调色不替代正文色。

### Neutral
- **奶油画布 / canvas**：应用背景。
- **暖纸 / surface、surface-raised**：卡片、输入、预览与制作面板，以明度区分层级。
- **砂线 / border、border-strong**：边界与分隔。
- **可可文字 / text、text-soft、muted**：标题、正文、辅助信息。

状态使用 `success` 和 `error` 及对应淡底色，不将其扩展成第二套品牌色。暗色主题已有暖深棕覆盖，沿用 `bobo.css` 中的主题变量；插画保持原资产，不自动反色。

**The Status Has Words Rule.** 进度、暂停、错误和完成必须伴随文字，颜色和角色动作只作补充。

## Typography

主字体及中文回退见前置 token。显示文字重而紧凑，正文与辅助信息保持普通无衬线阅读节奏。首页标题使用 display；区块标题使用 title；输入与介绍使用 body；导航、标签与辅助信息使用 label。

工作台沿用更紧凑的实际层级：面板标题与输入为 13px，事件正文为 12px、1.7 行高，状态说明为 11px。避免把辅助字号用于长正文。字体回退属于运行兼容措施，不作为新品牌字形方向。

## Layout

首页内容上限 1120px，横向内边距通常为 36px；项目和伙伴区与创意输入共用内容边界。角色卡默认四列，间距 12px。

工作台使用两个主面板：制作进度和对话在左，预览、素材、文件在右。默认列为 `minmax(470px,1.2fr) minmax(350px,1fr)`，间距和外边距 16px；各面板独立处理内容溢出。

1100px 以下首页边距收至 24px，工作台间距与边距收至 10px；800px 以下伙伴卡变两列，工作台上下排列并允许纵向滚动。新表面应继承这种从并排到堆叠的变化，不把桌面最小列宽硬塞进窄窗口。

## Elevation & Depth

层次主要依靠暖色表面、细边框和圆角。常规卡片及工作台面板无阴影；首页输入保留很轻的环境阴影，基础浮层存在柔和暖棕阴影。精确阴影与交互扩展记录于 sidecar。

插画自身的软光、桌面遮挡和角色体积是重要深度来源。不要给普通工作面板增加厚重的悬浮感。

## Shapes

控件、卡片、伙伴卡与大面板的圆角依次使用前置圆角 token。创意快捷词采用胶囊形。主要容器采用细实线边框，角色保持圆润立体剪影，图片使用平滑采样。

## Components

### Buttons

主操作使用橙底浅字，常见控件圆角；首页开始按钮高 44px，禁用时降低透明度。停止制作使用浅色描边按钮。现有首页主操作悬停轻移 1px；键盘可见焦点为强调色 2px 轮廓、外偏移 2px。不要用动画取代按钮状态。

### Inputs / Fields

创意输入是抬亮的圆角表面，1px 暖边框；首页输入区与附件、模型、提交控件共享容器。工作台输入更紧凑，仍保留清晰的控件区与文字区。

### Chips

创意快捷词采用暖纸胶囊、细边框与柔和正文色，悬停改变底色和边框并轻微上移。它们是操作入口，不是纯装饰标签。

### Cards / Containers

项目卡采用 card 圆角和抬亮表面；伙伴卡采用 companion 圆角、暖纸表面。伙伴图像与角色名称、职责文字一起出现；悬停采用杏奶底色与橙色边框。主面板采用 panel 圆角，不叠加重阴影。

### Navigation

导航保留左侧项目栏与工作台顶部工具区。活动导航使用杏奶底和橙色文字，预览、素材、文件以标签区组织。侧栏可以收起；活动项必须具有清晰的形状或指示线，不能只靠文字色。

### 波波的制作工坊

复用 `assets/bobo/` 中已批准的角色、工坊、首页与图标资产，不以旧像素角色替换。四个角色为策划、画师、工程师和测试员。工坊画面宽高比为 2.5，前景桌面遮挡角色下部以保持空间感。

**The Fixed Station Rule.** 多人模式中角色与标签共用固定槽位；移除伙伴时保留其他角色的岗位，不按剩余人数重排标签。

单人模式使用同一个共享工坊和固定岗位，并保留所选角色外观；休憩场景使用现有首页插画。运行时只有活动伙伴做轻微动作，周期 2.8s，幅度 3px 和 0.5°；系统请求减少动态时关闭动作。保留旧 pack/scene 标识的兼容映射，展示名使用 bobo.ai 与波波。

## Do's and Don'ts

### Do:
- **Do** 用现有暖色变量和批准的波波资产扩展新界面。
- **Do** 保持岗位、角色标签和真实运行状态一致。
- **Do** 保留可见键盘焦点与减少动态支持。

### Don't:
- **Don't** 恢复像素化图片采样或旧角色作为默认视觉。
- **Don't** 把忙碌动作或工坊场景当作任务成功的证据。
- **Don't** 为新界面复制旧技术标识作为面向用户的品牌名。
