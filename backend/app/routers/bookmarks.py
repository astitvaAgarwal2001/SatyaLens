from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, SavedArticle
from app.schemas import SavedArticleCreate, SavedArticleOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/bookmarks", tags=["Bookmarks"])

@router.get("", response_model=List[SavedArticleOut])
def get_user_bookmarks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(SavedArticle)
        .filter(SavedArticle.user_id == current_user.id)
        .order_by(SavedArticle.saved_at.desc())
        .all()
    )

@router.post("", response_model=SavedArticleOut, status_code=status.HTTP_201_CREATED)
def create_bookmark(
    payload: SavedArticleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if already bookmarked
    existing = (
        db.query(SavedArticle)
        .filter(SavedArticle.user_id == current_user.id, SavedArticle.url == payload.url)
        .first()
    )
    if existing:
        return existing

    new_saved = SavedArticle(
        user_id=current_user.id,
        title=payload.title,
        url=payload.url,
        domain=payload.domain,
        wing=payload.wing,
        snippet=payload.snippet,
        publisher_name=payload.publisher_name,
        published_at=payload.published_at,
    )
    db.add(new_saved)
    db.commit()
    db.refresh(new_saved)
    return new_saved

@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(SavedArticle)
        .filter(SavedArticle.id == bookmark_id, SavedArticle.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found."
        )
    db.delete(entry)
    db.commit()
    return None

@router.delete("/by-url", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookmark_by_url(
    url: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(SavedArticle)
        .filter(SavedArticle.user_id == current_user.id, SavedArticle.url == url)
        .first()
    )
    if entry:
        db.delete(entry)
        db.commit()
    return None
