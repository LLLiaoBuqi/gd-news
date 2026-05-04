# gd-news Agent 说明

## 项目定位

这个仓库是一个“个人起步、团队可读”的 AI 创作能力雷达。

第一阶段优先服务彦齐的日常信息扫描，但输出内容要让项目成员也能看懂。收录重点不是泛 AI 新闻，而是会影响 AI 创作流程、创作工具选择、Agent 工作流和团队近期实验方向的信息。

## 收录优先级

默认按下面顺序判断信息价值：

1. 最新 Agent、Skill、workflow、自动化能力资讯，例如 `Anthropic`、`Claude Code`、`Claude Skills`、`OpenAI Skills`、`Flowith Canvas Cowork Skill`、`Cursor`、`Codex`、`OpenClaw`。
2. 最新发布的图像 / 图像编辑模型，例如 `GPT Image 2`、`GPT Image 1.5`、`Nano Banana 2`、`Nano Banana Pro`、`Seedream 4.5`、`Qwen Image Max 2512`、`Qwen Image Edit Plus 2511`、`FLUX.2`。
3. 最新发布的 AI 创作工具，以及已有 AI 创作工具的重要功能更新，例如 `Lovart`、`Flowith`、`LibLibAI`、`Krea`、`Runway`、`ComfyUI`。
4. 最新发布的大语言模型，例如 `GPT-5`、`Claude 4.5`、`Gemini 3`、`Qwen3`；但只有当它明显影响创作流程、Agent 使用或团队工作方式时才高亮。
5. 最新发布的 AI 视频模型，例如 `Seedance`、`Veo`、`Kling`、`Sora`、`Runway Gen`。

不要把泛 AI 热点、融资新闻、榜单、口水战或宽泛行业动态默认当成高优先级，除非它明确影响 AI 创作能力或团队工作流。

## 来源策略

优先使用官方来源：产品官网、模型页面、官方博客、changelog、GitHub release、文档和 release notes。

高质量二手来源可以用于发现线索和补充上下文，包括可靠媒体、社区整理和可信的一手发布帖。未经验证的传闻不要当事实展示给项目成员。

新增或移除信息源前，先阅读 `docs/SOURCE_COVERAGE.md`。

## 工作规则

- 保持改动小而可审查。
- 改 fetcher、评分逻辑、输出 schema 或页面默认展示前，先搜索现有实现。
- 私有信息源只放本地或密钥系统，不进 git。
- 不要提交 `feeds/follow.opml`、`.env`、token、cookie、API key、个人邮箱或个人订阅源。
- 新增信息源时，要说明它为什么符合当前收录优先级。
- 新增分类时，要确保它对项目成员有用，而不只是个人临时兴趣。

## 常用命令

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
.venv/bin/python -m py_compile scripts/update_news.py
.venv/bin/python -m pytest -q
.venv/bin/python scripts/update_news.py --output-dir data --window-hours 24 --rss-opml feeds/follow.opml
.venv/bin/python -m http.server 8080
```

Agent 工作流请阅读 `skills/ai-news-radar/SKILL.md`。
