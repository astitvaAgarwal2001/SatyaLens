from typing import List, Dict
from sqlalchemy.orm import Session
from app.models import DomainClassification, WingEnum

INITIAL_DOMAINS: List[Dict[str, str]] = [
    # Left Wing
    {"domain": "thewire.in", "publisher_name": "The Wire", "wing": WingEnum.LEFT.value},
    {"domain": "scroll.in", "publisher_name": "Scroll.in", "wing": WingEnum.LEFT.value},
    {"domain": "thequint.com", "publisher_name": "The Quint", "wing": WingEnum.LEFT.value},
    {"domain": "maktoobmedia.com", "publisher_name": "Maktoob Media", "wing": WingEnum.LEFT.value},
    {"domain": "newsclick.in", "publisher_name": "NewsClick", "wing": WingEnum.LEFT.value},
    {"domain": "newslaundry.com", "publisher_name": "Newslaundry", "wing": WingEnum.LEFT.value},
    {"domain": "nationalheraldindia.com", "publisher_name": "National Herald", "wing": WingEnum.LEFT.value},
    {"domain": "caravanmagazine.in", "publisher_name": "The Caravan", "wing": WingEnum.LEFT.value},
    {"domain": "article-14.com", "publisher_name": "Article 14", "wing": WingEnum.LEFT.value},
    {"domain": "altnews.in", "publisher_name": "Alt News", "wing": WingEnum.LEFT.value},
    {"domain": "thefederal.com", "publisher_name": "The Federal", "wing": WingEnum.LEFT.value},
    {"domain": "countercurrents.org", "publisher_name": "Countercurrents", "wing": WingEnum.LEFT.value},
    
    # Center / Neutral
    {"domain": "thehindu.com", "publisher_name": "The Hindu", "wing": WingEnum.CENTER.value},
    {"domain": "frontline.thehindu.com", "publisher_name": "Frontline Magazine", "wing": WingEnum.CENTER.value},
    {"domain": "indianexpress.com", "publisher_name": "The Indian Express", "wing": WingEnum.CENTER.value},
    {"domain": "timesofindia.indiatimes.com", "publisher_name": "The Times of India", "wing": WingEnum.CENTER.value},
    {"domain": "indiatimes.com", "publisher_name": "Times of India", "wing": WingEnum.CENTER.value},
    {"domain": "hindustantimes.com", "publisher_name": "Hindustan Times", "wing": WingEnum.CENTER.value},
    {"domain": "livemint.com", "publisher_name": "Mint", "wing": WingEnum.CENTER.value},
    {"domain": "ptinews.com", "publisher_name": "Press Trust of India (PTI)", "wing": WingEnum.CENTER.value},
    {"domain": "theprint.in", "publisher_name": "ThePrint", "wing": WingEnum.CENTER.value},
    {"domain": "deccanherald.com", "publisher_name": "Deccan Herald", "wing": WingEnum.CENTER.value},
    {"domain": "tribuneindia.com", "publisher_name": "The Tribune", "wing": WingEnum.CENTER.value},
    {"domain": "business-standard.com", "publisher_name": "Business Standard", "wing": WingEnum.CENTER.value},
    {"domain": "economictimes.indiatimes.com", "publisher_name": "The Economic Times", "wing": WingEnum.CENTER.value},
    {"domain": "ndtv.com", "publisher_name": "NDTV", "wing": WingEnum.CENTER.value},
    {"domain": "indiatoday.in", "publisher_name": "India Today", "wing": WingEnum.CENTER.value},
    {"domain": "thestatesman.com", "publisher_name": "The Statesman", "wing": WingEnum.CENTER.value},
    {"domain": "newindianexpress.com", "publisher_name": "The New Indian Express", "wing": WingEnum.CENTER.value},
    {"domain": "telegraphindia.com", "publisher_name": "The Telegraph India", "wing": WingEnum.CENTER.value},
    {"domain": "livelaw.in", "publisher_name": "LiveLaw", "wing": WingEnum.CENTER.value},
    {"domain": "barandbench.com", "publisher_name": "Bar & Bench", "wing": WingEnum.CENTER.value},
    {"domain": "scobserver.in", "publisher_name": "Supreme Court Observer", "wing": WingEnum.CENTER.value},
    {"domain": "thesouthfirst.com", "publisher_name": "The South First", "wing": WingEnum.CENTER.value},
    {"domain": "moneycontrol.com", "publisher_name": "Moneycontrol", "wing": WingEnum.CENTER.value},
    {"domain": "dainikbhaskar.com", "publisher_name": "Dainik Bhaskar", "wing": WingEnum.CENTER.value},
    {"domain": "amarujala.com", "publisher_name": "Amar Ujala", "wing": WingEnum.CENTER.value},

    # Right Wing
    {"domain": "opindia.com", "publisher_name": "OpIndia", "wing": WingEnum.RIGHT.value},
    {"domain": "swarajyamag.com", "publisher_name": "Swarajya", "wing": WingEnum.RIGHT.value},
    {"domain": "republicworld.com", "publisher_name": "Republic World", "wing": WingEnum.RIGHT.value},
    {"domain": "organiser.org", "publisher_name": "Organiser", "wing": WingEnum.RIGHT.value},
    {"domain": "firstpost.com", "publisher_name": "Firstpost", "wing": WingEnum.RIGHT.value},
    {"domain": "zeenews.india.com", "publisher_name": "Zee News", "wing": WingEnum.RIGHT.value},
    {"domain": "aninews.in", "publisher_name": "Asian News International (ANI)", "wing": WingEnum.RIGHT.value},
    {"domain": "news18.com", "publisher_name": "News18", "wing": WingEnum.RIGHT.value},
    {"domain": "panchjanya.com", "publisher_name": "Panchjanya", "wing": WingEnum.RIGHT.value},
    {"domain": "dnaindia.com", "publisher_name": "DNA India", "wing": WingEnum.RIGHT.value},
    {"domain": "abplive.com", "publisher_name": "ABP Live", "wing": WingEnum.RIGHT.value},
    {"domain": "wionews.com", "publisher_name": "WION", "wing": WingEnum.RIGHT.value},
    {"domain": "dailyo.in", "publisher_name": "DailyO", "wing": WingEnum.RIGHT.value},
    {"domain": "newsx.com", "publisher_name": "NewsX", "wing": WingEnum.RIGHT.value},
    {"domain": "jagran.com", "publisher_name": "Dainik Jagran", "wing": WingEnum.RIGHT.value},
    {"domain": "lawbeat.in", "publisher_name": "LawBeat", "wing": WingEnum.RIGHT.value},
]

