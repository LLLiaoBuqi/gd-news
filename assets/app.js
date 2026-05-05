const AI_LIST_INITIAL_LIMIT = 30;
const AI_SEARCH_CANDIDATE_LIMIT = 120;
const AI_CONFIG_STORAGE_KEY = "gdNewsAiAssistantConfig";
const DEFAULT_AI_CONFIG = {
  provider: "glm",
  apiKey: "",
  baseUrl: "https://open.bigmodel.cn/api/paas/v4/",
  model: "glm-4-flash-250414",
};

const GLM_MODEL_ALIASES = {
  "glm-4-flash": "glm-4-flash-250414",
};

const AI_QUERY_SYNONYMS = {
  nano: [
    "nano",
    "nano banana",
    "nano-banana",
    "nanobanana",
    "banana",
    "gemini image",
    "gemini 图片",
    "gemini 图像",
    "image model",
    "image editing",
    "图像模型",
    "图像编辑",
  ],
  "nano banana": ["nano", "nano banana", "nano-banana", "nanobanana", "banana"],
  agent: ["agent", "agents", "ai agent", "workflow", "automation", "自动化", "工作流", "智能体"],
  skill: ["skill", "skills", "claude skill", "openai skill", "技能", "工作流"],
  workflow: ["workflow", "workflows", "agent", "automation", "工作流", "自动化"],
  cursor: ["cursor", "claude code", "codex", "ide", "ai coding", "代码助手"],
  codex: ["codex", "cursor", "claude code", "ai coding", "代码生成"],
  claude: ["claude", "anthropic", "claude code", "claude skill"],
  image: ["image", "images", "image model", "image editing", "图像", "图片", "图像编辑"],
  video: ["video", "videos", "sora", "veo", "runway", "kling", "seedance", "视频"],
};

const AI_QUERY_STOPWORDS = [
  "帮我",
  "给我",
  "请",
  "搜索",
  "筛选",
  "挑选",
  "精选",
  "推荐",
  "找",
  "看看",
  "看",
  "十条",
  "10条",
  "十个",
  "10个",
  "最值得",
  "值得",
  "相关",
  "有关",
  "内容",
  "资讯",
  "新闻",
  "更新",
  "今天",
  "最新",
  "一下",
  "的",
  "和",
  "跟",
  "与",
];

const state = {
  itemsAi: [],
  itemsAll: [],
  itemsAllRaw: [],
  statsAi: [],
  totalAi: 0,
  totalRaw: 0,
  totalAllMode: 0,
  allDedup: true,
  allDataLoaded: false,
  allDataUrl: "data/latest-24h-all.json",
  allDataPromise: null,
  siteFilter: "",
  query: "",
  searchMode: "normal",
  aiSearchRunning: false,
  aiCuratedResults: null,
  aiSearchError: "",
  aiSearchRunId: 0,
  mode: "ai",
  waytoagiMode: "today",
  waytoagiData: null,
  sourceStatus: null,
  generatedAt: null,
  aiListExpanded: false,
};

function resetAiListExpansion() {
  state.aiListExpanded = false;
}

const statsEl = document.getElementById("stats");
const siteSelectEl = document.getElementById("siteSelect");
const sitePillsEl = document.getElementById("sitePills");
const newsListEl = document.getElementById("newsList");
const updatedAtEl = document.getElementById("updatedAt");
const searchInputEl = document.getElementById("searchInput");
const searchNormalBtnEl = document.getElementById("searchNormalBtn");
const searchAiBtnEl = document.getElementById("searchAiBtn");
const aiSearchSubmitEl = document.getElementById("aiSearchSubmit");
const aiSettingsBtnEl = document.getElementById("aiSettingsBtn");
const aiSettingsModalEl = document.getElementById("aiSettingsModal");
const aiSettingsCloseEl = document.getElementById("aiSettingsClose");
const aiProviderSelectEl = document.getElementById("aiProviderSelect");
const aiApiKeyInputEl = document.getElementById("aiApiKeyInput");
const aiBaseUrlInputEl = document.getElementById("aiBaseUrlInput");
const aiModelInputEl = document.getElementById("aiModelInput");
const aiSettingsStatusEl = document.getElementById("aiSettingsStatus");
const aiSettingsSaveEl = document.getElementById("aiSettingsSave");
const aiSettingsTestEl = document.getElementById("aiSettingsTest");
const resultCountEl = document.getElementById("resultCount");
const listTitleEl = document.getElementById("listTitle");
const listWrapEl = document.querySelector(".list-wrap");
const waytoagiWrapEl = document.querySelector(".waytoagi-wrap");
const itemTpl = document.getElementById("itemTpl");
const modeAiBtnEl = document.getElementById("modeAiBtn");
const modeAllBtnEl = document.getElementById("modeAllBtn");
const modeHintEl = document.getElementById("modeHint");
const allDedupeWrapEl = document.getElementById("allDedupeWrap");
const allDedupeToggleEl = document.getElementById("allDedupeToggle");
const allDedupeLabelEl = document.getElementById("allDedupeLabel");
const advancedSummaryEl = document.getElementById("advancedSummary");
const sourceHealthEl = document.getElementById("sourceHealth");

const waytoagiUpdatedAtEl = document.getElementById("waytoagiUpdatedAt");
const waytoagiMetaEl = document.getElementById("waytoagiMeta");
const waytoagiListEl = document.getElementById("waytoagiList");
const waytoagiTodayBtnEl = document.getElementById("waytoagiTodayBtn");
const waytoagi7dBtnEl = document.getElementById("waytoagi7dBtn");
const coverageStripEl = document.getElementById("coverageStrip");

function parseTypedTitleTexts(el) {
  if (!el?.dataset?.texts) return [el?.textContent || ""].filter(Boolean);
  try {
    const parsed = JSON.parse(el.dataset.texts);
    return (Array.isArray(parsed) ? parsed : [parsed]).map(String).filter(Boolean);
  } catch {
    return [el.textContent || ""].filter(Boolean);
  }
}

function initHeroTitleType() {
  const textEl = document.getElementById("heroTypedTitle");
  if (!textEl) return;

  const texts = parseTypedTitleTexts(textEl);
  if (!texts.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    textEl.textContent = texts[0];
    return;
  }

  const typingSpeed = 72;
  const deletingSpeed = 34;
  const initialDelay = 420;
  const pauseDuration = 1500;
  const variableSpeed = { min: 48, max: 108 };
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeoutId;

  const getTypingDelay = () => (
    Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min || typingSpeed
  );

  const tick = () => {
    const currentText = texts[textIndex];

    if (isDeleting) {
      if (charIndex > 0) {
        charIndex -= 1;
        textEl.textContent = currentText.slice(0, charIndex);
        timeoutId = window.setTimeout(tick, deletingSpeed);
        return;
      }

      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      timeoutId = window.setTimeout(tick, 240);
      return;
    }

    if (charIndex < currentText.length) {
      charIndex += 1;
      textEl.textContent = currentText.slice(0, charIndex);
      timeoutId = window.setTimeout(tick, getTypingDelay());
      return;
    }

    timeoutId = window.setTimeout(() => {
      isDeleting = true;
      tick();
    }, pauseDuration);
  };

  textEl.textContent = "";
  timeoutId = window.setTimeout(tick, initialDelay);
  window.addEventListener("pagehide", () => window.clearTimeout(timeoutId), { once: true });
}

