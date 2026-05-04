---
name: ai-news-radar
description: "Use when working on the gd-news AI creation radar repo: evaluating AI news sources, RSS/OPML/GitHub feed/X/newsletter coverage, changing source strategy or UI defaults, configuring Actions secrets, deploying Pages, or packaging/forking the project as an agent skill."
---

# gd-news AI 创作能力雷达

## First Reads

When this skill triggers inside the repo, read these files first:

- `README.md` for project usage and current commands.
- `docs/GPT_HANDOFF.md` before release-readiness checks or handing the project
  to another agent.
- `docs/SOURCE_COVERAGE.md` before changing source strategy.
- `docs/V2_PRODUCT_BRIEF.md` before changing product positioning or first-screen UX.
- `scripts/update_news.py` before changing data generation.
- `assets/app.js`, `assets/styles.css`, and `index.html` before changing the UI.
- `references/source-intake.md` when the user provides a new site, GitHub repo,
  RSS feed, newsletter, X source, or asks whether a source can be ingested.
- `references/v2-method.md` when the user asks for product optimization, source
  coverage strategy, Skill packaging, or "v2" direction.

## V2 Workflow

Use this order for non-trivial product or source-strategy work:

1. **Context pass**: read the current docs, source status, recent commits, and
   the smallest relevant code surface before proposing changes.
2. **Product diagnostic**: identify the user, current workaround, signal-density
   problem, narrowest useful default, and what must stay in the advanced layer.
3. **Coverage pass**: classify each requested source as official feed, OPML,
   public GitHub-generated feed, public archive, static page, X bridge, optional
   API adapter, or private inbox/bridge.
4. **Alternatives pass**: when the choice is not obvious, present 2-3 approaches:
   minimal viable, durable architecture, and optional creative/packaged variant.
5. **Implementation pass**: make small diffs, reuse existing fetcher/UI patterns,
   add tests for behavior changes, and run the fastest relevant validation.

For detailed prompts and decision criteria, read `references/v2-method.md`.

## Product Direction

Maintain a two-layer product:

- **Default layer**: a simple curated Signal view for Yanqi and project members.
- **Advanced layer**: custom OPML, source health, GitHub Actions, and maintainer controls.

Default display priority:

1. Agent / Skill / workflow updates.
2. Image / image-editing model updates.
3. AI creation tool updates.
4. LLM updates that affect creation workflows, Agent use, or team work.
5. AI video model updates.

Avoid adding many reader-facing choices. Prefer better defaults, source quality,
and clearer status output. Keep the old source intake and classification
capabilities, but tune default ranking and presentation toward the priority list
above.

The v2 packaging goal is a forkable public site plus a reusable agent Skill.
Project members should be able to browse the hosted page. Maintainers should be
able to add their own sources with OPML, public generated feeds, or secret-backed
optional adapters without changing the public default.

## Safety Rules

- Never commit private `feeds/follow.opml`.
- Never paste secrets, tokens, cookies, browser exports, or `.env` values into code or logs.
- Keep the public repo runnable without API keys.
- Prefer official RSS/Atom/OPML sources over fragile scraping.
- Avoid account-bound social timelines as defaults.
- Prefer reading public generated feeds over reimplementing another project's
  API or scraping pipeline.
- Treat X API, email, WeChat, private newsletters, and cookies as optional
  advanced integrations. Store credentials only in environment variables or
  GitHub Secrets.

## Add Personal Sources

Use OPML for private customization:

```bash
cp feeds/follow.example.opml feeds/follow.opml
python scripts/update_news.py --output-dir data --window-hours 24 --rss-opml feeds/follow.opml
```

For GitHub Actions deployment, base64 encode `feeds/follow.opml` and save it as
the repository secret `FOLLOW_OPML_B64`. Do not commit the private OPML file.

## Evaluate A New Source

When a user gives a source URL, first classify it:

- RSS/Atom/OPML: add privately through `feeds/follow.opml` unless it should help
  every public visitor.
- GitHub project with generated feeds: inspect README, workflows, output files,
  and raw JSON/RSS URLs; prefer consuming its public feed files.
- Official changelog or static page: add a focused fetcher only if stable.
- Newsletter: prefer public archive RSS or archive pages; never require private
  mailbox access for the public default.
- X/Twitter: prefer curated central feeds that already use official X API; direct
  X API should be optional and secret-backed.

For detailed intake checks and implementation patterns, read
`references/source-intake.md`.

## Add A Built-In Source

Only add a built-in source when it is useful to most public visitors.

1. Inspect existing fetchers in `scripts/update_news.py`.
2. Add `fetch_<source>(session, now)` returning `list[RawItem]`.
3. Use existing helpers for URL normalization, date parsing, and sessions.
4. Register the fetcher in the built-in task list.
5. Update `docs/SOURCE_COVERAGE.md` when coverage changes.
6. Add or update tests when behavior changes.
7. Run a local source-only probe before the full end-to-end generation.

## GitHub Project Feed Pattern

For repos like `follow-builders`, look for public files such as:

- `feed.json`, `feed-x.json`, `feed-blogs.json`, `latest.json`
- `state*.json` for dedupe behavior
- `.github/workflows/*.yml` for schedules, secrets, and output commit paths
- `config/*.json` for source lists

If the generated feed is public, stable, timestamped, and low-noise, add a
built-in fetcher that reads the raw GitHub URL. Do not copy its private tokens
or rebuild its crawler unless the user explicitly wants a self-hosted variant.

## Validate

Run the fastest relevant checks:

```bash
python -m py_compile scripts/update_news.py
pytest -q
```

When the Skill itself changes, validate the Skill package too:

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" skills/ai-news-radar
```

For an end-to-end local run:

```bash
python scripts/update_news.py --output-dir data --window-hours 24 --rss-opml feeds/follow.opml
python -m http.server 8080
```

Open `http://localhost:8080` and confirm the Signal view, all-source view,
WaytoAGI block, search, site filter, and source counts still work.

After pushing source changes, trigger and watch the workflow:

```bash
gh workflow run update-news.yml --repo lsk18059805307-sketch/gd-news --ref master
gh run list --repo lsk18059805307-sketch/gd-news --limit 5
```
