# AI 创作能力雷达来源策略

这个项目不再追求泛 AI 新闻覆盖，而是服务“个人起步、团队可读”的 AI 创作能力雷达。来源策略要帮助项目成员快速知道：哪些 Agent / Skill / workflow、图像模型、创作工具、大语言模型和视频模型变化，可能影响创作流程和近期团队实验。

## 产品模型

采用两层结构：

1. **信号层**：默认页面展示高信号内容，优先呈现 Agent / Skill / workflow、图像 / 图像编辑模型、AI 创作工具、对创作有影响的大语言模型、AI 视频模型。
2. **扩展层**：维护者使用 OPML、source health、GitHub Secrets、自定义 fetcher 扩展个人或团队来源。

默认页面不要暴露太多来源管理细节。来源健康、覆盖池和私有扩展能力可以作为状态信息展示，但不应该让项目成员被迫理解所有抓取机制。

## 五层来源结构

图像模型和创作工具来源采用五层结构：

1. **榜单源决定观察池**：用主流榜单判断哪些图像 / 图像编辑模型进入观察范围。
2. **官方源确认事实**：用官网、博客、changelog、release notes、GitHub、Hugging Face、ModelScope、文档确认版本名、发布时间、入口和能力变化。
3. **创作工具 changelog 判断落地价值**：用 Lovart、Flowith、LibLibAI 等工具更新判断模型是否真正进入创作工作流。
4. **可靠聚合源补漏**：用 AIbase、AI Breakfast、Follow Builders、NewsNow 等补充发现线索。
5. **私有 OPML 扩展个人线索**：把信任的博主、社区、评测账号放入 `feeds/follow.opml`，但不要提交到仓库。

## 收录优先级

默认按下面顺序筛选和高亮：

1. **P0 Agent / Skill / workflow**：例如 `Anthropic`、`Claude Code`、`Claude Skills`、`OpenAI Skills`、`Flowith Canvas Cowork Skill`、`Cursor`、`Codex`、`OpenClaw`。
2. **P1 图像 / 图像编辑排行榜模型**：例如 `GPT Image 2`、`GPT Image 1.5`、`Nano Banana 2`、`Nano Banana Pro`、`Seedream 4.5`、`Qwen Image Max 2512`、`Qwen Image Edit Plus 2511`、`FLUX.2`、`HunyuanImage 3.0 Instruct`、`Imagen 4 Ultra`、`MAI-Image-2`。
3. **P2 AI 创作工具**：例如 `Lovart`、`Flowith`、`LibLibAI`、`Krea`、`Runway`、`ComfyUI`、`Figma AI`、`Canva AI`。
4. **P3 大语言模型**：只有当模型更新会影响创作流程、Agent 使用、自动化 workflow 或团队工作方式时才高亮。
5. **P4 AI 视频模型**：例如 `Seedance`、`Veo`、`Kling`、`Sora`、`Runway Gen`。

泛 AI 热点、融资新闻、榜单文章、口水战、宽泛行业动态默认降权，除非它们明确改变创作能力或团队工作流。

## 榜单源

榜单源用于决定图像 / 图像编辑模型观察池，不直接作为事实发布源。

优先参考：

- Artificial Analysis Text to Image Leaderboard
- Artificial Analysis Image Editing Leaderboard
- LMArena / Arena Text-to-Image

辅助参考：

- Magic Hour / KEAR AI 等榜单整理
- 可靠评测文章和模型对比文章

规则：

- 不在文档中写死“第几名”，因为榜单会变化。
- 榜单只回答“该看哪些模型”，不回答“新闻是否为真”。
- 进入图像 / 图像编辑模型观察池后，仍需官方源或可靠二手源确认。

## 官方源

官方源用于确认事实，是模型和工具新闻进入团队可读页面的主要依据。

优先保留和扩展：

- OpenAI News、OpenAI docs、OpenAI release notes
- Anthropic News、Claude Code / Claude Skills 相关文档
- Google DeepMind、Google AI Blog、Gemini release notes
- ByteDance Seed、Volcano Engine、ModelArk 文档
- Qwen 官方博客、Qwen GitHub、ModelScope、Hugging Face
- Black Forest Labs 官方博客、GitHub、Hugging Face
- Tencent Hunyuan 官方博客、GitHub、Hugging Face
- Microsoft AI 官方博客、Copilot / MAI release notes
- Hugging Face Blog
- GitHub AI & ML、GitHub Changelog

规则：