const SOURCE_KINDS = {
  official_ai: { label: "官方", tone: "official" },
  aibreakfast: { label: "日报", tone: "newsletter" },
  followbuilders: { label: "Builders/X", tone: "builders" },
  techurls: { label: "聚合", tone: "aggregate" },
  buzzing: { label: "聚合", tone: "aggregate" },
  iris: { label: "聚合", tone: "aggregate" },
  bestblogs: { label: "博客", tone: "blogs" },
  tophub: { label: "聚合", tone: "aggregate" },
  zeli: { label: "聚合", tone: "aggregate" },
  aihubtoday: { label: "AI站点", tone: "aihub" },
  aibase: { label: "AI站点", tone: "aihub" },
  newsnow: { label: "聚合", tone: "aggregate" },
};

function fmtNumber(n) {
  return new Intl.NumberFormat("zh-CN").format(n || 0);
}

function fmtTime(iso) {
  if (!iso) return "时间未知";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "时间未知";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function fmtDate(iso) {
  if (!iso) return "未知日期";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function setStats(payload) {
  const cards = [
    ["Agent 优先", fmtNumber(payload.total_items)],
    ["站点数", fmtNumber(payload.site_count)],
    ["来源分组", fmtNumber(payload.source_count)],
    ["归档", fmtNumber(payload.archive_total || 0)]
  ];

  statsEl.innerHTML = "";
  cards.forEach(([k, v]) => {
    const node = document.createElement("div");
    node.className = "stat";
    node.innerHTML = `<div class="k">${k}</div><div class="v">${v}</div>`;
    statsEl.appendChild(node);
  });
}

function sourceKind(siteId) {
  return SOURCE_KINDS[siteId] || { label: "来源", tone: "default" };
}

function siteRows() {
  return Array.isArray(state.sourceStatus?.sites) ? state.sourceStatus.sites : [];
}

function siteRow(siteId) {
  return siteRows().find((site) => site.site_id === siteId) || null;
}

function renderCoverageCard(label, value, meta, tone = "") {
  const node = document.createElement("div");
  node.className = `coverage-card ${tone}`.trim();
  const labelEl = document.createElement("span");
  labelEl.className = "coverage-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("strong");
  valueEl.textContent = value;
  const metaEl = document.createElement("span");
  metaEl.className = "coverage-meta";
  metaEl.textContent = meta;
  node.append(labelEl, valueEl, metaEl);
  return node;
}

function renderCoverageStrip(errorMessage = "") {
  if (!coverageStripEl) return;
  coverageStripEl.innerHTML = "";

  const rows = siteRows();
  const failedSites = Array.isArray(state.sourceStatus?.failed_sites) ? state.sourceStatus.failed_sites : [];
  const rss = state.sourceStatus?.rss_opml || {};
  const allCount = Number(state.sourceStatus?.items_before_topic_filter || state.totalAllMode || state.itemsAll.length || 0);
  const coverageCount = Number(state.sourceStatus?.fetched_raw_items || state.totalRaw || allCount || 0);
  const officialCount = Number(siteRow("official_ai")?.item_count || 0);
  const newsletterCount = Number(siteRow("aibreakfast")?.item_count || 0);
  const buildersCount = Number(siteRow("followbuilders")?.item_count || 0);
  const totalSites = rows.length;
  const okSites = Number(state.sourceStatus?.successful_sites || 0);
  const opmlValue = rss.enabled ? `${fmtNumber(rss.ok_feeds || 0)}/${fmtNumber(rss.effective_feed_total || 0)}` : "OPML";
  const opmlMeta = rss.enabled ? "私有订阅已接入" : "可用 Secret 接入私有源";

  const cards = [
    ["源健康", totalSites ? `${fmtNumber(okSites)}/${fmtNumber(totalSites)}` : "加载中", failedSites.length ? `${fmtNumber(failedSites.length)} 个失败源` : (errorMessage || "内置源正常"), failedSites.length ? "warn" : "ok"],
    ["今日覆盖池", `${fmtNumber(coverageCount)} 条`, allCount ? `全网抓取原始信号 · ${fmtNumber(allCount)} 条入池` : "全网抓取原始信号", "signal"],
    ["Agent 优先", `${fmtNumber(state.totalAi)} 条`, "24小时创作能力信号", "signal"],
    ["官方/日报源池", `${fmtNumber(officialCount + newsletterCount)} 条`, "官方节点 + AI Breakfast", "official"],
    ["Builders/X源池", `${fmtNumber(buildersCount)} 条`, "Follow Builders公开feed", "builders"],
    ["私人扩展", opmlValue, opmlMeta, "private"],
  ];

  cards.forEach(([label, value, meta, tone]) => {
    coverageStripEl.appendChild(renderCoverageCard(label, value, meta, tone));
  });
}

function renderAdvancedSummary() {
  if (!advancedSummaryEl) return;
  const status = state.sourceStatus;
  const allCount = state.allDedup
    ? (state.totalAllMode || state.itemsAll.length)
    : (state.totalRaw || state.itemsAllRaw.length);
  if (!status) {
    advancedSummaryEl.textContent = `全量 ${fmtNumber(allCount)} 条`;
    return;
  }
  const sites = Array.isArray(status.sites) ? status.sites : [];
  const totalSites = sites.length;
  const okSites = Number(status.successful_sites || 0);
  advancedSummaryEl.textContent = `${fmtNumber(okSites)}/${fmtNumber(totalSites)} 源可用 · 全量 ${fmtNumber(allCount)} 条`;
}

function computeSiteStats(items) {
  const m = new Map();
  items.forEach((item) => {
    if (!m.has(item.site_id)) {
      m.set(item.site_id, { site_id: item.site_id, site_name: item.site_name, count: 0, raw_count: 0 });
    }
    const row = m.get(item.site_id);
    row.count += 1;
    row.raw_count += 1;
  });
  return Array.from(m.values()).sort((a, b) => b.count - a.count || a.site_name.localeCompare(b.site_name, "zh-CN"));
}

function currentSiteStats() {
  if (state.mode === "ai") return state.statsAi || [];
  return computeSiteStats(state.allDedup ? (state.itemsAll || []) : (state.itemsAllRaw || []));
}

function renderSiteFilters() {
  const stats = currentSiteStats();

  siteSelectEl.innerHTML = '<option value="">全部站点</option>';
  stats.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.site_id;
    const raw = s.raw_count ?? s.count;
    opt.textContent = `${s.site_name} (${s.count}/${raw})`;
    siteSelectEl.appendChild(opt);
  });
  siteSelectEl.value = state.siteFilter;

  sitePillsEl.innerHTML = "";
  const allPill = document.createElement("button");
  allPill.className = `pill ${state.siteFilter === "" ? "active" : ""}`;
  allPill.textContent = "全部";
  allPill.onclick = () => {
    handleSiteFilterChange("");
  };
  sitePillsEl.appendChild(allPill);

  stats.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = `pill ${state.siteFilter === s.site_id ? "active" : ""}`;
    const raw = s.raw_count ?? s.count;
    btn.textContent = `${s.site_name} ${s.count}/${raw}`;
    btn.onclick = () => {
      handleSiteFilterChange(s.site_id);
    };
    sitePillsEl.appendChild(btn);
  });
}

