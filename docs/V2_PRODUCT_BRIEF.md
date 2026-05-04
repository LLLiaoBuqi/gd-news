# gd-news 产品简报

## 问题定义

彦齐和项目成员需要一个每天可打开的 AI 创作能力雷达。它不追求覆盖所有 AI 新闻，而是快速回答：哪些 Agent / Skill / workflow、图像模型、创作工具、大语言模型和视频模型变化，会影响创作流程、工具选择和近期团队实验。

维护者仍需要保留旧项目的信息源能力：RSS / OPML、官方 changelog、公开 GitHub feed、newsletter、聚合源、source health、GitHub Actions 和私有 OPML 扩展。

## 默认展示优先级

1. **Agent / Skill / workflow**：Claude Code、Claude Skills、OpenAI Skills、Cursor、Codex、OpenClaw、Flowith Canvas Cowork Skill 等。
2. **图像 / 图像编辑模型**：GPT Image、Nano Banana、Seedream、Qwen Image、FLUX、Imagen、HunyuanImage 等。
3. **AI 创作工具更新**：Lovart、Flowith、LibLibAI、Krea、Runway、ComfyUI、Figma AI、Canva AI 等。
4. **影响创作或 Agent 工作流的大语言模型**：只有当模型变化影响创作链路、自动化 workflow 或团队工作方式时高亮。
5. **AI 视频模型**：Seedance、Veo、Kling、Sora、Runway Gen 等。

泛 AI 热点、融资新闻、榜单文章、口水战和宽泛行业动态默认降权，除非它们明确改变创作能力或团队工作流。

## 产品结构

继续采用两层结构：

- **信号层**：首页默认展示项目成员最该看的高信号内容，减少选择负担。
- **扩展层**：维护者使用 OPML、自定义 fetcher、source health、GitHub Secrets 和 Actions 扩展来源。

默认页面可以展示来源健康和覆盖状态，但不要把所有来源管理细节变成用户必须理解的操作项。

## 来源策略

保留旧项目的信息源分类和接入能力，但重新定义默认排序：

- 官方源负责确认事实。
- 榜单源负责维护图像 / 图像编辑模型观察池。
- 创作工具 changelog 负责判断能力是否落地到工作流。
- AI Breakfast、Follow Builders、AIbase、NewsNow 等聚合源负责补漏和发现线索。
- 私有 OPML 负责个人信任源和小众高质量来源扩展，不进入 git。

X、邮箱、WeChat、cookies、浏览器导出和登录态桥接只作为私有或高级扩展，不作为公共默认源。

## 当前阶段

当前仓库处于“方向迁移”阶段：

- 文档和 Agent 规则正在从旧 AI News Radar 改为 AI 创作能力雷达。
- 前端仍主要是旧版 AI Signal Board 展示结构。
- `scripts/update_news.py` 的筛选逻辑仍主要沿用旧项目。
- 后续要先用测试定义新筛选目标，再改抓取、排序和前端呈现。

## 成功标准

- 首页第一屏能说明这是 AI 创作能力雷达，而不是泛 AI 新闻聚合。
- 默认排序优先展示 Agent / Skill / workflow，其次是图像模型、创作工具、相关大语言模型和视频模型。
- 旧的信息源接入、source health、OPML 和 GitHub Actions 能力继续可用。
- 新增来源时，Agent 能判断它应该进入公共默认层、私有 OPML，还是暂不接入。
- 公共仓库不包含私有 OPML、token、cookie、API key、邮箱或个人订阅源。