- 官方源有明确发布时间和版本名时，优先采用官方表述。
- 官方源没有 RSS 时，可以通过稳定页面或聚合源发现，再由人工确认。
- 不要把平台营销语直接当成结论，页面应提炼“对创作流程有什么影响”。

## 创作工具 changelog

创作工具 changelog 用于判断模型和能力是否真正落地到工作流。

优先关注：

- `Lovart`：模型接入、图像编辑、PSD / 矢量 / 品牌资产、Canvas、批量生成能力。
- `Flowith`：Canvas、Agent、Skill、workflow、多人协作、多模态创作链路。
- `LibLibAI`：图像 / 视频生成、模型库、风格库、创作工作室能力。

后续可扩展：

- `Krea`
- `Runway`
- `ComfyUI`
- `Figma AI`
- `Canva AI`

规则：

- 工具更新只要改变创作流程，就高于普通模型新闻。
- 只新增对团队成员有实际价值的工具，不为“新奇”而扩源。
- 如果工具没有稳定 changelog，先放入聚合源或私有 OPML 观察。

## 可靠聚合源

旧项目中的部分聚合源继续保留，但角色改为“补漏和发现”，不直接决定首页高优先级。

优先保留：

- **AIbase**：中文 AI 产品、模型、创作工具动态，适合发现国内模型和工具。
- **AI Breakfast**：英文高信号 AI 日报，适合补充国际模型和产品线索。
- **Follow Builders**：适合 Agent、builder、X 线索；本项目只读取公开生成 JSON，不复制其 X API 流程。
- **NewsNow**：广覆盖补漏。
- **Hugging Face Blog**：开源模型、社区模型和工具动态。

降权作为发现池：

- `TechURLs`
- `Buzzing`
- `Info Flow`
- `BestBlogs`
- `TopHub`
- `Zeli`

暂不默认启用：

- `AI今日热榜 / aihot.today`：旧项目保留 fetcher，但 GitHub Actions 可能遇到 Cloudflare `403 Forbidden`。
- RSSHub X：适合私有 OPML，不适合作为公共默认源。
- WeChat、Telegram、Bilibili、Zhihu、小红书、邮箱、cookies：需要登录态或维护成本高，默认不作为公共源。

## 私有 OPML 工作流

个人或团队私有来源用 `feeds/follow.opml` 管理，不提交到仓库。

适合放入私有 OPML：

- 你信任的 AI 博主
- 设计 / 创作工具观察者
- 模型评测账号
- 小众但高质量的 RSS 源

使用方式：

```bash
cp feeds/follow.example.opml feeds/follow.opml
.venv/bin/python scripts/update_news.py --output-dir data --window-hours 24 --rss-opml feeds/follow.opml
```

检查 `data/source-status.json` 中的 `failed_feeds`、`zero_item_feeds`、`skipped_feeds`、`replaced_feeds`。

GitHub Actions 中使用私有 OPML 时，只能放入 `FOLLOW_OPML_B64` Secret，不要提交真实 OPML。

## 新增内置源规则

只有当一个来源长期对团队成员有价值，才考虑内置到 `scripts/update_news.py`。

新增内置源前必须满足：

- 内容与 P0-P4 优先级明确相关。
- 有稳定 URL、RSS、API、JSON、GitHub release 或可解析页面。
- 提供发布时间，或至少有可靠排序信息。
- 不需要私有 cookies、登录态、浏览器自动化或密钥。
- 能在 GitHub Actions 中礼貌抓取，不容易被封禁。
- 能补充现有来源覆盖，而不是重复制造噪声。

新增方式：

1. 在 `scripts/update_news.py` 添加 `fetch_<source_name>(session, now)`。
2. 返回 `RawItem`，字段包含 `site_id`、`site_name`、`source`、`title`、`url`、`published_at`、`meta`。
3. 在 `collect_all()` 的任务表注册。
4. 复用现有 URL、日期、标题清洗工具。
5. 更新本文件。
6. 增加或更新测试。

## 验证命令

改来源、fetcher、筛选逻辑后至少运行：

```bash
.venv/bin/python -m py_compile scripts/update_news.py
.venv/bin/python -m pytest -q
```

只改文档时，至少检查 git diff 和 lints。

## 部署约束

当前部署仍保持 GitHub Pages + GitHub Actions：

- GitHub Actions 更新 `data/*.json`。
- GitHub Pages 提供 `index.html` 和 `assets/*`。
- 私有 OPML 只放在 `FOLLOW_OPML_B64`，不进入仓库。

不要为了接入来源而把密钥、token、cookies、邮箱、个人订阅源写进代码、文档或日志。