function renderModeSwitch() {
  modeAiBtnEl.classList.toggle("active", state.mode === "ai");
  modeAllBtnEl.classList.toggle("active", state.mode === "all");
  if (allDedupeWrapEl) allDedupeWrapEl.classList.remove("show");
  if (allDedupeToggleEl) allDedupeToggleEl.checked = state.allDedup;
  if (allDedupeLabelEl) allDedupeLabelEl.textContent = state.allDedup ? "去重开" : "去重关";
  if (state.mode === "ai") {
    modeHintEl.textContent = `Agent 优先 · ${fmtNumber(state.totalAi)} 条`;
    if (listTitleEl && !state.aiCuratedResults) listTitleEl.textContent = "Agent 重点更新";
  } else {
    const allCount = state.allDedup
      ? (state.totalAllMode || state.itemsAll.length)
      : (state.totalRaw || state.itemsAllRaw.length);
    modeHintEl.textContent = `全量 · ${fmtNumber(allCount)} 条`;
    if (listTitleEl && !state.aiCuratedResults) listTitleEl.textContent = "全部 AI 更新";
  }
  renderAdvancedSummary();
}

function handleSiteFilterChange(siteId) {
  state.siteFilter = siteId;
  resetAiListExpansion();
  renderSiteFilters();
  renderModeSwitch();

  if (state.searchMode === "ai") {
    if (state.query.trim()) {
      runAiCuratedSearch();
      return;
    }
    renderList();
    return;
  }

  clearAiSearchResults();
  renderList();
}

function scrollToResults() {
  if (!listWrapEl) return;
  listWrapEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToWaytoagi() {
  if (!waytoagiWrapEl) return;
  waytoagiWrapEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSearchMode() {
  const isAiSearch = state.searchMode === "ai";
  searchNormalBtnEl?.classList.toggle("active", !isAiSearch);
  searchAiBtnEl?.classList.toggle("active", isAiSearch);
  aiSearchSubmitEl?.classList.toggle("show", isAiSearch);
  if (aiSearchSubmitEl) aiSearchSubmitEl.disabled = state.aiSearchRunning;
  if (searchInputEl) {
    searchInputEl.placeholder = isAiSearch
      ? "只筛选当前数据池，例如：nano / Agent 工作流 / 今天最值得看"
      : "搜索 Agent / Skill / 模型 / 工具 / 来源";
  }
}

function setSearchMode(mode) {
  if (state.searchMode === mode) return;
  state.searchMode = mode;
  state.query = "";
  clearAiSearchResults();
  resetAiListExpansion();
  if (searchInputEl) searchInputEl.value = "";
  renderModeSwitch();
  renderList();
}

function clearAiSearchResults() {
  state.aiSearchRunId += 1;
  state.aiSearchRunning = false;
  state.aiCuratedResults = null;
  state.aiSearchError = "";
  renderSearchMode();
}

function isCurrentAiSearchRun(runId) {
  return state.searchMode === "ai" && state.aiSearchRunId === runId;
}

function loadAiConfig() {
  try {
    const raw = window.localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_CONFIG };
    const config = { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
    config.model = GLM_MODEL_ALIASES[config.model] || config.model;
    return config;
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
}

function saveAiConfig(config) {
  const normalized = {
    ...config,
    model: GLM_MODEL_ALIASES[config.model] || config.model,
  };
  window.localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
}

function readAiSettingsForm() {
  return {
    provider: aiProviderSelectEl?.value || DEFAULT_AI_CONFIG.provider,
    apiKey: aiApiKeyInputEl?.value.trim() || "",
    baseUrl: aiBaseUrlInputEl?.value.trim() || DEFAULT_AI_CONFIG.baseUrl,
    model: aiModelInputEl?.value.trim() || DEFAULT_AI_CONFIG.model,
  };
}

function fillAiSettingsForm(config = loadAiConfig()) {
  if (aiProviderSelectEl) aiProviderSelectEl.value = config.provider || DEFAULT_AI_CONFIG.provider;
  if (aiApiKeyInputEl) aiApiKeyInputEl.value = config.apiKey || "";
  if (aiBaseUrlInputEl) aiBaseUrlInputEl.value = config.baseUrl || DEFAULT_AI_CONFIG.baseUrl;
  if (aiModelInputEl) aiModelInputEl.value = config.model || DEFAULT_AI_CONFIG.model;
}

function setAiSettingsStatus(message, isError = false) {
  if (!aiSettingsStatusEl) return;
  aiSettingsStatusEl.textContent = message;
  aiSettingsStatusEl.style.color = isError ? "var(--bad)" : "var(--muted)";
}

function openAiSettings(message = "") {
  fillAiSettingsForm();
  if (aiSettingsModalEl) aiSettingsModalEl.hidden = false;
  setAiSettingsStatus(message);
}

function closeAiSettings() {
  if (aiSettingsModalEl) aiSettingsModalEl.hidden = true;
}

function chatCompletionsUrl(baseUrl) {
  const trimmed = (baseUrl || DEFAULT_AI_CONFIG.baseUrl).replace(/\/+$/, "");
  return trimmed.endsWith("/chat/completions") ? trimmed : `${trimmed}/chat/completions`;
}

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const objectStart = raw.indexOf("{");
  const objectEnd = raw.lastIndexOf("}");
  const objectSlice = objectStart >= 0 && objectEnd > objectStart
    ? raw.slice(objectStart, objectEnd + 1)
    : "";
  const candidates = [raw, fenced, objectSlice]
    .map((candidate) => String(candidate || "").trim())
    .filter(Boolean);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`AI 已返回内容，但不是合法 JSON：${lastError?.message || "解析失败"}`);
}

async function callGlmChat(config, messages, options = {}) {
  if (!config.apiKey) {
    throw new Error("请先在 AI 设置里填写 API Key。");
  }

  const res = await fetch(chatCompletionsUrl(config.baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.25,
      stream: false,
      response_format: options.responseFormat || { type: "text" },
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      ...(options.tools ? { tools: options.tools } : {}),
      ...(options.toolChoice ? { tool_choice: options.toolChoice } : {}),
    }),
  });

  let payload = {};
  try {
    payload = await res.json();
  } catch {
    payload = {};
  }

  if (!res.ok) {
    const message = payload?.error?.message || payload?.message || `GLM 接口返回 ${res.status}`;
    throw new Error(message);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("GLM 没有返回内容。");
  return String(content);
}

function normalizeAiSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueValues(values) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}

function stripAiQueryStopwords(text) {
  let out = normalizeAiSearchText(text);
  AI_QUERY_STOPWORDS
    .sort((a, b) => b.length - a.length)
    .forEach((word) => {
      out = out.replaceAll(word, " ");
    });
  return out.replace(/\s+/g, " ").trim();
}

function buildAiQueryTerms(query) {
  const normalized = normalizeAiSearchText(query);
  const semanticText = stripAiQueryStopwords(normalized);
  const latinTerms = semanticText.match(/[a-z0-9][a-z0-9.+_-]*/g) || [];
  const cjkTerms = (semanticText.match(/[\u4e00-\u9fa5]{2,}/g) || [])
    .map((term) => stripAiQueryStopwords(term))
    .filter((term) => term.length >= 2);

  const baseTerms = uniqueValues([...latinTerms, ...cjkTerms]);
  const expanded = [...baseTerms];
  baseTerms.forEach((term) => {
    const aliases = AI_QUERY_SYNONYMS[term] || [];
    expanded.push(...aliases);
  });

  Object.entries(AI_QUERY_SYNONYMS).forEach(([key, aliases]) => {
    if (normalized.includes(key)) expanded.push(...aliases);
  });

  return uniqueValues(expanded.map(normalizeAiSearchText));
}

function scoreAiSearchItem(item, terms) {
  if (!terms.length) return 1;
  const titleText = normalizeAiSearchText([item.title, item.title_zh, item.title_en, item.title_bilingual].join(" "));
  const summaryText = normalizeAiSearchText(item.summary);
  const metaText = normalizeAiSearchText([item.source, item.site_name, item.site_id].join(" "));
  const haystack = `${titleText} ${summaryText} ${metaText}`;
  let score = 0;

  terms.forEach((term) => {
    if (!term) return;
    if (titleText.includes(term)) score += term.length > 4 ? 14 : 9;
    if (summaryText.includes(term)) score += term.length > 4 ? 8 : 5;
    if (metaText.includes(term)) score += 3;
    if (haystack.includes(term)) score += 1;
  });

  return score;
}

function aiSearchTimestamp(item) {
  const ts = Date.parse(item.published_at || item.first_seen_at || "");
  return Number.isNaN(ts) ? 0 : ts;
}

function buildAiCandidatePayload(item, index, score) {
  return {
    id: item.id || `${item.site_id || "site"}-${index}`,
    rank: index + 1,
    relevance_score: score,
    title: item.title || item.title_zh || item.title_en || "",
    title_zh: item.title_zh || "",
    title_en: item.title_en || "",
    summary: item.summary || "",
    url: item.url || "",
    source: item.source || "",
    site_name: item.site_name || "",
    site_id: item.site_id || "",
    published_at: item.published_at || item.first_seen_at || "",
  };
}

function buildAiSearchRecall(query) {
  const terms = buildAiQueryTerms(query);
  const baseItems = modeItems()
    .filter((item) => !state.siteFilter || item.site_id === state.siteFilter)
    .filter((item) => (item.title || item.title_zh || item.title_en) && item.url);

  const scored = baseItems
    .map((item) => ({ item, score: scoreAiSearchItem(item, terms) }))
    .filter(({ score }) => !terms.length || score > 0)
    .sort((a, b) => b.score - a.score || aiSearchTimestamp(b.item) - aiSearchTimestamp(a.item));

  const candidates = scored
    .slice(0, AI_SEARCH_CANDIDATE_LIMIT)
    .map(({ item, score }, index) => buildAiCandidatePayload(item, index, score));

  return {
    candidates,
    terms,
    totalMatches: scored.length,
    searchedItems: baseItems.length,
  };
}

function filterAiResultsToCandidates(results, candidates) {
  const candidateByUrl = new Map(candidates.map((item) => [item.url, item]));
  const seen = new Set();
  return results
    .filter((item) => item && candidateByUrl.has(item.url) && !seen.has(item.url))
    .map((item) => {
      seen.add(item.url);
      const original = candidateByUrl.get(item.url);
      return {
        title: item.title || original.title,
        summary: item.summary || original.summary || original.title,
        url: original.url,
        source: item.source || original.source || original.site_name,
        published_at: original.published_at,
        reason: item.reason || "匹配你的搜索意图，并且来自当前数据池。",
      };
    });
}

function buildAiSearchMessages(query, recall) {
  const { candidates, terms, totalMatches, searchedItems } = recall;
  const systemPrompt = [
    "你是 AI News 情报助手，为设计与 AI 产品团队筛选每日最值得阅读的信息。",
    "你的任务是理解用户 query，结合 expanded_terms 和 candidates，从当前 AI-News 数据池里挑出最值得看的新闻，并生成标题和摘要。",
    "团队偏好：优先 Agent、工作流、模型能力变化、AI 创作工具、开发者工具、官方发布、一手来源、可落地案例；弱化泛行业营销、重复转载、标题党和低信号融资新闻。",
    "不要做泛网页搜索，不要补充 candidates 之外的内容；只能基于候选标题、站内摘要、来源、时间和 URL 做判断。",
    "输出必须是 JSON，不要输出 Markdown。格式：{\"items\":[{\"title\":\"...\",\"summary\":\"...\",\"url\":\"...\",\"source\":\"...\",\"reason\":\"...\"}]}。",
    "必须返回一个可被 JSON.parse 直接解析的对象；所有字符串使用双引号，字符串内部不要出现未转义的英文双引号，不能使用尾逗号。",
    "禁止输出解释、前后缀、代码块或注释；items 必须是数组，每个字段必须是字符串。",
    "只能从 candidates 中选择，url 必须逐字复制 candidates 里的 url；如果候选和 query 不相关，就少返回或返回空数组，不要硬选。",
    "summary 用中文，2 到 3 句话，80 个中文字以内，说明这条为什么值得团队看。",
  ].join("\n");

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: JSON.stringify({
        request: query,
        expanded_terms: terms,
        recall: {
          matched_candidates: totalMatches,
          searched_items: searchedItems,
          passed_to_model: candidates.length,
        },
        instruction: "请基于 request 和 expanded_terms 选出最多十条最值得团队阅读的内容。每条必须保留原始 url。不要编造候选列表之外的文章。",
        candidates,
      }, null, 2),
    },
  ];
}

