import urllib.parse
import re
import html
import logging
from typing import List, Dict, Any, Optional
import feedparser
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.cache import cache
from app.services.classifier_service import classifier_service, extract_base_domain
from app.services.gemini_service import gemini_service
from app.models import WingEnum

logger = logging.getLogger("satyalens.aggregator")

def clean_html(raw_html: str) -> str:
    """Strip HTML tags and clean up entities."""
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    text = soup.get_text(separator=" ")
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()

def parse_headline_and_publisher(title: str, source_title: Optional[str] = None) -> (str, str):
    """
    Google News RSS titles often end with ' - Publisher Name'.
    Separate the clean headline from the publisher.
    """
    clean_title = clean_html(title)
    if " - " in clean_title:
        parts = clean_title.rsplit(" - ", 1)
        headline = parts[0].strip()
        pub = source_title or parts[1].strip()
        return headline, pub
    return clean_title, source_title or "Indian Media"

class NewsAggregator:
    @staticmethod
    def fetch_rss_for_query(query: str, max_entries: int = 25) -> List[Dict[str, Any]]:
        """
        Fetch articles from Google News RSS with Indian edition parameter.
        """
        encoded_query = urllib.parse.quote(query)
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
        
        try:
            feed = feedparser.parse(rss_url)
            articles = []
            for entry in feed.entries[:max_entries]:
                raw_title = entry.get("title", "")
                link = entry.get("link", "")
                published = entry.get("published", "")
                summary = clean_html(entry.get("summary", "") or entry.get("description", ""))

                source_obj = entry.get("source", {})
                source_href = source_obj.get("href", "") if isinstance(source_obj, dict) else ""
                source_title = source_obj.get("title", "") if isinstance(source_obj, dict) else ""

                headline, publisher = parse_headline_and_publisher(raw_title, source_title)
                
                # Derive domain from source_href or publisher
                domain = extract_base_domain(source_href)
                if not domain and publisher:
                    # fallback slug
                    domain = publisher.lower().replace(" ", "").replace(".", "") + ".com"

                articles.append({
                    "title": headline,
                    "url": link,
                    "domain": domain,
                    "publisher_name": publisher,
                    "published_at": published,
                    "snippet": summary,
                })
            return articles
        except Exception as e:
            logger.error(f"Error fetching Google News RSS for query '{query}': {e}")
            return []

    @classmethod
    async def aggregate_and_classify(
        cls,
        db: Session,
        raw_query: str,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Full pipeline:
        1. Query Expansion (Gemini Flash)
        2. RSS Fetching & Deduplication
        3. Domain Classification (Database + AI Fallback)
        4. Perspective Summary Generation (Gemini Flash)
        5. Caching & Return
        """
        cache_key = f"news_agg:{raw_query.strip().lower()}"
        cached_result = cache.get_json(cache_key)
        if cached_result:
            logger.info(f"Returning cached news results for '{raw_query}'")
            return cached_result

        # Step 1: Query Expansion
        expanded_queries = await gemini_service.expand_query(raw_query)
        if not expanded_queries:
            expanded_queries = [raw_query]

        # Step 2: Fetch articles from each expanded query
        seen_titles = set()
        seen_urls = set()
        raw_articles = []

        for q in expanded_queries:
            fetched = cls.fetch_rss_for_query(q, max_entries=20)
            for a in fetched:
                title_norm = re.sub(r"[^a-zA-Z0-9]", "", a["title"].lower())
                url_clean = a["url"].split("?")[0]
                if title_norm not in seen_titles and url_clean not in seen_urls:
                    seen_titles.add(title_norm)
                    seen_urls.add(url_clean)
                    raw_articles.append(a)

        # Step 3: Classify each article by domain
        left_list = []
        center_list = []
        right_list = []
        unclassified_list = []

        for a in raw_articles:
            wing, pub, is_ai = classifier_service.get_classification_for_domain(
                db, a["domain"], a["publisher_name"], a["snippet"]
            )
            
            # If still unclassified, run AI fallback classification on a few candidates
            if wing == WingEnum.UNCLASSIFIED.value and len(unclassified_list) < 5:
                wing, pub, is_ai = await classifier_service.classify_with_ai_fallback(
                    db, a["domain"], a["publisher_name"], a["snippet"]
                )

            item = {
                "id": str(hash(a["url"])),
                "title": a["title"],
                "url": a["url"],
                "domain": a["domain"],
                "publisher_name": pub,
                "published_at": a["published_at"],
                "snippet": a["snippet"],
                "wing": wing,
                "ai_suggested": is_ai,
                "is_saved": False
            }

            if wing == WingEnum.LEFT.value:
                left_list.append(item)
            elif wing == WingEnum.CENTER.value:
                center_list.append(item)
            elif wing == WingEnum.RIGHT.value:
                right_list.append(item)
            else:
                unclassified_list.append(item)

        # Step 4: AI Perspective Comparison Summary
        summary = await gemini_service.generate_perspective_summary(
            raw_query, left_list, center_list, right_list
        )

        result = {
            "query": raw_query,
            "expanded_queries": expanded_queries,
            "perspective_summary": summary,
            "left_articles": left_list,
            "center_articles": center_list,
            "right_articles": right_list,
            "unclassified_articles": unclassified_list,
            "total_articles": len(raw_articles)
        }

        # Cache result for 10 minutes
        cache.set_json(cache_key, result, ttl=600)
        return result

news_aggregator = NewsAggregator()