# Quick O(1) developer lookup map for hardcoded publishers
HARDCODED_PUBLISHERS: Dict[str, Dict[str, str]] = {
    item["domain"].lower().strip(): {
        "domain": item["domain"].lower().strip(),
        "publisher_name": item["publisher_name"],
        "wing": item["wing"],
    }
    for item in INITIAL_DOMAINS
}

def seed_initial_domains(db: Session) -> int:
    """
    Synchronizes domain classifications in DB strictly with the developer hardcoded list.
    - Inserts missing hardcoded publications
    - Restores/enforces developer classification and publisher name on existing records
    - Deletes any user-created or unapproved records
    """
    count = 0
    valid_domains = set()

    for item in INITIAL_DOMAINS:
        domain = item["domain"].lower().strip()
        valid_domains.add(domain)
        existing = db.query(DomainClassification).filter(DomainClassification.domain == domain).first()
        if not existing:
            entry = DomainClassification(
                domain=domain,
                publisher_name=item["publisher_name"],
                wing=item["wing"],
            )
            db.add(entry)
            count += 1
        else:
            if existing.wing != item["wing"] or existing.publisher_name != item["publisher_name"]:
                existing.wing = item["wing"]
                existing.publisher_name = item["publisher_name"]
                count += 1

    # Remove any rogue user-submitted records not in the hardcoded list
    rogue_entries = db.query(DomainClassification).filter(~DomainClassification.domain.in_(valid_domains)).all()
    for rogue in rogue_entries:
        db.delete(rogue)
        count += 1

    if count > 0:
        db.commit()
    return count