async function repairAiSearchJson(config, content, parseError) {
  const repaired = await callGlmChat(config, [
    {
      role: "system",
      content: [
        "你是 JSON 修复器。用户会给你一段模型输出和解析错误。",
        "只输出一个严格 JSON 对象，不要 Markdown，不要解释。",
        "目标 schema：{\"items\":[{\"title\":\"...\",\"summary\":\"...\",\"url\":\"...\",\"source\":\"...\",\"reason\":\"...\"}]}。",
        "如果某个字段缺失，用空字符串补齐；如果条目无法修复，就删除该条。",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify({
        parse_error: parseError,
        broken_output: String(content || "").slice(0, 12000),
      }, null, 2),
    },
  ], {
    temperature: 0,
    responseFormat: { type: "json_object" },
    maxTokens: 3000,
  });

  try {
    return extractJsonObject(repaired);
  } catch (err) {
    throw new Error(`AI 已收到模型响应，但返回格式不完整，自动修复也失败：${err.message}`);
  }
}

function effectiveAllItems() {
  return state.allDedup ? state.itemsAll : state.itemsAllRaw;
}

function modeItems() {
  return state.mode === "all" ? effectiveAllItems() : state.itemsAi;
}

function getFilteredItems() {
  const q = state.query.trim().toLowerCase();
  return modeItems().filter((item) => {
    if (state.siteFilter && item.site_id !== state.siteFilter) return false;
    if (!q) return true;
    const hay = `${item.title || ""} ${item.title_zh || ""} ${item.title_en || ""} ${item.site_name || ""} ${item.source || ""}`.toLowerCase();
    return hay.includes(q);
  });
}

function pickSummaryText(item) {
  const summary = (item.summary || "").trim();
  if (summary) return summary;
  const zh = (item.title_zh || "").trim();
  const en = (item.title_en || "").trim();
  if (zh && en && zh !== en) return en;
  return "";
}

function renderItemNode(item, { hideSource = false } = {}) {
  const node = itemTpl.content.firstElementChild.cloneNode(true);

  const timeEl = node.querySelector(".time");
  timeEl.textContent = fmtTime(item.published_at || item.first_seen_at);

  const sourceEl = node.querySelector(".source");
  const dotEl = node.querySelector(".meta-dot");
  if (hideSource) {
    sourceEl.remove();
    if (dotEl) dotEl.remove();
  } else {
    sourceEl.textContent = item.source || "未分区";
  }

  const titleEl = node.querySelector(".title");
  const zh = (item.title_zh || "").trim();
  const en = (item.title_en || "").trim();
  titleEl.textContent = item.title || zh || en;
  titleEl.href = item.url;

  const summaryEl = node.querySelector(".summary");
  const summaryText = pickSummaryText(item);
  if (summaryText) {
    summaryEl.textContent = summaryText;
  } else {
    summaryEl.remove();
  }

  return node;
}

function renderCuratedItemNode(item) {
  const node = itemTpl.content.firstElementChild.cloneNode(true);
  node.classList.add("curated");

  const timeEl = node.querySelector(".time");
  if (timeEl) timeEl.textContent = fmtTime(item.published_at);
  const sourceEl = node.querySelector(".source");
  if (sourceEl) sourceEl.textContent = item.source || "AI 精准筛选";

  const titleEl = node.querySelector(".title");
  titleEl.textContent = item.title || "未命名更新";
  titleEl.href = item.url || "#";

  const summaryEl = node.querySelector(".summary");
  summaryEl.textContent = item.summary || item.reason || "AI 暂未生成摘要。";

  return node;
}

function renderAiSearchStatus(message, isError = false) {
  newsListEl.innerHTML = "";
  const div = document.createElement("div");
  div.className = `ai-search-status${isError ? " error" : ""}`;
  div.textContent = message;
  newsListEl.appendChild(div);
}

function renderAiCuratedResults() {
  const results = Array.isArray(state.aiCuratedResults) ? state.aiCuratedResults : [];
  if (listTitleEl) listTitleEl.textContent = "AI 精准筛选";
  resultCountEl.textContent = `${fmtNumber(results.length)} 条`;
  newsListEl.innerHTML = "";

  if (state.aiSearchError) {
    renderAiSearchStatus(state.aiSearchError, true);
    return;
  }

  if (state.aiSearchRunning) {
    renderAiSearchStatus("AI 正在当前数据池里召回候选、排序并生成摘要...");
    return;
  }

  if (!results.length) {
    renderAiSearchStatus("AI 精准筛选只检索当前数据池。输入主题或需求后点击“筛选新闻”。");
    return;
  }

  const frag = document.createDocumentFragment();
  results.slice(0, 10).forEach((item) => frag.appendChild(renderCuratedItemNode(item)));
  newsListEl.appendChild(frag);
}

function buildSourceGroupNode(source, items) {
  const section = document.createElement("section");
  section.className = "source-group";
  const header = document.createElement("header");
  header.className = "source-group-head";
  const title = document.createElement("h3");
  title.textContent = source;
  const count = document.createElement("span");
  count.textContent = `${fmtNumber(items.length)} 条`;
  const listEl = document.createElement("div");
  listEl.className = "source-group-list";
  header.append(title, count);
  section.append(header, listEl);
  items.forEach((item) => listEl.appendChild(renderItemNode(item, { hideSource: true })));
  return section;
}

function groupBySource(items) {
  const groupMap = new Map();
  items.forEach((item) => {
    const key = item.source || "未分区";
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key).push(item);
  });

  return Array.from(groupMap.entries()).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "zh-CN"));
}

function renderGroupedBySource(items) {
  const groups = groupBySource(items);
  const frag = document.createDocumentFragment();

  groups.forEach(([source, groupItems]) => {
    frag.appendChild(buildSourceGroupNode(source, groupItems));
  });

  newsListEl.appendChild(frag);
}

