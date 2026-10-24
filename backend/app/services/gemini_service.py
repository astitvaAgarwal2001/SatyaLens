import json
import logging
import re
from typing import List, Dict, Optional, Any
from app.config import settings

logger = logging.getLogger("satyalens.gemini")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._model = None
        if self.api_key:
            self._init_client()

    def _init_client(self):
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel(self.model_name)
            logger.info(f"Gemini client initialized with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self._model = None

    def _clean_json_response(self, text: str) -> str:
        """Strip markdown code fences if Gemini returns ```json ... ```"""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    async def expand_query(self, user_query: str) -> List[str]:
        """
        Fast Query Expansion:
        Extract key entities and generate 2-3 optimal Google News queries.
        Target execution time: <200ms prompt.
        """
        clean_user_q = user_query.strip()
        if not clean_user_q:
            return []

        # If Gemini is configured and available
        if self._model:
            try:
                prompt = (
                    f"You are an expert Indian news entity extractor. "
                    f"Given this user headline or topic: \"{clean_user_q}\"\n"
                    f"Extract the primary entities, actors, and events, and return a JSON list of 2 to 3 "
                    f"short, high-precision search queries suitable for Indian Google News RSS.\n"
                    f"Rules:\n"
                    f"1. Return ONLY a valid JSON array of strings, e.g. [\"query 1\", \"query 2\", \"query 3\"].\n"
                    f"2. Keep each query between 2 to 5 words without punctuation.\n"
                    f"3. Focus specifically on the Indian political, legal, economic, or social context."
                )
                response = self._model.generate_content(prompt)
                raw_text = self._clean_json_response(response.text)
                parsed = json.loads(raw_text)
                if isinstance(parsed, list) and len(parsed) > 0:
                    queries = [str(q).strip() for q in parsed if str(q).strip()]
                    # Ensure original query is retained or prioritized
                    if clean_user_q not in queries:
                        queries.insert(0, clean_user_q)
                    return queries[:3]
            except Exception as e:
                logger.warning(f"Gemini query expansion failed ({e}). Using heuristic expansion.")

        # Heuristic fallback if Gemini not configured or API error
        return self._heuristic_query_expansion(clean_user_q)

    def _heuristic_query_expansion(self, query: str) -> List[str]:
        """Fallback query expansion without API calls."""
        tokens = [w for w in re.split(r"\s+", query) if len(w) > 2 and w.lower() not in {
            "what", "when", "where", "which", "whose", "why", "how", "the", "and", "for", "with", "about", "that", "this"
        }]
        queries = [query]
        if len(tokens) >= 2:
            queries.append(" ".join(tokens[:4]))
        if len(tokens) >= 4:
            queries.append(" ".join(tokens[2:]))
        # Deduplicate preserving order
        seen = set()
        res = []
        for q in queries:
            if q.lower() not in seen:
                seen.add(q.lower())
                res.append(q)
        return res[:3]

    async def generate_perspective_summary(
        self,
        query: str,
        left_articles: List[Dict[str, Any]],
        center_articles: List[Dict[str, Any]],
        right_articles: List[Dict[str, Any]],
    ) -> Dict[str, str]:
        """
        Perspective Comparison Summary:
        Analyzes Left, Center, and Right framing differences across Indian media.
        """
        def format_samples(articles: List[Dict[str, Any]], limit: int = 3) -> str:
            lines = []
            for a in articles[:limit]:
                title = a.get("title", "")
                pub = a.get("publisher_name", "")
                lines.append(f"- [{pub}] {title}")
            return "\n".join(lines) if lines else "No articles found in this wing."

        left_sample = format_samples(left_articles)
        center_sample = format_samples(center_articles)
        right_sample = format_samples(right_articles)

        if self._model:
            try:
                prompt = (
                    f"You are SatyaLens AI, a neutral Indian political media analyst.\n"
                    f"Topic: \"{query}\"\n\n"
                    f"Here is current coverage from Indian news outlets:\n\n"
                    f"[LEFT-WING OUTLETS (e.g., The Wire, Scroll, The Quint)]:\n{left_sample}\n\n"
                    f"[CENTER / FACTUAL OUTLETS (e.g., The Hindu, Indian Express, PTI, Mint)]:\n{center_sample}\n\n"
                    f"[RIGHT-WING OUTLETS (e.g., OpIndia, Swarajya, Republic, Organiser)]:\n{right_sample}\n\n"
                    f"Provide an objective, comparative bias analysis in JSON format with exact keys:\n"
                    f"{{\n"
                    f"  \"left_perspective\": \"2-3 concise sentences on how left-leaning media frame this (critique of state/policy, rights/accountability angle, dissenting voices).\",\n"
                    f"  \"center_perspective\": \"2-3 concise sentences on how center/neutral wire outlets report this (factual chronology, official statements, court arguments, objective data).\",\n"
                    f"  \"right_perspective\": \"2-3 concise sentences on how right-leaning media frame this (national interest, government policy intent, scrutiny of opposition/activists).\",\n"
                    f"  \"fact_consensus\": \"1-2 sentences summarizing verified core facts agreed upon across all outlets.\",\n"
                    f"  \"bias_divergence\": \"1-2 sentences highlighting where editorial narratives diverge or spin.\"\n"
                    f"}}\n"
                    f"Return ONLY valid JSON."
                )

                response = self._model.generate_content(prompt)
                cleaned = self._clean_json_response(response.text)
                parsed = json.loads(cleaned)
                return {
                    "left_perspective": parsed.get("left_perspective", "Focuses on civil rights, institutional accountability, and critique of official policies."),
                    "center_perspective": parsed.get("center_perspective", "Focuses on verified legal proceedings, verified data, and balanced stakeholder statements."),
                    "right_perspective": parsed.get("right_perspective", "Emphasizes national security, economic growth, and government rationale."),
                    "fact_consensus": parsed.get("fact_consensus", "Core events, court orders, or policy announcements remain consistent across all reporting."),
                    "bias_divergence": parsed.get("bias_divergence", "Divergence occurs primarily in headline sensationalism and attribution of political motives.")
                }
            except Exception as e:
                logger.warning(f"Gemini perspective summary generation failed ({e}). Using intelligent fallback.")

        # Heuristic fallback summary based on available articles
        return self._heuristic_perspective_summary(query, left_articles, center_articles, right_articles)

    def _heuristic_perspective_summary(
        self,
        query: str,
        left_articles: List[Dict[str, Any]],
        center_articles: List[Dict[str, Any]],
        right_articles: List[Dict[str, Any]],
    ) -> Dict[str, str]:
        has_left = len(left_articles) > 0
        has_center = len(center_articles) > 0
        has_right = len(right_articles) > 0

        left_lead = f"from {left_articles[0].get('publisher_name', 'outlets')}" if has_left else "outlets"
        center_lead = f"from {center_articles[0].get('publisher_name', 'wires')}" if has_center else "national wires"
        right_lead = f"from {right_articles[0].get('publisher_name', 'publications')}" if has_right else "commentaries"

        return {
            "left_perspective": (
                f"Reporting {left_lead} highlights transparency, executive accountability, civil liberties, "
                f"and systemic impacts on marginalized or critical voices."
            ),
            "center_perspective": (
                f"Mainstream center coverage {center_lead} emphasizes judicial proceedings, constitutional precedents, "
                f"and verified factual statements from official government and opposition bodies."
            ),
            "right_perspective": (
                f"Coverage {right_lead} underscores policy intent, governance outcomes, national security considerations, "
                f"and counters opposition assertions."
            ),
            "fact_consensus": (
                f"All Indian media wings confirm the core developments regarding '{query}', while differing on editorial framing and political implications."
            ),
            "bias_divergence": (
                f"Left outlets frame the story around policy critique and civil impact, while Right outlets prioritize administrative intent and counter-arguments."
            )
        }

    async def classify_snippet(self, domain: str, publisher_name: str, snippet: str) -> Optional[str]:
        """
        Fallback Domain Classifier:
        Uses Gemini to analyze editorial tone & publication metadata to propose 'LEFT', 'CENTER', or 'RIGHT'.
        """
        if not self._model:
            return None

        try:
            prompt = (
                f"Analyze this Indian news outlet metadata:\n"
                f"Domain: {domain}\n"
                f"Publisher: {publisher_name}\n"
                f"Snippet / Headline: {snippet}\n\n"
                f"Classify the political/editorial leaning of this Indian publication into one of: 'LEFT', 'CENTER', or 'RIGHT'.\n"
                f"Return ONLY a single word: LEFT, CENTER, or RIGHT."
            )
            response = self._model.generate_content(prompt)
            classification = response.text.strip().upper()
            if "LEFT" in classification:
                return "LEFT"
            if "RIGHT" in classification:
                return "RIGHT"
            if "CENTER" in classification:
                return "CENTER"
        except Exception as e:
            logger.warning(f"Gemini snippet classification failed for {domain}: {e}")

        return None

gemini_service = GeminiService()
