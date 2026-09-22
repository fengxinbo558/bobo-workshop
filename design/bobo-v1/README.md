# bobo.ai 视觉提案 · v2

当前版本已修正角色握持方向与工作台状态逻辑，详见 REVISION-v2.md。首稿通过 index-v1.html 保留对照。

本轮交付：原版视觉素材清单、bobo.ai 原创角色设定、首页与制作工作台换肤效果图。新图由内置 imagegen 生成，是供选择和修改的概念图，还不是已接入程序的页面或逐帧动画。

## 已确认方向

- 新名称：bobo.ai（全小写）。
- 风格：温暖潮玩；圆润小怪兽；奶油白与橙色；创作伙伴的陪伴感。
- 现有制作流程、游戏预览、素材、文件、设置和角色岗位延续。

## 本版设计提议

主角暂名「波波 BOBO」：橙色软胶小怪兽、不对称的小角、奶油色脸腹、深棕眼睛、一颗小牙、短手和圆脚。相同角色穿戴不同工具来表达岗位，避免五个完全不同角色导致品牌辨识分散。

| 岗位 | 造型识别 | 工作状态 |
|---|---|---|
| 策划 | 折叠图纸 | 思考、查看计划 |
| 画师 | 画笔、浅粉围裙 | 绘制素材 |
| 工程师 | 鼠尾草色工具挎包、电脑 | 编码、构建、修复 |
| 测试员 | 浅色头带、手柄 | 试玩、检查、庆祝 |

角色图展示岗位设定和表情意向；工程接入仍需统一画布、脚底锚点、透明底和逐帧动作，不能把设定图直接当动画精灵图。

界面采用奶油色底、深棕正文、橙色主操作和选中态，鼠尾草绿表达正常/完成状态。插画和角色放在欢迎区、工坊区及状态反馈区，长文本、项目列表与预览保持清晰。

| 色彩 | 提议色值 | 用途 |
|---|---|---|
| 奶油白 | #F6F1E8 | 应用背景 |
| 浅纸白 | #FFFCF7 | 编辑区与浮层 |
| 橙色 | #ED793F | 品牌、主操作、角色 |
| 可可棕 | #302B27 | 正文与图标 |
| 鼠尾草 | #A5B6A3 | 场景配色、状态辅助 |

实际开发时会单独验证文字与按钮的对比度；配色板不等同于所有颜色都可直接作正文。

## 原版视觉核对

证据基线：本地 dev，提交 21729721f342c273efd19206bba1922923312407。

- 5 套角色主题：经典工坊、苔光工坊、星铸工坊、暮光魔法工坊、Hello Kitty 工坊。
- 5 个单人工坊背景，与主题包对应；另外 2 个多人场景：协作工坊、荷塘钓鱼。
- 9 个过渡场景：暖木工坊、水晶实验室、森林营地、天空码头、海边街机、雪地小屋、星空观测台、魔药花园、屋顶工作室。
- 每套主题 manifest 具有 16 类动作：idle、think、wait、walk、work、carry、paint、sleep、play、repair、coffee、stretch、type、inspect、sweep、celebrate。部分状态复用同一组帧，并不是 16 套完全独立的素材。
- 当前界面结构由 HomeDashboard、ProjectRail、ProductionDiorama、Pipeline、Composer、Inspector、SettingsModal 等组件组成。
- `original/docs/noobi-workbench.png` 是仓库原有截图，未把它当作当前运行版本的截图；当前代码比该截图多出或改动了部分功能。
- 已复制 45 个原始参考文件；来源与副本的精确对应在 `original/manifest.json`。

## 后续替换位置

| 视觉层 | 当前位置 | 替换工作 |
|---|---|---|
| 应用名与图标 | package.json、src/renderer/index.html、build/icon.png、src/renderer/assets/noobi-app-icon.png | 统一 bobo.ai 名称、图标与打包显示名称 |
| 角色主题与岗位 | NoobiPackPicker.tsx、NoobiCrewPicker.tsx、noobiProductionPacks.ts | 接入波波角色、岗位装束和逐帧动作 |
| 场景与过渡 | NoobiScenePicker.tsx、noobiTransitionScenes.ts、assets/noobi-* | 工坊背景、钓鱼场景与过渡动画统一 |
| 页面与组件 | HomeDashboard.tsx、ProjectRail.tsx、ProductionDiorama.tsx、SettingsModal.tsx、styles.css | 首页、工作台、设置与角色选择换肤 |
| 兼容与同步 | dev 分支及既有设置/IPC/存储字段 | 展示名优先，内部字段不做盲目全局替换，以降低旧数据迁移和合并上游的成本 |

## 文件与状态

`index.html` 是本地视觉提案册，直接打开即可。`generated/` 放新方案图片和完整生成提示词；`original/` 保留原图。

仓库名称、应用运行代码和远端分支本轮尚未改名或部署；本轮先确定视觉。图片里的项目、状态与游戏画面为示意内容，不代表实际完成的游戏。