function renderGroupedBySiteAndSource(items) {
  const siteMap = new Map();
  items.forEach((item) => {
    if (!siteMap.has(item.site_id)) {
      siteMap.set(item.site_id, {
        siteName: item.site_name || item.site_id,
        items: [],
      });
    }
    siteMap.get(item.site_id).items.push(item);
  });

  const sites = Array.from(siteMap.entries()).sort((a, b) => {
    const byCount = b[1].items.length - a[1].items.length;
    if (byCount !== 0) return byCount;
    return a[1].siteName.localeCompare(b[1].siteName, "zh-CN");
  });

  const frag = document.createDocumentFragment();
  sites.forEach(([, site]) => {
    const siteSection = document.createElement("section");
    siteSection.className = "site-group";
    const header = document.createElement("header");
    header.className = "site-group-head";
    const title = document.createElement("h3");
    title.textContent = site.siteName;
    const count = document.createElement("span");
    count.textContent = `${fmtNumber(site.items.length)} 条`;
    const siteListEl = document.createElement("div");
    siteListEl.className = "site-group-list";
    header.append(title, count);
    siteSection.append(header, siteListEl);

    const sourceGroups = groupBySource(site.items);
    sourceGroups.forEach(([source, groupItems]) => {
      siteListEl.appendChild(buildSourceGroupNode(source, groupItems));
    });
    frag.appendChild(siteSection);
  });

  newsListEl.appendChild(frag);
}

function renderFlatList(items) {
  const frag = document.createDocumentFragment();
  items.forEach((item) => frag.appendChild(renderItemNode(item)));
  newsListEl.appendChild(frag);
}

function appendLoadMoreButton(remaining) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "load-more";
  btn.textContent = `展开剩余 ${fmtNumber(remaining)} 条`;
  btn.addEventListener("click", () => {
    state.aiListExpanded = true;
    renderList();
  });
  newsListEl.appendChild(btn);
}

function appendCollapseButton() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "load-more is-collapse";
  btn.textContent = "收起";
  btn.addEventListener("click", () => {
    state.aiListExpanded = false;
    renderList();
    newsListEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  newsListEl.appendChild(btn);
}

function renderProgressiveFlatList(items) {
  const total = items.length;
  if (state.aiListExpanded || total <= AI_LIST_INITIAL_LIMIT) {
    renderFlatList(items);
    if (state.aiListExpanded && total > AI_LIST_INITIAL_LIMIT) {
      appendCollapseButton();
    }
  } else {
    renderFlatList(items.slice(0, AI_LIST_INITIAL_LIMIT));
    appendLoadMoreButton(total - AI_LIST_INITIAL_LIMIT);
  }
}

function renderList() {
  if (state.searchMode === "ai" && (state.aiSearchRunning || state.aiCuratedResults || state.aiSearchError)) {
    renderAiCuratedResults();
    return;
  }

  const filtered = getFilteredItems();
  resultCountEl.textContent = `${fmtNumber(filtered.length)} 条`;

  newsListEl.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "当前筛选条件下没有结果。";
    newsListEl.appendChild(empty);
    return;
  }

  if (state.mode === "all") {
    renderProgressiveFlatList(filtered);
    return;
  }

  if (state.siteFilter) {
    renderGroupedBySource(filtered);
    return;
  }

  if (state.mode === "ai") {
    renderProgressiveFlatList(filtered);
    return;
  }

  renderGroupedBySiteAndSource(filtered);
}

function waytoagiViews(waytoagi) {
  const updates7d = Array.isArray(waytoagi?.updates_7d) ? waytoagi.updates_7d : [];
  const latestDate = waytoagi?.latest_date || (updates7d.length ? updates7d[0].date : null);
  const updatesToday = Array.isArray(waytoagi?.updates_today) && waytoagi.updates_today.length
    ? waytoagi.updates_today
    : (latestDate ? updates7d.filter((u) => u.date === latestDate) : []);
  return { updates7d, updatesToday, latestDate };
}

function renderWaytoagi(waytoagi) {
  const { updates7d, updatesToday, latestDate } = waytoagiViews(waytoagi);
  if (waytoagiTodayBtnEl) waytoagiTodayBtnEl.classList.toggle("active", state.waytoagiMode === "today");
  if (waytoagi7dBtnEl) waytoagi7dBtnEl.classList.toggle("active", state.waytoagiMode === "7d");
  waytoagiUpdatedAtEl.textContent = fmtTime(waytoagi.generated_at);

  waytoagiMetaEl.innerHTML = "";
  const rootLink = document.createElement("a");
  rootLink.href = waytoagi.root_url || "#";
  rootLink.target = "_blank";
  rootLink.rel = "noopener noreferrer";
  rootLink.textContent = "主页面";
  const historyLink = document.createElement("a");
  historyLink.href = waytoagi.history_url || "#";
  historyLink.target = "_blank";
  historyLink.rel = "noopener noreferrer";
  historyLink.textContent = "历史更新页";
  const todayCount = document.createElement("span");
  todayCount.textContent = `最近更新日(${latestDate || "--"})：${fmtNumber(waytoagi.count_today || updatesToday.length)} 条`;
  const weekCount = document.createElement("span");
  weekCount.textContent = `近 7 日：${fmtNumber(waytoagi.count_7d || updates7d.length)} 条`;
  [rootLink, "·", historyLink, "·", todayCount, "·", weekCount].forEach((part) => {
    if (typeof part === "string") {
      const sep = document.createElement("span");
      sep.textContent = part;
      waytoagiMetaEl.appendChild(sep);
    } else {
      waytoagiMetaEl.appendChild(part);
    }
  });

  waytoagiListEl.innerHTML = "";
  if (waytoagi.has_error) {
    const div = document.createElement("div");
    div.className = "waytoagi-error";
    div.textContent = waytoagi.error || "WaytoAGI 数据加载失败";
    waytoagiListEl.appendChild(div);
    return;
  }

  const updates = state.waytoagiMode === "today" ? updatesToday : updates7d;
  if (!updates.length) {
    const div = document.createElement("div");
    div.className = "waytoagi-empty";
    div.textContent = state.waytoagiMode === "today"
      ? "最近更新日没有更新，可切换到近7日查看。"
      : (waytoagi.warning || "近 7 日没有更新");
    waytoagiListEl.appendChild(div);
    return;
  }

  updates.forEach((u) => {
    const row = document.createElement("a");
    row.className = "waytoagi-item";
    row.href = u.url || "#";
    row.target = "_blank";
    row.rel = "noopener noreferrer";

    const dateEl = document.createElement("span");
    dateEl.className = "d";
    dateEl.textContent = fmtDate(u.date);

    const textWrap = document.createElement("div");
    textWrap.className = "waytoagi-text";
    const titleEl = document.createElement("strong");
    titleEl.className = "t";
    titleEl.textContent = u.title || "未命名更新";
    textWrap.appendChild(titleEl);
    const summary = (u.summary || "").trim();
    if (summary) {
      const summaryEl = document.createElement("p");
      summaryEl.className = "s";
      summaryEl.textContent = summary;
      textWrap.appendChild(summaryEl);
    }

    row.append(dateEl, textWrap);
    waytoagiListEl.appendChild(row);
  });
}

function renderMetric(label, value, tone = "") {
  const node = document.createElement("div");
  node.className = `health-metric ${tone}`.trim();
  const labelEl = document.createElement("span");
  labelEl.className = "health-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("strong");
  valueEl.textContent = value;
  node.append(labelEl, valueEl);
  return node;
}

