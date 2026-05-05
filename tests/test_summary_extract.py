import unittest

from scripts.update_news import clean_html_summary, extract_feed_entry_summary


class CleanHtmlSummaryTests(unittest.TestCase):
    def test_returns_none_for_empty_or_none(self):
        self.assertIsNone(clean_html_summary(None))
        self.assertIsNone(clean_html_summary(""))
        self.assertIsNone(clean_html_summary("   "))
        self.assertIsNone(clean_html_summary("<p></p>"))

    def test_strips_tags_and_decodes_entities(self):
        raw = "<p>Hello&nbsp;<b>world</b> &amp; more</p>"
        self.assertEqual(clean_html_summary(raw), "Hello world & more")

    def test_collapses_whitespace_and_breaks(self):
        raw = "first<br>second<br/>third\n\n  trailing"
        self.assertEqual(clean_html_summary(raw), "first second third trailing")

    def test_truncates_to_limit_with_ellipsis(self):
        raw = "x" * 350
        out = clean_html_summary(raw, limit=280)
        self.assertIsNotNone(out)
        assert out is not None
        self.assertEqual(len(out), 281)
        self.assertTrue(out.endswith("…"))

    def test_short_text_not_truncated(self):
        raw = "短摘要"
        self.assertEqual(clean_html_summary(raw, limit=280), "短摘要")


class ExtractFeedEntrySummaryTests(unittest.TestCase):
    def test_returns_none_when_entry_is_none(self):
        self.assertIsNone(extract_feed_entry_summary(None))

    def test_prefers_summary_field(self):
        entry = {"summary": "<p>From summary</p>", "description": "From description"}
        self.assertEqual(extract_feed_entry_summary(entry), "From summary")

    def test_falls_back_to_description(self):
        entry = {"description": "<b>desc only</b>"}
        self.assertEqual(extract_feed_entry_summary(entry), "desc only")

    def test_falls_back_to_content_value(self):
        entry = {"content": [{"value": "<p>content body</p>"}]}
        self.assertEqual(extract_feed_entry_summary(entry), "content body")

    def test_skips_empty_summary_in_favor_of_description(self):
        entry = {"summary": "<p></p>", "description": "Real desc"}
        self.assertEqual(extract_feed_entry_summary(entry), "Real desc")

    def test_returns_none_when_all_fields_missing(self):
        entry = {"title": "no summary anywhere"}
        self.assertIsNone(extract_feed_entry_summary(entry))

    def test_truncation_respected(self):
        entry = {"summary": "x" * 600}
        out = extract_feed_entry_summary(entry, limit=120)
        assert out is not None
        self.assertEqual(len(out), 121)
        self.assertTrue(out.endswith("…"))


if __name__ == "__main__":
    unittest.main()
