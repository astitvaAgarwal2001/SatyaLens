import urllib.parse
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from app.models import DomainClassification, WingEnum
from app.seed_data import HARDCODED_PUBLISHERS
from app.services.gemini_service import gemini_service

def extract_base_domain(url_or_domain: str) -> str:
    """
    Clean and extract normalized domain string from URL or raw domain.
    E.g. 'https://www.thehindu.com/news/' -> 'thehindu.com'
    """
    if not url_or_domain:
        return ""
    val = url_or_domain.strip().lower()
    if not (val.startswith("http://") or val.startswith("https://")):
        val = "https://" + val
    parsed = urllib.parse.urlparse(val)
    domain = parsed.netloc or parsed.path
    # Strip port if any
    if ":" in domain:
        domain = domain.split(":")[0]
    # Strip www.
    if domain.startswith("www."):
        domain = domain[4:]
    return domain.strip()

class ClassifierService:
    @staticmethod
    def get_classification_for_domain(
        db: Session,
        raw_domain_or_url: str,
        publisher_name: str = "",
        snippet: str = ""
    ) -> Tuple[str, str, bool]:
        """
        Returns: (wing, publisher_name, is_ai_suggested)
        """
        domain = extract_base_domain(raw_domain_or_url)
        if not domain:
            return WingEnum.UNCLASSIFIED.value, publisher_name or "Unknown Source", False

        # 1. Exact match in hardcoded developer list (highest priority)
        if domain in HARDCODED_PUBLISHERS:
            data = HARDCODED_PUBLISHERS[domain]
            return data["wing"], data["publisher_name"] or publisher_name, False

        # 2. Check parent domain in hardcoded developer list (e.g. frontline.thehindu.com -> thehindu.com)
        parts = domain.split(".")
        if len(parts) > 2:
            parent_domain = ".".join(parts[-2:])
            if parent_domain in HARDCODED_PUBLISHERS:
                data = HARDCODED_PUBLISHERS[parent_domain]
                return data["wing"], data["publisher_name"] or publisher_name, False

        # 3. Match in DB
        entry = db.query(DomainClassification).filter(DomainClassification.domain == domain).first()
        if entry:
            return entry.wing, entry.publisher_name or publisher_name, False

        # 4. Check parent domain in DB
        if len(parts) > 2:
            parent_domain = ".".join(parts[-2:])
            parent_entry = db.query(DomainClassification).filter(DomainClassification.domain == parent_domain).first()
            if parent_entry:
                return parent_entry.wing, parent_entry.publisher_name or publisher_name, False

        # 5. Default to UNCLASSIFIED
        return WingEnum.UNCLASSIFIED.value, publisher_name or domain, False

    @staticmethod
    async def classify_with_ai_fallback(
        db: Session,
        raw_domain_or_url: str,
        publisher_name: str,
        snippet: str
    ) -> Tuple[str, str, bool]:
        """
        Same as above, but runs Gemini AI classification if domain is unclassified.
        """
        wing, pub, is_ai = ClassifierService.get_classification_for_domain(db, raw_domain_or_url, publisher_name, snippet)
        if wing != WingEnum.UNCLASSIFIED.value:
            return wing, pub, False

        domain = extract_base_domain(raw_domain_or_url)
        # Attempt Gemini fallback
        ai_wing = await gemini_service.classify_snippet(domain, publisher_name, snippet)
        if ai_wing and ai_wing in {WingEnum.LEFT.value, WingEnum.CENTER.value, WingEnum.RIGHT.value}:
            return ai_wing, publisher_name or domain, True

        return WingEnum.UNCLASSIFIED.value, publisher_name or domain, False

    @staticmethod
    def update_or_create_classification(
        db: Session,
        domain: str,
        wing: str,
        publisher_name: Optional[str] = None
    ) -> DomainClassification:
        """
        Upsert a domain classification in the database.
        Cannot modify hardcoded developer publishers.
        """
        clean_domain = extract_base_domain(domain)
        if clean_domain in HARDCODED_PUBLISHERS:
            raise ValueError(f"Domain '{clean_domain}' is hardcoded by developers and cannot be changed.")
        entry = db.query(DomainClassification).filter(DomainClassification.domain == clean_domain).first()
        if entry:
            entry.wing = wing.upper()
            if publisher_name:
                entry.publisher_name = publisher_name
        else:
            entry = DomainClassification(
                domain=clean_domain,
                publisher_name=publisher_name or clean_domain.capitalize(),
                wing=wing.upper(),
            )
            db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
        return entry

classifier_service = ClassifierService()