function renderIssueList(title, items) {
  const wrap = document.createElement("div");
  wrap.className = "health-issue";
  const titleEl = document.createElement("div");
  titleEl.className = "health-issue-title";
  titleEl.textContent = title;
  const list = document.createElement("ul");
  items.slice(0, 6).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = typeof item === "string" ? item : JSON.stringify(item);
    list.appendChild(li);
  });
  if (items.length > 6) {
    const li = document.createElement("li");
    li.textContent = `另有 ${fmtNumber(items.length - 6)} 项`;
    list.appendChild(li);
  }
  wrap.append(titleEl, list);
  return wrap;
}

function renderSourceHealth(errorMessage = "") {
  if (!sourceHealthEl) return;
  sourceHealthEl.innerHTML = "";

  const status = state.sourceStatus;
  if (!status) {
    const empty = document.createElement("div");
    empty.className = "health-empty";
    empty.textContent = errorMessage || "源状态未生成";
    sourceHealthEl.appendChild(empty);
    renderAdvancedSummary();
    return;
  }

  const sites = Array.isArray(status.sites) ? status.sites : [];
  const failedSites = Array.isArray(status.failed_sites) ? status.failed_sites : [];
  const zeroSites = Array.isArray(status.zero_item_sites) ? status.zero_item_sites : [];
  const rss = status.rss_opml || {};
  const failedFeeds = Array.isArray(rss.failed_feeds) ? rss.failed_feeds : [];
  const skippedFeeds = Array.isArray(rss.skipped_feeds) ? rss.skipped_feeds : [];
  const replacedFeeds = Array.isArray(rss.replaced_feeds) ? rss.replaced_feeds : [];

  const metricGrid = document.createElement("div");
  metricGrid.className = "health-grid";
  metricGrid.append(
    renderMetric("内置源", `${fmtNumber(status.successful_sites || 0)}/${fmtNumber(sites.length)}`, failedSites.length ? "warn" : "ok"),
    renderMetric("RSS", rss.enabled ? `${fmtNumber(rss.ok_feeds || 0)}/${fmtNumber(rss.effective_feed_total || 0)}` : "未启用"),
    renderMetric("失败源", fmtNumber(failedSites.length + failedFeeds.length), failedSites.length || failedFeeds.length ? "bad" : "ok"),
    renderMetric("替换/跳过", `${fmtNumber(replacedFeeds.length)}/${fmtNumber(skippedFeeds.length)}`)
  );
  sourceHealthEl.appendChild(metricGrid);

  const issues = document.createElement("div");
  issues.className = "health-issues";
  if (failedSites.length) issues.appendChild(renderIssueList("失败站点", failedSites));
  if (zeroSites.length) issues.appendChild(renderIssueList("零结果站点", zeroSites));
  if (failedFeeds.length) issues.appendChild(renderIssueList("失败 RSS", failedFeeds));
  if (skippedFeeds.length) {
    issues.appendChild(renderIssueList("跳过 RSS", skippedFeeds.map((item) => `${item.feed_url} · ${item.reason || "skipped"}`)));
  }

  if (issues.childElementCount) {
    sourceHealthEl.appendChild(issues);
  } else {
    const ok = document.createElement("div");
    ok.className = "health-ok";
    ok.textContent = "源状态正常";
    sourceHealthEl.appendChild(ok);
  }
  renderAdvancedSummary();
}

async function loadNewsData() {
  const res = await fetch(`./data/latest-24h.json?t=${Date.now()}`);
  if (!res.ok) throw new Error(`加载 latest-24h.json 失败: ${res.status}`);
  return res.json();
}

async function loadAllModeData() {
  if (state.allDataLoaded) return;
  if (!state.allDataPromise) {
    state.allDataPromise = fetch(`./${state.allDataUrl}?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`加载 latest-24h-all.json 失败: ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        state.itemsAllRaw = payload.items_all_raw || payload.items_all || state.itemsAi;
        state.itemsAll = payload.items_all || state.itemsAi;
        state.totalRaw = payload.total_items_raw || state.itemsAllRaw.length;
        state.totalAllMode = payload.total_items_all_mode || state.itemsAll.length;
        state.allDataLoaded = true;
      })
      .catch((err) => {
        state.allDataPromise = null;
        throw err;
      });
  }
  return state.allDataPromise;
}

async function loadWaytoagiData() {
  const res = await fetch(`./data/waytoagi-7d.json?t=${Date.now()}`);
  if (!res.ok) throw new Error(`加载 waytoagi-7d.json 失败: ${res.status}`);
  return res.json();
}

async function loadSourceStatusData() {
  const res = await fetch(`./data/source-status.json?t=${Date.now()}`);
  if (!res.ok) throw new Error(`加载 source-status.json 失败: ${res.status}`);
  return res.json();
}

async function runAiCuratedSearch() {
  const query = searchInputEl.value.trim() || "帮我挑出最值得看的十条";
  const runId = state.aiSearchRunId + 1;
  state.query = query;
  state.searchMode = "ai";
  state.aiSearchRunId = runId;
  state.aiSearchRunning = true;
  state.aiCuratedResults = null;
  state.aiSearchError = "";
  renderSearchMode();
  renderList();
  scrollToResults();

  try {
    if (state.mode === "all") {
      await loadAllModeData();
    }

    const recall = buildAiSearchRecall(query);
    const { candidates } = recall;
    if (!candidates.length) {
      throw new Error(`当前数据池里没有和「${query}」相关的候选内容。可以切到“全量”后再试，或换一个关键词。`);
    }

    const config = loadAiConfig();
    const content = await callGlmChat(
      config,
      buildAiSearchMessages(query, recall),
      {
        temperature: 0,
        responseFormat: { type: "json_object" },
        maxTokens: 4096,
      }
    );
    if (!isCurrentAiSearchRun(runId)) return;
    let payload;
    try {
      payload = extractJsonObject(content);
    } catch (parseErr) {
      payload = await repairAiSearchJson(config, content, parseErr.message);
    }
    if (!isCurrentAiSearchRun(runId)) return;
    const results = Array.isArray(payload.items) ? payload.items : [];
    state.aiCuratedResults = filterAiResultsToCandidates(results, candidates).slice(0, 10);
    if (!state.aiCuratedResults.length) {
      throw new Error(`AI 没有返回可展示的「${query}」相关结果。`);
    }
  } catch (err) {
    if (!isCurrentAiSearchRun(runId)) return;
    state.aiCuratedResults = null;
    const message = err.message || "AI 精准筛选失败";
    const isConfigError = /API Key|请先|Base URL|Model|GLM|接口返回|没有返回内容|Failed to fetch/i.test(message);
    state.aiSearchError = isConfigError
      ? `${message}。请检查 AI 设置中的 API Key、Base URL 和 Model。`
      : message;
    if (/API Key|请先/.test(state.aiSearchError)) {
      openAiSettings("先填写 BigModel API Key，再点击“筛选新闻”。");
    }
  } finally {
    if (isCurrentAiSearchRun(runId)) {
      state.aiSearchRunning = false;
      renderSearchMode();
      renderList();
    }
  }
}

