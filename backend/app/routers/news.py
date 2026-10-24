from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, SearchHistory, SavedArticle
from app.auth import get_current_user_optional
from app.schemas import NewsSearchResponse
from app.services.news_aggregator import news_aggregator

router = APIRouter(prefix="/api/news", tags=["News"])

@router.get("/search", response_model=NewsSearchResponse)
async def search_news(
    q: str = Query(..., min_length=2, max_length=300, description="News topic or headline to search"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query_text = q.strip()
    if not query_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty."
        )

    # Record search history if user is logged in
    if current_user:
        history_entry = SearchHistory(user_id=current_user.id, query=query_text)
        db.add(history_entry)
        db.commit()

    # Aggregate and classify
    results = await news_aggregator.aggregate_and_classify(
        db=db,
        raw_query=query_text,
        user_id=current_user.id if current_user else None
    )

    # If user is logged in, mark bookmarked articles
    if current_user:
        saved_urls = {
            s.url for s in db.query(SavedArticle.url).filter(SavedArticle.user_id == current_user.id).all()
        }
        for wing_key in ["left_articles", "center_articles", "right_articles", "unclassified_articles"]:
            for item in results.get(wing_key, []):
                if item.get("url") in saved_urls:
                    item["is_saved"] = True

    return results
