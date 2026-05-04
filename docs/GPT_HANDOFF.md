# GPT 交接说明：gd-news AI 创作能力雷达

这个文档用于把项目交给新的 GPT / Codex / Claude / Cursor Agent 会话。

## 本地项目

- 本地路径：`/Users/gaoding/gd-news`
- GitHub 仓库：`https://github.com/lsk18059805307-sketch/gd-news.git`
- 本地预览：`http://127.0.0.1:8080/`

本地预览命令：

```bash
cd /Users/gaoding/gd-news
.venv/bin/python -m http.server 8080
```

## 项目定位

`gd-news` 正在从旧版 AI News Radar 改造成“个人起步、团队可读”的 AI 创作能力雷达。

它的目标不是覆盖所有 AI 新闻，而是帮助彦齐和项目成员快速发现会影响创作流程、创作工具选择、Agent 工作流和近期团队实验方向的信息。

默认优先级：

1. Agent、Skill、workflow、自动化能力资讯。
2. 图像 / 图像编辑排行榜模型。
3. AI 创作工具和重要功能更新。
4. 对创作或 Agent 工作流有影响的大语言模型。
5. AI 视频模型。

## 当前已完成的改造

项目规则：

- 新增 `.cursor/rules/project.mdc`，定义红线、改前必读和改后必跑。
- 重写 `AGENTS.md`，把 Agent 说明改成中文，并明确 AI 创作能力雷达的收录优先级。
- 重写 `CLAUDE.md`，同步新的项目定位和来源边界。

来源策略：

- 重写 `docs/SOURCE_COVERAGE.md`。
- 来源结构改为五层：
  - 榜单源决定观察池。
  - 官方源确认事实。
  - 创作工具 changelog 判断落地价值。
  - 可靠聚合源补漏。
  - 私有 OPML 扩展个人线索。

尚未完成：

- `scripts/update_news.py` 里的筛选逻辑仍主要沿用旧项目。
- `README.md` 仍有较多旧项目文案。
- 前端 `index.html`、`assets/app.js`、`assets/styles.css` 仍是旧版 AI Signal Board 展示结构。
- `skills/ai-news-radar/SKILL.md` 仍需要后续改成创作能力雷达 Skill。

## 关键文件

- `AGENTS.md`：Agent 工作纪律和项目定位。
- `.cursor/rules/project.mdc`：Cursor 持久规则。
- `CLAUDE.md`：Claude / Claude Code 入口说明。
- `docs/SOURCE_COVERAGE.md`：来源策略，是后续接源和改筛选的依据。
- `scripts/update_news.py`：抓取、过滤、排序、写入数据的核心脚本。
- `assets/app.js`：前端读取 `data/*.json` 并渲染页面。
- `.github/workflows/update-news.yml`：定时更新数据的 GitHub Actions。

## 后续建议顺序

1. 完成文档层改造：`README.md`、`skills/ai-news-radar/SKILL.md`、`docs/V2_PRODUCT_BRIEF.md`。
2. 为创作能力雷达补测试：优先改 `tests/test_topic_filter.py`。
3. 调整 `scripts/update_news.py` 里的关键词、源权重和 `is_ai_related_record()`。
4. 调整前端文案和来源标签：`index.html`、`assets/app.js`、`assets/styles.css`。
5. 本地跑验证后再考虑改 GitHub Actions 或 JSON schema。

## 验证命令

```bash
.venv/bin/python -m py_compile scripts/update_news.py
.venv/bin/python -m pytest -q
git diff --check
```

如果 `.venv` 不存在：

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install pytest
```

## 安全边界

不要提交：

- `feeds/follow.opml`
- `.env`
- token、API key、cookie
- 个人邮箱
- 个人订阅源
- 浏览器导出内容

不要贸然修改：

- `.github/workflows/update-news.yml`
- `data/*.json` schema
- `scripts/update_news.py` 的输出字段合约

## 给新 Agent 的建议提示词

```text
你现在接手本地项目：
/Users/gaoding/gd-news

这是一个从 AI News Radar fork 出来的项目，正在改造成“个人起步、团队可读”的 AI 创作能力雷达。

请先阅读：
AGENTS.md
.cursor/rules/project.mdc
CLAUDE.md
docs/GPT_HANDOFF.md
docs/SOURCE_COVERAGE.md
skills/ai-news-radar/SKILL.md

任务：
1. 不要直接重构。
2. 先判断当前文档、来源策略、抓取逻辑和前端展示还有哪些旧项目残留。
3. 按严重程度列出下一步应该改的文件。
4. 严禁提交私有 OPML、密钥、cookie、邮箱或个人订阅源。
```