async function init() {
  const [newsResult, waytoagiResult, statusResult] = await Promise.allSettled([
    loadNewsData(),
    loadWaytoagiData(),
    loadSourceStatusData(),
  ]);

  if (newsResult.status === "fulfilled") {
    const payload = newsResult.value;
    state.itemsAi = payload.items_ai || payload.items || [];
    state.itemsAllRaw = payload.items_all_raw || payload.items_all || [];
    state.itemsAll = payload.items_all || [];
    state.statsAi = payload.site_stats || [];
    state.totalAi = payload.total_items || state.itemsAi.length;
    state.totalRaw = payload.total_items_raw || state.itemsAllRaw.length;
    state.totalAllMode = payload.total_items_all_mode || state.itemsAll.length;
    state.allDataUrl = payload.all_mode_data_url || state.allDataUrl;
    state.allDataLoaded = Boolean(payload.items_all || payload.items_all_raw);
    state.generatedAt = payload.generated_at;

    setStats(payload);
    renderModeSwitch();
    renderCoverageStrip();
    renderSiteFilters();
    renderList();
    updatedAtEl.textContent = fmtTime(state.generatedAt);
  } else {
    updatedAtEl.textContent = "新闻数据加载失败";
    newsListEl.innerHTML = `<div class="empty">${newsResult.reason.message}</div>`;
    renderCoverageStrip(newsResult.reason.message);
  }

  if (statusResult.status === "fulfilled") {
    state.sourceStatus = statusResult.value;
    renderSourceHealth();
    renderCoverageStrip();
  } else {
    renderSourceHealth(statusResult.reason.message);
    renderCoverageStrip(statusResult.reason.message);
  }

  if (waytoagiResult.status === "fulfilled") {
    state.waytoagiData = waytoagiResult.value;
    renderWaytoagi(state.waytoagiData);
  } else {
    waytoagiUpdatedAtEl.textContent = "加载失败";
    waytoagiListEl.innerHTML = `<div class="waytoagi-error">${waytoagiResult.reason.message}</div>`;
  }
}

searchInputEl.addEventListener("input", (e) => {
  state.query = e.target.value;
  resetAiListExpansion();
  clearAiSearchResults();
  if (state.searchMode === "ai") {
    renderModeSwitch();
    renderList();
    return;
  }
  renderList();
});

searchInputEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (state.searchMode === "ai") {
    return;
  }
  scrollToResults();
});

searchInputEl.addEventListener("search", () => {
  state.query = searchInputEl.value;
  resetAiListExpansion();
  clearAiSearchResults();
  if (state.searchMode === "ai") {
    renderModeSwitch();
    renderList();
    return;
  }
  renderModeSwitch();
  renderList();
  if (state.query.trim()) {
    scrollToResults();
  }
});

if (searchNormalBtnEl) {
  searchNormalBtnEl.addEventListener("click", () => setSearchMode("normal"));
}

if (searchAiBtnEl) {
  searchAiBtnEl.addEventListener("click", () => setSearchMode("ai"));
}

if (aiSearchSubmitEl) {
  aiSearchSubmitEl.addEventListener("click", () => runAiCuratedSearch());
}

if (aiSettingsBtnEl) {
  aiSettingsBtnEl.addEventListener("click", () => openAiSettings());
}

if (aiSettingsCloseEl) {
  aiSettingsCloseEl.addEventListener("click", closeAiSettings);
}

if (aiSettingsModalEl) {
  aiSettingsModalEl.addEventListener("click", (e) => {
    if (e.target === aiSettingsModalEl) closeAiSettings();
  });
}

if (aiSettingsSaveEl) {
  aiSettingsSaveEl.addEventListener("click", () => {
    saveAiConfig(readAiSettingsForm());
    setAiSettingsStatus("已保存到当前浏览器。API Key 不会写入仓库。");
  });
}

if (aiSettingsTestEl) {
  aiSettingsTestEl.addEventListener("click", async () => {
    const config = readAiSettingsForm();
    saveAiConfig(config);
    aiSettingsTestEl.disabled = true;
    setAiSettingsStatus("正在测试连接...");
    try {
      const content = await callGlmChat(config, [
        { role: "system", content: "你是连接测试助手。" },
        { role: "user", content: "只回复 OK" },
      ], { temperature: 0 });
      setAiSettingsStatus(`连接成功：${content.slice(0, 24)}`);
    } catch (err) {
      setAiSettingsStatus(err.message || "连接失败", true);
    } finally {
      aiSettingsTestEl.disabled = false;
    }
  });
}

siteSelectEl.addEventListener("change", (e) => {
  handleSiteFilterChange(e.target.value);
});

modeAiBtnEl.addEventListener("click", () => {
  state.mode = "ai";
  resetAiListExpansion();
  clearAiSearchResults();
  renderModeSwitch();
  renderSiteFilters();
  renderList();
  scrollToWaytoagi();
});

modeAllBtnEl.addEventListener("click", async () => {
  state.mode = "all";
  resetAiListExpansion();
  clearAiSearchResults();
  renderModeSwitch();
  modeAllBtnEl.disabled = true;
  try {
    await loadAllModeData();
    renderSiteFilters();
    renderList();
    scrollToResults();
  } catch (err) {
    newsListEl.innerHTML = "";
    const failed = document.createElement("div");
    failed.className = "empty";
    failed.textContent = err.message;
    newsListEl.appendChild(failed);
    scrollToResults();
  } finally {
    modeAllBtnEl.disabled = false;
  }
});

if (allDedupeToggleEl) {
  allDedupeToggleEl.addEventListener("change", (e) => {
    state.allDedup = Boolean(e.target.checked);
    resetAiListExpansion();
    clearAiSearchResults();
    renderModeSwitch();
    renderSiteFilters();
    renderList();
  });
}

if (waytoagiTodayBtnEl) {
  waytoagiTodayBtnEl.addEventListener("click", () => {
    state.waytoagiMode = "today";
    if (state.waytoagiData) renderWaytoagi(state.waytoagiData);
  });
}

if (waytoagi7dBtnEl) {
  waytoagi7dBtnEl.addEventListener("click", () => {
    state.waytoagiMode = "7d";
    if (state.waytoagiData) renderWaytoagi(state.waytoagiData);
  });
}

initHeroTitleType();
renderSearchMode();
init();
