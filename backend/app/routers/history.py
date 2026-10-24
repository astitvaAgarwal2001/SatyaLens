from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, SearchHistory
from app.schemas import SearchHistoryOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("", response_model=List[SearchHistoryOut])
def get_user_search_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.searched_at.desc())
        .limit(30)
        .all()
    )

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_user_search_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).delete()
    db.commit()
    return None
