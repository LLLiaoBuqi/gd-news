import json
import unittest
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

from scripts.update_news import (
    RawItem,
    build_featured_sources_payload,
    make_item_id,
    normalize_url,
    parse_date_any,
    parse_opml_subscriptions,
    parse_relative_time_zh,
    resolve_featured_rss_url,
    resolve_official_rss_url,
)


class UtilsTests(unittest.TestCase):
    def test_normalize_url_removes_tracking(self):
        raw = "https://example.com/path?a=1&utm_source=x&fbclid=abc"
        self.assertEqual(normalize_url(raw), "https://example.com/path?a=1")

    def test_make_item_id_stable(self):
        a = make_item_id("site", "src", "Title", "https://a.com?p=1&utm_source=x")
        b = make_item_id("site", "src", "Title", "https://a.com?p=1")
        self.assertEqual(a, b)

    def test_parse_relative_time_zh_minutes(self):
        now = datetime(2026, 2, 19, 12, 0, tzinfo=timezone.utc)
        dt = parse_relative_time_zh("8分钟前", now)
        self.assertEqual(dt, datetime(2026, 2, 19, 11, 52, tzinfo=timezone.utc))

    def test_parse_date_any_english_rfc_not_misparsed_as_today(self):
        now = datetime(2026, 2, 21, 4, 30, tzinfo=timezone.utc)
        dt = parse_date_any("Tue, 07 Oct 2025 03:00:00 GMT", now)
        self.assertEqual(dt, datetime(2025, 10, 7, 3, 0, tzinfo=timezone.utc))

    def test_parse_opml_subscriptions(self):
        opml = """<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0"><body>
<outline text="A" title="A" xmlUrl="https://a.com/feed.xml" />
<outline text="A2" title="A2" xmlUrl="https://a.com/feed.xml" />
<outline text="B" xmlUrl="https://b.com/rss" />
</body></opml>"""
        with TemporaryDirectory() as td:
            p = Path(td) / "x.opml"
            p.write_text(opml, encoding="utf-8")
            feeds = parse_opml_subscriptions(p)
        self.assertEqual(len(feeds), 2)
        self.assertEqual(feeds[0]["title"], "A")
        self.assertEqual(feeds[1]["title"], "B")

    def test_featured_rss_allows_wechat_bridge_without_changing_default_opml_policy(self):
        feed_url = "https://wechat2rss.bestblogs.dev/feed/example.xml"

        self.assertEqual(resolve_official_rss_url(feed_url), (None, "no_official_rss_for_source_type"))
        self.assertEqual(resolve_featured_rss_url(feed_url), (feed_url, None))

    def test_build_featured_sources_payload_keeps_recent_items_and_feed_status(self):
        now = datetime(2026, 5, 6, 6, 0, tzinfo=timezone.utc)
        items = [
            RawItem(
                site_id="featuredrss",
                site_name="常看博主精选",
                source="AIGC Weekly",
                title="OpenAI 发布新功能",
                url="https://example.com/a",
                published_at=datetime(2026, 5, 6, 5, 0, tzinfo=timezone.utc),
                meta={"feed_url": "https://example.com/feed.xml"},
                summary="摘要",
            ),
            RawItem(
                site_id="featuredrss",
                site_name="常看博主精选",
                source="Old Feed",
                title="旧内容",
                url="https://example.com/old",
                published_at=datetime(2026, 5, 4, 5, 0, tzinfo=timezone.utc),
                meta={},
            ),
        ]
        statuses = [
            {
                "feed_title": "AIGC Weekly",
                "feed_url": "https://example.com/feed.xml",
                "effective_feed_url": "https://example.com/feed.xml",
                "ok": True,
                "item_count": 1,
                "skipped": False,
            },
            {
                "feed_title": "Broken",
                "feed_url": "https://example.com/broken.xml",
                "effective_feed_url": "https://example.com/broken.xml",
                "ok": False,
                "item_count": 0,
                "error": "timeout",
                "skipped": False,
            },
        ]

        payload = build_featured_sources_payload(now, items, statuses, window_hours=24, enabled=True)

        self.assertTrue(payload["enabled"])
        self.assertEqual(payload["total_items"], 1)
        self.assertEqual(payload["items"][0]["title"], "OpenAI 发布新功能")
        self.assertEqual(payload["feeds"][0]["feed_title"], "AIGC Weekly")
        self.assertEqual(payload["failed_feeds"], ["https://example.com/broken.xml"])

    def test_featured_sources_payload_groups_regions_and_excludes_waytoagi(self):
        now = datetime(2026, 5, 6, 6, 0, tzinfo=timezone.utc)
        items = [
            RawItem(
                site_id="featuredrss",
                site_name="常看博主精选",
                source="数字生命卡兹克",
                title="国内更新",
                url="https://mp.weixin.qq.com/a",
                published_at=datetime(2026, 5, 6, 5, 0, tzinfo=timezone.utc),
                meta={},
            ),
            RawItem(
                site_id="featuredrss",
                site_name="常看博主精选",
                source="OpenAI(@OpenAI)",
                title="Global update",
                url="https://x.com/OpenAI/status/1",
                published_at=datetime(2026, 5, 6, 4, 0, tzinfo=timezone.utc),
                meta={},
            ),
            RawItem(
                site_id="featuredrss",
                site_name="常看博主精选",
                source="Twitter @WaytoAGI｜通往AGI之路",
                title="不应展示",
                url="https://x.com/WaytoAGI/status/1",
                published_at=datetime(2026, 5, 6, 3, 0, tzinfo=timezone.utc),
                meta={},
            ),
        ]
        statuses = [
            {
                "feed_title": "数字生命卡兹克",
                "feed_url": "https://wechat2rss.bestblogs.dev/feed/a.xml",
                "effective_feed_url": "https://wechat2rss.bestblogs.dev/feed/a.xml",
                "ok": True,
                "item_count": 1,
                "skipped": False,
            },
            {
                "feed_title": "OpenAI(@OpenAI)",
                "feed_url": "https://api.xgo.ing/rss/user/openai",
                "effective_feed_url": "https://api.xgo.ing/rss/user/openai",
                "ok": False,
                "item_count": 0,
                "error": "timeout",
                "skipped": False,
            },
            {
                "feed_title": "Twitter @WaytoAGI｜通往AGI之路",
                "feed_url": "https://rsshub.pseudoyu.com/twitter/user/WaytoAGI",
                "effective_feed_url": "https://rsshub.pseudoyu.com/twitter/user/WaytoAGI",
                "ok": False,
                "item_count": 0,
                "error": "timeout",
                "skipped": False,
            },
        ]

        payload = build_featured_sources_payload(now, items, statuses, window_hours=24, enabled=True)

        self.assertEqual(payload["total_items"], 2)
        self.assertEqual([item["region"] for item in payload["items"]], ["domestic", "global"])
        self.assertEqual([item["title"] for item in payload["groups"]["domestic"]["items"]], ["国内更新"])
        self.assertEqual([item["title"] for item in payload["groups"]["global"]["items"]], ["Global update"])
        self.assertEqual(payload["groups"]["global"]["failed_feeds"], ["https://api.xgo.ing/rss/user/openai"])
        self.assertNotIn("WaytoAGI", json.dumps(payload, ensure_ascii=False))


if __name__ == "__main__":
    unittest.main()
